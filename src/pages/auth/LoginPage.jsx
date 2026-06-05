import { useEffect, useRef, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import AuthCheckingScreen from "../../components/ui/AuthCheckingScreen.jsx";
import AdOverlay from "../../components/ui/AdOverlay.jsx";
import Icon from "../../components/ui/Icon";
import ThemeSwitch from "../../components/ui/ThemeSwitch.jsx";
import { useAppContext } from "../../context/AppContext";
import { getBlockedStateSync } from "../../services/usageSessionService";
import { isNativeApp } from "../../utils/platform.js";

const FIZZIA_URL = "https://fizzia.vercel.app/";
const LOGO_URL = "/images/Logo%20Fizzia.svg";
const ADS = [
  { image: "/images/ad%201.jpeg", alt: "Anuncio de Fizzia" },
  { image: "/images/ad%202.jpeg", alt: "Anuncio de Fizzia" },
];
const DEMO_ACCOUNTS = [
  { role: "Administrador", email: "admin@demo.local", password: "demo123", icon: "admin_panel_settings" },
  { role: "Vendedor", email: "vendedor@demo.local", password: "demo123", icon: "point_of_sale" },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const { authChecking, handleLogin, loginError, loginLoading, session, loginForm, setLoginForm, setTheme, theme } = useAppContext();
  const [copied, setCopied] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [loginAd, setLoginAd] = useState(null);
  const nativeApp = isNativeApp();
  const darkMode = theme === "dark";

  const initialBlocked = useRef(getBlockedStateSync());
  const [blocked, setBlocked] = useState(Boolean(initialBlocked.current));
  const [unblockRemaining, setUnblockRemaining] = useState(initialBlocked.current?.unblockRemaining ?? null);
  const lastTickRef = useRef(Date.now());

  useEffect(() => {
    if (!blocked) return;
    const id = setInterval(() => {
      const now = Date.now();
      const delta = now - lastTickRef.current;
      lastTickRef.current = now;
      setUnblockRemaining((prev) => {
        if (prev === null) return prev;
        const next = prev - delta;
        if (next <= 0) { window.location.reload(); return 0; }
        return next;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [blocked]);

  useEffect(() => {
    const idx = Math.floor(Math.random() * ADS.length);
    setLoginAd(ADS[idx]);
  }, []);

  if (blocked) {
    const totalSec = Math.floor((unblockRemaining ?? 0) / 1000);
    const hours = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    const display = hours > 0
      ? `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
      : `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    return (
      <div style={{ position: "fixed", inset: 0, zIndex: 99999, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.92)", padding: "2rem" }}>
        <div className="max-w-md text-center">
          <svg className="mx-auto mb-6 h-16 w-16 text-[#fca5a5]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <circle cx="12" cy="13" r="8" />
            <path d="M12 9v4l2.5 2.5" />
            <path d="M12 5V3" />
            <path d="M10 3h4" />
          </svg>
          <h2 className="text-2xl font-bold text-white">Tiempo de uso agotado</h2>
          <p className="mt-2 text-sm leading-6 text-[#999]">
            Vuelve a intentar cuando termine el contador
          </p>
          <div className="mx-auto mt-6 flex items-center justify-center gap-3">
            <svg className="h-16 w-16 -rotate-90" viewBox="0 0 48 48">
              <circle cx="24" cy="24" fill="none" r="20" stroke="white" strokeOpacity="0.1" strokeWidth="4" />
              <circle cx="24" cy="24" fill="none" r="20" stroke="#fca5a5" strokeLinecap="round" strokeWidth="4"
                strokeDasharray={2 * Math.PI * 20}
                strokeDashoffset={2 * Math.PI * 20 * (1 - Math.min(Math.max(unblockRemaining / (24 * 60 * 60 * 1000), 0), 1))}
                style={{ transition: "stroke-dashoffset 1s linear" }} />
            </svg>
            <span className="text-3xl font-bold tabular-nums tracking-tight text-[#fca5a5]">{display}</span>
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <a className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2fa84f] px-6 py-4 text-base font-semibold text-white transition hover:bg-[#289644]"
              href="https://wa.me/5930989200977" rel="noopener noreferrer" target="_blank">
              Contactar por Whatsapp
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (session) {
    return <Navigate replace to="/panel" />;
  }

  if (authChecking) {
    return <AuthCheckingScreen />;
  }

  const loginAs = async (account) => {
    setSelectedRole(account.role);
    setLoginForm((current) => ({ ...current, email: account.email, password: account.password }));
    const ok = await handleLogin();
    setSelectedRole("");
    if (ok) navigate("/panel");
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const ok = await handleLogin();
    if (ok) navigate("/panel");
  };

  const copyValue = async (key, value) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      window.setTimeout(() => setCopied(""), 1400);
    } catch {
      setCopied("");
    }
  };

  return (
    <div className={`min-h-screen bg-white text-[#0f1f16] dark:bg-black dark:text-white ${nativeApp ? "px-3 py-4 sm:px-5 sm:py-6" : "px-4 py-8"}`}>
      <div className="mx-auto flex min-h-[calc(100dvh-4rem)] max-w-[520px] items-center">
        <div className={`relative w-full overflow-hidden border border-[#dce8df] bg-white shadow-[0_32px_90px_rgba(47,168,79,0.10)] dark:border-[#222] dark:bg-[#0a0a0a] dark:shadow-[0_0_80px_rgba(255,255,255,0.05)] ${nativeApp ? "min-h-[calc(100dvh-2rem)] rounded-[24px]" : "rounded-[28px]"}`}>
          <div className="absolute right-5 top-5 z-20">
            <ThemeSwitch darkMode={darkMode} onToggle={() => setTheme((current) => (current === "dark" ? "light" : "dark"))} />
          </div>

          <div className="px-5 py-7 sm:px-10 lg:px-12">
            <a className="inline-flex items-center gap-4 rounded-2xl p-1 pr-4 transition hover:bg-[#f0edf9] dark:hover:bg-[#1a1a1a]" href={FIZZIA_URL} rel="noreferrer" target="_blank">
              <img alt="Fizzia" className="h-14 w-14 shrink-0 object-contain sm:h-16 sm:w-16" src={LOGO_URL} />
              <p className="text-lg font-semibold text-[#0f1f16] dark:text-white sm:text-xl">Demo</p>
            </a>

            <form className="mt-6 grid gap-4" onSubmit={handleFormSubmit}>
              <input
                className="w-full rounded-md border border-[#dce8df] bg-white px-4 py-3 text-sm text-[#0f1f16] placeholder-[#8ba394] transition focus:border-[#2fa84f] focus:outline-none dark:border-[#333] dark:bg-black dark:text-white dark:placeholder-[#555]"
                placeholder="Correo electronico"
                type="email"
                value={loginForm.email}
                onChange={(e) => setLoginForm((prev) => ({ ...prev, email: e.target.value }))}
              />
              <input
                className="w-full rounded-md border border-[#dce8df] bg-white px-4 py-3 text-sm text-[#0f1f16] placeholder-[#8ba394] transition focus:border-[#2fa84f] focus:outline-none dark:border-[#333] dark:bg-black dark:text-white dark:placeholder-[#555]"
                placeholder="Contrasena"
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm((prev) => ({ ...prev, password: e.target.value }))}
              />

              {loginError ? (
                <div className="rounded-md border border-[#7f1d1d] bg-[#3c1116] px-4 py-3 text-sm text-[#fecaca]">{loginError}</div>
              ) : null}

              <button
                className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#2fa84f] px-4 py-3 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(47,168,79,0.18)] transition hover:-translate-y-0.5 hover:bg-[#238b3e] disabled:opacity-60"
                disabled={loginLoading}
                type="submit"
              >
                <Icon name="login" />
                {loginLoading ? "Entrando..." : "Entrar"}
              </button>
            </form>

            <div className="mt-6 grid gap-3">
              {DEMO_ACCOUNTS.map((account) => (
                <div key={account.email} className="rounded-[18px] border border-[#dce8df] bg-white p-4 dark:border-[#222] dark:bg-black">
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[#edf8f0] text-[#167232] dark:bg-[#111] dark:text-[#2fa84f]">
                      <Icon name={account.icon} />
                    </span>
                    <strong className="flex-1 text-sm text-[#0f1f16] dark:text-white">{account.role}</strong>
                  </div>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    <button className="inline-flex items-center justify-center gap-2 rounded-md border border-[#dce8df] px-3 py-2 text-xs font-semibold text-[#274432] transition hover:border-[#2fa84f] dark:border-[#333] dark:text-[#ccc]" onClick={() => copyValue(`${account.email}:email`, account.email)} type="button">
                      <Icon className="text-[16px]" name="content_copy" />
                      {copied === `${account.email}:email` ? "Copiado" : "Copiar correo"}
                    </button>
                    <button className="inline-flex items-center justify-center gap-2 rounded-md border border-[#dce8df] px-3 py-2 text-xs font-semibold text-[#274432] transition hover:border-[#2fa84f] dark:border-[#333] dark:text-[#ccc]" onClick={() => copyValue(`${account.email}:pass`, account.password)} type="button">
                      <Icon className="text-[16px]" name="content_copy" />
                      {copied === `${account.email}:pass` ? "Copiada" : "Copiar contrasena"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {loginAd ? <AdOverlay ad={loginAd} onClose={() => setLoginAd(null)} /> : null}
    </div>
  );
}
