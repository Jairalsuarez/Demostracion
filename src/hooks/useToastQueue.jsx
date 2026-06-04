import { useEffect, useRef, useState } from "react";

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
  } catch {}
}

export default function useToastQueue(limit = 3, duration = 2200) {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef({});

  const pushToast = (message, type = "info", dedupeKey = "", action = null) => {
    if (dedupeKey) {
      const shown = getShownToastMap();
      if (shown[dedupeKey]) return;
      rememberShownToast(dedupeKey);
    }

    const id = crypto.randomUUID();
    setToasts((current) => [...current, { id, message, type, action }].slice(-limit));
  };

  const dismissToast = (id) => {
    if (timersRef.current[id]) {
      clearTimeout(timersRef.current[id]);
      delete timersRef.current[id];
    }
    setToasts((current) => current.filter((t) => t.id !== id));
  };

  useEffect(() => {
    const currentIds = toasts.map((t) => t.id);
    const activeIds = Object.keys(timersRef.current);

    activeIds.forEach((id) => {
      if (!currentIds.includes(id)) {
        clearTimeout(timersRef.current[id]);
        delete timersRef.current[id];
      }
    });

    currentIds.forEach((id) => {
      if (!timersRef.current[id]) {
        timersRef.current[id] = setTimeout(() => {
          delete timersRef.current[id];
          setToasts((current) => current.filter((t) => t.id !== id));
        }, duration);
      }
    });
  }, [toasts, duration]);

  useEffect(() => {
    return () => {
      Object.values(timersRef.current).forEach(clearTimeout);
      timersRef.current = {};
    };
  }, []);

  return { toasts, pushToast, dismissToast };
}
