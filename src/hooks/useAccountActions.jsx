export default function useAccountActions({
  session,
  user,
  commit,
  setSession,
  notify,
  inform,
  personName,
  mergeUsers,
  updateRemoteProfile,
}) {
  const saveProfile = async ({ nombre, apellido, telefono, avatarUrl }) => {
    const cleanName = String(nombre ?? user?.nombre ?? "").trim();
    const cleanLastName = String(apellido ?? user?.apellido ?? "").trim();
    const cleanPhone = String(telefono ?? user?.telefono ?? "").trim() || String(user?.telefono || "").trim();
    if (!cleanName) return inform("El nombre no puede quedar vacio.", "warning");
    if (!cleanPhone) return inform("Agrega un numero de telefono para tu perfil.", "warning");

    const nextUser = {
      ...user,
      nombre: cleanName,
      apellido: cleanLastName,
      telefono: cleanPhone,
      avatarUrl: avatarUrl || user?.avatarUrl || "",
    };
    const remote = session?.mode === "supabase" ? await updateRemoteProfile(nextUser) : { ok: false };
    if (session?.mode === "supabase" && !remote.ok) {
      inform(`No se pudo actualizar el perfil en Supabase. ${remote.error || "Intenta de nuevo."}`, "error");
      return { ok: false };
    }

    const finalUser = remote.ok ? { ...nextUser, ...remote.profile } : nextUser;

    commit((current) => ({
      ...current,
      users: mergeUsers(
        current.users.map((item) => (item.id === finalUser.id ? { ...item, ...finalUser } : item)),
        []
      ),
    }));
    setSession((current) =>
      current
        ? {
            ...current,
            nombre: finalUser.nombre,
            apellido: finalUser.apellido || "",
            telefono: finalUser.telefono || "",
            avatarUrl: finalUser.avatarUrl || "",
            displayName: personName(finalUser),
          }
        : current
    );
    notify(`${personName(finalUser)} actualizo su perfil.`, personName(finalUser));
    inform("Perfil actualizado.", "success");
    return { ok: true, user: finalUser };
  };

  return {
    saveProfile,
  };
}
