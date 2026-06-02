import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "../../components/Modal";
import Icon from "../../components/ui/Icon";
import PageHeader from "../../components/ui/PageHeader";
import SectionBlock from "../../components/ui/SectionBlock";
import { getOptimizedImageUrl } from "../../services/storageService.js";

export default function ProfilePage({ onSave, onUploadAvatar, user }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ nombre: user?.nombre || "", apellido: user?.apellido || "", telefono: user?.telefono || "", avatarUrl: user?.avatarUrl || "" });
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [avatarBusy, setAvatarBusy] = useState(false);
  const formRef = useRef(form);

  useEffect(() => {
    formRef.current = form;
  }, [form]);

  useEffect(() => {
    setForm({ nombre: user?.nombre || "", apellido: user?.apellido || "", telefono: user?.telefono || "", avatarUrl: user?.avatarUrl || "" });
  }, [user?.apellido, user?.avatarUrl, user?.id, user?.nombre, user?.telefono]);

  const initials = useMemo(() => {
    const letters = [form.nombre, form.apellido]
      .map((value) => value?.trim()?.slice(0, 1)?.toUpperCase())
      .filter(Boolean)
      .slice(0, 2);
    return letters.join("") || "U";
  }, [form.apellido, form.nombre]);

  const fullName = useMemo(() => [form.nombre, form.apellido].filter(Boolean).join(" ").trim() || user?.email || "Usuario", [form.apellido, form.nombre, user?.email]);
  const hasChanges = useMemo(() => {
    return (
      form.nombre.trim() !== (user?.nombre || "").trim() ||
      form.apellido.trim() !== (user?.apellido || "").trim() ||
      form.telefono.trim() !== (user?.telefono || "").trim() ||
      (form.avatarUrl || "") !== (user?.avatarUrl || "")
    );
  }, [form.apellido, form.avatarUrl, form.nombre, form.telefono, user?.apellido, user?.avatarUrl, user?.nombre, user?.telefono]);

  const save = async (event) => {
    event.preventDefault();
    if (!hasChanges) return;
    await onSave(form);
    navigate("/panel");
  };

  const upload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setAvatarBusy(true);
    const url = await onUploadAvatar(file);
    if (url) {
      const nextForm = { ...formRef.current, avatarUrl: url };
      setForm(nextForm);
      const result = await onSave(nextForm);
      if (result?.ok) setAvatarModalOpen(false);
    }
    setAvatarBusy(false);
    event.target.value = "";
  };

  const removeAvatar = async () => {
    if (!form.avatarUrl) return setAvatarModalOpen(false);
    setAvatarBusy(true);
    const nextForm = { ...formRef.current, avatarUrl: "" };
    setForm(nextForm);
    const result = await onSave(nextForm);
    setAvatarBusy(false);
    if (result?.ok) setAvatarModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Perfil" title="Mi cuenta" />

      <SectionBlock description="Tu foto, tu nombre y el rol con el que trabajas cada dia." title="Datos personales">
        <form className="grid gap-5 md:grid-cols-[180px_minmax(0,1fr)]" onSubmit={save}>
          <div className="space-y-3 md:sticky md:top-24">
            <button
              className="group relative grid h-32 w-32 place-items-center overflow-hidden rounded-lg border border-[#dfe7db] bg-[#f8faf6] text-left dark:border-[#314056] dark:bg-[#0f172a] sm:h-40 sm:w-40"
              onClick={() => setAvatarModalOpen(true)}
              type="button"
            >
              {form.avatarUrl ? (
                <img alt={fullName} className="h-full w-full object-cover" decoding="async" loading="lazy" src={getOptimizedImageUrl(form.avatarUrl, { width: 320, height: 320 })} />
              ) : (
                <span className="text-4xl font-semibold text-[#183325] dark:text-white">{initials}</span>
              )}
              <span className="absolute inset-x-3 bottom-3 inline-flex items-center justify-center gap-2 rounded-md bg-white/92 px-3 py-2 text-sm font-medium text-[#183325] opacity-0 transition group-hover:opacity-100 dark:bg-[#182235]/92 dark:text-white">
                <Icon className="text-lg" name="photo_camera" />
                Editar foto
              </span>
            </button>
            <button className="inline-flex w-fit text-sm font-medium text-[#5b6d61] dark:text-white/65" onClick={() => setAvatarModalOpen(true)} type="button">
              Tocar avatar para cambiar o quitar foto
            </button>
          </div>

          <div className="grid gap-4">
            <label className="grid gap-2 text-sm">
              Nombre
              <input className="rounded-md border border-[#dfe7db] bg-white px-3 py-2 text-[#183325] dark:border-[#314056] dark:bg-[#0f172a] dark:text-[#f8fafc]" onChange={(event) => setForm((current) => ({ ...current, nombre: event.target.value }))} value={form.nombre} />
            </label>
            <label className="grid gap-2 text-sm">
              Apellido
              <input className="rounded-md border border-[#dfe7db] bg-white px-3 py-2 text-[#183325] dark:border-[#314056] dark:bg-[#0f172a] dark:text-[#f8fafc]" onChange={(event) => setForm((current) => ({ ...current, apellido: event.target.value }))} value={form.apellido} />
            </label>
            <label className="grid gap-2 text-sm">
              Correo
              <input className="rounded-md border border-[#dfe7db] bg-white px-3 py-2 text-[#183325] dark:border-[#314056] dark:bg-[#0f172a] dark:text-[#c7d2e0]" disabled value={user?.email || ""} />
            </label>
            <label className="grid gap-2 text-sm">
              Telefono
              <input className="rounded-md border border-[#dfe7db] bg-white px-3 py-2 text-[#183325] dark:border-[#314056] dark:bg-[#0f172a] dark:text-[#f8fafc]" onChange={(event) => setForm((current) => ({ ...current, telefono: event.target.value }))} placeholder="Ej. 593999999999" value={form.telefono} />
            </label>
            <label className="grid gap-2 text-sm">
              Rol
              <input className="rounded-md border border-[#dfe7db] bg-white px-3 py-2 text-[#183325] dark:border-[#314056] dark:bg-[#0f172a] dark:text-[#c7d2e0]" disabled value={user?.role || ""} />
            </label>
            {!form.telefono.trim() ? <p className="text-sm text-[#b42318]">Agrega tu numero para poder recibir pedidos desde el catalogo publico cuando te toque atender.</p> : null}
            <div>
              <button className="rounded-md bg-[#1f7a3a] px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[linear-gradient(135deg,#2563eb,#1d4ed8)]" disabled={!hasChanges} type="submit">
                Guardar cambios
              </button>
            </div>
          </div>
        </form>
      </SectionBlock>

      <Modal open={avatarModalOpen} onClose={() => !avatarBusy && setAvatarModalOpen(false)} text="Actualiza o elimina la foto visible en tu perfil." title="Foto de perfil">
        <div className="space-y-4">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <div className="grid h-20 w-20 place-items-center overflow-hidden rounded-lg border border-[#dfe7db] bg-[#f8faf6] dark:border-[#314056] dark:bg-[#0f172a]">
              {form.avatarUrl ? (
                <img alt={fullName} className="h-full w-full object-cover" decoding="async" loading="lazy" src={getOptimizedImageUrl(form.avatarUrl, { width: 160, height: 160 })} />
              ) : (
                <span className="text-2xl font-semibold text-[#183325] dark:text-white">{initials}</span>
              )}
            </div>
            <div>
              <strong className="block text-sm font-semibold text-[#183325] dark:text-white">{fullName}</strong>
              <span className="block text-sm text-[#5b6d61] dark:text-white/65">{form.avatarUrl ? "Foto activa" : "Sin foto cargada"}</span>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-md bg-[#1f7a3a] px-4 py-3 text-sm font-medium text-white dark:bg-[linear-gradient(135deg,#2563eb,#1d4ed8)] ${avatarBusy ? "pointer-events-none opacity-70" : ""}`}>
              <Icon className="text-lg" name="upload" />
              {avatarBusy ? "Guardando..." : "Cambiar foto"}
              <input accept="image/*" className="hidden" disabled={avatarBusy} onChange={upload} type="file" />
            </label>
            <button
              className="inline-flex items-center justify-center gap-2 rounded-md border border-[#f2c6bf] px-4 py-3 text-sm font-medium text-[#c2410c] disabled:cursor-not-allowed disabled:opacity-50"
              disabled={avatarBusy || !form.avatarUrl}
              onClick={removeAvatar}
              type="button"
            >
              <Icon className="text-lg" name="delete" />
              Quitar foto
            </button>
          </div>

          <div className="flex justify-end">
            <button
              className="rounded-md border border-[#dfe7db] px-4 py-2 text-sm font-medium text-[#183325] dark:border-[#314056] dark:bg-[#0f172a] dark:text-white disabled:opacity-50"
              disabled={avatarBusy}
              onClick={() => setAvatarModalOpen(false)}
              type="button"
            >
              Cerrar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
