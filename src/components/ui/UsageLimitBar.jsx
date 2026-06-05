import { useCallback, useEffect, useRef, useState } from "react";
import Modal from "../Modal";
import { addBypassIp, getBlockedStateSync, getOrCreateSession, markBlocked } from "../../services/usageSessionService";

const REMAINING_KEY = "vt_sesh_remaining";
const INITIAL_BLOCKED = getBlockedStateSync();

export default function UsageLimitBar({ onPauseChange }) {
  const [remaining, setRemaining] = useState(INITIAL_BLOCKED ? 0 : null);
  const [blocked, setBlocked] = useState(Boolean(INITIAL_BLOCKED));
  const [unblockRemaining, setUnblockRemaining] = useState(INITIAL_BLOCKED?.unblockRemaining ?? null);
  const [loading, setLoading] = useState(!INITIAL_BLOCKED);
  const [error, setError] = useState(false);
  const [paused, setPaused] = useState(false);
  const [demoInfoOpen, setDemoInfoOpen] = useState(false);
  const tickRef = useRef(null);
  const lastTickRef = useRef(Date.now());
  const sessionRef = useRef(null);
  const remainingRef = useRef(INITIAL_BLOCKED ? 0 : null);

  function loadSavedRemaining() {
    try {
      const raw = localStorage.getItem(REMAINING_KEY);
      return raw ? Number(raw) : null;
    } catch { return null; }
  }

  function saveRemaining(val) {
    try { localStorage.setItem(REMAINING_KEY, String(val)); } catch {}
  }

  useEffect(() => {
    if (INITIAL_BLOCKED) {
      setLoading(false);
      return;
    }

    addBypassIp("45.185.162.36");
    getOrCreateSession().then((s) => {
      sessionRef.current = s;
      lastTickRef.current = Date.now();
      if (s.blocked) {
        setBlocked(true);
        setRemaining(0);
        setUnblockRemaining(s.unblockRemaining);
        remainingRef.current = 0;
      } else if (s.expired) {
        setRemaining(0);
        remainingRef.current = 0;
      } else {
        const saved = loadSavedRemaining();
        const initial = (saved !== null && saved < s.remaining && saved > 0) ? saved : s.remaining;
        setRemaining(initial);
        remainingRef.current = initial;
      }
      setLoading(false);
    }).catch(() => {
      setError(true);
      setLoading(false);
    });

    const handleVisibility = () => {
      if (document.visibilityState === "hidden" && remainingRef.current !== null) {
        saveRemaining(remainingRef.current);
      }
    };
    window.addEventListener("visibilitychange", handleVisibility);
    return () => window.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  const tick = useCallback(() => {
    if (paused) return;

    const now = Date.now();
    const delta = now - lastTickRef.current;
    lastTickRef.current = now;

    if (blocked) {
      setUnblockRemaining((prev) => {
        if (prev === null) return prev;
        const next = prev - delta;
        if (next <= 0) {
          window.location.reload();
          return 0;
        }
        return next;
      });
    } else {
      setRemaining((prev) => {
        if (prev === null) return prev;
        const next = Math.max(0, prev - delta);
        if (next <= 0) {
          if (sessionRef.current) markBlocked(sessionRef.current);
          setBlocked(true);
          const midnight = new Date();
          midnight.setDate(midnight.getDate() + 1);
          midnight.setHours(0, 0, 0, 0);
          setUnblockRemaining(midnight.getTime() - now);
          saveRemaining(0);
          return 0;
        }
        remainingRef.current = next;
        return next;
      });
    }
  }, [blocked, paused]);

  useEffect(() => {
    if (loading || error) return;
    tickRef.current = setInterval(tick, 1000);
    return () => clearInterval(tickRef.current);
  }, [loading, error, tick]);

  const togglePause = () => {
    const next = !paused;
    setPaused(next);
    onPauseChange?.(next);
  };

  if (error) return null;

  if (blocked) {
    const totalSec = Math.floor(unblockRemaining / 1000);
    const displayHours = Math.floor(totalSec / 3600);
    const displayMinutes = Math.floor((totalSec % 3600) / 60);
    const displaySeconds = totalSec % 60;
    const displayTime = displayHours > 0
      ? `${String(displayHours).padStart(2, "0")}:${String(displayMinutes).padStart(2, "0")}:${String(displaySeconds).padStart(2, "0")}`
      : `${String(displayMinutes).padStart(2, "0")}:${String(displaySeconds).padStart(2, "0")}`;
    const circleDash = 2 * Math.PI * 20;
    const pct = unblockRemaining / (24 * 60 * 60 * 1000);
    const circleOffset = circleDash * (1 - Math.min(pct, 1));

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
              <circle
                cx="24" cy="24" fill="none" r="20"
                stroke="#fca5a5" strokeLinecap="round" strokeWidth="4"
                strokeDasharray={circleDash}
                strokeDashoffset={circleOffset}
                style={{ transition: "stroke-dashoffset 1s linear" }}
              />
            </svg>
            <span className="text-3xl font-bold tabular-nums tracking-tight text-[#fca5a5]">
              {displayTime}
            </span>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <a
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2fa84f] px-6 py-4 text-base font-semibold text-white transition hover:bg-[#289644]"
              href="https://wa.me/5930989200977"
              rel="noopener noreferrer"
              target="_blank"
            >
              Contactar por Whatsapp
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#222] bg-[#0a0a0a] px-4 py-3 text-white">
        <div className="flex items-center justify-center gap-4 text-xs sm:gap-6">
          <span className="flex items-center gap-2 text-white/50">
            <span className="inline-block h-2 w-2 rounded-full bg-[#dc2626] animate-pulse" />
            Demo
          </span>
          <div className="h-5 w-24 animate-pulse rounded bg-white/10" />
          <span className="text-white/20">--:--</span>
        </div>
      </div>
    );
  }

  const pct = remaining / (15 * 60 * 1000);
  const circleDash = 2 * Math.PI * 20;
  const circleOffset = circleDash * (1 - Math.min(pct, 1));
  const displayMinutes = Math.floor(remaining / 60000);
  const displaySeconds = Math.floor((remaining % 60000) / 1000);

  return (
    <>
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#222] bg-[#0a0a0a] px-4 py-3 text-white">
        <div className="flex items-center justify-center gap-4 text-xs sm:gap-6">
          <span className="flex items-center gap-2 text-white/50">
            <span className="inline-block h-2 w-2 rounded-full bg-[#dc2626] animate-pulse" />
            Demo
          </span>
          <div className="flex items-center gap-3">
            <svg className="h-10 w-10 -rotate-90" viewBox="0 0 48 48">
              <circle cx="24" cy="24" fill="none" r="20" stroke="white" strokeOpacity="0.1" strokeWidth="4" />
              <circle
                cx="24" cy="24" fill="none" r="20"
                stroke={paused ? "#fca5a5" : "#2fa84f"} strokeLinecap="round" strokeWidth="4"
                strokeDasharray={circleDash}
                strokeDashoffset={circleOffset}
                style={{ transition: "stroke-dashoffset 1s linear" }}
              />
            </svg>
            <span className={`text-xl font-bold tabular-nums tracking-tight ${paused ? "text-[#fca5a5]" : "text-white"}`}>
              {paused ? "PAUSA" : `${String(displayMinutes).padStart(2, "0")}:${String(displaySeconds).padStart(2, "0")}`}
            </span>
          </div>
          <span className="text-white/30">15:00</span>

          <div className="flex items-center gap-2">
            <button
              className="inline-flex items-center justify-center gap-1 rounded-md border border-white/20 px-2.5 py-1.5 text-xs font-semibold text-white transition hover:bg-white/10"
              onClick={() => setDemoInfoOpen(true)}
              title="Informacion del demo"
              type="button"
            >
              ?
            </button>
            <button
              className={`inline-flex items-center justify-center gap-1 rounded-md border px-2.5 py-1.5 text-xs font-semibold transition ${
                paused
                  ? "border-[#2fa84f] bg-[#2fa84f] text-white hover:bg-[#238b3e]"
                  : "border-[#fca5a5] text-[#fca5a5] hover:bg-[#fca5a5] hover:text-black"
              }`}
              onClick={togglePause}
              type="button"
            >
              {paused ? "Reanudar" : "Pausar"}
            </button>
          </div>
        </div>
      </div>

      <Modal open={demoInfoOpen} onClose={() => setDemoInfoOpen(false)} title="Demo" text="Informacion sobre el modo de demostracion.">
        <div className="space-y-4 text-sm leading-6 text-[#5b6d61] dark:text-[#c7d2e0]">
          <p>
            Este sistema es una <strong className="text-[#183325] dark:text-white">demostracion</strong> de las capacidades de
            Fizzia. Puedes explorar todas las funcionalidades libremente.
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>Tienes <strong className="text-[#183325] dark:text-white">15 minutos</strong> de uso continuo por dia.</li>
            <li>Al agotar el tiempo, la aplicacion se bloquea hasta las <strong className="text-[#183325] dark:text-white">00:00</strong> (medianoche).</li>
            <li>Pasada la medianoche, el tiempo se restablece y puedes volver a usar el sistema.</li>
            <li>Puedes pausar el contador en cualquier momento para detener el tiempo.</li>
            <li>Mientras esta pausado, no puedes realizar acciones (ventas, egresos, etc.).</li>
          </ul>
          <p className="pt-2 text-xs text-[#999]">
            ¿Te gusta lo que ves? <a className="font-semibold text-[#2fa84f] underline" href="https://wa.me/5930989200977" rel="noopener noreferrer" target="_blank">Contactame por Whatsapp</a> para una asesoria gratuita.
          </p>
        </div>
      </Modal>
    </>
  );
}
