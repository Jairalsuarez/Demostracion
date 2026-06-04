import Modal from "../Modal";

export default function ProductModal({
  editing,
  onClose,
  open,
  productForm,
  presentation = "modal",
  removeProduct,
  saveProduct,
  setProductForm,
  uploadError,
  uploadProductImage,
  uploading,
}) {
  const hasChanges = editing
    ? productForm.nombre !== editing.nombre ||
      Number(productForm.precio) !== Number(editing.precio) ||
      Number(productForm.costo) !== Number(editing.costo) ||
      Number(productForm.stock) !== Number(editing.stock) ||
      productForm.descripcion !== editing.descripcion ||
      productForm.imagen_url !== editing.imagen_url
    : true;
  const fieldClassName =
    "w-full rounded-xl border border-[#d8dee4] bg-white px-3 py-2 text-[#1f2937] transition placeholder:text-[#9aa4b2] focus:border-[#f97316] focus:outline-none focus:ring-4 focus:ring-[#f97316]/10 dark:border-white/10 dark:bg-[#111827] dark:text-white text-sm";
  const sectionClassName = "rounded-2xl border border-[#e5e7eb] bg-white p-4 dark:border-white/10 dark:bg-[#0f172a]";
  const canSave = hasChanges && Boolean(productForm.nombre?.trim());

  return (
    <Modal
      open={open}
      onClose={onClose}
      text={editing ? "Edita solo los datos necesarios del producto." : "Completa lo esencial para crear el producto."}
      title={editing ? "Editar producto" : "Nuevo producto"}
      variant={presentation === "page" ? "page" : "default"}
      wide
    >
      <div className="space-y-4">
        <div className={`${sectionClassName} space-y-4`}>
          <label className="grid gap-2 text-sm font-semibold text-[#1f2937] dark:text-white">
            Nombre
            <input
              className={fieldClassName}
              onChange={(e) => setProductForm((current) => ({ ...current, nombre: e.target.value }))}
              placeholder="Ej. Jugo de naranja 500ml"
              type="text"
              value={productForm.nombre || ""}
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-3">
            <label className="grid gap-2 text-sm font-semibold text-[#1f2937] dark:text-white">
              Precio
              <input
                className={fieldClassName}
                min="0"
                onChange={(e) => setProductForm((current) => ({ ...current, precio: e.target.value }))}
                placeholder="0.00"
                step="0.01"
                type="number"
                value={productForm.precio || ""}
              />
            </label>

            <label className="grid gap-2 text-sm font-semibold text-[#1f2937] dark:text-white">
              Costo
              <input
                className={fieldClassName}
                min="0"
                onChange={(e) => setProductForm((current) => ({ ...current, costo: e.target.value }))}
                placeholder="0.00"
                step="0.01"
                type="number"
                value={productForm.costo || ""}
              />
            </label>

            <label className="grid gap-2 text-sm font-semibold text-[#1f2937] dark:text-white">
              Stock
              <input
                className={fieldClassName}
                min="0"
                onChange={(e) => setProductForm((current) => ({ ...current, stock: Number(e.target.value || 0) }))}
                placeholder="0"
                step="1"
                type="number"
                value={productForm.stock || ""}
              />
            </label>
          </div>

          <label className="grid gap-2 text-sm font-semibold text-[#1f2937] dark:text-white">
            Descripcion
            <textarea
              className={`${fieldClassName} min-h-[80px] resize-none`}
              onChange={(e) => setProductForm((current) => ({ ...current, descripcion: e.target.value }))}
              placeholder="Descripcion breve del producto."
              rows="3"
              value={productForm.descripcion}
            />
          </label>
        </div>

        <div className={`${sectionClassName} space-y-3`}>
          <label className="grid gap-1 text-sm font-semibold text-[#1f2937] dark:text-white">
            URL de la imagen
            <span className="text-xs font-medium text-[#5b6d61] dark:text-[#c7d2e0]">Opcional</span>
            <input
              className={fieldClassName}
              onChange={(e) => setProductForm((current) => ({ ...current, imagen_url: e.target.value }))}
              placeholder="Se completa al subir una imagen o puedes pegarla manualmente."
              value={productForm.imagen_url}
            />
          </label>

          <div className="flex flex-wrap items-center gap-2">
            <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#d8dee4] bg-[#f8fafc] px-3 py-2 text-xs font-semibold text-[#1f2937] transition hover:bg-[#eef2f7] dark:border-[#334155] dark:bg-[#172033] dark:text-white dark:hover:bg-[#22304a]">
              {uploading ? <span className="h-3 w-3 animate-spin rounded-full border-2 border-[#f97316]/30 border-t-[#f97316]" /> : null}
              {uploading ? "Subiendo..." : "Tomar foto"}
              <input
                className="hidden"
                accept="image/*"
                capture="environment"
                disabled={uploading}
                onChange={(e) => e.target.files?.[0] && uploadProductImage(e.target.files[0])}
                type="file"
              />
            </label>
            <label className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-[#d8dee4] bg-white px-3 py-2 text-xs font-semibold text-[#1f2937] transition hover:bg-[#f8fafc] dark:border-[#334155] dark:bg-[#111827] dark:text-white dark:hover:bg-[#172033]">
              Elegir foto
              <input
                className="hidden"
                accept="image/*"
                disabled={uploading}
                onChange={(e) => e.target.files?.[0] && uploadProductImage(e.target.files[0])}
                type="file"
              />
            </label>
            <span className="text-xs text-[#6b7280] dark:text-white/55">La foto es obligatoria.</span>
          </div>
          {uploading ? <p className="text-sm font-medium text-[#f97316]">Estamos cargando el archivo. Manten esta pantalla abierta.</p> : null}
          {uploadError ? <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">{uploadError}</p> : null}
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-[#e5e7eb] pt-2 dark:border-white/10">
          <button
            className="rounded-xl bg-[#111827] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#1f2937] disabled:cursor-not-allowed disabled:bg-[#cbd5e1] disabled:text-[#64748b] disabled:opacity-100 dark:bg-[#f97316] dark:text-[#fff7ed] dark:hover:bg-[#ea580c] dark:disabled:bg-[#334155] dark:disabled:text-[#94a3b8]"
            disabled={!canSave}
            onClick={saveProduct}
            type="button"
          >
            {editing ? "Guardar cambios" : "Crear producto"}
          </button>
          <button className="rounded-xl border border-[#d8dee4] px-4 py-2 text-sm font-semibold text-[#1f2937] transition hover:bg-[#f8fafc] dark:border-[#334155] dark:bg-[#172033] dark:text-white dark:hover:bg-[#22304a]" onClick={onClose} type="button">
            Cancelar
          </button>
          {editing ? (
            <button className="rounded-xl border border-[#fecaca] px-4 py-2 text-sm font-semibold text-[#b91c1c] transition hover:bg-[#fff1f2] dark:border-[#7f1d1d] dark:bg-[#2a1315] dark:text-[#fca5a5] dark:hover:bg-[#3a171b]" onClick={() => removeProduct(editing.id)} type="button">
              Eliminar
            </button>
          ) : null}
        </div>
      </div>
    </Modal>
  );
}
