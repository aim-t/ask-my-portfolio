import { createRoot } from "react-dom/client";
import { WidgetShell } from "./WidgetShell";
import widgetCss from "./widget.css?inline";

let stylesInjected = false;
const FONT_HREF =
  "https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600;700&display=swap";

function injectStyles() {
  if (stylesInjected) return;

  // Fira Code, since a host page (e.g. the Gatsby site) has no reason to
  // have loaded it already - falls back to the system monospace stack
  // in widget.css's --font-mono if this request is blocked.
  if (!document.querySelector(`link[href="${FONT_HREF}"]`)) {
    const fontLink = document.createElement("link");
    fontLink.rel = "stylesheet";
    fontLink.href = FONT_HREF;
    document.head.appendChild(fontLink);
  }

  const style = document.createElement("style");
  style.setAttribute("data-ask-my-portfolio-widget", "");
  style.textContent = widgetCss;
  document.head.appendChild(style);
  stylesInjected = true;
}

/**
 * Mounts the Ask My Portfolio chat widget onto a host page.
 *
 * target: a CSS selector, an existing element, or omitted to auto-create
 * a container appended to <body> (matching how the floating bubble in
 * widget/chat-widget.html positioned itself).
 */
export function mount(target?: string | HTMLElement) {
  injectStyles();

  let container: HTMLElement;
  if (typeof target === "string") {
    const found = document.querySelector(target);
    if (!found) {
      throw new Error(`Ask My Portfolio widget: no element matches selector "${target}"`);
    }
    container = found as HTMLElement;
  } else if (target instanceof HTMLElement) {
    container = target;
  } else {
    container = document.createElement("div");
    document.body.appendChild(container);
  }

  const root = createRoot(container);
  root.render(<WidgetShell />);
  return { unmount: () => root.unmount() };
}
