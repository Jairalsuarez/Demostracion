import { supabase, supabaseReady } from "./supabaseclient";
import { normalizeProduct, safeNumber } from "./normalizers.js";

export async function fetchRemoteProducts() {
  if (!supabaseReady || !supabase) return { ok: false, error: "Supabase no configurado." };
  const { data, error } = await supabase
    .from("products")
    .select("id,nombre,categoria,marca,descripcion,precio,stock,stock_local,stock_deposito,imagen_url,activo,updated_at")
    .order("created_at", { ascending: false });

  if (error) return { ok: false, error: error.message };
  return { ok: true, products: (data || []).map(normalizeProduct) };
}

export async function upsertRemoteProduct(product, userId) {
  if (!supabaseReady || !supabase) return { ok: false, error: "Supabase no configurado." };
  const payload = {
    id: product.id,
    nombre: product.nombre,
    categoria: product.categoria,
    marca: product.marca || null,
    descripcion: product.descripcion,
    precio: safeNumber(product.precio),
    stock: safeNumber(product.stockLocal) + safeNumber(product.stockDeposito),
    stock_local: safeNumber(product.stockLocal),
    stock_deposito: safeNumber(product.stockDeposito),
    imagen_url: product.imagen_url,
    activo: product.activo ?? true,
    updated_by: userId || null,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("products")
    .upsert(payload)
    .select("id,nombre,categoria,marca,descripcion,precio,stock,stock_local,stock_deposito,imagen_url,activo,updated_at")
    .single();

  if (error) return { ok: false, error: error.message };
  return { ok: true, product: normalizeProduct(data) };
}

export async function deleteRemoteProduct(id) {
  if (!supabaseReady || !supabase) return { ok: false, error: "Supabase no configurado." };
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
