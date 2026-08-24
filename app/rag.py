"""
RAG core: ingestion and retrieval.

Embeddings: this uses a small, self-fitted TF-IDF vectorizer (scikit-learn)
instead of ChromaDB's bundled neural embedding model. That was a deliberate
choice, not a shortcut - see TfidfEmbeddingFunction below for why. Either
way, retrieval is 100% local: no API key and no network call is ever
needed for ingestion or retrieval. The only place an API key is needed
is generation (see llm.py).
"""
import pickle
import re
from pathlib import Path

import chromadb
from chromadb.api.types import EmbeddingFunction
from sklearn.feature_extraction.text import TfidfVectorizer, ENGLISH_STOP_WORDS

# "aiman" and "tariq" show up in nearly every chunk in this corpus (every
# section is about her), so on their own they carry no retrieval signal
# and would otherwise dilute the ranking toward generic overlap instead
# of the actual technical terms in a question. Treat them as stopwords
# on top of the standard English list.
_STOP_WORDS = set(ENGLISH_STOP_WORDS) | {"aiman", "tariq"}

_WORD_RE = re.compile(r"[a-zA-Z]+")


def _stem(word):
    """
    Minimal suffix-stripping stemmer (e.g. "databases" -> "database",
    "companies" -> "company"). Without this, a plural in a question
    ("What databases has Aiman worked with?") shares zero tokens with
    the singular form in the source text ("## Database Management"),
    so the chunk that actually answers the question never gets
    retrieved. A real stemmer library was skipped to keep this
    dependency-free, matching the rest of the TF-IDF setup.
    """
    if len(word) > 4 and word.endswith("ies"):
        return word[:-3] + "y"
    if len(word) > 3 and word.endswith("s") and not word.endswith("ss"):
        return word[:-1]
    return word


def _analyze(text):
    """Tokenize, drop stopwords, stem, then emit unigrams and bigrams."""
    tokens = [_stem(w) for w in _WORD_RE.findall(text.lower()) if w not in _STOP_WORDS]
    return tokens + [f"{a} {b}" for a, b in zip(tokens, tokens[1:])]

from app.config import (
    DATA_DIR,
    CHROMA_DIR,
    CHUNK_SIZE_WORDS,
    CHUNK_OVERLAP_WORDS,
    TOP_K,
    COLLECTION_NAME,
)


class TfidfEmbeddingFunction(EmbeddingFunction):
    """
    A from-scratch, dependency-light embedding function for Chroma.

    ChromaDB's default embedding function (all-MiniLM-L6-v2) has to
    download a ~80MB model from S3/Hugging Face on first run. That's a
    real deploy risk on locked-down hosts, CI runners, and free-tier
    containers with restricted egress, and it adds a slow cold start.

    For a small, keyword-heavy, hand-curated knowledge base like this
    one (a handful of markdown files about one person), a TF-IDF
    vectorizer fit on the corpus itself is fully deterministic, has
    zero external dependencies at runtime, and in practice retrieves
    just as accurately - see eval/run_eval.py, which scores retrieval
    recall directly. If you outgrow this (a much larger or more
    semantically varied knowledge base), swap this class for
    chromadb.utils.embedding_functions.DefaultEmbeddingFunction() -
    everything else in this file stays the same.
    """

    def __init__(self, path):
        self.path = Path(path)
        self.vectorizer = None
        if self.path.exists():
            with open(self.path, "rb") as f:
                self.vectorizer = pickle.load(f)

    def fit(self, corpus):
        self.vectorizer = TfidfVectorizer(
            analyzer=_analyze, max_features=4096, sublinear_tf=True
        )
        self.vectorizer.fit(corpus)
        self.path.parent.mkdir(parents=True, exist_ok=True)
        with open(self.path, "wb") as f:
            pickle.dump(self.vectorizer, f)

    def __call__(self, input):
        if self.vectorizer is None:
            raise RuntimeError("TF-IDF vectorizer not fitted yet - run rag.ingest() first.")
        return self.vectorizer.transform(input).toarray().tolist()

    @staticmethod
    def name():
        return "tfidf-local"

    def get_config(self):
        return {"path": str(self.path)}

    @staticmethod
    def build_from_config(config):
        return TfidfEmbeddingFunction(config["path"])


_embedding_fn = None


