export const DEFAULT_LOGO = "/images/Logo%20Fizzia.svg";

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

export function buildDisplayName(profile = {}) {
  const fullName = [profile.nombre, profile.apellido].filter(Boolean).join(" ").trim();
  return fullName || profile.nombre || profile.email || "Usuario";
}

export function normalizeRole(role) {
  if (!role) return "vendedor";
  const value = String(role).toLowerCase().trim();
  if (value === "admin") return "admin";
  if (value === "seller" || value === "vendedor") return "vendedor";
  return "vendedor";
}

export function safeNumber(value) {
  return Number(value || 0);
}

export function normalizeProduct(product) {
  const legacyStock = safeNumber(product.stock);
  const hasSplitStock = product.stock_local !== undefined || product.stockLocal !== undefined || product.stock_deposito !== undefined || product.stockDeposito !== undefined;
  const stockLocal = hasSplitStock ? safeNumber(product.stock_local ?? product.stockLocal) : legacyStock;
  const stockDeposito = hasSplitStock ? safeNumber(product.stock_deposito ?? product.stockDeposito) : 0;
  return {
    id: product.id,
    nombre: product.nombre || "",
    categoria: product.categoria || "General",
    marca: product.marca || "",
    descripcion: product.descripcion || "",
    precio: safeNumber(product.precio),
    stockLocal,
    stockDeposito,
    stock: stockLocal + stockDeposito,
    imagen_url: product.imagen_url || "https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?auto=format&fit=crop&w=1200&q=80",
    activo: product.activo ?? true,
    updatedAt: product.updated_at || product.updatedAt || new Date().toISOString(),
  };
}

export function normalizeShift(shift) {
  return {
    id: shift.id,
    userId: shift.user_id || shift.userId,
    userName: shift.user_name || shift.userName || "",
    estado: shift.estado || "abierto",
    saldoInicial: safeNumber(shift.saldo_inicial ?? shift.saldoInicial),
    saldoFinal: shift.saldo_final === null || shift.saldoFinal === null ? null : safeNumber(shift.saldo_final ?? shift.saldoFinal),
    totalVentas: safeNumber(shift.total_ventas ?? shift.totalVentas),
    startedAt: shift.started_at || shift.startedAt || new Date().toISOString(),
    closedAt: shift.closed_at || shift.closedAt || null,
  };
}

export function normalizeWalletState(wallet) {
  return {
    saldoActual: safeNumber(wallet?.saldo_actual ?? wallet?.saldoActual),
    updatedAt: wallet?.updated_at || wallet?.updatedAt || new Date().toISOString(),
  };
}

export function normalizeCashState(cash) {
  return {
    saldoActual: safeNumber(cash?.saldo_actual ?? cash?.saldoActual),
    updatedAt: cash?.updated_at || cash?.updatedAt || new Date().toISOString(),
  };
}

export function cleanTurnoLabel(value) {
  const text = String(value || "").trim();
  const lower = text.toLowerCase();
  if (["manana", "mañana", "maã±ana", "maã£ã¢â±ana"].includes(lower)) return "Mañana";
  if (lower === "tarde") return "Tarde";
  if (lower === "noche") return "Noche";
  if (lower === "apoyo") return "Apoyo";
  return text || "Mañana";
}

export function normalizeSchedule(schedule) {
  return {
    id: schedule.id,
    fecha: schedule.fecha || "",
    inicio: schedule.inicio || "",
    fin: schedule.fin || "",
    responsable: schedule.responsable || "",
    turno: cleanTurnoLabel(schedule.turno),
    notas: schedule.notas || "",
    estado: schedule.estado || "programado",
    createdAt: schedule.created_at || schedule.createdAt || new Date().toISOString(),
  };
}

