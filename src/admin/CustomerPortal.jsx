// src/admin/CustomerPortal.jsx
import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../utils/supabaseClient";

/* ---------------------- tiny toast system ---------------------- */
const useToasts = () => {
  const [toasts, setToasts] = useState([]);
  const push = (type, text) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, type, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  };
  return {
    toasts,
    success: (t) => push("success", t),
    error: (t) => push("error", t),
    info: (t) => push("info", t),
  };
};

const Toasts = ({ toasts }) => (
  <div style={{ position: "fixed", top: 16, right: 16, zIndex: 9999, display: "grid", gap: 8 }}>
    {toasts.map((t) => (
      <div
        key={t.id}
        style={{
          padding: "10px 12px",
          borderRadius: 10,
          color: "#fff",
          minWidth: 240,
          boxShadow: "0 6px 18px rgba(0,0,0,.15)",
          background:
            t.type === "success" ? "#10b981" : t.type === "error" ? "#ef4444" : "#6b7280",
        }}
      >
        {t.text}
      </div>
    ))}
  </div>
);

/* ------------------ defaults + normalizer helpers ------------------ */
const ROUTE_OPTIONS = [
  { value: "route:/assessment", label: "Child Assessment" },
  { value: "route:/callback", label: "Schedule Callback" },
  { value: "route:/reflexes", label: "About Reflexes" },
];

const makeDefaultConfig = (businessName = "SmartChild Buddy") => ({
  branding: { title: businessName, primary: "#764ba2", logo: "" },
  content: {
    welcomeText: {
      title: "👋 Hi there!",
      lines: [
        `I’m the ${businessName} virtual assistant — here to help you 24/7.`,
        "I can answer questions about your child’s concerns and guide you through a quick, parent-friendly assessment.",
        "We’ll suggest next steps and explain how primitive reflexes relate to development.",
      ],
    },
  },
  ui: { startStage: "home", showConcernBox: true },
  home: {
    tiles: [
      { id: "assessment", icon: "🧭", label: "Child Assessment", action: "route:/assessment" },
      { id: "calendar", icon: "📞", label: "Schedule Callback", action: "route:/callback" },
      { id: "reflexes", icon: "🧠", label: "About Reflexes", action: "route:/reflexes" },
      { id: "products", icon: "🛍️", label: "Products", action: "url:https://clinic.example.com/store" },
    ],
  },
  reflexes: { topics: [] },
  qa: { includeSourceLinks: true, confidenceThreshold: 0.62 },
  handoff: { alwaysShowCallbackChip: true, fallbackToCallbackOnLowConfidence: true },
  leadCapture: { fields: ["parentName", "email", "childName", "childAge", "consent"], required: true },
});

const deepMerge = (base, override) => {
  const out = JSON.parse(JSON.stringify(base));
  const merge = (t, s) => {
    if (!s) return;
    for (const k of Object.keys(s)) {
      if (s[k] && typeof s[k] === "object" && !Array.isArray(s[k])) {
        if (!t[k] || typeof t[k] !== "object") t[k] = {};
        merge(t[k], s[k]);
      } else {
        t[k] = s[k];
      }
    }
  };
  merge(out, override);
  return out;
};

const normalizeConfig = (cfg, businessName) => {
  const base = makeDefaultConfig(businessName);
  const inCfg = cfg || {};
  let out = deepMerge(base, inCfg);

  // legacy -> new
  const b = inCfg.branding || {};
  if (!out.branding.title && b.name) out.branding.title = b.name;
  if (!out.branding.primary && b.primaryColor) out.branding.primary = b.primaryColor;
  if (!out.branding.logo && b.logo) out.branding.logo = b.logo;

  if (!inCfg?.content?.welcomeText) {
    const lines = [];
    if (b.greeting) lines.push(b.greeting);
    if (b.tagline) lines.push(b.tagline);
    if (b.responseTime) lines.push(b.responseTime);
    if (lines.length) out.content.welcomeText = { title: "👋 Hi there!", lines };
  }

  if (!inCfg?.home?.tiles && Array.isArray(inCfg.menuOptions)) {
    out.home.tiles = inCfg.menuOptions.map((m, i) => {
      let action = "route:/assessment";
      if (m.action === "callback") action = "route:/callback";
      else if (m.action === "external_link") action = `url:${m.url || ""}`;
      return {
        id: m.id || m.label?.toLowerCase().replace(/\s+/g, "-") || `tile_${i}`,
        icon: m.icon || "✨",
        label: m.label || "Link",
        action,
      };
    });
  }

  return out;
};

