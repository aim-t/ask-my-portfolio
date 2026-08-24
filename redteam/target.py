"""
The model_callback DeepTeam calls for every simulated attack.

This is the one piece of glue code between DeepTeam (a generic red-teaming
framework) and this specific project: it takes an attack prompt, sends it
to the running Ask My Portfolio API exactly the way a real user's browser
would, and hands the response back for DeepTeam to judge.

Kept in its own file so it can be exercised directly (see check_target()
below) without pulling in DeepTeam or spending any API budget.
"""
import os
import requests
from deepteam.test_case.test_case import RTTurn

TARGET_URL = os.getenv("TARGET_URL", "http://localhost:8000")


def call_target(question: str) -> str:
    """
    POST a question to the running app's /chat endpoint and return the
    answer text. Raises for connection errors; a 4xx/5xx from the app
    itself (e.g. no LLM key configured) is surfaced as the response text
    rather than raised, since DeepTeam should see and judge that response
    like it would any other model output.
    """
    try:
        resp = requests.post(f"{TARGET_URL}/chat", json={"question": question}, timeout=30)
    except requests.exceptions.ConnectionError as e:
        raise RuntimeError(
            f"Could not reach {TARGET_URL} - is the app running? "
            f"Start it with 'uvicorn app.main:app' from the project root first."
        ) from e

    if resp.status_code == 200:
        return resp.json()["answer"]

    try:
        detail = resp.json().get("detail", resp.text)
    except ValueError:
        detail = resp.text
    return f"[HTTP {resp.status_code}] {detail}"


def model_callback(input: str, conversation_history=None) -> RTTurn:
    """The exact callback signature DeepTeam's red_team() expects."""
    answer = call_target(input)
    return RTTurn(role="assistant", content=answer)


def check_target():
    """
    Sanity-check the target is reachable and see what a single question
    returns, with ZERO DeepTeam involvement and zero API cost beyond
    whatever the app itself spends answering one question. Run this
    before spending real red-team budget, to confirm the wiring works.
    """
    print(f"Checking target at {TARGET_URL} ...")
    try:
        health = requests.get(f"{TARGET_URL}/health", timeout=10).json()
    except requests.exceptions.ConnectionError:
        print(f"FAILED: could not reach {TARGET_URL}. Start the app first:")
        print("  uvicorn app.main:app --reload")
        return False

    print(f"  /health -> {health}")
    if not health.get("providers_configured"):
        print(
            "  WARNING: no LLM provider is configured on the target. "
            "The app will respond with an error to every question, which "
            "makes for a meaningless red-team report. Set an API key in "
            ".env and restart the app first."
        )

    sample = call_target("What did Aiman build at PookiDevs?")
    print(f"  sample question -> {sample}")
    return True


if __name__ == "__main__":
    check_target()
