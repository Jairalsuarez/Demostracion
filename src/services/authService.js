import { getAppData } from "./appDataService.js";
import { buildDisplayName } from "./normalizers.js";

const SESSION_KEY = "ventas-local-session-v2";
const DAYS = 90;

function secureSuffix() {
  if (typeof window !== "undefined" && window.location.protocol === "https:") {
    return "; Secure";
  }
  return "";
}

function writeCookie(name, value, days = DAYS) {
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax${secureSuffix()}`;
}

function readCookie(name) {
  const chunk = document.cookie
    .split("; ")
    .find((item) => item.startsWith(`${name}=`));
  return chunk ? decodeURIComponent(chunk.split("=").slice(1).join("=")) : null;
}

function removeCookie(name) {
  document.cookie = `${name}=; path=/; SameSite=Lax${secureSuffix()}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

export function getSession() {
  try {
    const raw = readCookie(SESSION_KEY) || (() => {
      try {
        return window.localStorage.getItem(SESSION_KEY);
      } catch {
        return null;
      }
    })();
    if (!raw) return null;
    const session = JSON.parse(raw);
    if (new Date(session.expiresAt).getTime() < Date.now()) {
      removeCookie(SESSION_KEY);
      return null;
    }
    return session;
  } catch {
    removeCookie(SESSION_KEY);
    return null;
  }
}

function createSession(user, mode = "local") {
  return {
    userId: user.id,
    role: user.role,
    nombre: user.nombre,
    apellido: user.apellido || "",
    telefono: user.telefono || "",
    email: user.email,
    avatarUrl: user.avatarUrl || "",
    displayName: buildDisplayName(user),
    mode,
    expiresAt: new Date(Date.now() + DAYS * 24 * 60 * 60 * 1000).toISOString(),
  };
}

function persistSession(session) {
  writeCookie(SESSION_KEY, JSON.stringify(session));
  try {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
  }
  return session;
}

function persistLocalSession(user) {
  return persistSession(createSession(user, "local"));
}

export function clearSession() {
  removeCookie(SESSION_KEY);
  try {
    window.localStorage.removeItem(SESSION_KEY);
  } catch {
  }
}

function loginLocal(email, password) {
  const app = getAppData();
  const user = app.users.find(
    (item) => item.email?.trim().toLowerCase() === email.trim().toLowerCase() && item.password === password
  );
  if (!user) return { ok: false, error: "Credenciales invalidas." };
  return { ok: true, session: persistLocalSession(user) };
}

export async function loginUser({ email, password }) {
  return loginLocal(email.trim().toLowerCase(), password);
}
