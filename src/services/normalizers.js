export const DEFAULT_LOGO = "/images/Logo%20Fizzia.svg";

function safeNumber(value) {
  return Number(value || 0);
}

export function buildDisplayName(profile = {}) {
  const fullName = [profile.nombre, profile.apellido].filter(Boolean).join(" ").trim();
  return fullName || profile.nombre || profile.email || "Usuario";
}

export function createNotice(message, actorName = "Fizzia", type = "info") {
  return {
    id: crypto.randomUUID(),
    message,
    actorName,
    type,
    read: false,
    createdAt: new Date().toISOString(),
  };
}

export function normalizeCashState(cash) {
  return {
    saldoActual: safeNumber(cash?.saldo_actual ?? cash?.saldoActual),
    updatedAt: cash?.updated_at || cash?.updatedAt || new Date().toISOString(),
  };
}

export function normalizeProduct(product) {
  const stock = safeNumber(product.stock);
  return {
    id: product.id,
    nombre: product.nombre || "",
    categoria: product.categoria || "General",
    marca: product.marca || "",
    descripcion: product.descripcion || "",
    precio: safeNumber(product.precio),
    costo: safeNumber(product.costo || 0),
    stock,
    imagen_url: product.imagen_url || "",
    activo: product.activo ?? true,
    updatedAt: product.updated_at || product.updatedAt || new Date().toISOString(),
  };
}

export function cleanTurnoLabel(value) {
  const text = String(value || "").trim();
  const lower = text.toLowerCase();
  if (["manana", "mañana", "maã±ana"].includes(lower)) return "Mañana";
  if (lower === "tarde") return "Tarde";
  if (lower === "noche") return "Noche";
  if (lower === "apoyo") return "Apoyo";
  return text || "Mañana";
}
