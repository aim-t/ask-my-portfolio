"""
FastAPI app exposing the RAG chatbot as a small HTTP API.

Endpoints:
  GET  /health         - liveness + whether the index and a provider are ready
  POST /chat           - {"question": "..."} -> grounded answer + sources
  GET  /                - redirects to /health for a friendly root response

On startup, the app ingests data/*.md into the local Chroma vector store
automatically, so there is no separate "build the index" step to forget.
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.config import ALLOWED_ORIGINS
from app import rag
from app.llm import generate, NoProviderAvailable, PROVIDER_CHAIN

app = FastAPI(title="Ask My Portfolio API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

_state = {"indexed_chunks": 0}


@app.on_event("startup")
def startup():
    _state["indexed_chunks"] = rag.ingest(force=True)


class ChatRequest(BaseModel):
    question: str


class ChatResponse(BaseModel):
    answer: str
    provider: str
    sources: list[str]


@app.get("/")
def root():
    return {"service": "ask-my-portfolio", "docs": "/docs", "health": "/health"}


@app.get("/health")
def health():
    # Derived from PROVIDER_CHAIN, the same list app/llm.py actually uses
    # to generate answers, rather than a separately maintained copy - a
    # hardcoded second list here is exactly what let this drift out of
    # sync when Groq was added as a fourth provider.
    providers_configured = [name for name, key, _ in PROVIDER_CHAIN if key]
    return {
        "status": "ok",
        "indexed_chunks": _state["indexed_chunks"],
        "providers_configured": providers_configured,
    }


@app.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest):
    question = req.question.strip()
    if not question:
        raise HTTPException(status_code=400, detail="question must not be empty")

    chunks = rag.retrieve(question)
    if not chunks:
        raise HTTPException(status_code=500, detail="No indexed content found - has ingest run?")

    try:
        answer, provider = generate(question, chunks)
    except NoProviderAvailable as e:
        raise HTTPException(status_code=503, detail=str(e))

    sources = sorted(set(c["source"] for c in chunks))
    return ChatResponse(answer=answer, provider=provider, sources=sources)
