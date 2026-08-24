"""
Multi-provider LLM wrapper with fallback logic.

Mirrors the pattern Aiman already shipped in production at PookiDevs:
try OpenAI first, fall back to Anthropic, then Gemini, then Groq.
Whichever provider has a key configured and responds successfully
wins. If none of the four keys are configured, this raises a clear
error rather than failing silently - see NoProviderAvailable below.

Groq is last in the chain, not because it is worse, but because it was
added later as a fallback for Gemini's free-tier daily quota (20
requests/day on the model this project defaults to) being easy to
exhaust during normal development and testing. Groq's free tier has
much higher limits, at the cost of running open models (Llama, etc.)
rather than Gemini's own.

Add a fifth provider by writing one function with the same signature
(prompt, system) -> str and adding it to PROVIDER_CHAIN.
"""
from app.config import (
    OPENAI_API_KEY,
    ANTHROPIC_API_KEY,
    GEMINI_API_KEY,
    GROQ_API_KEY,
    OPENAI_MODEL,
    ANTHROPIC_MODEL,
    GEMINI_MODEL,
    GROQ_MODEL,
)


class NoProviderAvailable(Exception):
    pass


def _call_openai(prompt, system):
    from openai import OpenAI

    client = OpenAI(api_key=OPENAI_API_KEY)
    resp = client.chat.completions.create(
        model=OPENAI_MODEL,
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": prompt},
        ],
        temperature=0.2,
        max_tokens=500,
    )
    return resp.choices[0].message.content.strip()


def _call_anthropic(prompt, system):
    import anthropic

    client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)
    resp = client.messages.create(
        model=ANTHROPIC_MODEL,
        max_tokens=500,
        system=system,
        messages=[{"role": "user", "content": prompt}],
    )
    return resp.content[0].text.strip()


def _call_gemini(prompt, system):
    import google.generativeai as genai

    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel(GEMINI_MODEL, system_instruction=system)
    resp = model.generate_content(prompt)
    return resp.text.strip()


def _call_groq(prompt, system):
    from groq import Groq

    client = Groq(api_key=GROQ_API_KEY)
    resp = client.chat.completions.create(
        model=GROQ_MODEL,
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": prompt},
        ],
        temperature=0.2,
        max_tokens=500,
    )
    return resp.choices[0].message.content.strip()


# Ordered (provider_name, api_key, call_fn) - first one with a key set is
# tried first; on any exception, we move to the next available provider.
PROVIDER_CHAIN = [
    ("openai", OPENAI_API_KEY, _call_openai),
    ("anthropic", ANTHROPIC_API_KEY, _call_anthropic),
    ("gemini", GEMINI_API_KEY, _call_gemini),
    ("groq", GROQ_API_KEY, _call_groq),
]

SYSTEM_PROMPT = (
    "You are 'Ask My Portfolio', a chat assistant answering questions about "
    "Aiman Tariq for recruiters and hiring managers. Answer ONLY using the "
    "context provided below. If the context does not contain the answer, "
    "say you don't have that information rather than guessing. Keep answers "
    "concise (2-4 sentences), factual, and in third person about Aiman. "
    "Do not invent employers, dates, or skills that are not in the context."
)


def build_prompt(question, chunks):
    context = "\n\n".join(f"[{c['source']}] {c['text']}" for c in chunks)
    return (
        f"Context:\n{context}\n\n"
        f"Question: {question}\n\n"
        f"Answer the question using only the context above."
    )


def generate(question, chunks):
    """
    Try each configured provider in order until one succeeds.
    Returns (answer_text, provider_used).
    """
    prompt = build_prompt(question, chunks)
    tried = []
    last_error = None

    for name, key, fn in PROVIDER_CHAIN:
        if not key:
            continue
        tried.append(name)
        try:
            answer = fn(prompt, SYSTEM_PROMPT)
            return answer, name
        except Exception as e:
            last_error = e
            continue

    if not tried:
        raise NoProviderAvailable(
            "No LLM provider is configured. Set OPENAI_API_KEY, ANTHROPIC_API_KEY, "
            "GEMINI_API_KEY, or GROQ_API_KEY in your .env file."
        )
    raise NoProviderAvailable(
        f"All configured providers failed ({', '.join(tried)}). Last error: {last_error}"
    )
