// src/supabaseClient.js
//import { createClient } from '@supabase/supabase-js'

//const supabaseUrl = 'https://dbwdaphrepcjbmxhjgou.supabase.co'
//const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRid2RhcGhyZXBjamJteGhqZ291Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1MDc5MDQsImV4cCI6MjA3MDA4MzkwNH0.BAFtq7Z66Z23RF7dXGNNG4woIGSVGkPJKEDURQG7HBc'

//export const supabase = createClient(supabaseUrl, supabaseAnonKey)
// src/utils/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

/**
 * Prefer Vite env if present; otherwise fall back to your existing constants.
 * This keeps all current code working, but lets you switch environments
 * without editing source.
 */

const FALLBACK_URL = 'https://dbwdaphrepcjbmxhjgou.supabase.co';
const FALLBACK_ANON =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRid2RhcGhyZXBjamJteGhqZ291Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1MDc5MDQsImV4cCI6MjA3MDA4MzkwNH0.BAFtq7Z66Z23RF7dXGNNG4woIGSVGkPJKEDURQG7HBc';

function pick(key) {
  // Vite env at build/runtime
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env && key in import.meta.env) {
      return import.meta.env[key];
    }
  } catch (_) {}
  // Node env (SSR/tools)
  try {
    if (typeof process !== 'undefined' && process.env && key in process.env) {
      return process.env[key];
    }
  } catch (_) {}
  return undefined;
}

let url = pick('VITE_SUPABASE_URL') || FALLBACK_URL;
let anon = pick('VITE_SUPABASE_ANON_KEY') || FALLBACK_ANON;

/**
 * Optional: allow meta-tag overrides on specific pages (e.g., /admin)
 * <meta name="supabase-url" content="https://...supabase.co">
 * <meta name="supabase-anon" content="eyJ...">
 */
if (typeof document !== 'undefined') {
  const metaUrl = document.querySelector('meta[name="supabase-url"]')?.content;
  const metaAnon = document.querySelector('meta[name="supabase-anon"]')?.content;
  url = metaUrl || url;
  anon = metaAnon || anon;
}

export const supabase = createClient(url, anon, {
  auth: { persistSession: true, autoRefreshToken: true },
});

// Helpful debug (remove if noisy)
if (!pick('VITE_SUPABASE_URL') || !pick('VITE_SUPABASE_ANON_KEY')) {
  console.warn('⚠️ Using FALLBACK Supabase URL/key. Set VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY to override.');
}

