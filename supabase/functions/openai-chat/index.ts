// supabase/functions/capture_lead/index.ts
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { parsePhoneNumberFromString } from "npm:libphonenumber-js@1.10.24";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? ""; // set in dashboard
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors(req) });
  try {
    const { widget_id, lead } = await req.json();
    if (!widget_id || !lead) return j(req, { ok: false, error: "missing widget_id or lead" }, 400);

    const { data: customer } = await sb
      .from("widget_customers")
      .select("id,email,business_name,widget_id")
      .eq("widget_id", widget_id)
      .single();
    if (!customer) return j(req, { ok: false, error: "unknown widget_id" }, 404);

    const { data: cfgRow } = await sb
      .from("widget_configs")
      .select("config")
      .eq("customer_id", customer.id)
      .single();
    const cfg: any = cfgRow?.config ?? {};
    const notifyTo: string = cfg?.leadCapture?.emailNotification || customer.email;
    const captureGeo: boolean = cfg?.leadCapture?.captureGeo !== false;

    // --- IP & country
    let ip =
      (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() ||
      req.headers.get("cf-connecting-ip") ||
      "";
    let country = req.headers.get("cf-ipcountry") || "";
    if (captureGeo && !country) {
      try {
        const geoRes = await fetch(`https://ipapi.co/${ip || ""}/json/`);
        if (geoRes.ok) {
          const g = await geoRes.json();
          country = g.country || g.country_code || "";
        }
      } catch {}
    }

    // --- phone validation/normalization
    let phoneRaw = (lead.phone ?? "").toString().trim();
    let phoneE164 = "";
    let phoneValid = false;
    if (phoneRaw) {
      try {
        const guess = (lead.country || country || "US").toString().toUpperCase();
        const p = parsePhoneNumberFromString(phoneRaw, guess);
        if (p?.isValid()) {
          phoneValid = true;
          phoneE164 = p.number.toString();
        }
      } catch {}
    }

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
    };

    await sb.from("captured_leads").insert({ customer_id: customer.id, lead_data: enriched });

    // --- email notify (Resend)
    if (notifyTo && RESEND_API_KEY) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "SmartChild Buddy <noreply@yourdomain.com>",
          to: [notifyTo],
          subject: `New lead - ${customer.business_name}`,
          text: [
            `A new lead was captured:`,
            ``,
            `Name: ${lead.parentName || ""}`,
            `Email: ${lead.email || ""}`,
            `Phone: ${phoneE164 || phoneRaw || ""}${phoneValid ? " (valid)" : ""}`,
            lead.childName ? `Child: ${lead.childName} (${lead.childAge || "—"})` : null,
            enriched.callbackRequested ? `Callback requested: Yes` : null,
            lead.concerns ? `Concerns: ${lead.concerns}` : null,
            country ? `Country: ${country}` : null,
            ip ? `IP: ${ip}` : null,
            ``,
            `— SmartChild Buddy`,
          ]
            .filter(Boolean)
            .join("\n"),
        }),
      });
    }

    return j(req, { ok: true });
  } catch (e) {
    return j(req, { ok: false, error: e?.message || "error" }, 500);
  }
});

function cors(req: Request) {
  const o = req.headers.get("origin") || "*";
  return {
    "Access-Control-Allow-Origin": o,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };
}
function j(req: Request, body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", ...cors(req) } });
}
