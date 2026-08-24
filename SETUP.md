# Setup: from zip file to live portfolio project in 1-2 days

Follow this in order. Everything up to "get an API key" needs nothing from you except running commands.

## Day 1, morning: get it running locally (30-45 min)

1. Unzip the project and open a terminal in the `ask-my-portfolio` folder.
2. Install Python 3.11+ if you do not have it, then:
   ```
   python -m venv .venv
   source .venv/bin/activate        # Windows: .venv\Scripts\activate
   pip install -r requirements.txt
   ```
3. Prove the retrieval layer works, with zero API keys, zero cost:
   ```
   python -m eval.run_eval
   ```
   You should see `Retrieval recall@4: 100% (12/12)`. This is the number that goes in your README/portfolio writeup, and you can point to this exact command in an interview.

## Day 1, midday: get one API key (10-15 min)

You only need ONE of these, not all four. Pick whichever you can get fastest:

- OpenAI: platform.openai.com -> API keys. Needs a payment method on file but a few dollars of credit covers this project many times over.
- Anthropic: console.anthropic.com -> API keys. Same idea.
- Google Gemini: aistudio.google.com -> Get API key. Has a free tier, usually the fastest to get working with no card required. Its free tier caps out at 20 requests/day on the model this project defaults to, which is easy to hit if you're iterating a lot - Groq below is the fix if you do.
- Groq: console.groq.com -> API keys. Also free, no card required, and with much higher rate limits than Gemini's free tier. Runs open models (Llama, etc.) instead of Gemini's own.

Copy `.env.example` to `.env` and paste the key in:
```
cp .env.example .env
```
Edit `.env` and fill in ONE of `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GEMINI_API_KEY`, or `GROQ_API_KEY`. Add a second one too if you want automatic fallback when the first is rate-limited or down.

## Day 1, afternoon: run it and talk to it (15 min)

```
uvicorn app.main:app --reload
```

Open `http://localhost:8000/docs`, expand `POST /chat`, click "Try it out", and ask it something like `"What did Aiman build at PookiDevs?"`. You should get back a grounded answer plus which file it came from.

Then also run the full evaluation, including generation this time:
```
python -m eval.run_eval --with-generation
```
This is the number that shows the whole pipeline works end to end, not just retrieval. Screenshot this output, or copy the numbers into your README, before you move on.

## Day 1, evening: personalize the content (30-60 min)

Everything the bot knows lives in `data/*.md`. This is the highest-leverage 30 minutes in the whole setup:

- Read through `data/about.md`, `data/experience.md`, `data/projects.md`, `data/skills.md`.
- Fix anything that is out of date or add anything new (a project you finished this week, an updated role, a new skill).
- Re-run `python -m eval.run_eval` after any edit. If recall drops, it usually means a question in `eval/eval_set.json` now expects content you changed; update that question or its `expected_source`/`expected_keywords` to match.

You do not need to touch any Python code to update what the bot knows.

## Day 1, late evening (optional, 15-20 min): generate the red-team report

This step is separate from getting the chatbot live and can be done any time after Day 1 morning, as long as the app is running locally with an API key configured.

```
pip install -r requirements-redteam.txt
python redteam/target.py          # confirm the app is reachable, costs nothing
python -m redteam.run_redteam     # the real scan - needs OPENAI_API_KEY specifically
```

This needs `OPENAI_API_KEY` even if you configured a different provider as your main chatbot's key, since DeepTeam's own attack-generation and judging models default to OpenAI. It takes a few minutes and costs a few cents. When it finishes, open `redteam/results/report.md` - that is the write-up-ready summary of what it tried and what the app did about it.

## Day 2, morning: deploy the API (45-90 min)

Pick one, all have generous free tiers and both work with the Dockerfile as-is:

**Render** (simplest): render.com -> New -> Web Service -> connect your GitHub repo (push this folder to a new repo first) -> it detects the Dockerfile automatically -> add your API key as an environment variable in the dashboard -> Deploy.

