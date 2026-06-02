import { useEffect, useState } from "react";

const SHOWN_TOASTS_KEY = "sabores-shown-toasts";
const SHOWN_TOAST_TTL_MS = 24 * 60 * 60 * 1000;

function getShownToastMap() {
  try {
    const raw = window.localStorage.getItem(SHOWN_TOASTS_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    const now = Date.now();
    return Object.fromEntries(Object.entries(parsed).filter(([, shownAt]) => now - Number(shownAt || 0) < SHOWN_TOAST_TTL_MS));
  } catch {
    return {};
  }
}

function rememberShownToast(key) {
  if (!key) return;
  try {
    const current = getShownToastMap();
    window.localStorage.setItem(SHOWN_TOASTS_KEY, JSON.stringify({ ...current, [key]: Date.now() }));
  } catch {
    // Ignore private-mode/localStorage failures.
  }
}

export default function useToastQueue(limit = 3, duration = 2200) {
  const [toasts, setToasts] = useState([]);

  const pushToast = (message, type = "info", dedupeKey = "") => {
    if (dedupeKey) {
      const shown = getShownToastMap();
      if (shown[dedupeKey]) return;
      rememberShownToast(dedupeKey);
    }

    setToasts((current) => [...current, { id: crypto.randomUUID(), message, type }].slice(-limit));
  };

  const dismissToast = (id) => setToasts((current) => current.filter((toast) => toast.id !== id));
  const dismissAllToasts = () => setToasts([]);

  useEffect(() => {
    if (!toasts.length) return undefined;
    const timer = window.setTimeout(() => dismissAllToasts(), duration);
    return () => window.clearTimeout(timer);
  }, [duration, toasts]);

  return { toasts, pushToast, dismissToast, dismissAllToasts };
}
