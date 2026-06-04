export default function useAccountActions({ session, user, commit, setSession, inform, personName, mergeUsers }) {
  const saveProfile = async ({ nombre, apellido, telefono, avatarUrl }) => {
    const cleanName = String(nombre ?? user?.nombre ?? "").trim();
    const cleanLastName = String(apellido ?? user?.apellido ?? "").trim();
    const cleanPhone = String(telefono ?? user?.telefono ?? "").trim() || String(user?.telefono || "").trim();
    if (!cleanName) return inform("El nombre no puede quedar vacio.", "warning");
    if (!cleanPhone) return inform("Agrega un numero de telefono.", "warning");
    const nextUser = { ...user, nombre: cleanName, apellido: cleanLastName, telefono: cleanPhone, avatarUrl: avatarUrl || user?.avatarUrl || "" };
    commit((current) => ({
      ...current,
      users: mergeUsers(current.users.map((item) => item.id === nextUser.id ? { ...item, ...nextUser } : item)),
    }));
    setSession((current) => current ? { ...current, nombre: nextUser.nombre, apellido: nextUser.apellido || "", telefono: nextUser.telefono || "", avatarUrl: nextUser.avatarUrl || "", displayName: personName(nextUser) } : current);
    inform("Perfil actualizado.", "success");
    return { ok: true, user: nextUser };
  };
  return { saveProfile };
}
