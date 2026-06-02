import { createClient } from "@supabase/supabase-js";
import { isNativeApp } from "../utils/platform.js";

const DEMO_LOCAL_ONLY = true;
const url = DEMO_LOCAL_ONLY ? "" : import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL || "";
const key = DEMO_LOCAL_ONLY
  ? ""
  : import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
    import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
    "";

function secureSuffix() {
  if (typeof window !== "undefined" && window.location.protocol === "https:") {
    return "; Secure";
  }
  return "";
}

const cookieStorage = {
  getItem(storageKey) {
    if (typeof document === "undefined") return null;
    const chunk = document.cookie
      .split("; ")
      .find((item) => item.startsWith(`${storageKey}=`));
    if (chunk) return decodeURIComponent(chunk.split("=").slice(1).join("="));
    try {
      return window.localStorage.getItem(storageKey);
    } catch {
      return null;
    }
  },
  setItem(storageKey, value) {
    if (typeof document === "undefined") return;
    document.cookie = `${storageKey}=${encodeURIComponent(value)}; path=/; SameSite=Lax${secureSuffix()}; max-age=${60 * 60 * 24 * 30}`;
    try {
      window.localStorage.setItem(storageKey, value);
    } catch {
      // Cookie remains the primary persistence layer.
    }
  },
  removeItem(storageKey) {
    if (typeof document === "undefined") return;
    document.cookie = `${storageKey}=; path=/; SameSite=Lax${secureSuffix()}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    try {
      window.localStorage.removeItem(storageKey);
    } catch {
      // Ignore storage cleanup failures.
    }
  },
};

const nativeStorage = {
  getItem(storageKey) {
    try {
      return window.localStorage.getItem(storageKey);
    } catch {
      return null;
    }
  },
  setItem(storageKey, value) {
    try {
      window.localStorage.setItem(storageKey, value);
    } catch {
      // Ignore storage failures.
    }
  },
  removeItem(storageKey) {
    try {
      window.localStorage.removeItem(storageKey);
    } catch {
      // Ignore storage failures.
    }
  },
};

export const supabaseReady = Boolean(url && key);

const storage = isNativeApp() ? nativeStorage : cookieStorage;

export const supabase = supabaseReady
  ? createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: "ventas-supabase-auth",
        storage: storage,
      },
    })
  : null;
