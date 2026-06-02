import { createNotice, DEFAULT_LOGO, normalizeCashState, normalizeCommunityFeedback, normalizeProduct } from "./normalizers.js";

const APP_KEY = "fizzia-ventas-demo-local-v2";
const BUSINESS_CONTACT = {
  telefono: "+593999999999",
  whatsapp: "593999999999",
  horario: "Lunes a Sabado - 09:00 - 19:00",
};

const nowIso = () => new Date().toISOString();

function seed() {
  const now = nowIso();

  return {
    business: {
      nombre: "Demo",
      descripcion: "Una demo comercial de Fizzia para presentar ventas, caja e inventario con una experiencia clara y rapida.",
      telefono: BUSINESS_CONTACT.telefono,
      whatsapp: BUSINESS_CONTACT.whatsapp,
      ubicacion: "Local comercial",
      horario: BUSINESS_CONTACT.horario,
      mapaUrl: "",
      instagramUrl: "",
      facebookUrl: "",
      logoUrl: DEFAULT_LOGO,
      featuredProductId: "prod-mango",
    },
    wallet: { saldoActual: 320, updatedAt: now },
    cashBox: { saldoActual: 85, updatedAt: now },
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
    products: [
      normalizeProduct({
        id: "prod-mango",
        nombre: "Jugo natural de mango",
        categoria: "Bebidas",
        marca: "Linea demo",
        descripcion: "Producto de ejemplo para registrar ventas y descontar stock local.",
        precio: 2.5,
        stockLocal: 8,
        stockDeposito: 6,
        stock: 14,
        imagen_url: "/images/ad%201.jpeg",
        activo: true,
      }),
      normalizeProduct({
        id: "prod-fresa",
        nombre: "Batido de fresa",
        categoria: "Bebidas",
        marca: "Linea demo",
        descripcion: "Item limitado para probar seleccion, cobro y resumen de ventas.",
        precio: 3.25,
        stockLocal: 5,
        stockDeposito: 4,
        stock: 9,
        imagen_url: "/images/ad%202.jpeg",
        activo: true,
      }),
      normalizeProduct({
        id: "prod-combo",
        nombre: "Combo comercial",
        categoria: "Combos",
        marca: "Linea demo",
        descripcion: "Combo de demostracion para tickets con mayor valor.",
        precio: 4.8,
        stockLocal: 4,
        stockDeposito: 3,
        stock: 7,
        imagen_url: "/images/buenafe.png",
        activo: true,
      }),
      normalizeProduct({
        id: "prod-snack",
        nombre: "Snack premium",
        categoria: "Snacks",
        marca: "Linea demo",
        descripcion: "Producto seco para mostrar inventario mixto en una demo corta.",
        precio: 1.75,
        stockLocal: 10,
        stockDeposito: 8,
        stock: 18,
        imagen_url: "/images/trabajando.png",
        activo: true,
      }),
    ],
    sales: [],
    expenses: [],
    expenseCategories: [
      { id: "cat-mercaderia", nombre: "Mercaderia", createdAt: now },
      { id: "cat-servicios", nombre: "Servicios", createdAt: now },
      { id: "cat-otros", nombre: "Otros", createdAt: now },
    ],
    distributors: [{ id: "dist-central", nombre: "Proveedor demo", telefono: "", notas: "", createdAt: now }],
    turnos: [],
    schedules: [],
    communityFeedbacks: [
      normalizeCommunityFeedback({
        id: "feedback-1",
        comment: "El panel se entiende rapido y permite explicar el flujo de venta sin configuraciones externas.",
      }),
      normalizeCommunityFeedback({
        id: "feedback-2",
        comment: "La demo guarda ventas, caja e inventario directamente en este navegador.",
      }),
    ],
    notifications: [createNotice("Fizzia preparo esta demo para una presentacion comercial.", "Fizzia")],
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