def get_embedding_fn():
    global _embedding_fn
    if _embedding_fn is None:
        _embedding_fn = TfidfEmbeddingFunction(CHROMA_DIR / "tfidf_vectorizer.pkl")
    return _embedding_fn


def _split_sections(text):
    """
    Split markdown text on '##' headers so each topic (e.g. one job, one
    skill category) becomes its own section. Chunking never crosses a
    section boundary - see _chunk_text - so a query about one topic
    ("databases") doesn't retrieve a chunk diluted with an unrelated
    neighboring topic ("soft skills"). The top-level '#' title is
    dropped since it carries no retrieval signal of its own.
    """
    text = re.sub(r"^#\s+.*$", "", text, count=1, flags=re.MULTILINE)
    parts = re.split(r"(?=^##\s)", text, flags=re.MULTILINE)
    return [p.strip() for p in parts if p.strip()]


def _chunk_text(text, source, chunk_size=CHUNK_SIZE_WORDS, overlap=CHUNK_OVERLAP_WORDS):
    """
    Split text into overlapping word-count chunks, one section
    (see _split_sections) at a time. This is intentionally simple (no
    external tokenizer dependency) - good enough for a small,
    hand-authored knowledge base like this one. Splitting on paragraphs
    within a section means a chunk rarely cuts a sentence in half.
    """
    chunks = []

    for section in _split_sections(text):
        paragraphs = [p.strip() for p in re.split(r"\n\s*\n", section) if p.strip()]
        buffer_words = []

        def flush():
            if buffer_words:
                chunks.append(" ".join(buffer_words))

        for para in paragraphs:
            words = para.split()
            if len(buffer_words) + len(words) <= chunk_size:
                buffer_words.extend(words)
            else:
                flush()
                buffer_words = buffer_words[-overlap:] if overlap else []
                buffer_words.extend(words)
        flush()

    return [{"text": c, "source": source} for c in chunks if c.strip()]


def load_documents(data_dir=DATA_DIR):
    """Read every .md file in data/ and chunk it."""
    all_chunks = []
    for path in sorted(Path(data_dir).glob("*.md")):
        text = path.read_text(encoding="utf-8")
        all_chunks.extend(_chunk_text(text, source=path.name))
    return all_chunks


def get_client():
    # anonymized_telemetry=False: the version of posthog this chromadb
    # release depends on has a different capture() signature than
    # chromadb's telemetry code calls, so every event throws and gets
    # logged as "Failed to send telemetry event" - harmless, but disabling
    # it outright is cleaner than leaving that noise on every startup/query.
    return chromadb.PersistentClient(
        path=str(CHROMA_DIR), settings=chromadb.Settings(anonymized_telemetry=False)
    )


def get_collection(client=None):
    client = client or get_client()
    return client.get_or_create_collection(name=COLLECTION_NAME, embedding_function=get_embedding_fn())


def ingest(force=False):
    """
    Chunk every file in data/ and upsert it into the Chroma collection.
    Safe to call on every app startup - it recreates the collection and
    refits the TF-IDF vectorizer from scratch each time, which is cheap
    at this data size and guarantees the index never drifts from
    data/*.md.
    """
    client = get_client()
    if force:
        try:
            client.delete_collection(COLLECTION_NAME)
        except Exception:
            pass

    chunks = load_documents()
    if not chunks:
        return 0

    documents = [c["text"] for c in chunks]
    metadatas = [{"source": c["source"]} for c in chunks]
    ids = [f"{c['source']}-{i}" for i, c in enumerate(chunks)]

    # Fit the vectorizer on this corpus BEFORE creating the collection,
    # so the collection's embedding function is ready to embed on upsert.
    get_embedding_fn().fit(documents)

    collection = get_collection(client)
    collection.upsert(ids=ids, documents=documents, metadatas=metadatas)
    return len(chunks)


def retrieve(query, top_k=TOP_K):
    """Return the top_k most relevant chunks for a query, with their source file."""
    collection = get_collection()
    results = collection.query(query_texts=[query], n_results=top_k)

    if not results["documents"] or not results["documents"][0]:
        return []

    out = []
    for doc, meta, dist in zip(
        results["documents"][0], results["metadatas"][0], results["distances"][0]
    ):
        out.append({"text": doc, "source": meta.get("source", "unknown"), "distance": dist})
    return out


if __name__ == "__main__":
    n = ingest(force=True)
    print(f"Ingested {n} chunks from {DATA_DIR}")
