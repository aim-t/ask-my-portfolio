"""
Configuration for Ask My Portfolio.

All settings are read from environment variables (loaded from .env in
local development, or from real environment variables in Docker/production).
Nothing here requires an API key to import, so the app can start up and
serve /health even before any keys are configured.
"""
import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
CHROMA_DIR = BASE_DIR / "chroma_store"

# LLM provider keys - all optional, the app falls back across whichever
# of these are actually set. Get at least one working key before you
# consider the project "live".
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")

# Model names - override in .env if you want a cheaper/newer model.
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
ANTHROPIC_MODEL = os.getenv("ANTHROPIC_MODEL", "claude-3-5-haiku-20241022")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash-lite")
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")

# Retrieval settings
CHUNK_SIZE_WORDS = int(os.getenv("CHUNK_SIZE_WORDS", "120"))
CHUNK_OVERLAP_WORDS = int(os.getenv("CHUNK_OVERLAP_WORDS", "30"))
TOP_K = int(os.getenv("TOP_K", "4"))
COLLECTION_NAME = "portfolio"

# CORS - the domains allowed to call this API from a browser widget.
# Add your real portfolio domain in .env before deploying.
ALLOWED_ORIGINS = [
    o.strip()
    for o in os.getenv(
        "ALLOWED_ORIGINS", "http://localhost:3000,https://aimantariq.tech,https://www.aimantariq.tech"
    ).split(",")
    if o.strip()
]
