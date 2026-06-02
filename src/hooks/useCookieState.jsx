import { useEffect, useState } from "react";

function readCookie(name) {
  if (typeof document === "undefined") return null;
  const chunk = document.cookie
    .split("; ")
    .find((item) => item.startsWith(`${name}=`));
  if (!chunk) return null;
  return decodeURIComponent(chunk.split("=").slice(1).join("="));
}

function writeCookie(name, value, days) {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

export default function useCookieState(name, initialValue, days = 90) {
  const [value, setValue] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = window.localStorage.getItem(name);
      if (stored !== null) return stored;
    }
    return readCookie(name) ?? initialValue;
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(name, value);
    } catch {
      // Cookie persistence remains as a fallback.
    }
    writeCookie(name, value, days);
  }, [days, name, value]);

  return [value, setValue];
}
