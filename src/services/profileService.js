import { supabase, supabaseReady } from "./supabaseclient";
import { buildDisplayName, normalizeProfile, normalizeRole } from "./normalizers.js";

const PROFILE_FIELDS = ["id", "role", "nombre", "apellido", "telefono", "avatar_url", "created_at"];

const isMissingColumnError = (error, column) =>
  String(error?.message || "")
    .toLowerCase()
    .includes(column.toLowerCase());

async function runProfileQuery(buildQuery) {
  const selectedFields = [...PROFILE_FIELDS];

  while (selectedFields.length) {
    const query = buildQuery(selectedFields);
    const { data, error } = await query;

    if (!error) return { ok: true, data, selectedFields };

    const removableColumn = ["avatar_url", "telefono", "apellido"].find((column) => selectedFields.includes(column) && isMissingColumnError(error, column));
    if (!removableColumn) return { ok: false, error: error.message };

    const nextFields = selectedFields.filter((field) => field !== removableColumn);
    selectedFields.splice(0, selectedFields.length, ...nextFields);
  }

  return { ok: false, error: "No se pudo consultar el perfil con las columnas disponibles." };
}

function mergeProfileWithFallback(profile = {}, remoteProfile = {}) {
  return {
    ...profile,
    ...remoteProfile,
    apellido: remoteProfile.apellido ?? profile.apellido ?? "",
    telefono: remoteProfile.telefono ?? profile.telefono ?? "",
    avatarUrl: remoteProfile.avatarUrl ?? profile.avatarUrl ?? "",
  };
}

async function fetchSupabaseProfile(userId) {
  if (!supabaseReady || !supabase || !userId) return { ok: false, error: "Supabase no configurado." };

  const result = await runProfileQuery((fields) => supabase.from("profiles").select(fields.join(",")).eq("id", userId).maybeSingle());
  if (!result.ok) return result;

  const { data } = result;
  if (!data) return { ok: false, error: "No existe perfil para este usuario en profiles." };

  return { ok: true, profile: normalizeProfile(data) };
}

export async function fetchRemoteProfiles() {
  if (!supabaseReady || !supabase) return { ok: false, error: "Supabase no configurado." };

  const result = await runProfileQuery((fields) => supabase.from("profiles").select(fields.join(",")).order("created_at", { ascending: false }));
  if (!result.ok) return result;

  const { data } = result;
  return { ok: true, profiles: (data || []).map(normalizeProfile) };
}

export async function updateRemoteProfile(profile) {
  if (!supabaseReady || !supabase) return { ok: false, error: "Supabase no configurado." };

  const basePayload = {
    nombre: profile.nombre,
    apellido: profile.apellido || "",
    telefono: profile.telefono || "",
    role: normalizeRole(profile.role),
    avatar_url: profile.avatarUrl || null,
  };

  const result = await runProfileQuery((fields) => {
    const payload = Object.fromEntries(Object.entries(basePayload).filter(([key]) => fields.includes(key) || !["apellido", "telefono", "avatar_url"].includes(key)));
    return supabase.from("profiles").update(payload).eq("id", profile.id).select(fields.join(",")).single();
  });

  if (!result.ok) return result;

  return { ok: true, profile: mergeProfileWithFallback(profile, normalizeProfile(result.data)) };
}

export function mergeUsers(localUsers = [], remoteProfiles = []) {
  if (supabaseReady) return [...remoteProfiles];
  const map = new Map();
  [...localUsers, ...remoteProfiles].forEach((item) => {
    if (!item?.id) return;
    const current = map.get(item.id) || {};
    map.set(item.id, { ...current, ...item });
  });
  return [...map.values()];
}

export { buildDisplayName, fetchSupabaseProfile };