export function normalizeSale(sale, items = []) {
  const profileName = buildDisplayName(sale.profiles || {});
  return {
    id: sale.id,
    shiftId: sale.shift_id || sale.shiftId || null,
    userId: sale.user_id || sale.userId || null,
    userName: sale.user_name || sale.userName || profileName,
    total: safeNumber(sale.total),
    description: sale.descripcion || sale.description || "",
    informal: sale.informal ?? sale.isInformal ?? false,
    paymentMethod: sale.payment_method || sale.paymentMethod || "efectivo",
    paymentEvidenceUrl: sale.payment_evidence_url || sale.paymentEvidenceUrl || "",
    paymentEvidenceName: sale.payment_evidence_name || sale.paymentEvidenceName || "",
    createdAt: sale.created_at || sale.createdAt || new Date().toISOString(),
    items: items.map((item) => ({
      id: item.id,
      productId: item.product_id || item.productId,
      nombre: item.nombre || "",
      precio: safeNumber(item.precio),
      cantidad: safeNumber(item.cantidad),
      subtotal: safeNumber(item.subtotal),
    })),
  };
}

export function normalizeExpense(expense) {
  const profileName = buildDisplayName(expense.profiles || {});
  return {
    id: expense.id,
    categoria: expense.categoria || "",
    descripcion: expense.descripcion || "",
    detalleOferta: expense.detalle_oferta || expense.detalleOferta || "",
    distributorId: expense.distributor_id || expense.distributorId || null,
    distributorName: expense.distributor_name || expense.distributorName || "",
    evidenceUrl: expense.evidence_url || expense.evidenceUrl || "",
    evidenceName: expense.evidence_name || expense.evidenceName || "",
    cantidad: safeNumber(expense.cantidad || 0),
    unitCost: safeNumber(expense.unit_cost ?? expense.unitCost),
    confirmationAccepted: expense.confirmation_accepted ?? expense.confirmationAccepted ?? false,
    monto: safeNumber(expense.monto),
    userId: expense.user_id || expense.userId || null,
    userName: expense.user_name || expense.userName || profileName,
    createdAt: expense.created_at || expense.createdAt || new Date().toISOString(),
  };
}

export function normalizeDistributor(distributor) {
  return {
    id: distributor.id,
    nombre: distributor.nombre || "",
    telefono: distributor.telefono || "",
    notas: distributor.notas || "",
    createdBy: distributor.created_by || distributor.createdBy || null,
    createdAt: distributor.created_at || distributor.createdAt || new Date().toISOString(),
  };
}

export function normalizeExpenseCategory(category) {
  return {
    id: category.id,
    nombre: category.nombre || "",
    createdBy: category.created_by || category.createdBy || null,
    createdAt: category.created_at || category.createdAt || new Date().toISOString(),
  };
}

export function normalizeWalletMovement(movement) {
  return {
    id: movement.id,
    tipo: movement.tipo,
    monto: safeNumber(movement.monto),
    descripcion: movement.descripcion || "",
    createdBy: movement.created_by || null,
    createdAt: movement.created_at || new Date().toISOString(),
  };
}

export function normalizeProfile(profile) {
  return {
    id: profile.id,
    nombre: profile.nombre || "",
    apellido: profile.apellido || "",
    telefono: profile.telefono || "",
    role: normalizeRole(profile.role),
    avatarUrl: profile.avatar_url || profile.avatarUrl || "",
    displayName: buildDisplayName(profile),
    email: profile.email || "",
    source: profile.source || "remote",
    createdAt: profile.created_at || profile.createdAt || new Date().toISOString(),
  };
}

export function normalizeNotification(notification) {
  return {
    id: notification.id,
    type: notification.tipo || "info",
    message: notification.mensaje || notification.message || "",
    actorId: notification.actor_id || notification.actorId || null,
    actorName: notification.actor_name || notification.actorName || "Fizzia",
    read: notification.leido ?? notification.read ?? false,
    createdAt: notification.created_at || notification.createdAt || new Date().toISOString(),
  };
}

export function normalizeCommunityFeedback(entry) {
  return {
    id: entry.id,
    comment: entry.comment || "",
    createdAt: entry.created_at || entry.createdAt || new Date().toISOString(),
  };
}
