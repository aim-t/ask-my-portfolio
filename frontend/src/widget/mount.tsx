import { createRoot } from "react-dom/client";
import { WidgetShell } from "./WidgetShell";
import widgetCss from "./widget.css?inline";

let stylesInjected = false;

function injectStyles() {
  if (stylesInjected) return;
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
