import { createNotice, DEFAULT_LOGO, normalizeCashState, normalizeProduct } from "./normalizers.js";

const APP_KEY = "fizzia-ventas-local-v3";
const BUSINESS_CONTACT = {
  telefono: "+593999999999",
  whatsapp: "593999999999",
  horario: "Lunes a Sabado - 09:00 - 19:00",
};

const nowIso = () => new Date().toISOString();

function seed() {
  return {
    business: {
      nombre: "Demo",
      descripcion: "",
      telefono: BUSINESS_CONTACT.telefono,
      whatsapp: BUSINESS_CONTACT.whatsapp,
      ubicacion: "",
      horario: BUSINESS_CONTACT.horario,
      mapaUrl: "",
      instagramUrl: "",
      facebookUrl: "",
      logoUrl: DEFAULT_LOGO,
      featuredProductId: "",
    },
    wallet: { saldoActual: 0, updatedAt: nowIso() },
    cashBox: { saldoActual: 0, updatedAt: nowIso() },
    users: [
      {
        id: "demo-admin",
        nombre: "Administrador",
        apellido: "Demo",
        telefono: "593999999998",
        email: "admin@demo.local",
        role: "admin",
        avatarUrl: "",
        password: "demo123",
        source: "local",
      },
      {
        id: "demo-vendedor",
        nombre: "Vendedor",
        apellido: "Demo",
        telefono: "593999999997",
        email: "vendedor@demo.local",
        role: "vendedor",
        avatarUrl: "",
        password: "demo123",
        source: "local",
      },
    ],
    products: [],
    sales: [],
    expenses: [],
    expenseCategories: [],
    distributors: [],
    turnos: [],
    schedules: [],
    communityFeedbacks: [],
    notifications: [],
  };
}

export function getAppData() {
  const baseline = seed();
  try {
    const raw = localStorage.getItem(APP_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    if (!parsed) return baseline;
    const merged = { ...baseline, ...parsed };
    merged.business = { ...baseline.business, ...(parsed.business || {}), ...BUSINESS_CONTACT, nombre: baseline.business.nombre, logoUrl: baseline.business.logoUrl };
    merged.cashBox = normalizeCashState(parsed.cashBox || parsed.cash_box || baseline.cashBox);
    merged.products = (parsed.products?.length ? parsed.products : baseline.products).slice(0, 6).map(normalizeProduct);
    merged.users = parsed.users?.length ? parsed.users : baseline.users;
    return merged;
  } catch {
    return baseline;
  }
}

export function saveAppData(data) {
  localStorage.setItem(APP_KEY, JSON.stringify(data));
}
