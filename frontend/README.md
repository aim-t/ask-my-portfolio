# Ask My Portfolio, frontend

A React + TypeScript + Tailwind CSS interface for the [Ask My Portfolio](../README.md)
RAG chatbot. Two build targets share the same components: a standalone app you can
deploy on its own, and an embeddable widget bundle for dropping onto another site.

## Design

Phosphor-terminal, not generic SaaS. Fira Code throughout (the same font
aimantariq.tech already uses for its code blocks), a green-on-near-black CRT palette
by default, and a genuinely different light mode rather than an inverted copy: a
carbon-copy typewritten page, cream paper with a rust-red accent pulled from the
classic two-tone typewriter ribbon. The chat panel is styled like a terminal window
(traffic-light dots, a title bar), messages are prefixed like shell output
(`>` for what you typed, `#` for the answer), and the page load types itself out
character by character rather than fading in - a `useTypewriter` hook, not a canned
library effect. Message entrances and the widget's open/close use `motion`; the
one-time boot sequence is plain CSS `animation-delay` staggering, no library needed
for something that only ever plays once.

## Running it locally

```
npm install
cp .env.example .env
npm run dev
```

Opens on `http://localhost:3000` (not Vite's default 5173, on purpose, see below).
Point it at your running backend:

```
cd ..
source .venv/bin/activate
uvicorn app.main:app --reload
```

### Why port 3000

The backend's `ALLOWED_ORIGINS` default (`app/config.py`) already whitelists
`http://localhost:3000`, since that was the port used for the plain HTML widget.
`vite.config.ts` sets the dev server to that port too, so local dev works against an
unmodified backend with no CORS configuration step. If you change the backend's
`ALLOWED_ORIGINS`, update `server.port` in `vite.config.ts` to match, or vice versa.

## Environment

One variable, `VITE_API_BASE_URL` (see `.env.example`), read at build time by both
build targets. Defaults to `http://localhost:8000` for local dev.

## Standalone app build

```
npm run build      # outputs to dist/
npm run preview    # serve the production build locally to sanity check it
```

`dist/` is a normal static site: deployable to Vercel, Netlify, or any static host.
Set `VITE_API_BASE_URL` to your deployed backend's URL in that host's environment
variables before building, since Vite bakes it in at build time.

## Widget build

```
npm run build:widget   # outputs to dist-widget/ask-my-portfolio-widget.js
```

A single self-contained script, no separate CSS file to include: it injects its own
styles into `<head>` on mount, the same "no build step, no dependencies" promise
`widget/chat-widget.html` made, just built from the real chat component instead of a
hand-written copy. React is bundled in, not left external, so this works as a plain
`<script>` tag on a page that has no React of its own (like the Gatsby portfolio site).

### Embedding it

```html
<script src="/ask-my-portfolio-widget.js"></script>
<script>
  AskMyPortfolioWidget.mount();
</script>
```

`mount()` with no argument creates its own floating bubble container appended to
`<body>`, positioned bottom-right, matching how `widget/chat-widget.html` positioned
itself. Pass a CSS selector or an element to mount into an existing container instead:

```html
<div id="my-container"></div>
<script>
  AskMyPortfolioWidget.mount("#my-container");
</script>
```

This is not wired into the Gatsby site yet. Build it, host `ask-my-portfolio-widget.js`
wherever the site can serve a static file from, and add the two script tags above.

### Style isolation tradeoff

Tailwind's preflight (its base CSS reset) is deliberately left out of the widget build
(`src/widget/widget.css`) because it resets margins, headings, and buttons on the
_whole_ host page it's injected into, not just the widget. Without preflight, the
utility classes are additive and only apply where used.

The tradeoff: a full prefix-based isolation (every class renamed to e.g. `amp:flex`)
would avoid even utility-class-name collisions with the host page's own CSS, but it
requires every class name in the shared components to differ between the app build and
the widget build, which conflicts with reusing the exact same components for both. This
build accepts the smaller residual risk of a utility class name collision instead. If
that turns out to matter in practice once this is actually embedded, switching to a
prefix is the fix, at the cost of no longer sharing literal class names between builds.

The widget also always renders in its own fixed dark color scheme, independent of the
host page's theme and the standalone app's light/dark toggle, so it never touches the
host document's `<html>` element.

## Project layout

```
src/
  main.tsx              standalone app entry
  App.tsx                header, chat panel, about section
  index.css               app styles: Tailwind + class-based dark mode
  lib/
    types.ts               shared types, match app/main.py's ChatResponse
    api.ts                  fetch wrapper, VITE_API_BASE_URL, typed errors
    useChat.ts              chat state and send logic, shared by both builds
    useTheme.ts             light/dark toggle with localStorage persistence
  components/
    Header.tsx, ChatPanel.tsx, MessageBubble.tsx, ChatInput.tsx,
    AnswerMeta.tsx, AboutSection.tsx, ThemeToggle.tsx
  widget/
    mount.tsx               widget build entry, exports mount()
    WidgetShell.tsx          floating bubble and panel, wraps ChatPanel
    widget.css               Tailwind without preflight, see above
```

`ChatPanel` (message list, input, loading and error states) is the actual shared
component behind both the standalone app's inline chat and the widget's floating
panel; `App.tsx` and `WidgetShell.tsx` are just two different frames around it.

## Linting and formatting

```
npm run lint           # eslint
npm run format          # prettier --write
npm run format:check    # prettier --check, what CI would run
```

## Numbers shown in the About section

Pulled from the main [README.md](../README.md) and `eval/run_eval.py`'s output, not
invented: retrieval recall@4 is 100% (12/12) on the handwritten evaluation set, and the
red-team scan scope is 6 vulnerability types against 4 attack methods (see
[`redteam/run_redteam.py`](../redteam/run_redteam.py)). If those numbers change, update
`src/components/AboutSection.tsx` to match.
