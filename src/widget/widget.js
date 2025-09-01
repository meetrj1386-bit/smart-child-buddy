// src/widget/widget.js
(() => {
  const thisScript =
    document.currentScript ||
    [...document.querySelectorAll("script")]
      .reverse()
      .find((s) => (s.getAttribute("src") || "").includes("/widget.js"));

  const ds = (thisScript && thisScript.dataset) || {};
  const projectId = ds.project || "";
  const origin = ds.origin || window.location.origin;
  const chatPath = ds.chatPath || "/chat.html";
  const position = (ds.position || "right").toLowerCase();
  const startOpen = String(ds.startOpen || "false") === "true";
  const primary = ds.primary || "#764ba2";
  const title = ds.title || "SmartChild Buddy";
  const width = parseInt(ds.width || "380", 10);
  const height = parseInt(ds.height || "560", 10);
  const z = 2147483647;

  // ----- bubble (launcher)
  const bubble = document.createElement("button");
  bubble.setAttribute("aria-label", "Open chat");
  bubble.setAttribute("aria-expanded", "false");
  bubble.style.cssText = `
    position: fixed; ${position === "left" ? "left" : "right"}: 24px; bottom: 24px;
    width: 56px; height: 56px; border-radius: 50%; border:0; cursor:pointer;
    background:${primary}; color:#fff; box-shadow:0 14px 28px rgba(0,0,0,.25);
    display:grid; place-items:center; z-index:${z};
  `;
  bubble.innerHTML =
    '<svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z"/></svg>';
  document.body.appendChild(bubble);

  // ----- panel (container)
  const panelId = "scb-panel-" + Math.random().toString(36).slice(2);
  const panel = document.createElement("div");
  panel.id = panelId;
  bubble.setAttribute("aria-controls", panelId);
  panel.style.cssText = `
    position: fixed; ${position === "left" ? "left" : "right"}: 24px; bottom: 24px;
    width:${width}px; height:${height}px; max-width:calc(100vw - 32px); max-height:calc(100vh - 96px);
    background:#fff; border-radius:16px; overflow:hidden; box-shadow:0 24px 48px rgba(0,0,0,.28);
    transform: translateY(8px); opacity:0; display:none; z-index:${z};
    transition: transform .22s ease, opacity .22s ease;
  `;
  document.body.appendChild(panel);

  const iframe = document.createElement("iframe");
  iframe.title = title;
  iframe.allow = "clipboard-write; autoplay";
  iframe.style.cssText = "width:100%; height:100%; border:0; display:block;";
  panel.appendChild(iframe);

  const setSize = () => {
    const isMobile = matchMedia("(max-width: 640px)").matches;
    if (isMobile) {
      panel.style.width = "100vw";
      panel.style.height = "100vh";
      panel.style.bottom = "0";
      panel.style.borderRadius = "0";
      panel.style[position === "left" ? "left" : "right"] = "0";
    } else {
      panel.style.width = `${width}px`;
      panel.style.height = `${height}px`;
      panel.style.bottom = "24px";
      panel.style.borderRadius = "16px";
      panel.style[position === "left" ? "left" : "right"] = "24px";
    }
  };
  setSize();
  window.addEventListener("resize", setSize);

  let isOpen = false;

  const openPanel = () => {
    if (!iframe.src) {
      const url = new URL(chatPath, origin);
      if (projectId) url.searchParams.set("project", projectId);
      iframe.src = url.toString();
    }
    panel.style.display = "block";
    requestAnimationFrame(() => {
      panel.style.transform = "translateY(0)";
      panel.style.opacity = "1";
    });
    isOpen = true;
    bubble.setAttribute("aria-expanded", "true");
  };

  const closePanel = () => {
    panel.style.transform = "translateY(8px)";
    panel.style.opacity = "0";
    setTimeout(() => {
      panel.style.display = "none";
    }, 220);
    isOpen = false;
    bubble.setAttribute("aria-expanded", "false");
  };

  // toggle via bubble
  bubble.addEventListener("click", () => {
    isOpen ? closePanel() : openPanel();
  });

  // allow iframe to ask host to close (ESC/back in iframe)
  window.addEventListener("message", (e) => {
    if (e?.data?.type === "SCB_REQUEST_CLOSE") {
      if (isOpen) closePanel();
    }
  });

  // legacy support: if iframe still posts a plain "SCB_CLOSE"
  window.addEventListener("message", (e) => {
    if (e?.data === "SCB_CLOSE") {
      if (isOpen) closePanel();
    }
  });

  if (startOpen) openPanel();
})();
