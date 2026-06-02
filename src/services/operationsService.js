import { supabase, supabaseReady } from "./supabaseclient";
import {
  normalizeCommunityFeedback,
  normalizeExpenseCategory,
  normalizeDistributor,
  normalizeExpense,
  normalizeNotification,
  normalizeSale,
  normalizeSchedule,
  normalizeShift,
  normalizeCashState,
  normalizeWalletMovement,
  normalizeWalletState,
  safeNumber,
} from "./normalizers.js";

const SUPABASE_OPERATION_TIMEOUT_MS = 15000;

function formatSupabaseError(error) {
  return [error?.message, error?.details, error?.hint, error?.code ? `Codigo: ${error.code}` : ""].filter(Boolean).join(" ");
}

function isRpcSchemaMismatch(error, functionName) {
  const text = formatSupabaseError(error).toLowerCase();
  return (
    text.includes("shift_id") ||
    text.includes(functionName.toLowerCase()) ||
    text.includes("invalid input syntax") ||
    text.includes("could not find") ||
    text.includes("schema cache")
  );
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const normalizeUuid = (value) => {
  const text = String(value || "").trim();
  return UUID_PATTERN.test(text) ? text : null;
};

async function withSupabaseTimeout(promise, actionLabel) {
  let timeoutId;

  try {
    return await Promise.race([
      promise,
      new Promise((_, reject) => {
        timeoutId = window.setTimeout(() => {
          reject(new Error(`Tiempo de espera agotado al ${actionLabel}.`));
        }, SUPABASE_OPERATION_TIMEOUT_MS);
      }),
    ]);
  } finally {
    if (timeoutId) window.clearTimeout(timeoutId);
  }
}

export async function fetchRemoteCommunityFeedback() {
  if (!supabaseReady || !supabase) return { ok: false, error: "Supabase no configurado." };
  const { data, error } = await supabase
    .from("community_feedback")
    .select("id,comment,created_at")
    .order("created_at", { ascending: false })
    .limit(60);

  if (error) return { ok: false, error: error.message };
  return { ok: true, feedbacks: (data || []).map(normalizeCommunityFeedback) };
}

export async function createRemoteCommunityFeedback(feedback) {
  if (!supabaseReady || !supabase) return { ok: false, error: "Supabase no configurado." };
  const payload = {
    comment: feedback.comment,
  };

  const { data, error } = await supabase
    .from("community_feedback")
    .insert(payload)
    .select("id,comment,created_at")
    .single();

  if (error) return { ok: false, error: error.message };
  return { ok: true, feedback: normalizeCommunityFeedback(data) };
}

export async function deleteRemoteCommunityFeedback(id) {
  if (!supabaseReady || !supabase) return { ok: false, error: "Supabase no configurado." };
  const { error } = await supabase.from("community_feedback").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function fetchRemoteNotifications() {
  if (!supabaseReady || !supabase) return { ok: false, error: "Supabase no configurado." };
  const { data, error } = await supabase
    .from("notifications")
    .select("id,tipo,mensaje,actor_id,actor_name,leido,created_at")
    .order("created_at", { ascending: false })
    .limit(30);

  if (error) return { ok: false, error: error.message };
  return { ok: true, notifications: (data || []).map(normalizeNotification) };
}

export async function createRemoteNotification(notification) {
  if (!supabaseReady || !supabase) return { ok: false, error: "Supabase no configurado." };
  const payload = {
    id: notification.id,
    tipo: notification.type || "info",
    mensaje: notification.message,
    actor_id: notification.actorId || null,
    actor_name: notification.actorName || "",
    leido: false,
  };

  const { data, error } = await supabase
    .from("notifications")
    .insert(payload)
    .select("id,tipo,mensaje,actor_id,actor_name,leido,created_at")
    .single();

  if (error) return { ok: false, error: error.message };
  return { ok: true, notification: normalizeNotification(data) };
}

export async function fetchRemoteShifts() {
  if (!supabaseReady || !supabase) return { ok: false, error: "Supabase no configurado." };
  const { data, error } = await supabase
    .from("shifts")
    .select("id,user_id,user_name,estado,saldo_inicial,saldo_final,total_ventas,started_at,closed_at")
    .order("started_at", { ascending: false });

  if (error) return { ok: false, error: error.message };
  return { ok: true, shifts: (data || []).map(normalizeShift) };
}

export async function fetchRemoteWalletState() {
  if (!supabaseReady || !supabase) return { ok: false, error: "Supabase no configurado." };
  const { data, error } = await supabase.from("wallet_state").select("id,saldo_actual,updated_at").eq("id", "principal").maybeSingle();

  if (error) return { ok: false, error: error.message };
  if (!data) return { ok: false, error: "No existe wallet_state principal." };
  return { ok: true, wallet: normalizeWalletState(data) };
}

export async function fetchRemoteCashState() {
  if (!supabaseReady || !supabase) return { ok: false, error: "Supabase no configurado." };
  const { data, error } = await supabase.from("cash_state").select("id,saldo_actual,updated_at").eq("id", "principal").maybeSingle();

  if (error) return { ok: false, error: formatSupabaseError(error) };
  if (!data) return { ok: true, cashBox: normalizeCashState({ saldoActual: 0 }) };
  return { ok: true, cashBox: normalizeCashState(data) };
}

export async function fetchRemoteSales() {
  if (!supabaseReady || !supabase) return { ok: false, error: "Supabase no configurado." };

  const { data: sales, error: salesError } = await supabase
    .from("sales")
    .select("id,shift_id,user_id,total,descripcion,informal,payment_method,payment_evidence_url,payment_evidence_name,created_at,profiles(nombre,apellido)")
    .order("created_at", { ascending: false });

  if (salesError) return { ok: false, error: salesError.message };
  if (!sales?.length) return { ok: true, sales: [] };

  const saleIds = sales.map((sale) => sale.id);
  const { data: items, error: itemsError } = await supabase
    .from("sale_items")
    .select("id,sale_id,product_id,nombre,precio,cantidad,subtotal")
    .in("sale_id", saleIds);

  if (itemsError) return { ok: false, error: itemsError.message };

  const salesMap = new Map(sales.map((sale) => [sale.id, []]));
  (items || []).forEach((item) => {
    const list = salesMap.get(item.sale_id) || [];
    list.push(item);
    salesMap.set(item.sale_id, list);
  });

  return { ok: true, sales: sales.map((sale) => normalizeSale(sale, salesMap.get(sale.id) || [])) };
}

export async function createRemoteSale(sale) {
  if (!supabaseReady || !supabase) return { ok: false, error: "Supabase no configurado." };

  const salePayload = {
    p_shift_id: normalizeUuid(sale.shiftId),
    p_user_id: sale.userId,
    p_total: safeNumber(sale.total),
    p_payment_method: sale.paymentMethod || "efectivo",
    p_payment_evidence_url: sale.paymentEvidenceUrl || null,
    p_payment_evidence_name: sale.paymentEvidenceName || null,
    p_created_at: sale.createdAt,
    p_items: sale.items.map((item) => ({
      product_id: item.productId,
      nombre: item.nombre,
      precio: safeNumber(item.precio),
      cantidad: safeNumber(item.cantidad),
      subtotal: safeNumber(item.subtotal),
    })),
  };

  let rpcResult;
  try {
    rpcResult = await withSupabaseTimeout(supabase.rpc("create_sale_with_items", salePayload), "registrar la venta");
  } catch (error) {
    return { ok: false, error: error.message };
  }

  const { data: saleId, error: rpcError } = rpcResult;

  if (rpcError) {
    const canFallbackToDirectInsert = isRpcSchemaMismatch(rpcError, "create_sale_with_items");
    if (canFallbackToDirectInsert) {
      return createRemoteSaleDirect(sale, salePayload);
    }

    return {
      ok: false,
      error:
        rpcError.message?.includes("create_sale_with_items")
          ? "Falta la funcion create_sale_with_items en Supabase. Aplica el SQL del esquema actualizado para descontar stock remotamente."
          : formatSupabaseError(rpcError),
    };
  }

  const { data: createdSale, error: saleError } = await supabase
    .from("sales")
    .select("id,shift_id,user_id,total,descripcion,informal,payment_method,payment_evidence_url,payment_evidence_name,created_at,profiles(nombre,apellido)")
    .eq("id", saleId)
    .single();

  if (saleError) return { ok: false, error: saleError.message };

  const { data: createdItems, error: itemError } = await supabase
    .from("sale_items")
    .select("id,sale_id,product_id,nombre,precio,cantidad,subtotal")
    .eq("sale_id", saleId);

  if (itemError) return { ok: false, error: itemError.message };
  return { ok: true, sale: normalizeSale(createdSale, createdItems || []) };
}

async function createRemoteSaleDirect(sale, salePayload) {
  const total = safeNumber(sale.total);
  const saleInsert = {
    shift_id: salePayload.p_shift_id || null,
    user_id: sale.userId,
    total,
    informal: false,
    payment_method: sale.paymentMethod || "efectivo",
    payment_evidence_url: sale.paymentEvidenceUrl || null,
    payment_evidence_name: sale.paymentEvidenceName || null,
    created_at: sale.createdAt,
  };

  const { data: createdSale, error: saleError } = await supabase
    .from("sales")
    .insert(saleInsert)
    .select("id,shift_id,user_id,total,descripcion,informal,payment_method,payment_evidence_url,payment_evidence_name,created_at,profiles(nombre,apellido)")
    .single();

  if (saleError) return { ok: false, error: formatSupabaseError(saleError) };

  const itemPayload = salePayload.p_items.map((item) => ({
    sale_id: createdSale.id,
    product_id: item.product_id,
    nombre: item.nombre || "",
    precio: safeNumber(item.precio),
    cantidad: safeNumber(item.cantidad),
    subtotal: safeNumber(item.subtotal),
  }));

  const { data: createdItems, error: itemError } = await supabase
    .from("sale_items")
    .insert(itemPayload)
    .select("id,sale_id,product_id,nombre,precio,cantidad,subtotal");

  if (itemError) return { ok: false, error: formatSupabaseError(itemError) };

  try {
    await applySaleSideEffects({
      total,
      userId: sale.userId,
      shiftId: saleInsert.shift_id,
      paymentMethod: saleInsert.payment_method,
      movementDescription: `Venta ${createdSale.id} - ${sale.paymentMethod || "efectivo"}`,
      items: itemPayload,
    });
  } catch {
    // The sale and items are the critical records; failed side effects can be reconciled after the RPC is fixed.
  }

  return { ok: true, sale: normalizeSale(createdSale, createdItems || []) };
}

export async function createRemoteInformalSale(sale) {
  if (!supabaseReady || !supabase) return { ok: false, error: "Supabase no configurado." };

  const salePayload = {
    p_shift_id: normalizeUuid(sale.shiftId),
    p_user_id: sale.userId,
    p_total: safeNumber(sale.total),
    p_description: sale.description?.trim() || "",
    p_payment_method: sale.paymentMethod || "efectivo",
    p_payment_evidence_url: sale.paymentEvidenceUrl || null,
    p_payment_evidence_name: sale.paymentEvidenceName || null,
    p_created_at: sale.createdAt,
  };

  const directResult = await createRemoteInformalSaleDirect(sale, salePayload);
  if (directResult.ok) return directResult;

  const { data: saleId, error: rpcError } = await supabase.rpc("create_informal_sale", salePayload);

  if (rpcError) {
    const canFallbackToDirectInsert = isRpcSchemaMismatch(rpcError, "create_informal_sale");
    if (canFallbackToDirectInsert) {
      return createRemoteInformalSaleDirect(sale, salePayload);
    }

    return {
      ok: false,
      error:
        rpcError.message?.includes("create_informal_sale")
          ? "Falta la funcion create_informal_sale en Supabase. Aplica el SQL actualizado para registrar ventas informales remotamente."
          : rpcError.message,
    };
  }

  const { data, error } = await supabase
    .from("sales")
    .select("id,shift_id,user_id,total,descripcion,informal,payment_method,payment_evidence_url,payment_evidence_name,created_at,profiles(nombre,apellido)")
    .eq("id", saleId)
    .single();

  if (error) return { ok: false, error: error.message };
  return { ok: true, sale: normalizeSale(data, []) };
}

async function createRemoteInformalSaleDirect(sale, salePayload) {
  const total = safeNumber(sale.total);
  const payload = {
    shift_id: salePayload.p_shift_id || null,
    user_id: sale.userId,
    total,
    descripcion: sale.description?.trim() || "",
    informal: true,
    payment_method: sale.paymentMethod || "efectivo",
    payment_evidence_url: sale.paymentEvidenceUrl || null,
    payment_evidence_name: sale.paymentEvidenceName || null,
    created_at: sale.createdAt,
  };

  const { data, error } = await supabase
    .from("sales")
    .insert(payload)
    .select("id,shift_id,user_id,total,descripcion,informal,payment_method,payment_evidence_url,payment_evidence_name,created_at,profiles(nombre,apellido)")
    .single();

  if (error) return { ok: false, error: formatSupabaseError(error) };

  try {
    await applySaleSideEffects({
      total,
      userId: sale.userId,
      shiftId: payload.shift_id,
      paymentMethod: payload.payment_method,
      movementDescription: `Venta informal: ${sale.description?.trim() || data.id}`,
      items: [],
    });
  } catch {
    // The sale is the critical record; sync will recover wallet/shift state when the RPC is fixed.
  }

  return { ok: true, sale: normalizeSale(data, []) };
}

async function applySaleSideEffects({ total, userId, shiftId, paymentMethod = "efectivo", movementDescription, items = [] }) {
  if ((paymentMethod || "efectivo") === "efectivo") {
    const { data: cashBox } = await supabase
      .from("cash_state")
      .select("id,saldo_actual,updated_at")
      .eq("id", "principal")
      .maybeSingle();

    await upsertRemoteCashState(
      {
        saldoActual: safeNumber(cashBox?.saldo_actual) + total,
        updatedAt: new Date().toISOString(),
      },
      userId
    );
  } else {
    const { data: wallet } = await supabase
      .from("wallet_state")
      .select("id,saldo_actual,updated_at")
      .eq("id", "principal")
      .maybeSingle();

    await upsertRemoteWalletState(
      {
        saldoActual: safeNumber(wallet?.saldo_actual) + total,
        updatedAt: new Date().toISOString(),
      },
      userId
    );
  }

  await createRemoteWalletMovement({
    tipo: "venta",
    monto: total,
    descripcion: movementDescription,
    createdBy: userId,
  });

  if (shiftId) {
    const { data: shift } = await supabase
      .from("shifts")
      .select("id,total_ventas")
      .eq("id", shiftId)
      .maybeSingle();

    if (shift) {
      await supabase
        .from("shifts")
        .update({ total_ventas: safeNumber(shift.total_ventas) + total })
        .eq("id", shiftId);
    }
  }

  await Promise.all(
    items.map(async (item) => {
      const { data: product } = await supabase
        .from("products")
        .select("id,stock_local,stock_deposito")
        .eq("id", item.product_id)
        .maybeSingle();

      if (!product) return;
      const stockLocal = Math.max(safeNumber(product.stock_local) - safeNumber(item.cantidad), 0);
      await supabase
        .from("products")
        .update({
          stock_local: stockLocal,
          stock: stockLocal + safeNumber(product.stock_deposito),
          updated_at: new Date().toISOString(),
          updated_by: userId,
        })
        .eq("id", item.product_id);
    })
  );
}

export async function fetchRemoteExpenses() {
  if (!supabaseReady || !supabase) return { ok: false, error: "Supabase no configurado." };
  const { data, error } = await supabase
    .from("expenses")
    .select("id,categoria,descripcion,detalle_oferta,distributor_id,distributor_name,evidence_url,evidence_name,cantidad,unit_cost,confirmation_accepted,monto,user_id,created_at,profiles(nombre,apellido)")
    .order("created_at", { ascending: false });

  if (error) return { ok: false, error: error.message };
  return { ok: true, expenses: (data || []).map(normalizeExpense) };
}

export async function fetchRemoteExpenseCategories() {
  if (!supabaseReady || !supabase) return { ok: false, error: "Supabase no configurado." };
  const { data, error } = await supabase
    .from("expense_categories")
    .select("id,nombre,created_by,created_at")
    .order("nombre", { ascending: true });

  if (error) return { ok: false, error: error.message };
  return { ok: true, categories: (data || []).map(normalizeExpenseCategory) };
}

export async function createRemoteExpenseCategory(category) {
  if (!supabaseReady || !supabase) return { ok: false, error: "Supabase no configurado." };
  const payload = {
    nombre: category.nombre,
    created_by: category.createdBy || null,
  };

  let result;
  try {
    result = await withSupabaseTimeout(
      supabase
        .from("expense_categories")
        .insert(payload)
        .select("id,nombre,created_by,created_at")
        .single(),
      "crear la categoria"
    );
  } catch (error) {
    return { ok: false, error: error.message };
  }

  const { data, error } = result;

  if (error) return { ok: false, error: error.message };
  return { ok: true, category: normalizeExpenseCategory(data) };
}

export async function createRemoteExpense(expense) {
  if (!supabaseReady || !supabase) return { ok: false, error: "Supabase no configurado." };
  const payload = {
    categoria: expense.categoria,
    descripcion: expense.descripcion,
    detalle_oferta: expense.detalleOferta || null,
    distributor_id: expense.distributorId || null,
    distributor_name: expense.distributorName || null,
    evidence_url: expense.evidenceUrl || null,
    evidence_name: expense.evidenceName || null,
    cantidad: safeNumber(expense.cantidad),
    unit_cost: safeNumber(expense.unitCost),
    confirmation_accepted: Boolean(expense.confirmationAccepted),
    monto: safeNumber(expense.monto),
    user_id: expense.userId,
    created_at: expense.createdAt,
  };

  let result;
  try {
    result = await withSupabaseTimeout(
      supabase
        .from("expenses")
        .insert(payload)
        .select("id,categoria,descripcion,detalle_oferta,distributor_id,distributor_name,evidence_url,evidence_name,cantidad,unit_cost,confirmation_accepted,monto,user_id,created_at,profiles(nombre,apellido)")
        .single(),
      "guardar el egreso"
    );
  } catch (error) {
    return { ok: false, error: error.message };
  }

  const { data, error } = result;

  if (error) return { ok: false, error: error.message };
  return { ok: true, expense: normalizeExpense(data) };
}

export async function fetchRemoteDistributors() {
  if (!supabaseReady || !supabase) return { ok: false, error: "Supabase no configurado." };
  const { data, error } = await supabase
    .from("distributors")
    .select("id,nombre,telefono,notas,created_by,created_at")
    .order("nombre", { ascending: true });

  if (error) return { ok: false, error: error.message };
  return { ok: true, distributors: (data || []).map(normalizeDistributor) };
}

export async function createRemoteDistributor(distributor) {
  if (!supabaseReady || !supabase) return { ok: false, error: "Supabase no configurado." };
  const payload = {
    nombre: distributor.nombre,
    telefono: distributor.telefono || null,
    notas: distributor.notas || null,
    created_by: distributor.createdBy || null,
  };

  let result;
  try {
    result = await withSupabaseTimeout(
      supabase
        .from("distributors")
        .insert(payload)
        .select("id,nombre,telefono,notas,created_by,created_at")
        .single(),
      "crear el distribuidor"
    );
  } catch (error) {
    return { ok: false, error: error.message };
  }

  const { data, error } = result;

  if (error) return { ok: false, error: error.message };
  return { ok: true, distributor: normalizeDistributor(data) };
}

export async function upsertRemoteWalletState(wallet, userId) {
  if (!supabaseReady || !supabase) return { ok: false, error: "Supabase no configurado." };

  const payload = {
    id: "principal",
    saldo_actual: safeNumber(wallet.saldoActual),
    updated_at: new Date().toISOString(),
    updated_by: userId || null,
  };

  let result;
  try {
    result = await withSupabaseTimeout(
      supabase.from("wallet_state").upsert(payload).select("id,saldo_actual,updated_at").single(),
      "actualizar el saldo"
    );
  } catch (error) {
    return { ok: false, error: error.message };
  }

  const { data, error } = result;
  if (error) return { ok: false, error: error.message };
  return { ok: true, wallet: normalizeWalletState(data) };
}

export async function upsertRemoteCashState(cashBox, userId) {
  if (!supabaseReady || !supabase) return { ok: false, error: "Supabase no configurado." };

  const payload = {
    id: "principal",
    saldo_actual: safeNumber(cashBox.saldoActual),
    updated_at: new Date().toISOString(),
    updated_by: userId || null,
  };

  let result;
  try {
    result = await withSupabaseTimeout(
      supabase.from("cash_state").upsert(payload).select("id,saldo_actual,updated_at").single(),
      "actualizar la caja"
    );
  } catch (error) {
    return { ok: false, error: error.message };
  }

  const { data, error } = result;
  if (error) return { ok: false, error: formatSupabaseError(error) };
  return { ok: true, cashBox: normalizeCashState(data) };
}

export async function createRemoteWalletMovement(movement) {
  if (!supabaseReady || !supabase) return { ok: false, error: "Supabase no configurado." };

  const payload = {
    tipo: movement.tipo,
    monto: safeNumber(movement.monto),
    descripcion: movement.descripcion || null,
    created_by: movement.createdBy || null,
  };

  let result;
  try {
    result = await withSupabaseTimeout(
      supabase
        .from("wallet_movements")
        .insert(payload)
        .select("id,tipo,monto,descripcion,created_by,created_at")
        .single(),
      "registrar el movimiento de saldo"
    );
  } catch (error) {
    return { ok: false, error: error.message };
  }

  const { data, error } = result;

  if (error) return { ok: false, error: error.message };
  return { ok: true, movement: normalizeWalletMovement(data) };
}

export async function fetchRemoteSchedules() {
  if (!supabaseReady || !supabase) return { ok: false, error: "Supabase no configurado." };
  const { data, error } = await supabase
    .from("schedules")
    .select("id,fecha,inicio,fin,responsable,turno,notas,estado,created_at")
    .order("fecha", { ascending: true })
    .order("inicio", { ascending: true });

  if (error) return { ok: false, error: error.message };
  return { ok: true, schedules: (data || []).map(normalizeSchedule) };
}

export async function createRemoteSchedule(schedule) {
  if (!supabaseReady || !supabase) return { ok: false, error: "Supabase no configurado." };
  const payload = {
    id: schedule.id,
    fecha: schedule.fecha,
    inicio: schedule.inicio,
    fin: schedule.fin,
    responsable: schedule.responsable,
    turno: schedule.turno,
    notas: schedule.notas,
    estado: schedule.estado,
  };
  const { data, error } = await supabase
    .from("schedules")
    .insert(payload)
    .select("id,fecha,inicio,fin,responsable,turno,notas,estado,created_at")
    .single();

  if (error) return { ok: false, error: error.message };
  return { ok: true, schedule: normalizeSchedule(data) };
}

export async function updateRemoteScheduleStatus(id, estado) {
  if (!supabaseReady || !supabase) return { ok: false, error: "Supabase no configurado." };
  const { data, error } = await supabase
    .from("schedules")
    .update({ estado })
    .eq("id", id)
    .select("id,fecha,inicio,fin,responsable,turno,notas,estado,created_at")
    .single();

  if (error) return { ok: false, error: error.message };
  return { ok: true, schedule: normalizeSchedule(data) };
}

export async function deleteRemoteSchedule(id) {
  if (!supabaseReady || !supabase) return { ok: false, error: "Supabase no configurado." };
  const { error } = await supabase.from("schedules").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function createRemoteShift(shift) {
  if (!supabaseReady || !supabase) return { ok: false, error: "Supabase no configurado." };
  const payload = {
    user_id: shift.userId,
    user_name: shift.userName,
    estado: shift.estado,
    saldo_inicial: safeNumber(shift.saldoInicial),
    saldo_final: shift.saldoFinal,
    total_ventas: safeNumber(shift.totalVentas),
    started_at: shift.startedAt,
    closed_at: shift.closedAt,
  };
  const { data, error } = await supabase
    .from("shifts")
    .insert(payload)
    .select("id,user_id,user_name,estado,saldo_inicial,saldo_final,total_ventas,started_at,closed_at")
    .single();
  if (error) return { ok: false, error: error.message };
  return { ok: true, shift: normalizeShift(data) };
}

export async function updateRemoteShift(shift) {
  if (!supabaseReady || !supabase) return { ok: false, error: "Supabase no configurado." };
  const payload = {
    estado: shift.estado,
    saldo_inicial: safeNumber(shift.saldoInicial),
    saldo_final: shift.saldoFinal,
    total_ventas: safeNumber(shift.totalVentas),
    closed_at: shift.closedAt,
  };
  const { data, error } = await supabase
    .from("shifts")
    .update(payload)
    .eq("id", shift.id)
    .select("id,user_id,user_name,estado,saldo_inicial,saldo_final,total_ventas,started_at,closed_at")
    .single();
  if (error) return { ok: false, error: error.message };
  return { ok: true, shift: normalizeShift(data) };
}
