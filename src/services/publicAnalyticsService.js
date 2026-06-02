import { supabase, supabaseReady } from "./supabaseclient.js";

const PUBLIC_ANALYTICS_KEY = "public-catalog-analytics";

const DEFAULT_ANALYTICS = {
  pageVisits: 0,
  whatsappClicks: 0,
};

export function getPublicAnalytics() {
  if (typeof window === "undefined") return DEFAULT_ANALYTICS;

  try {
    const parsed = JSON.parse(localStorage.getItem(PUBLIC_ANALYTICS_KEY) || "{}");
    return {
      pageVisits: Number(parsed.pageVisits || 0),
      whatsappClicks: Number(parsed.whatsappClicks || 0),
    };
  } catch {
    return DEFAULT_ANALYTICS;
  }
}

function savePublicAnalytics(nextAnalytics) {
  if (typeof window === "undefined") return nextAnalytics;
  localStorage.setItem(PUBLIC_ANALYTICS_KEY, JSON.stringify(nextAnalytics));
  window.dispatchEvent(new CustomEvent("public-analytics-updated", { detail: nextAnalytics }));
  return nextAnalytics;
}

async function insertRemoteAnalyticsEvent(eventType) {
  if (!supabaseReady || !supabase) return { ok: false };

  const { error } = await supabase.from("public_analytics_events").insert({
    event_type: eventType,
    page_path: typeof window !== "undefined" ? window.location.pathname : null,
  });

  return { ok: !error, error: error?.message || "" };
}

export async function fetchPublicAnalytics() {
  if (!supabaseReady || !supabase) return getPublicAnalytics();

  const { data, error } = await supabase.from("public_analytics_events").select("event_type");
  if (error) return getPublicAnalytics();

  return (data || []).reduce(
    (acc, item) => {
      if (item.event_type === "page_visit") acc.pageVisits += 1;
      if (item.event_type === "whatsapp_click") acc.whatsappClicks += 1;
      return acc;
    },
    { ...DEFAULT_ANALYTICS }
  );
}

export function trackPublicPageVisit() {
  const current = getPublicAnalytics();
  insertRemoteAnalyticsEvent("page_visit");
  return savePublicAnalytics({ ...current, pageVisits: current.pageVisits + 1 });
}

export function trackWhatsAppClick() {
  const current = getPublicAnalytics();
  insertRemoteAnalyticsEvent("whatsapp_click");
  return savePublicAnalytics({ ...current, whatsappClicks: current.whatsappClicks + 1 });
}
