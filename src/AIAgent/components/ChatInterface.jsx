// src/AIAgent/components/ChatInterface.jsx
import React, { useEffect, useRef, useState } from "react";
import ReflexBuddyAI from "../core/ReflexBuddyAI";
import { supabase } from "../../utils/supabaseClient";

const reflexBuddyAI = new ReflexBuddyAI();
/* ----------------------------- Small UI bits ----------------------------- */


function HeaderBar({ brandColor, brandTitle, onBack, showBack, showClose }) {
  return (
    <div
      className="flex items-center justify-between px-4 py-3 text-white"
      style={{ background: brandColor }}
    >
      <div className="flex items-center gap-2">
        {showBack && (
          <button
            onClick={onBack}
            className="px-2 py-1 rounded hover:bg-white/20"
            aria-label="Back"
          >
            ← Back
          </button>
        )}
        <div className="font-semibold">Welcome to {brandTitle}</div>
      </div>
      {showClose && (
        <button
          onClick={() =>
            window.parent?.postMessage({ type: "SCB_REQUEST_CLOSE" }, "*")
          }
          className="px-2 py-1 rounded hover:bg-white/20"
          aria-label="Close"
        >
          ✕
        </button>
      )}
    </div>
  );
}

function LoadingDots({ color = "#7c3aed" }) {
  return (
    <div className="flex justify-start">
      <div className="bg-white shadow-lg rounded-2xl p-4">
        <div className="flex gap-2">
          <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: color }} />
          <div className="w-2 h-2 rounded-full animate-bounce [animation-delay:120ms]" style={{ background: color }} />
          <div className="w-2 h-2 rounded-full animate-bounce [animation-delay:240ms]" style={{ background: color }} />
        </div>
      </div>
    </div>
  );
}

/* ----------------------------- Capture callback (compact) ----------------------------- */

