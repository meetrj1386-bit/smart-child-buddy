// public/widget-loader.js
(function () {
  if (window.__widgetLoaded) return;
  window.__widgetLoaded = true;

  // ---- read dataset ----
  const thisScript =
    document.currentScript ||
    document.querySelector('script[src*="widget-loader.js"]');

  const ds = (thisScript && thisScript.dataset) || {};
  // sizing from data-* (with sensible defaults)
const OPEN_WIDTH   = Number(ds.openWidth)  || 480;  // px
const OPEN_MAX_VH  = Number(ds.openMaxVh)  || 0.92; // 0–1 of viewport height
const OPEN_MAX_PX  = Number(ds.openMaxPx)  || 780;  // px cap
const CLOSED_SIZE  = Number(ds.closedSize) || 72;   // bubble diameter

  const projectId = ds.project || ds.widgetId || 'default';
  const origin    = ds.origin  || window.location.origin;
  const chatPath  = ds.chatPath || '/chat.html';
  const position  = (ds.position || 'right').toLowerCase();
  const startOpen = String(ds.startOpen || 'false') === 'true';
  const primary   = ds.primary || '#5A6ACF';
  const z         = 2147483647;

  // ---- create launcher bubble ----
  const bubble = document.createElement('button');
  bubble.id = 'ai-therapy-widget-bubble';
  bubble.setAttribute('aria-label', 'Open chat');
  bubble.style.cssText = `
  position:fixed; right:24px; bottom:24px;
  width:68px; height:68px;         /* ← a bit larger */
  border-radius:50%;               /* keep it a circle */
  background:${primary}; color:#fff;
  box-shadow:0 18px 38px rgba(0,0,0,.28);
  display:grid; place-items:center; cursor:pointer; z-index:${z};
`;
 // bubble.innerHTML = '<svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z"/></svg>';
 bubble.innerHTML = '<img src="…/logoMark.svg" style="width:32px">';
 
 document.body.appendChild(bubble);

  // ---- create panel + iframe ----
  const panel = document.createElement('div');
  panel.id = 'ai-therapy-widget-container';
  panel.style.cssText = `
    position: fixed; ${position === 'left' ? 'left' : 'right'}: 24px; bottom: 24px;
    width:380px; height:560px; max-width:calc(100vw - 32px); max-height:calc(100vh - 96px);
    background:#fff; border-radius:16px; overflow:hidden; box-shadow:0 24px 48px rgba(0,0,0,.28);
    transform: translateY(8px); opacity:0; display:none; z-index:${z};
    transition: transform .22s ease, opacity .22s ease;
  `;
  document.body.appendChild(panel);

  const iframe = document.createElement('iframe');
  iframe.id = 'ai-therapy-widget-iframe';
  iframe.title = 'SmartChild Buddy';
  iframe.allow = 'clipboard-write; autoplay';
  iframe.style.cssText = 'width:100%; height:100%; border:0; display:block;';
  panel.appendChild(iframe);

  // ---- responsive sizing ----
  const setSize = () => {
  const isMobile = matchMedia('(max-width: 640px)').matches;

  if (isMobile) {
    // fill screen on mobile
    panel.style.width = '100vw';
    panel.style.height = '100vh';
    panel.style.bottom = '0';
    panel.style.borderRadius = '0';
    panel.style[position === 'left' ? 'left' : 'right'] = '0';
  } else {
    // roomy desktop size
    panel.style.width = `${OPEN_WIDTH}px`;
    const height = Math.min(window.innerHeight * OPEN_MAX_VH, OPEN_MAX_PX);
    panel.style.height = `${Math.round(height)}px`;
    panel.style.bottom = '24px';
    panel.style.borderRadius = '16px';
    panel.style[position === 'left' ? 'left' : 'right'] = '24px';
  }
};

  setSize();
  window.addEventListener('resize', setSize);

  bubble.addEventListener('keydown', (e) => {
  if (e.key === ' ') e.preventDefault(); // don't toggle on space
});

  // ---- open/close helpers ----
  const openPanel = () => {
    if (!iframe.src) {
      const url = new URL(chatPath, origin);
      // chat.html expects ?project=<id>
      url.searchParams.set('project', projectId);
      iframe.src = url.toString();
    }
    bubble.blur();
    panel.style.display = 'block';
    requestAnimationFrame(() => {
      panel.style.transform = 'translateY(0)';
      panel.style.opacity = '1';
    });
  };

  const closePanel = () => {
    panel.style.transform = 'translateY(8px)';
    panel.style.opacity = '0';
    setTimeout(() => { panel.style.display = 'none'; }, 220);
  };

  // ---- wire launcher ----
  let open = false;
  bubble.addEventListener('click', () => { open ? closePanel() : openPanel(); open = !open; });

  // ---- listen for close requests from iframe ----
  window.addEventListener('message', (evt) => {
    // accept both object message and simple string fallback
    const msg = evt?.data;
    if (msg === 'SCB_CLOSE' || msg?.type === 'SCB_REQUEST_CLOSE') {
      closePanel(); open = false;
    }
  });

  // ---- start-open support ----
  if (startOpen) { openPanel(); open = true; }
})();
