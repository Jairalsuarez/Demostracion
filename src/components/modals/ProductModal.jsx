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
      productForm.categoria !== editing.categoria ||
      productForm.marca !== (editing.marca || "") ||
      Number(productForm.precio) !== Number(editing.precio) ||
      Number(productForm.stockLocal) !== Number(editing.stockLocal) ||
      Number(productForm.stockDeposito) !== Number(editing.stockDeposito) ||
      productForm.descripcion !== editing.descripcion ||
      productForm.imagen_url !== editing.imagen_url ||
      Boolean(productForm.activo) !== Boolean(editing.activo)
    : true;
  const fieldClassName =
    "w-full rounded-2xl border border-[#d8dee4] bg-white px-4 py-3 text-[#1f2937] transition placeholder:text-[#9aa4b2] focus:border-[#f97316] focus:outline-none focus:ring-4 focus:ring-[#f97316]/10 dark:border-white/10 dark:bg-[#111827] dark:text-white";
  const sectionClassName = "rounded-[24px] border border-[#e5e7eb] bg-white p-5 dark:border-white/10 dark:bg-[#0f172a]";
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
      <div className="space-y-5">
        <div className={`${sectionClassName} space-y-5`}>
          <div className="grid gap-4 md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
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

            <label className="grid gap-2 text-sm font-semibold text-[#1f2937] dark:text-white">
              Categoria
              <input
                className={fieldClassName}
                onChange={(e) => setProductForm((current) => ({ ...current, categoria: e.target.value }))}
                placeholder="Bebidas"
                type="text"
                value={productForm.categoria || ""}
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <label className="grid gap-2 text-sm font-semibold text-[#1f2937] dark:text-white">
              Marca
              <input
                className={fieldClassName}
                onChange={(e) => setProductForm((current) => ({ ...current, marca: e.target.value }))}
                placeholder="Opcional"
                type="text"
                value={productForm.marca || ""}
              />
            </label>

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
              Stock local
              <input
                className={fieldClassName}
                min="0"
                onChange={(e) => setProductForm((current) => ({ ...current, stockLocal: e.target.value, stock: Number(e.target.value || 0) + Number(current.stockDeposito || 0) }))}
                placeholder="0"
                step="1"
                type="number"
                value={productForm.stockLocal || ""}
              />
            </label>

            <label className="grid gap-2 text-sm font-semibold text-[#1f2937] dark:text-white">
              Stock deposito
              <input
                className={fieldClassName}
                min="0"
                onChange={(e) => setProductForm((current) => ({ ...current, stockDeposito: e.target.value, stock: Number(current.stockLocal || 0) + Number(e.target.value || 0) }))}
                placeholder="0"
                step="1"
                type="number"
                value={productForm.stockDeposito || ""}
              />
            </label>
          </div>

          <label className="grid gap-2 text-sm font-semibold text-[#1f2937] dark:text-white">
            Descripcion
            <textarea
              className={`${fieldClassName} min-h-[120px] resize-none`}
              onChange={(e) => setProductForm((current) => ({ ...current, descripcion: e.target.value }))}
              placeholder="Descripcion breve del producto."
              rows="4"
              value={productForm.descripcion}
            />
          </label>
        </div>

        <div className={`${sectionClassName} space-y-4`}>
          <label className="grid gap-2 text-sm font-semibold text-[#1f2937] dark:text-white">
            URL de la imagen
            <span className="text-xs font-medium text-[#5b6d61] dark:text-[#c7d2e0]">Opcional</span>
            <input
              className={fieldClassName}
              onChange={(e) => setProductForm((current) => ({ ...current, imagen_url: e.target.value }))}
              placeholder="Se completa al subir una imagen o puedes pegarla manualmente."
              value={productForm.imagen_url}
            />
          </label>

          <div className="flex flex-wrap items-center gap-3">
            <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-[#d8dee4] bg-[#f8fafc] px-4 py-3 text-sm font-semibold text-[#1f2937] transition hover:bg-[#eef2f7] dark:border-[#334155] dark:bg-[#172033] dark:text-white dark:hover:bg-[#22304a]">
              {uploading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#f97316]/30 border-t-[#f97316]" /> : null}
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
            <label className="inline-flex cursor-pointer items-center justify-center rounded-2xl border border-[#d8dee4] bg-white px-4 py-3 text-sm font-semibold text-[#1f2937] transition hover:bg-[#f8fafc] dark:border-[#334155] dark:bg-[#111827] dark:text-white dark:hover:bg-[#172033]">
              Elegir foto
              <input
                className="hidden"
                accept="image/*"
                disabled={uploading}
                onChange={(e) => e.target.files?.[0] && uploadProductImage(e.target.files[0])}
                type="file"
              />
            </label>
            <span className="text-sm text-[#6b7280] dark:text-white/55">La foto es obligatoria para guardar el producto.</span>
          </div>
          {uploading ? <p className="text-sm font-medium text-[#f97316]">Estamos cargando el archivo. Mantén esta pantalla abierta.</p> : null}
          {uploadError ? <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">{uploadError}</p> : null}

          <label className="flex items-center justify-between gap-4 rounded-2xl border border-[#e5e7eb] bg-[#f8fafc] px-4 py-4 text-sm dark:border-white/10 dark:bg-[#111827]">
            <div>
              <p className="font-semibold text-[#1f2937] dark:text-white">Visible en catalogo</p>
              <p className="mt-1 text-xs text-[#6b7280] dark:text-white/55">Si lo desactivas, solo se vera en el panel.</p>
            </div>
            <input checked={productForm.activo} onChange={(e) => setProductForm((current) => ({ ...current, activo: e.target.checked }))} type="checkbox" />
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-3 border-t border-[#e5e7eb] pt-1 dark:border-white/10">
          <button
            className="rounded-2xl bg-[#111827] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1f2937] disabled:cursor-not-allowed disabled:bg-[#cbd5e1] disabled:text-[#64748b] disabled:opacity-100 dark:bg-[#f97316] dark:text-[#fff7ed] dark:hover:bg-[#ea580c] dark:disabled:bg-[#334155] dark:disabled:text-[#94a3b8]"
            disabled={!canSave}
            onClick={saveProduct}
            type="button"
          >
            {editing ? "Guardar cambios" : "Crear producto"}
          </button>
          <button className="rounded-2xl border border-[#d8dee4] px-5 py-3 text-sm font-semibold text-[#1f2937] transition hover:bg-[#f8fafc] dark:border-[#334155] dark:bg-[#172033] dark:text-white dark:hover:bg-[#22304a]" onClick={onClose} type="button">
            Cancelar
          </button>
          {editing ? (
            <button className="rounded-2xl border border-[#fecaca] px-5 py-3 text-sm font-semibold text-[#b91c1c] transition hover:bg-[#fff1f2] dark:border-[#7f1d1d] dark:bg-[#2a1315] dark:text-[#fca5a5] dark:hover:bg-[#3a171b]" onClick={() => removeProduct(editing.id)} type="button">
              Eliminar
            </button>
          ) : null}
        </div>
      </div>
    </Modal>
  );
}
