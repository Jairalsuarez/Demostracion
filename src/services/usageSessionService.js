const SESSION_DURATION = 15 * 60 * 1000;
const COOKIE_NAME = "vt_sesh";
const STORAGE_KEY = "ventas_usage_session";
const DB_NAME = "ventas_db";
const DB_STORE = "session";
const BYPASS_STORAGE_KEY = "ventas_bypass_ips";

function getBypassIps() {
  try {
    const raw = localStorage.getItem(BYPASS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function addBypassIp(ip) {
  const ips = getBypassIps();
  if (!ips.includes(ip)) {
    ips.push(ip);
    try { localStorage.setItem(BYPASS_STORAGE_KEY, JSON.stringify(ips)); } catch {}
  }
}

function getMidnightMs() {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setDate(midnight.getDate() + 1);
  midnight.setHours(0, 0, 0, 0);
  return midnight.getTime();
}

function getBlockedDuration() {
  return getMidnightMs() - Date.now();
}

function setCookie(name, value, minutes) {
  const expires = new Date(Date.now() + minutes * 60 * 1000).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function getCookie(name) {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function getStorage() {
  try { return localStorage.getItem(STORAGE_KEY); } catch { return null; }
}

function setStorage(value) {
  try { localStorage.setItem(STORAGE_KEY, value); } catch {}
}

function getSessionStorage() {
  try { return sessionStorage.getItem(STORAGE_KEY); } catch { return null; }
}

function setSessionStorage(value) {
  try { sessionStorage.setItem(STORAGE_KEY, value); } catch {}
}

function openIDB() {
  if (!window.indexedDB) return null;
  return new Promise((resolve) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(DB_STORE)) db.createObjectStore(DB_STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => resolve(null);
  });
}

async function getIDB() {
  try {
    const db = await openIDB();
    if (!db) return null;
    return new Promise((resolve) => {
      const tx = db.transaction(DB_STORE, "readonly");
      const req = tx.objectStore(DB_STORE).get("session");
      req.onsuccess = () => { resolve(req.result); db.close(); };
      req.onerror = () => { resolve(null); db.close(); };
    });
  } catch { return null; }
}

async function setIDB(value) {
  try {
    const db = await openIDB();
    if (!db) return;
    const tx = db.transaction(DB_STORE, "readwrite");
    tx.objectStore(DB_STORE).put(value, "session");
    tx.oncomplete = () => db.close();
  } catch {}
}

function buildFingerprint() {
  return [
    navigator.userAgent,
    screen.width, screen.height, screen.colorDepth,
    navigator.language, navigator.platform,
  ].join("||");
}

let cachedIp = null;

async function fetchIp() {
  if (cachedIp) return cachedIp;
  try {
    const res = await fetch("https://api.ipify.org?format=json", { signal: AbortSignal.timeout(5000) });
    const data = await res.json();
    cachedIp = data.ip;
    return cachedIp;
  } catch {
    return "unknown";
  }
}

function writeSessionAll(ip, fingerprint, startedAt) {
  const encoded = JSON.stringify({ ip, fingerprint, startedAt });
  setCookie(COOKIE_NAME, encoded, 30);
  setStorage(encoded);
  setSessionStorage(encoded);
  setIDB({ ip, fingerprint, startedAt });
}

function writeBlockedAll(ip, fingerprint, blockedAt) {
  const data = { ip, fingerprint, blockedAt };
  const encoded = JSON.stringify(data);
  const minutesUntilMidnight = Math.ceil(getBlockedDuration() / 60000) + 5;
  setCookie(COOKIE_NAME, encoded, minutesUntilMidnight);
  setStorage(encoded);
  setSessionStorage(encoded);
  setIDB(data);
}

export async function getOrCreateSession() {
  const raw = getCookie(COOKIE_NAME) || getStorage() || getSessionStorage() || (await getIDB());
  if (raw) {
    try {
      const data = typeof raw === "string" ? JSON.parse(raw) : raw;

      if (data.blockedAt || data.ip) {
        const bypassIps = getBypassIps();
        if (bypassIps.includes(data.ip)) {
          return createFreshSession();
        }
      }

      if (data.blockedAt) {
        clearAllStorage();
        return createFreshSession();
      }

      if (data.startedAt) {
        const elapsed = Date.now() - Number(data.startedAt);
        if (elapsed < SESSION_DURATION) {
          return { ...data, remaining: SESSION_DURATION - elapsed };
        }
        clearAllStorage();
        return createFreshSession();
      }
    } catch {}
  }

  return createFreshSession();
}

async function createFreshSession() {
  const ip = await fetchIp();
  const fingerprint = buildFingerprint();
  const startedAt = Date.now();
  writeSessionAll(ip, fingerprint, startedAt);
  return { ip, fingerprint, startedAt, remaining: SESSION_DURATION };
}

function markBlocked(session) {
  const blockedAt = Date.now();
  writeBlockedAll(session.ip, session.fingerprint, blockedAt);
}

function clearAllStorage() {
  try { localStorage.removeItem(STORAGE_KEY); } catch {}
  try { sessionStorage.removeItem(STORAGE_KEY); } catch {}
  document.cookie = `${COOKIE_NAME}=;expires=${new Date(0).toUTCString()};path=/`;
  if (window.indexedDB) {
    try { window.indexedDB.deleteDatabase(DB_NAME); } catch {}
  }
}

export function clearSession() {
  clearAllStorage();
}

export { addBypassIp, getBypassIps };