**Railway**: railway.app -> New Project -> Deploy from GitHub repo -> same idea, add the env var, deploy.

**Fly.io** (if you want more control): `flyctl launch` from inside this folder, it will detect the Dockerfile; `flyctl secrets set OPENAI_API_KEY=...` (or whichever provider), then `flyctl deploy`.

Whichever you pick, once it is live, hit `https://your-deployed-url/health` and confirm you see `"status": "ok"`.

## Day 2, midday: put it on aimantariq.tech (30-60 min)

1. Open `widget/chat-widget.html` and change the `API_BASE_URL` constant near the bottom to your deployed URL from the step above (not `localhost`).
2. Also update `ALLOWED_ORIGINS` in your deployed environment variables to include `https://aimantariq.tech` (it already does by default in `.env.example` - just confirm it made it into your host's environment variable settings).
3. Since your site is Gatsby, the easiest path is: copy the `<style>`, the `<div id="amp-widget-root">`, and the `<script>` block from `chat-widget.html` into a small React component (e.g. `src/components/AskMyPortfolio.jsx`) using `dangerouslySetInnerHTML` for the style/markup and a `useEffect` to run the script once on mount, then drop `<AskMyPortfolio />` into your site's layout component so it shows on every page. If you would rather not touch your Gatsby build at all, host `chat-widget.html` as a static file and embed it with `<iframe src="/chat-widget.html" style="border:none;position:fixed;bottom:0;right:0;width:380px;height:0;">` and let the widget's own CSS handle sizing - either approach works, the React one looks slightly more native.

## Day 2, afternoon: write it up (30 min)

Add a short entry to your CV/portfolio project list. A version you can paste directly:

> **Ask My Portfolio** - A RAG chatbot that answers recruiter questions about my background, grounded in my real CV data. Built with FastAPI, ChromaDB, and a multi-provider LLM fallback (OpenAI/Anthropic/Gemini/Groq). Retrieval is measured against a handwritten evaluation set (100% recall@4) rather than asserted, and the deployed app is red-teamed with DeepTeam against prompt injection, hallucination, and instruction leakage. Deployed with Docker; try it live at the chat bubble on this site.
>
> GitHub: [link once you push it] | Live: aimantariq.tech

Push the code to a public GitHub repo before you link it anywhere - that repo, with this README's "Decisions" section intact, is doing real work in an interview: it shows you can explain why you made each choice, not just that you followed a tutorial.

## If something breaks

- `python -m eval.run_eval` fails on import: you probably skipped `pip install -r requirements.txt` or forgot to activate the virtual environment.
- `/chat` returns a 503 with "No LLM provider is configured": your `.env` key is missing, misspelled, or the app was started before you saved `.env` (restart `uvicorn` after editing `.env`).
- `/chat` returns a 503 with "All configured providers failed" and a quota/429 message: this is a different situation than the one above - a key IS configured, but the provider itself is rate-limited or over quota right now (Gemini's free tier caps at 20 requests/day on the default model, which is easy to hit during normal testing). It usually clears on its own; adding `GROQ_API_KEY` as a second key gives the app an automatic fallback for exactly this case.
- The widget shows "Sorry, I couldn't reach the backend": check `API_BASE_URL` in `chat-widget.html` matches your deployed URL exactly, including `https://`, and that your host's `ALLOWED_ORIGINS` includes your site's real domain.
- Docker build fails on `pip install`: make sure you are using the provided `Dockerfile` as-is; it installs `build-essential` specifically because `scikit-learn` needs it on a slim base image.
- `import deepteam` fails with `ModuleNotFoundError: No module named 'sentry_sdk'`: this is a real gap in deepteam 1.0.9's own dependency list, not something you did wrong. `pip install -r requirements-redteam.txt` already includes the fix; if you installed `deepteam` some other way, run `pip install sentry-sdk` too.
- `python -m redteam.run_redteam` exits immediately with an OPENAI_API_KEY message: that is expected and by design, it is a cheap check before any spend happens. DeepTeam's default judge model is OpenAI's regardless of which provider your chatbot itself uses.