function CallbackForm({ projectId, onBack, onDone, brandColor = "#764ba2", brandTitle = "SmartChild Buddy" }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", website: "" }); // website = honeypot
  const [submitting, setSubmitting] = useState(false);

  // Prefill from previous visit
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("scb_parent") || "null");
      if (saved) setForm((f) => ({ ...f, ...saved }));
    } catch {}
  }, []);

  const looksLikePhone = (v) => !v || /^\+?[0-9()[\]\s-]{7,20}$/.test(v);

  const callCaptureLead = async (payload) => {
    // Try hyphen first (if you deployed as capture-lead), then underscore fallback
    try {
      return await supabase.functions.invoke("capture-lead", { body: payload });
    } catch (e) {
      return await supabase.functions.invoke("capture_lead", { body: payload });
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email) {
      alert("Name and email are required");
      return;
    }
    if (!looksLikePhone(form.phone)) {
      alert("Please enter a valid phone number");
      return;
    }

    setSubmitting(true);
    try {
      const { data, error } = await callCaptureLead({
        widget_id: projectId,
        lead: {
          parentName: form.name,
          email: form.email,
          phone: form.phone || "",
          website: form.website || "", // honeypot
          callbackRequested: true,
          route: "callback",
          referrer: document.referrer,
          page: location.href,
          utm: Object.fromEntries(new URLSearchParams(location.search).entries()),
        },
      });
      if (error) throw error;

      localStorage.setItem(
        "scb_parent",
        JSON.stringify({ name: form.name, email: form.email, phone: form.phone })
      );

      onDone?.(data);
    } catch (err) {
      console.error("[CallbackForm] error", err);
      alert("Could not submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const input =
    "w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500";

  return (
    <div className="h-full flex flex-col">
      <HeaderBar
        brandColor={brandColor}
        brandTitle={brandTitle}
        onBack={onBack}
        showBack
        showClose
      />

      <form onSubmit={submit} className="p-6 bg-white flex-1 overflow-y-auto space-y-4" aria-busy={submitting}>
        {/* Honeypot */}
        <input
          type="text"
          name="website"
          autoComplete="off"
          value={form.website}
          onChange={(e) => setForm({ ...form, website: e.target.value })}
          style={{ position: "absolute", left: "-9999px", opacity: 0 }}
          tabIndex={-1}
        />

        <h2 className="text-xl font-bold mb-2">Request a quick callback</h2>
        <p className="text-sm text-gray-600 mb-4">
          Leave your details and we’ll reach out shortly.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">Your name *</label>
            <input
              className={input}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Email *</label>
            <input
              type="email"
              className={input}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Phone (optional)</label>
            <input
              className={input}
              placeholder="e.g. +1 415 555 0123"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 rounded-xl text-white font-semibold"
          style={{ background: brandColor }}
        >
          {submitting ? "Submitting…" : "Request callback"}
        </button>
      </form>
    </div>
  );
}

/* ----------------------------- Lead capture (2-column) ----------------------------- */

function LeadForm({ projectId, brandColor, onBack, onComplete, pendingConcern }) {
  const [form, setForm] = useState({
    parentName: "",
    email: "",
    childName: "",
    childAge: "",
    website: "", // honeypot
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("scb_parent") || "null");
      if (saved)
        setForm((f) => ({
          ...f,
          parentName: saved.name || "",
          email: saved.email || "",
        }));
    } catch {}
  }, []);

  const callCaptureLead = async (payload) => {
    try {
      return await supabase.functions.invoke("capture-lead", { body: payload });
    } catch (e) {
      return await supabase.functions.invoke("capture_lead", { body: payload });
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.childName || !form.childAge) {
      alert("Please complete required fields.");
      return;
    }
    setSubmitting(true);
    try {
      const { data, error } = await callCaptureLead({
        widget_id: projectId,
        lead: {
          parentName: form.parentName || "",
          email: form.email || "",
          childName: form.childName || "",
          childAge: form.childAge || "",
          website: form.website || "", // honeypot
          concerns: pendingConcern || "",
          route: "lead",
          referrer: document.referrer,
          page: location.href,
          utm: Object.fromEntries(new URLSearchParams(location.search).entries()),
        },
      });
      if (error) throw error;

      localStorage.setItem(
        "scb_parent",
        JSON.stringify({
          name: form.parentName,
          email: form.email,
          phone: "",
        })
      );

      onComplete?.({
        childName: form.childName,
        childAge: parseInt(form.childAge, 10),
        response: data,
      });
    } catch (err) {
      console.error("[LeadForm] error", err);
      alert("Could not submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const input =
    "w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500";

  return (
    <div className="h-full flex flex-col">
      <HeaderBar
        brandColor={brandColor}
        brandTitle="SmartChild Buddy"
        onBack={onBack}
        showBack
        showClose
      />

      <form onSubmit={submit} className="p-6 bg-white flex-1 overflow-y-auto space-y-4" aria-busy={submitting}>
        {/* Honeypot */}
        <input
          type="text"
          name="website"
          autoComplete="off"
          value={form.website}
          onChange={(e) => setForm({ ...form, website: e.target.value })}
          style={{ position: "absolute", left: "-9999px", opacity: 0 }}
          tabIndex={-1}
        />

        <div className="space-y-1">
          <h2 className="text-lg font-bold">Thanks for sharing your concern ❤️</h2>
          <p className="text-sm text-gray-600">
            Before we begin a quick, parent-friendly assessment, please share a few details so we can tailor guidance and follow up if needed.
          </p>
          {pendingConcern && (
            <div className="text-xs text-gray-600 mt-1">
              Concern: <span className="font-medium">{pendingConcern}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">Your name</label>
            <input
              className={input}
              value={form.parentName}
              onChange={(e) => setForm({ ...form, parentName: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Email *</label>
            <input
              type="email"
              required
              className={input}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Child’s first name *</label>
            <input
              required
              className={input}
              value={form.childName}
              onChange={(e) => setForm({ ...form, childName: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Child’s age (years) *</label>
            <input
              type="number"
              min="1"
              max="18"
              required
              className={input}
              value={form.childAge}
              onChange={(e) => setForm({ ...form, childAge: e.target.value })}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 rounded-xl text-white font-semibold"
          style={{ background: brandColor }}
        >
          {submitting ? "Starting…" : "Start consultation"}
        </button>
      </form>
    </div>
  );
}

/* ----------------------------- Main Chat Interface ----------------------------- */

export default function ChatInterface({ widgetMode = false, projectId = "" }) {
  // UI route stage (home/lead/chat/callback)
  const [stage, setStage] = useState("home");

  // AI dialogue stage (initial/questioning/diagnostic/recommendations/…)
  const [dialogStage, setDialogStage] = useState("initial");


  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [config, setConfig] = useState(null);
  const [tiles, setTiles] = useState([]);
  const [pendingConcern, setPendingConcern] = useState("");
  const [selectedConcerns, setSelectedConcerns] = useState([]);

  const [childInfo, setChildInfo] = useState(null);
  const messagesEndRef = useRef(null);

  // Intro shown once per assessment
  const assessmentIntroShownRef = useRef(false);
 
  /* ----------------------------- Effects ----------------------------- */

  // ESC closes widget
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape")
        window.parent?.postMessage({ type: "SCB_REQUEST_CLOSE" }, "*");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Fetch per-clinic config
  useEffect(() => {
    if (!widgetMode || !projectId) return;
    let alive = true;
    (async () => {
      const { data, error } = await supabase.rpc("get_widget_config", {
        p_widget_id: projectId,
      });
      if (!error && data && alive) {
        setConfig(normalizeConfig(data.config || {}));
      } else {
        setConfig(normalizeConfig({}));
      }
    })();
    return () => {
      alive = false;
    };
  }, [widgetMode, projectId]);

  // Apply tiles + startStage
  useEffect(() => {
    if (!config) return;
    const t =
      Array.isArray(config?.home?.tiles) && config.home.tiles.length
        ? config.home.tiles
        : DEFAULT_TILES;
    setTiles(t);
    const start = config?.ui?.startStage || (t.length ? "home" : "lead");
    setStage(start);
  }, [config, widgetMode]);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const brandColor = config?.branding?.primary || "#764ba2";
  const brandTitle = config?.branding?.title || "SmartChild Buddy";

  /* ----------------------------- Concern helpers ----------------------------- */

  const toggleConcern = (label) => {
    setSelectedConcerns((prev) =>
      prev.includes(label)
        ? prev.filter((x) => x !== label)
        : [...prev, label]
    );
  };

  const buildConcernText = (chips = selectedConcerns, typed = pendingConcern) => {
    const list = chips.length ? chips.join(", ") : "";
    const t = (typed || "").trim();
    if (list && t) return `${list} — ${t}`;
    if (list) return list;
    return t;
  };

  const continueToLead = () => {
    const combined = buildConcernText();
    setPendingConcern(combined);
    setStage("lead");
  };

  const displayConcern = buildConcernText();

  /* ----------------------------- Tile actions ----------------------------- */

  const runTileAction = (tile) => {
    const action = tile?.action || "route:/assessment";
    if (action.startsWith("route:")) {
      const route = action.slice(6);
      if (route === "/callback") {
        setStage("callback");
      } else {
        setStage("lead");
      }
      return;
    }
    if (action.startsWith("url:")) {
      window.open(action.slice(4), "_blank", "noopener,noreferrer");
      return;
    }
    setStage("lead");
  };

  /* ----------------------------- Chat send ----------------------------- */

function splitReplyIntoBubbles(text) {
  if (!text) return [];

  const t = text.trim();
  const qIdx = t.search(/Question\s*\d+\s*:/i);

  // If a Question is present, split into [empathy, preamble, question]
  if (qIdx > -1) {
    const beforeQ = t.slice(0, qIdx).trim();
    const question = t.slice(qIdx).trim();

    // further split "beforeQ" at "Before we dive..."
    const diveIdx = beforeQ.search(/Before we dive/i);
    const parts = [];
    if (diveIdx > -1) {
      parts.push(beforeQ.slice(0, diveIdx).trim());
      parts.push(beforeQ.slice(diveIdx).trim());
    } else {
      parts.push(beforeQ);
    }
    parts.push(question);

    return parts.filter(Boolean);
  }

  // otherwise try a simple split at the first blank line
  const nn = t.indexOf('\n\n');
  if (nn !== -1) return [t.slice(0, nn).trim(), t.slice(nn).trim()];

  return [t];
}


  const sendText = async (text, extraCtx = {}) => {

    function routeIntent(text, cfg) {
  const t = (text || '').toLowerCase();

  // services
  const svc = cfg?.services?.keywords || {};
  for (const [key, syns] of Object.entries(svc)) {
    const words = [key, ...(syns || [])].map(w => w.toLowerCase());
    if (words.some(w => t.includes(w))) return { type: 'service', key };
  }

  // scheduling
  if (/\b(book|schedule|appointment|consult|callback)\b/i.test(t))
    return { type: 'schedule' };

  // simple FAQ match
  const faqs = cfg?.faqs || [];
  const hit = faqs.find(f => t.includes(f.q.toLowerCase().replace(/\?$/, '')));
  if (hit) return { type: 'faq', faq: hit };

  // otherwise: assessment
  return { type: 'assessment' };
}


    const msg = (text || chatInput || "").trim();
    if (!msg || isLoading) return;

    setMessages((p) => [...p, { role: "user", content: msg }]);
    setChatInput("");
    setIsLoading(true);

    try {
      const response = await reflexBuddyAI.chat(msg, {
        childAge: childInfo?.age,
        childName: childInfo?.name,
        previousStage: dialogStage,
        ...extraCtx,
      });

      const reply =
        response?.message ||
        "I’m here to help. Could you share a bit more about your child?";

     const nextStage = response?.dialogStage || response?.stage || stage;
     if (nextStage) setStage(nextStage);

const isQuestionFlow = nextStage === "questioning" || nextStage === "diagnostic";

      
        if (isQuestionFlow && !assessmentIntroShownRef.current) {
    assessmentIntroShownRef.current = true; // <-- keep the flag, nothing else

} 

/*setMessages(prev => [
  ...prev,
  {
    role: "assistant",
    content: reply,
    hasExercises: !!response?.includesExercises,
    needsFollowUp: !!response?.needsFollowUp,
  },
]);*/

const parts = splitReplyIntoBubbles(reply);

setMessages(prev => [
  ...prev,
  ...parts.map((content, idx) => ({
    role: "assistant",
    content,
    hasExercises: idx === parts.length - 1 ? !!response?.includesExercises : false,
    needsFollowUp: idx === parts.length - 1 ? !!response?.needsFollowUp : false,
  })),
]);

      if (nextStage) setStage(nextStage);

    } catch (err) {
      console.error("chat error", err);
      setMessages((p) => [
        ...p,
        {
          role: "assistant",
          content:
            "Sorry — I had trouble with that. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };


  

  /* ----------------------------- Stage renders ----------------------------- */


  const brand = config?.persona?.brandName || config?.branding?.title || 'our clinic';
const intent = routeIntent(userMsg, config);

// keep a light memory so flows connect
const [serviceContext, setServiceContext] = useState(null);

if (intent.type === 'service') {
  setServiceContext(intent.key); // remember chosen service

  const autoStart = (config?.ui?.autoStartAssessmentOnServiceQuery ?? true);
  if (autoStart) {
    setPendingConcern(intent.key);
    setIsLoading(false);
    setStage('lead');
    return;
  }
  const raw = config?.services?.answers?.[intent.key] ||
              `Yes — ${brand} supports families in this area.`;
  const answer = raw
    .replaceAll('{{brand}}', brand)
    .replaceAll('{{phone}}', config?.contact?.phone || '')
    .replaceAll('{{email}}', config?.contact?.email || '');

  pushAssistant(answer, {
    ctas: [
      config?.schedule?.bookUrl ? { label: 'Book consult', type: 'link', href: config.schedule.bookUrl } : null,
      { label: 'Start 2-minute check', type: 'action', action: 'start_assessment' },
      config?.schedule?.callbackEnabled ? { label: 'Request callback', type: 'action', action: 'open_callback' } : null
    ].filter(Boolean)
  });
  return; // don’t jump into lead form yet
}

if (intent.type === 'faq') {
  const a = intent.faq.a
    .replaceAll('{{brand}}', brand)
    .replaceAll('{{phone}}', config?.contact?.phone || '')
    .replaceAll('{{email}}', config?.contact?.email || '')
    .replaceAll('{{address}}', config?.contact?.address || '')
    .replaceAll('{{mapUrl}}', config?.contact?.mapUrl || '');
  pushAssistant(a, {
    ctas: [
      config?.schedule?.bookUrl ? { label: 'Book consult', type: 'link', href: config.schedule.bookUrl } : null,
      config?.schedule?.callbackEnabled ? { label: 'Request callback', type: 'action', action: 'open_callback' } : null
    ].filter(Boolean)
  });
  return;
}

if (intent.type === 'schedule') {
  if (config?.schedule?.bookUrl) openExternal(config.schedule.bookUrl);
  else setStage('callback'); // your existing callback form
  return;
}

// intent === 'assessment' → run your current flow
// pass serviceContext so intros reference Autism/ADHD when present
runReflexAssessment({ serviceContext });


  if (stage === "callback") {
    return (
      <CallbackForm
        projectId={projectId}
        brandColor={brandColor}
        brandTitle={brandTitle}
        onBack={() => setStage("home")}
        onDone={() => {
          setMessages((p) => [
            ...p,
            {
              role: "assistant",
              content:
                "Thanks! Our team will call you soon. Meanwhile, you can ask me anything here.",
            },
          ]);
          setStage("chat");
        }}
      />
    );
  }

  if (stage === "lead") {
    return (
      <LeadForm
        projectId={projectId}
        brandColor={brandColor}
        onBack={() => setStage("home")}
        pendingConcern={pendingConcern}
        onComplete={({ childName, childAge }) => {
          setChildInfo({ name: childName, age: childAge });
          setDialogStage("initial");
          assessmentIntroShownRef.current = false;

          const initial = buildConcernText([], pendingConcern);
          setStage("chat");

          if (initial) {
            setMessages([]);
            setTimeout(() => sendText(initial), 30);
          } else {
            setMessages([
              {
                role: "assistant",
                content: `Hi ${
                  childName ? `there — supporting ${childName}` : "there"
                }! Tell me about your child’s needs and I’ll guide you.`,
              },
            ]);
          }
        }}
      />
    );
  }

  if (stage === "home") {
    const welcomeTitle =
      config?.content?.welcomeText?.title || "👋 Hi there!";
    const welcomeLines = Array.isArray(config?.content?.welcomeText?.lines)
      ? config.content.welcomeText.lines
      : null;
    const concernsList = config?.home?.concerns || DEFAULT_CONCERNS;

    return (
      <div className="h-full flex flex-col">
        <HeaderBar brandColor={brandColor} brandTitle={brandTitle} showClose />

        {/* Welcome */}
        <div className="p-4 space-y-4">
          <div className="space-y-1.5">
            <h2 className="text-lg font-extrabold text-gray-900">
              {welcomeTitle}
            </h2>
            {welcomeLines ? (
              welcomeLines.map((line, i) => (
                <p key={i} className="text-[14px] leading-[1.6] text-gray-700">
                  {line}
                </p>
              ))
            ) : (
              <>
                <p className="text-[14px] leading-[1.6] text-gray-700 max-w-[46ch]">
                  I’m the <span className="font-semibold">{brandTitle}</span>{" "}
                  virtual assistant — here to help you 24/7.
                </p>
                <p className="text-[14px] leading-[1.6] text-gray-700 max-w-[46ch]">
                  I can answer questions about your child’s concerns and guide
                  you through a quick, parent-friendly assessment. We’ll suggest
                  next steps and explain how primitive reflexes relate to
                  development.
                </p>
              </>
            )}
          </div>

          {/* Concern box */}
          {config?.ui?.showConcernBox !== false && (
            <div className="rounded-xl border bg-white p-3 shadow-sm">
              <label className="block text-sm font-semibold mb-1">
                Tell us your concern
              </label>
              <div className="flex gap-2">
             
              <input
  type="text"
  inputMode="text"
  className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
  placeholder="e.g., speech, behavior, movement, learning…"
  value={pendingConcern}
  onChange={(e) => setPendingConcern(e.target.value)}
  onKeyDown={(e) => {
    // keep space/keys inside the input; don't let them bubble to the page/bubble
    e.stopPropagation();
    if (e.key === 'Enter') {
      e.preventDefault();
      setStage('lead');
    }
  }}
/>

                <button
                  className="px-4 py-2 rounded-lg text-white font-semibold disabled:opacity-50"
                  style={{ background: brandColor }}
                  onClick={continueToLead}
                  disabled={!displayConcern}
                >
                  Continue
                </button>
              </div>

              {/* Concern chips */}
              <div className="mt-2 flex flex-wrap gap-2">
                {concernsList.map((c) => {
                  const active = selectedConcerns.includes(c);
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => toggleConcern(c)}
                      className={`h-9 px-4 rounded-full border ${
                        active
                          ? "bg-gray-900 text-white border-gray-900"
                          : "bg-white text-gray-800 border-gray-200 hover:bg-gray-50"
                      }`}
                      title={c}
                    >
                      {c}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quick links (compact row) */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-gray-600">
              Quick links
            </div>
            <div className="flex flex-wrap gap-2">
              {(tiles && tiles.length ? tiles : DEFAULT_TILES).map((t) => (
                <button
                  key={t.id}
                  onClick={() => runTileAction(t)}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-full border bg-white hover:bg-gray-50"
                  title={t.label}
                >
                  <span aria-hidden>{t.icon || "•"}</span>
                  <span className="text-sm">{t.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="px-4 pb-4 text-[12px] text-gray-500">
          You can also hit <span className="font-semibold">Esc</span> to close
          the widget.
        </div>
      </div>
    );
  }

  /* ----------------------------- Chat stage ----------------------------- */

  return (
    <div className="h-full flex flex-col">
      <HeaderBar
        brandColor={brandColor}
        brandTitle={brandTitle}
        showClose
        showBack={stage === "chat" && (dialogStage === "questioning" || dialogStage === "diagnostic")}
        onBack={() => setStage("home")}
      />

      {/* Child context */}
      {childInfo && (
        <div className="bg-purple-50 px-4 py-2 border-b text-sm">
          Supporting <span className="font-semibold">{childInfo.name}</span>, age{" "}
          {childInfo.age}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#f7f7f8]">
       {messages.map((msg, idx) => {
  const isUser = msg.role === "user";
  const isQuestion = /^Question\s*\d+\s*:/i.test(msg.content);

  return (
    <div key={idx} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-3xl ${isUser ? "order-2" : ""}`}>
        <div className={`rounded-2xl p-4 ${isUser ? "bg-purple-600 text-white ml-auto" : "bg-white shadow-lg"}`}>
          <div
            className={
              // narrower column + tighter leading improves readability
              `whitespace-pre-wrap max-w-[62ch] ${
                isQuestion ? "text-[16px] font-semibold leading-7" : "text-[15px] leading-6"
              }`
            }
          >
            {msg.content}
          </div>

          {msg.hasExercises && (
            <div className="mt-3 pt-3 border-t border-purple-100">
              <span className="text-xs text-purple-600">💡 Exercises included above — try them today!</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
})}

        {isLoading && <LoadingDots color={brandColor} />}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick answers for question flow */}
      
      {/* Explore topics (chips) */}
      {config?.ui?.showConcernBox !== false && (
        <div className="px-4 py-2 bg-white border-t">
          <div className="text-xs font-semibold text-gray-600 mb-1">Explore topics</div>
          <div className="flex flex-wrap gap-2">
            {(config?.home?.concerns || DEFAULT_CONCERNS).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => sendText(c)}
                className="h-8 px-3 rounded-full border bg-white text-gray-800 border-gray-200 hover:bg-gray-50"
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      
      {/* Yes / No / Sometimes quick replies */}
{(dialogStage === "questioning" || dialogStage === "diagnostic") && (
  <div className="px-4 py-2 bg-white border-t flex items-center justify-center gap-2">
    <button
      onClick={() => sendText("Yes")}
      disabled={isLoading}
      className="px-4 py-2 rounded-lg text-white font-semibold disabled:opacity-50"
      style={{ background: brandColor }}
    >
      Yes ✓
    </button>
    <button
      onClick={() => sendText("No")}
      disabled={isLoading}
      className="px-4 py-2 rounded-lg text-white font-semibold disabled:opacity-50"
      style={{ background: brandColor }}
    >
      No ✗
    </button>
    <button
      onClick={() => sendText("Sometimes")}
      disabled={isLoading}
      className="px-4 py-2 rounded-lg text-white font-semibold disabled:opacity-50"
      style={{ background: brandColor }}
    >
      Sometimes
    </button>
  </div>
)}


      {/* Input */}
      <div className="p-4 border-t bg-white">
        <div className="flex gap-2">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendText()}
            placeholder="Ask about your child…"
            className="flex-1 px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            disabled={isLoading}
          />
          <button
            onClick={() => sendText()}
            disabled={isLoading || !chatInput.trim()}
            className="px-6 py-3 rounded-xl text-white font-semibold disabled:opacity-50"
            style={{ background: brandColor }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------- Defaults & normalizer ----------------------------- */

const DEFAULT_TILES = [
  { id: "assessment", label: "Child Assessment", icon: "🧭", action: "route:/assessment" },
  { id: "callback",   label: "Schedule Callback", icon: "📞", action: "route:/callback" },
  { id: "reflexes",   label: "About Reflexes", icon: "🧠", action: "route:/reflexes" },
  { id: "products",   label: "Products", icon: "🛍️", action: "url:https://clinic.example.com/store" },
];

const DEFAULT_CONCERNS = ["Speech", "Behavior", "Feeding", "Sleep", "Sensory", "Learning"];

function normalizeConfig(cfgRaw) {
  const cfg = cfgRaw || {};
  return {
    schemaVersion: cfg.schemaVersion || 1,
    branding: {
      title: cfg?.branding?.title || cfg?.branding?.name || "SmartChild Buddy",
      primary: cfg?.branding?.primary || cfg?.branding?.primaryColor || "#764ba2",
      logo: cfg?.branding?.logo || "",
    },
    ui: {
      startStage: cfg?.ui?.startStage || "home",
      showConcernBox: cfg?.ui?.showConcernBox !== false,
    },
    content: {
      welcomeText: cfg?.content?.welcomeText || null,
      homePlaceholder: cfg?.content?.homePlaceholder || "",
    },
    home: {
      tiles: Array.isArray(cfg?.home?.tiles) ? cfg.home.tiles : DEFAULT_TILES,
      concerns: Array.isArray(cfg?.home?.concerns) ? cfg.home.concerns : DEFAULT_CONCERNS,
    },
    leadCapture: cfg?.leadCapture || { enabled: true },
    qa: cfg?.qa || {},
  };
}