const pretty = (obj) => {
  try { return JSON.stringify(obj, null, 2); } catch { return ""; }
};
const safeParse = (text) => {
  try { return JSON.parse(text); } catch (e) { return { __error: e?.message || "Invalid JSON" }; }
};

/* ----------------------------- UI helpers ----------------------------- */
const Card = ({ title, children, actions }) => (
  <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 16, background: "#fff", marginBottom: 16 }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
      <h3 style={{ margin: 0, fontSize: 18 }}>{title}</h3>
      <div>{actions}</div>
    </div>
    {children}
  </div>
);
const inputStyle = { width: "100%", padding: 8, border: "1px solid #e5e7eb", borderRadius: 8 };
const btn = (bg) => ({ padding: "8px 12px", background: bg, color: "#fff", border: 0, borderRadius: 8, cursor: "pointer" });
const btnLink = (bg) => ({ ...btn(bg), textDecoration: "none", display: "inline-block" });

/* ============================ MAIN COMPONENT ============================ */
export default function CustomerPortal() {
  const toast = useToasts();

  const [customers, setCustomers] = useState([]);
  const [loadingList, setLoadingList] = useState(false);

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [config, setConfig] = useState(makeDefaultConfig());

  const [leads, setLeads] = useState([]);
  const [loadingLeads, setLoadingLeads] = useState(false);

  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const [newCustomer, setNewCustomer] = useState({ businessName: "", widgetId: "", email: "" });

  // NEW: advanced JSON on create
  const [useRawOnCreate, setUseRawOnCreate] = useState(false);
  const [newCustomerRawJSON, setNewCustomerRawJSON] = useState("");

  // NEW: Raw JSON editor for existing customer
  const [rawEditorText, setRawEditorText] = useState("");

  const selectedWidgetId = selectedCustomer?.widget_id;

  useEffect(() => { loadCustomers(); }, []);

  /* ---------------------- load customers via RPC ---------------------- */
  const loadCustomers = async () => {
    setLoadingList(true);
    const { data, error } = await supabase.rpc("list_widget_customers");
    setLoadingList(false);
    if (error) {
      console.error(error);
      toast.error("Failed to load customers");
      setCustomers([]);
      return;
    }
    setCustomers(data || []);
  };

  const loadLeadsForCustomer = async (customerId) => {
    setLoadingLeads(true);
    const { data, error } = await supabase.rpc("list_leads_for_customer", { p_customer_id: customerId });
    setLoadingLeads(false);
    if (error) {
      console.error(error);
      setLeads([]);
      return;
    }
    setLeads(data || []);
  };

  const selectCustomer = async (cust) => {
    setSelectedCustomer(cust);
    // prefer RPC same as widget
    let cfg = null;
    const rpc = await supabase.rpc("get_widget_config", { p_widget_id: cust.widget_id });
    if (!rpc.error && rpc.data?.config) cfg = rpc.data.config;
    else {
      const { data } = await supabase.from("widget_configs").select("*").eq("customer_id", cust.id).single();
      if (data?.config) cfg = data.config;
    }
    const normalized = normalizeConfig(cfg, cust.business_name);
    setConfig(normalized);
    setRawEditorText(pretty(normalized)); // keep raw editor synced
    loadLeadsForCustomer(cust.id);
  };

  /* ---------------------- create / save with validation ---------------------- */
  const isValidEmail = (e) => /\S+@\S+\.\S+/.test(e);
  const isValidSlug = (s) => /^[a-z0-9-]+$/.test(s);
  const isValidHex = (h) => /^#([0-9A-Fa-f]{3}){1,2}$/.test(h);
  const isValidUrl = (u) => /^https?:\/\//i.test(u || "");

  const createCustomer = async () => {
    if (!newCustomer.businessName || !newCustomer.widgetId || !newCustomer.email) {
      toast.error("Please fill all fields"); return;
    }
    if (!isValidSlug(newCustomer.widgetId)) { toast.error("Widget ID must be lowercase letters, numbers, hyphens"); return; }
    if (!isValidEmail(newCustomer.email)) { toast.error("Invalid email"); return; }

    // Decide config for the new customer
    let cfgToInsert = makeDefaultConfig(newCustomer.businessName);
    if (useRawOnCreate) {
      if (!newCustomerRawJSON.trim()) {
        toast.error("Paste JSON or turn off Advanced JSON toggle"); return;
      }
      const parsed = safeParse(newCustomerRawJSON);
      if (parsed.__error) { toast.error(`Invalid JSON: ${parsed.__error}`); return; }
      cfgToInsert = normalizeConfig(parsed, newCustomer.businessName);
    }

    setIsCreating(true);
    const { data: customer, error } = await supabase
      .from("widget_customers")
      .insert({
        business_name: newCustomer.businessName,
        email: newCustomer.email,
        widget_id: newCustomer.widgetId.toLowerCase().replace(/\s+/g, "-"),
      })
      .select()
      .single();

    if (error) { setIsCreating(false); toast.error(error.message); return; }

    const { error: cfgErr } = await supabase
      .from("widget_configs")
      .insert({ customer_id: customer.id, config: cfgToInsert });

    setIsCreating(false);
    if (cfgErr) { toast.error(cfgErr.message); return; }

    toast.success("Customer created");
    setShowNewCustomerForm(false);
    setNewCustomer({ businessName: "", widgetId: "", email: "" });
    setNewCustomerRawJSON("");
    setUseRawOnCreate(false);
    await loadCustomers();
    setSelectedCustomer(customer);
    setConfig(cfgToInsert);
    setRawEditorText(pretty(cfgToInsert));
  };

  const validateConfig = () => {
    const b = config.branding || {};
    if (!b.title || b.title.trim().length < 2) return "Branding title is required";
    if (!isValidHex(b.primary || "")) return "Primary color must be a valid hex";

    const tiles = config?.home?.tiles || [];
    if (tiles.length === 0) return "Add at least one Quick Link";
    for (const t of tiles) {
      if (!t.label) return "Each tile needs a label";
      if (!t.action) return "Each tile needs an action";
      if (t.action.startsWith("url:")) {
        const url = t.action.slice(4);
        if (!isValidUrl(url)) return `Invalid URL for tile "${t.label}"`;
      }
    }
    const qa = config?.qa || {};
    if (qa.confidenceThreshold < 0 || qa.confidenceThreshold > 1)
      return "QA confidence threshold must be between 0 and 1";

    return null;
  };


const saveConfig = async () => {
  if (!selectedCustomer) return;
  const err = validateConfig();
  if (err) { toast.error(err); return; }

  setIsSaving(true);

  // 1) does a config row already exist?
  const { data: existing, error: selErr } = await supabase
    .from('widget_configs')
    .select('id')                   // keep it light
    .eq('customer_id', selectedCustomer.id)
    .limit(1)
    .maybeSingle();

  if (selErr) {
    setIsSaving(false);
    toast.error(selErr.message);
    return;
  }

  let error;
  if (existing?.id) {
    // 2) UPDATE existing
    ({ error } = await supabase
      .from('widget_configs')
      .update({ config, updated_at: new Date().toISOString() })
      .eq('id', existing.id));
  } else {
    // 3) INSERT new
    ({ error } = await supabase
      .from('widget_configs')
      .insert({ customer_id: selectedCustomer.id, config, updated_at: new Date().toISOString() }));
  }

  setIsSaving(false);
  if (error) {
    toast.error(error.message);
    return;
  }
  toast.success('Configuration saved');
  await loadCustomers();
};


  // --- CSV export ---
  const exportLeadsCSV = () => {
    if (!selectedCustomer) return;
    const headers = [
      "created_at",
      "parentName",
      "email",
      "phone",
      "childName",
      "childAge",
      "callbackRequested",
      "concerns",
    ];
    const escape = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;

    const rows = leads.map((l) => {
      const d = l.lead_data || {};
      return [
        new Date(l.created_at).toISOString(),
        d.parentName,
        d.email,
        d.phone,
        d.childName,
        d.childAge,
        d.callbackRequested ? "true" : "false",
        d.concerns,
      ].map(escape).join(",");
    });

    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedCustomer.widget_id}_leads.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  /* ---------------------- duplicate customer ---------------------- */
  const duplicateCustomer = async () => {
    if (!selectedCustomer) return;

    const businessName = window.prompt("New business/clinic name?", `${selectedCustomer.business_name} Copy`);
    if (!businessName) return;
    const widgetId = window.prompt("New widget id (lowercase/hyphens)?", `${selectedCustomer.widget_id}-copy`);
    if (!widgetId || !isValidSlug(widgetId)) { toast.error("Invalid widget id"); return; }

    const newCfg = JSON.parse(JSON.stringify(config));
    newCfg.branding = { ...(newCfg.branding || {}), title: businessName };

    const { data: cust, error } = await supabase
      .from("widget_customers")
      .insert({
        business_name: businessName,
        email: selectedCustomer.email,
        widget_id: widgetId,
        subscription_plan: selectedCustomer.subscription_plan || "free",
        is_active: true,
      })
      .select()
      .single();

    if (error) { toast.error(error.message); return; }

    const { error: cfgErr } = await supabase.from("widget_configs").insert({ customer_id: cust.id, config: newCfg });
    if (cfgErr) { toast.error(cfgErr.message); return; }

    toast.success("Customer duplicated");
    await loadCustomers();
  };

  /* ---------------------- tile & topic helpers ---------------------- */
  const addTile = () => {
    const tiles = config?.home?.tiles || [];
    const next = [...tiles, { id: `tile_${Date.now()}`, icon: "✨", label: "New Link", action: "route:/assessment" }];
    setConfig({ ...config, home: { ...config.home, tiles: next } });
    setRawEditorText(pretty({ ...config, home: { ...config.home, tiles: next } }));
  };

  const updateTile = (idx, patch) => {
    const tiles = (config?.home?.tiles || []).map((t, i) => (i === idx ? { ...t, ...patch } : t));
    const next = { ...config, home: { ...config.home, tiles } };
    setConfig(next);
    setRawEditorText(pretty(next));
  };

  const removeTile = (idx) => {
    if (!window.confirm("Remove this tile?")) return;
    const tiles = (config?.home?.tiles || []).filter((_, i) => i !== idx);
    const next = { ...config, home: { ...config.home, tiles } };
    setConfig(next);
    setRawEditorText(pretty(next));
  };

  const addReflexTopic = () => {
    const topics = config?.reflexes?.topics || [];
    const next = [...topics, { id: `topic_${Date.now()}`, title: "New Topic", blurb: "", prompt: "" }];
    const c = { ...config, reflexes: { ...config.reflexes, topics: next } };
    setConfig(c);
    setRawEditorText(pretty(c));
  };

  const updateReflexTopic = (idx, patch) => {
    const topics = (config?.reflexes?.topics || []).map((t, i) => (i === idx ? { ...t, ...patch } : t));
    const c = { ...config, reflexes: { ...config.reflexes, topics } };
    setConfig(c);
    setRawEditorText(pretty(c));
  };

  const removeReflexTopic = (idx) => {
    if (!window.confirm("Remove this topic?")) return;
    const topics = (config?.reflexes?.topics || []).filter((_, i) => i !== idx);
    const c = { ...config, reflexes: { ...config.reflexes, topics } };
    setConfig(c);
    setRawEditorText(pretty(c));
  };

  const welcomeLinesText = useMemo(
    () => (config?.content?.welcomeText?.lines || []).join("\n"),
    [config?.content?.welcomeText?.lines]
  );
  const setWelcomeLinesFromText = (text) => {
    const lines = text.split("\n").map((s) => s.trim()).filter(Boolean);
    const next = {
      ...config,
      content: { ...config.content, welcomeText: { ...(config.content?.welcomeText || {}), lines } },
    };
    setConfig(next);
    setRawEditorText(pretty(next));
  };

  const embedSnippet = selectedCustomer ? 
`<script src="https://YOUR_HOST/widget.js"
  data-project="${selectedCustomer.widget_id}"
  data-origin="https://YOUR_HOST"
  data-chat-path="/chat.html"
  data-position="right"
  data-start-open="false"
  data-primary="#764ba2"
  data-title="${(config?.branding?.name || 'SmartChild Buddy').replace(/"/g,'&quot;')}"></script>` : '';

  const copyEmbed = async () => {
    const snippet = `<script src="https://YOUR_HOST/widget.js"
  data-project="${selectedWidgetId}"
  data-origin="https://YOUR_HOST"
  data-chat-path="/chat.html"
  data-position="right"
  data-start-open="false"></script>`;
    await navigator.clipboard.writeText(snippet);
    toast.success("Embed code copied");
  };

  /* ---------- raw JSON editor actions ---------- */
  const applyRawToForm = () => {
    if (!rawEditorText.trim()) { toast.error("Paste JSON first"); return; }
    const parsed = safeParse(rawEditorText);
    if (parsed.__error) { toast.error(`Invalid JSON: ${parsed.__error}`); return; }
    const normalized = normalizeConfig(parsed, selectedCustomer?.business_name || "SmartChild Buddy");
    setConfig(normalized);
    setRawEditorText(pretty(normalized));
    toast.success("Applied to form");
  };

  const formatRaw = () => {
    const parsed = safeParse(rawEditorText);
    if (parsed.__error) { toast.error(`Invalid JSON: ${parsed.__error}`); return; }
    setRawEditorText(pretty(parsed));
  };

  const downloadRaw = () => {
    const blob = new Blob([rawEditorText || pretty(config)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedCustomer?.widget_id || "widget"}-config.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const applyAndSave = async () => {
    applyRawToForm();
    await saveConfig();
  };

  /* -------------------------------- render -------------------------------- */
  return (
    <div style={{ padding: 20, maxWidth: 1200, margin: "0 auto" }}>
      <Toasts toasts={toast.toasts} />

      <h1 style={{ marginBottom: 12 }}>Widget Customer Portal</h1>

      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 16 }}>
        {/* Left: Customers */}
        <div>
          <Card
            title="Customers"
            actions={
              <button onClick={() => setShowNewCustomerForm((s) => !s)} style={btn("#10b981")}>
                + New
              </button>
            }
          >
            {loadingList && <div style={{ color: "#6b7280" }}>Loading…</div>}
            {!loadingList && customers.length === 0 && <div style={{ color: "#6b7280" }}>No customers yet.</div>}
            {customers.map((c) => (
              <div
                key={c.id}
                onClick={() => selectCustomer(c)}
                style={{
                  padding: 10,
                  marginBottom: 8,
                  border: "1px solid #e5e7eb",
                  borderRadius: 8,
                  cursor: "pointer",
                  background: selectedCustomer?.id === c.id ? "#eef2ff" : "#fff",
                }}
              >
                <div style={{ fontWeight: 600 }}>{c.business_name}</div>
                <div style={{ fontSize: 12, color: "#6b7280" }}>{c.widget_id}</div>
                <div style={{ fontSize: 12, color: "#6b7280" }}>{c.subscription_plan || "free"}</div>
              </div>
            ))}
          </Card>

          {showNewCustomerForm && (
            <Card title="Add Customer">
              <div style={{ display: "grid", gap: 10 }}>
                <div>
                  <label>Business Name</label>
                  <input
                    value={newCustomer.businessName}
                    onChange={(e) => setNewCustomer({ ...newCustomer, businessName: e.target.value })}
                    placeholder="Dr. Smith's Clinic"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label>Widget ID (lowercase, no spaces)</label>
                  <input
                    value={newCustomer.widgetId}
                    onChange={(e) =>
                      setNewCustomer({ ...newCustomer, widgetId: e.target.value.toLowerCase().replace(/\s/g, "-") })
                    }
                    placeholder="dr-smith-clinic"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label>Email</label>
                  <input
                    type="email"
                    value={newCustomer.email}
                    onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                    placeholder="admin@clinic.com"
                    style={inputStyle}
                  />
                </div>

                {/* NEW: Advanced JSON paste on create */}
                <div style={{ marginTop: 8, padding: 12, background: "#f9fafb", borderRadius: 8 }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <input
                      type="checkbox"
                      checked={useRawOnCreate}
                      onChange={(e) => setUseRawOnCreate(e.target.checked)}
                    />
                    <span>Advanced: Paste full JSON config for this customer</span>
                  </label>
                  {useRawOnCreate && (
                    <>
                      <div style={{ marginTop: 8 }}>
                        <textarea
                          rows={10}
                          placeholder='Paste JSON here…'
                          value={newCustomerRawJSON}
                          onChange={(e) => setNewCustomerRawJSON(e.target.value)}
                          style={{ ...inputStyle, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}
                        />
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          type="button"
                          onClick={() => setNewCustomerRawJSON(pretty(makeDefaultConfig(newCustomer.businessName || "SmartChild Buddy")))}
                          style={btn("#6366f1")}
                        >
                          Prefill with defaults
                        </button>
                        <button
                          type="button"
                          onClick={() => setNewCustomerRawJSON("")}
                          style={btn("#ef4444")}
                        >
                          Clear
                        </button>
                      </div>
                    </>
                  )}
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={createCustomer} style={btn("#10b981")} disabled={isCreating}>
                    {isCreating ? "Creating…" : "Create"}
                  </button>
                  <button onClick={() => setShowNewCustomerForm(false)} style={btn("#ef4444")}>
                    Cancel
                  </button>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Right: Config editor */}
        <div>
          {!selectedCustomer ? (
            <Card title="Pick a customer">
              <div style={{ color: "#6b7280" }}>Select a customer on the left to edit their widget.</div>
            </Card>
          ) : (
            <>
              <h2 style={{ margin: "6px 0 12px" }}>
                Configure: <span style={{ color: "#6b7280" }}>{selectedCustomer.business_name}</span>
              </h2>

              {/* Branding */}
              <Card
                title="Branding"
                actions={
                  <button onClick={duplicateCustomer} style={btn("#6366f1")}>
                    Duplicate Customer
                  </button>
                }
              >
                <div style={{ display: "grid", gap: 10, gridTemplateColumns: "1fr 1fr", alignItems: "start" }}>
                  <div>
                    <label>Title</label>
                    <input
                      value={config.branding?.title || ""}
                      onChange={(e) => setConfig({ ...config, branding: { ...config.branding, title: e.target.value } })}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label>Primary Color</label>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <input
                        type="color"
                        value={config.branding?.primary || "#764ba2"}
                        onChange={(e) =>
                          setConfig({ ...config, branding: { ...config.branding, primary: e.target.value } })
                        }
                        style={{ width: 44, height: 36, border: "1px solid #e5e7eb", borderRadius: 6 }}
                      />
                      <input
                        value={config.branding?.primary || "#764ba2"}
                        onChange={(e) => {
                          const v = e.target.value;
                          if (/^#([0-9A-Fa-f]{3}){1,2}$/.test(v))
                            setConfig({ ...config, branding: { ...config.branding, primary: v } });
                        }}
                        style={{ ...inputStyle, width: 120 }}
                      />
                    </div>
                  </div>
                  <div>
                    <label>Logo URL (optional)</label>
                    <input
                      value={config.branding?.logo || ""}
                      onChange={(e) => setConfig({ ...config, branding: { ...config.branding, logo: e.target.value } })}
                      placeholder="https://cdn.site/logo.svg"
                      style={inputStyle}
                    />
                  </div>
                </div>
              </Card>

              {/* Welcome */}
              <Card title="Welcome Text">
                <div style={{ display: "grid", gap: 10 }}>
                  <div>
                    <label>Headline</label>
                    <input
                      value={config.content?.welcomeText?.title || ""}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          content: {
                            ...config.content,
                            welcomeText: { ...(config.content?.welcomeText || {}), title: e.target.value },
                          },
                        })
                      }
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label>Lines (one per row)</label>
                    <textarea
                      value={welcomeLinesText}
                      onChange={(e) => setWelcomeLinesFromText(e.target.value)}
                      rows={4}
                      style={{ ...inputStyle, height: 120 }}
                    />
                  </div>
                </div>
              </Card>

              {/* UI Settings */}
              <Card title="UI Settings">
                <div style={{ display: "grid", gap: 10, gridTemplateColumns: "1fr 1fr" }}>
                  <div>
                    <label>Start Stage</label>
                    <select
                      value={config.ui?.startStage || "home"}
                      onChange={(e) => setConfig({ ...config, ui: { ...(config.ui || {}), startStage: e.target.value } })}
                      style={inputStyle}
                    >
                      <option value="home">Home</option>
                      <option value="lead">Lead Capture</option>
                    </select>
                  </div>
                  <div>
                    <label>Show Concern Box</label>
                    <select
                      value={String(config.ui?.showConcernBox ?? true)}
                      onChange={(e) =>
                        setConfig({ ...config, ui: { ...(config.ui || {}), showConcernBox: e.target.value === "true" } })
                      }
                      style={inputStyle}
                    >
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </select>
                  </div>
                </div>
              </Card>

              {/* Home Tiles */}
              <Card title="Home Quick Links" actions={<button onClick={addTile} style={btn("#6366f1")}>+ Add Tile</button>}>
                {(config.home?.tiles || []).length === 0 && (
                  <div style={{ color: "#6b7280" }}>No tiles configured.</div>
                )}
                {(config.home?.tiles || []).map((t, idx) => {
                  const isUrl = t.action?.startsWith("url:");
                  const isRoute = t.action?.startsWith("route:");
                  return (
                    <div key={t.id || idx} style={{ background: "#f9fafb", padding: 10, borderRadius: 8, marginBottom: 10 }}>
                      <div style={{ display: "grid", gap: 8, gridTemplateColumns: "80px 1fr 1fr 120px" }}>
                        <input
                          value={t.icon || ""}
                          onChange={(e) => updateTile(idx, { icon: e.target.value })}
                          placeholder="Icon"
                          style={inputStyle}
                        />
                        <input
                          value={t.label || ""}
                          onChange={(e) => updateTile(idx, { label: e.target.value })}
                          placeholder="Label"
                          style={inputStyle}
                        />
                        <select
                          value={isRoute ? t.action : isUrl ? "url:" : "route:/assessment"}
                          onChange={(e) => {
                            const v = e.target.value;
                            if (v === "url:") updateTile(idx, { action: "url:https://example.com" });
                            else updateTile(idx, { action: v });
                          }}
                          style={inputStyle}
                        >
                          {ROUTE_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                          ))}
                          <option value="url:">External Link</option>
                        </select>
                        <button onClick={() => removeTile(idx)} style={btn("#ef4444")}>Remove</button>
                      </div>

                      {isUrl && (
                        <div style={{ marginTop: 8 }}>
                          <input
                            value={t.action?.slice(4) || ""}
                            onChange={(e) => updateTile(idx, { action: `url:${e.target.value}` })}
                            placeholder="https://clinic.example.com/store"
                            style={inputStyle}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </Card>

              {/* Reflex Topics */}
              <Card title="Reflex Topics (optional)" actions={<button onClick={addReflexTopic} style={btn("#6366f1")}>+ Add Topic</button>}>
                {(config.reflexes?.topics || []).length === 0 && (
                  <div style={{ color: "#6b7280" }}>No topics yet.</div>
                )}
                {(config.reflexes?.topics || []).map((t, idx) => (
                  <div key={t.id || idx} style={{ background: "#f9fafb", padding: 10, borderRadius: 8, marginBottom: 10 }}>
                    <div style={{ display: "grid", gap: 8 }}>
                      <input
                        value={t.title || ""}
                        onChange={(e) => updateReflexTopic(idx, { title: e.target.value })}
                        placeholder="Title (e.g., ATNR)"
                        style={inputStyle}
                      />
                      <input
                        value={t.blurb || ""}
                        onChange={(e) => updateReflexTopic(idx, { blurb: e.target.value })}
                        placeholder="Short description / teaser"
                        style={inputStyle}
                      />
                      <input
                        value={t.prompt || ""}
                        onChange={(e) => updateReflexTopic(idx, { prompt: e.target.value })}
                        placeholder="Chat prompt for this topic"
                        style={inputStyle}
                      />
                      <div>
                        <button onClick={() => removeReflexTopic(idx)} style={btn("#ef4444")}>Remove</button>
                      </div>
                    </div>
                  </div>
                ))}
              </Card>

              {/* QA */}
              <Card title="Answers (QA) Settings">
                <div style={{ display: "grid", gap: 10, gridTemplateColumns: "1fr 1fr" }}>
                  <div>
                    <label>Include Source Links</label>
                    <select
                      value={String(config.qa?.includeSourceLinks ?? true)}
                      onChange={(e) =>
                        setConfig({ ...config, qa: { ...(config.qa || {}), includeSourceLinks: e.target.value === "true" } })
                      }
                      style={inputStyle}
                    >
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </select>
                  </div>
                  <div>
                    <label>Confidence Threshold (0–1)</label>
                    <input
                      type="number"
                      min={0}
                      max={1}
                      step={0.01}
                      value={config.qa?.confidenceThreshold ?? 0.62}
                      onChange={(e) =>
                        setConfig({ ...config, qa: { ...(config.qa || {}), confidenceThreshold: parseFloat(e.target.value || "0") } })
                      }
                      style={inputStyle}
                    />
                  </div>
                </div>
              </Card>

              {/* NEW: Raw JSON editor */}
              <Card
                title="Raw JSON (advanced)"
                actions={
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={applyRawToForm} style={btn("#10b981")}>Apply to form</button>
                    <button onClick={applyAndSave} style={btn("#2563eb")}>Apply & Save</button>
                    <button onClick={formatRaw} style={btn("#6366f1")}>Format JSON</button>
                    <button onClick={downloadRaw} style={btn("#111827")}>Download</button>
                  </div>
                }
              >
                <textarea
                  rows={14}
                  value={rawEditorText}
                  onChange={(e) => setRawEditorText(e.target.value)}
                  style={{ ...inputStyle, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}
                  placeholder='Paste or edit full config JSON here…'
                />
              </Card>

              {/* Actions, Embed, Leads */}
              <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                <button onClick={saveConfig} style={btn("#2563eb")} disabled={isSaving}>
                  {isSaving ? "Saving…" : "Save Configuration"}
                </button>
                <a
                  href={`http://localhost:5173/chat.html?project=${encodeURIComponent(selectedWidgetId)}`}
                  target="_blank"
                  rel="noreferrer"
                  style={btnLink("#10b981")}
                >
                  Preview Widget →
                </a>
                <button onClick={copyEmbed} style={btn("#111827")}>Copy Embed</button>
              </div>

              <Card
                title="Recent Leads"
                actions={<button onClick={exportLeadsCSV} style={btn("#111827")}>Export CSV</button>}
              >
                {loadingLeads && <div style={{ color: "#6b7280" }}>Loading…</div>}
                {!loadingLeads && leads.length === 0 ? (
                  <div style={{ color: "#6b7280" }}>No leads yet.</div>
                ) : (
                  <div style={{ display: "grid", gap: 8 }}>
                    {leads.map((l) => {
                      const d = l.lead_data || {};
                      return (
                        <div key={l.id} style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: 10 }}>
                          <div style={{ fontSize: 12, color: "#6b7280" }}>{new Date(l.created_at).toLocaleString()}</div>
                          <div style={{ marginTop: 4 }}>
                            <strong>{d.parentName || "—"}</strong> · {d.email || "—"} · Child: {d.childName || "—"} ({d.childAge || "—"})
                          </div>
                          {d.concerns ? <div style={{ marginTop: 4, color: "#374151" }}>“{d.concerns}”</div> : null}
                          {d.callbackRequested ? <div style={{ marginTop: 4, color: "#2563eb" }}>Callback requested</div> : null}
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
