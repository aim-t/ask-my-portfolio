# Ask My Portfolio

A Retrieval-Augmented Generation (RAG) chatbot that answers questions about Aiman Tariq's background, grounded in her actual CV and project history, deployable behind a real API and embeddable on a portfolio site.

Ask it things like "Does Aiman have RAG experience?" or "What did she build at PookiDevs?" and it retrieves the relevant facts from her own data and generates a grounded answer, citing which file the answer came from.

## Why this project

Bare RAG demos are common in 2026 hiring pipelines; what separates candidates is measured evaluation and production maturity rather than an unverified "it works" claim. This project is built around three things a plain chatbot demo does not have: a retrieval layer that is tested against a handwritten evaluation set with measured numbers, a multi-provider LLM fallback pattern already proven in production (the same pattern used at PookiDevs), and a deployment path (FastAPI, Docker) rather than a notebook.

## Architecture

```
data/*.md            -> hand-written source content about Aiman
      |
      v
app/rag.py            -> chunk by section, embed with a self-fit TF-IDF
                          vectorizer, store/retrieve via ChromaDB
      |
      v
app/llm.py             -> build a grounded prompt from the retrieved
                          chunks, call OpenAI -> Anthropic -> Gemini
                          in order until one responds
      |
      v
app/main.py             -> FastAPI: POST /chat, GET /health
      |
      v
widget/chat-widget.html  -> drop-in chat bubble that calls /chat
```

## Decisions

**Embeddings: TF-IDF, not a downloaded neural model.** ChromaDB's default embedding function downloads a ~80MB model from S3/Hugging Face on first run. That is a real deploy risk on locked-down hosts, CI runners, and some free-tier containers, and it adds a slow cold start. For a small, keyword-heavy, hand-curated knowledge base like this one (a handful of markdown files about one person), a TF-IDF vectorizer fit on the corpus itself is fully deterministic, has zero external runtime dependencies, and measurably retrieves just as well: see `eval/run_eval.py`, which scored 100% retrieval recall (12/12) across a handwritten evaluation set once the vectorizer excluded near-universal terms ("Aiman" appears in nearly every chunk and was actively hurting ranking until it was added as a stopword) and chunked by markdown section boundary rather than raw paragraph length. If the knowledge base grows much larger or more semantically varied than this, `TfidfEmbeddingFunction` in `app/rag.py` is a drop-in swap for `chromadb.utils.embedding_functions.DefaultEmbeddingFunction()`.

**Evaluation: a small custom harness, not RAGAS.** RAGAS is the tool most current guides recommend for this kind of project. It was tried first here and its installed package currently has a broken import chain (a missing `langchain_community` submodule it depends on), which is a fragile foundation for something meant to just work in a day or two. `eval/run_eval.py` instead measures the two things that actually matter: retrieval recall (does the retriever pull the chunk the answer lives in) with zero API keys required, and answer faithfulness (does the generated answer actually contain the expected facts) once a provider key is set. It is about 130 lines, fully readable, and defensible line by line in an interview.

**Multi-provider LLM fallback.** Mirrors the pattern already shipped in production at PookiDevs: try OpenAI, fall back to Anthropic, fall back to Gemini. If one provider is down, rate-limited, or its key is missing, the next one is tried automatically. Add a fourth provider by writing one function with the same signature in `app/llm.py`.

**Chunking by markdown section, not fixed word count.** Each `##` header in a data file becomes its own chunk boundary before word-count chunking is applied within it. This keeps unrelated topics (e.g. "Database Management" and "Soft Skills" in `skills.md`) from being merged into a single diluted chunk, which measurably improved retrieval recall during development.

## Measured results

Run `python -m eval.run_eval` to reproduce:

```
Retrieval recall@4: 100% (12/12)
```

This runs with zero API keys and zero network calls, since retrieval is entirely local. Run `python -m eval.run_eval --with-generation` (needs one provider key configured) to also score answer faithfulness against the same handwritten question set.

## Project structure

```
app/
  config.py     settings, read from environment variables
  rag.py        chunking, TF-IDF embedding, ChromaDB ingestion and retrieval
  llm.py        multi-provider generation with fallback
  main.py       FastAPI app (/chat, /health)
data/
  about.md, experience.md, projects.md, skills.md   the knowledge base
eval/
  eval_set.json   12 handwritten question/answer pairs
  run_eval.py     retrieval recall + answer faithfulness scoring
widget/
  chat-widget.html   drop-in embeddable chat bubble
Dockerfile, docker-compose.yml, requirements.txt, .env.example
```

## Running it

See `SETUP.md` for the full day-by-day walkthrough. Short version:

```
pip install -r requirements.txt
cp .env.example .env      # add at least one LLM API key
uvicorn app.main:app --reload
```

Then open `http://localhost:8000/docs` for interactive API docs, or open `widget/chat-widget.html` directly in a browser (it points at `http://localhost:8000` by default).

## What you need to supply

Everything in this repository runs and is tested with zero API keys except the final "generate an answer" step, which needs at least one of `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, or `GEMINI_API_KEY` in `.env`. That call cannot be exercised without a real key, so it has not been tested end to end here; the retrieval layer it depends on has been, with the numbers above.
