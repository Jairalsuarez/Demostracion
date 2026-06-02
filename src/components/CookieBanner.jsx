import { useEffect, useState } from "react";
import Icon from "./ui/Icon";

const COOKIE_KEY = "ventas-cookie-consent";

function readCookie(name) {
  if (typeof document === "undefined") return null;
  const chunk = document.cookie
    .split("; ")
    .find((item) => item.startsWith(`${name}=`));
  return chunk ? decodeURIComponent(chunk.split("=").slice(1).join("=")) : null;
}

function writeCookie(name, value, days = 180) {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(readCookie(COOKIE_KEY) !== "accepted");
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-4 z-50 px-4">
      <div className="mx-auto flex max-w-4xl flex-col gap-4 rounded-2xl border border-[#dfe7db] bg-white/96 p-4 shadow-[0_22px_50px_rgba(24,51,37,0.14)] backdrop-blur dark:border-white/10 dark:bg-[#122117]/96 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#eef4ea] text-[#1f7a3a] dark:bg-[#1d3425] dark:text-white">
            <Icon name="cookie" />
          </span>
          <div>
            <p className="text-sm font-semibold text-[#183325] dark:text-white">Uso de cookies</p>
            <p className="mt-1 text-sm leading-6 text-[#5b6d61] dark:text-white/68">
              Usamos cookies para mantener la sesión iniciada y recordar preferencias básicas del sitio.
            </p>
          </div>
        </div>

        <button
          className="inline-flex items-center justify-center gap-2 rounded-md bg-[#1f7a3a] px-5 py-3 text-sm font-medium text-white"
          onClick={() => {
            writeCookie(COOKIE_KEY, "accepted");
            setVisible(false);
          }}
          type="button"
        >
          <Icon name="check_circle" />
          Aceptar
        </button>
      </div>
    </div>
  );
}
