// supabase/functions/capture-lead/index.ts
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ---- ENV ----
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ALLOWED_ORIGINS = (Deno.env.get("ALLOWED_ORIGINS") || "")
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);

// ---- CORS helpers ----
function isAllowedOrigin(origin: string) {
  if (!origin) return true; // non-browser clients
  if (!ALLOWED_ORIGINS.length) return true;
  return ALLOWED_ORIGINS.includes(origin);
}
function cors(req: Request) {
  const origin = req.headers.get("origin") ?? "";
  const allow = isAllowedOrigin(origin) ? (origin || "*") : "null";
  return {
    "Access-Control-Allow-Origin": allow,
    "Vary": "Origin",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "content-type, apikey, authorization, x-client-info",
  };
}
function json(req: Request, body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", ...cors(req) },
  });
}

serve(async (req) => {
  // 1) CORS preflight
  if (req.method === "OPTIONS") return new Response(null, { headers: cors(req) });

  // 2) Origin allow-list check
  const origin = req.headers.get("origin") ?? "";
  if (!isAllowedOrigin(origin)) return json(req, { ok: false, error: "origin_not_allowed" }, 403);

  const sb = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  try {
    const { widget_id, lead } = await req.json();
    if (!widget_id || !lead) return json(req, { ok: false, error: "missing widget_id or lead" }, 400);

    // 3) Honeypot bot filter (quietly drop)
    if (typeof lead.website === "string" && lead.website.trim()) {
      return json(req, { ok: true, dropped: true });
    }

    // 4) IP + country from edge headers (Cloudflare/Supabase)
    const ip =
      (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() ||
      req.headers.get("cf-connecting-ip") ||
      "";
    let country = req.headers.get("cf-ipcountry") || lead.country || "";

    // 5) Lookup customer + config
    const { data: customer, error: cErr } = await sb
      .from("widget_customers")
      .select("id,email,business_name,widget_id")
      .eq("widget_id", widget_id)
      .single();
    if (cErr || !customer) return json(req, { ok: false, error: "unknown widget_id" }, 404);

    const { data: cfgRow } = await sb
      .from("widget_configs")
      .select("config")
      .eq("customer_id", customer.id)
      .single();
    const cfg: any = cfgRow?.config ?? {};
    const captureGeo: boolean = cfg?.leadCapture?.captureGeo !== false; // default ON

    // 6) Optional geo fallback (ipapi) if enabled & missing country
    if (captureGeo && !country && ip) {
      try {
        const geoRes = await fetch(`https://ipapi.co/${ip}/json/`);
        if (geoRes.ok) {
          const g = await geoRes.json();
          country = g.country || g.country_code || country || "";
        }
      } catch {
        // ignore geo errors
      }
    }

    // 7) Country-aware phone normalization (dynamic import to avoid top-level build issues)
    let phoneRaw = (lead.phone ?? "").toString().trim();
    let phoneE164 = "";
    let phoneValid = false;
    if (phoneRaw) {
      try {
        const { parsePhoneNumberFromString } = await import("npm:libphonenumber-js@1.10.24");
        const region = (lead.country || country || "US").toString().toUpperCase();
        const p = parsePhoneNumberFromString(phoneRaw, region);
        if (p?.isValid()) {
          phoneValid = true;
          phoneE164 = p.number.toString(); // E.164
        }
      } catch {
        // ignore phone lib errors
      }
    }

    // 8) Simple rate limit: max 5 leads / 10 minutes per IP
    if (ip) {
      const sinceISO = new Date(Date.now() - 10 * 60 * 1000).toISOString();
      const { count } = await sb
        .from("captured_leads")
        .select("*", { count: "exact", head: true })
        .gte("created_at", sinceISO)
        .filter("lead_data->>ip", "eq", ip);
      if ((count ?? 0) > 5) return json(req, { ok: false, error: "rate_limited" }, 429);
    }

    // 9) Build enriched record
    const enriched = {
      ...lead,
      phone: phoneRaw || "",
      phoneE164,
      phoneValid,
      detectedCountry: country || null,
      ip: captureGeo ? (ip || null) : null,
      callbackRequested: Boolean(lead.callbackRequested),
      capturedVia: "widget",
      widget_id,
      // lightweight attribution
      referrer: lead.referrer || null,
      page: lead.page || null,
      utm: lead.utm || null,
    };

    // 10) Insert & return lead_id
    const { data: inserted, error: iErr } = await sb
      .from("captured_leads")
      .insert({ customer_id: customer.id, lead_data: enriched })
      .select("id, created_at")
      .single();
    if (iErr) return json(req, { ok: false, error: iErr.message }, 500);

    return json(req, { ok: true, lead_id: inserted.id });
  } catch (e) {
    return json(req, { ok: false, error: e?.message || "error" }, 500);
  }
});
