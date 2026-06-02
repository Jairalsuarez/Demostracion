import { useState } from "react";
import { createPortal } from "react-dom";
import Icon from "../ui/Icon";
import { getOptimizedImageUrl } from "../../services/storageService.js";

function StockBadge({ stock }) {
  const tone =
    Number(stock) <= 0
      ? "bg-[#fff1f2] text-[#b91c1c] dark:bg-[#1f2937] dark:text-[#fca5a5]"
      : Number(stock) <= 5
        ? "bg-[#fff7ed] text-[#c2410c] dark:bg-[#172033] dark:text-[#fdba74]"
        : "bg-[#f0fdf4] text-[#166534] dark:bg-[#0f172a] dark:text-[#93c5fd]";

  return <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tone}`}>{Number(stock) <= 0 ? "Agotado" : `${stock} total`}</span>;
}

export default function ProductListTable({ canEdit = false, emptyMessage, money, onEdit, onRemove, onView, products }) {
  const [deleteTarget, setDeleteTarget] = useState(null);

  if (!products.length) {
    return (
      <div className="rounded-md border border-dashed border-[#dfe7db] px-4 py-10 text-center text-sm text-[#5b6d61] dark:border-[#314056] dark:text-[#94a3b8]">
        {emptyMessage}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3 md:hidden">
        {products.map((product) => (
          <article
            key={product.id}
            className="cursor-pointer rounded-xl border border-[#edf1ea] p-4 active:scale-[0.99] dark:border-[#23314d] dark:bg-[#182235]"
            onClick={() => onView(product)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onView(product);
              }
            }}
            role="button"
            tabIndex={0}
          >
            <div className="flex gap-3">
              <button
                className="h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-[#e4ece2] bg-[#f7faf6] dark:border-[#314056] dark:bg-[#0f172a]"
                onClick={(event) => {
                  event.stopPropagation();
                  onView(product);
                }}
                type="button"
              >
                <img alt={product.nombre} className="h-full w-full object-cover" decoding="async" loading="lazy" src={getOptimizedImageUrl(product.imagen_url, { width: 160, height: 160 })} />
              </button>
              <div className="min-w-0 flex-1">
                <strong className="block font-semibold text-[#183325] dark:text-[#f8fafc]">{product.nombre}</strong>
                <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#5b6d61] dark:text-[#c7d2e0]">{product.descripcion}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[#5b6d61] dark:text-[#c7d2e0]">
                  <span className="rounded-full bg-[#f4f8ef] px-3 py-1 dark:bg-[#0f172a]">{product.categoria}</span>
                  <span className="font-medium text-[#183325] dark:text-[#f8fafc]">{money(product.precio)}</span>
                  <span>Local: {product.stockLocal}</span>
                  <span>Deposito: {product.stockDeposito}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <StockBadge stock={product.stock} />
              <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:justify-end">
                {canEdit ? (
                  <button
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-[#1f7a3a] px-3 py-2 text-white sm:flex-none"
                    onClick={(event) => {
                      event.stopPropagation();
                      onEdit(product);
                    }}
                    type="button"
                  >
                    <Icon name="edit" />
                    Editar
                  </button>
                ) : null}
                {canEdit ? (
                  <button
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-md border border-[#fecaca] px-3 py-2 text-[#b91c1c] sm:flex-none dark:border-[#7f1d1d] dark:text-[#fca5a5]"
                    onClick={(event) => {
                      event.stopPropagation();
                      setDeleteTarget(product);
                    }}
                    type="button"
                  >
                    <Icon name="delete" />
                    Eliminar
                  </button>
                ) : null}
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="hidden overflow-x-auto md:block">
      <table className="min-w-full text-left text-sm">
        <thead className="text-[#6a7b70] dark:text-[#94a3b8]">
          <tr>
            <th className="pb-3">Producto</th>
            <th className="pb-3">Categoria</th>
            <th className="pb-3">Precio</th>
            <th className="pb-3">Stock</th>
            <th className="pb-3">Estado</th>
            <th className="pb-3 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr
              key={product.id}
              className="cursor-pointer border-t border-[#edf1ea] align-top hover:bg-[#f8fafc] dark:border-[#23314d] dark:hover:bg-[#182235]"
              onClick={() => onView(product)}
            >
              <td className="py-4">
                <div className="flex gap-3">
                  <button
                    className="h-16 w-16 shrink-0 overflow-hidden rounded-md border border-[#e4ece2] bg-[#f7faf6] dark:border-[#314056] dark:bg-[#0f172a]"
                    onClick={(event) => {
                      event.stopPropagation();
                      onView(product);
                    }}
                    type="button"
                  >
                    <img alt={product.nombre} className="h-full w-full object-cover" decoding="async" loading="lazy" src={getOptimizedImageUrl(product.imagen_url, { width: 128, height: 128 })} />
                  </button>
                  <div className="min-w-0">
                    <strong className="block font-semibold text-[#183325] dark:text-[#f8fafc]">{product.nombre}</strong>
                    <p className="mt-1 line-clamp-2 max-w-xl text-xs leading-6 text-[#5b6d61] dark:text-[#c7d2e0]">{product.descripcion}</p>
                  </div>
                </div>
              </td>
              <td className="py-4">{product.categoria}</td>
              <td className="py-4 font-medium">{money(product.precio)}</td>
              <td className="py-4">
                <div className="grid gap-1 text-xs text-[#5b6d61] dark:text-[#c7d2e0]">
                  <span>Local: {product.stockLocal}</span>
                  <span>Deposito: {product.stockDeposito}</span>
                </div>
              </td>
              <td className="py-4">
                <StockBadge stock={product.stock} />
              </td>
              <td className="py-4">
                <div className="flex justify-end gap-2">
                  {canEdit ? (
                    <button
                      className="inline-flex items-center gap-2 rounded-md bg-[#1f7a3a] px-3 py-2 text-white"
                      onClick={(event) => {
                        event.stopPropagation();
                        onEdit(product);
                      }}
                      type="button"
                    >
                      <Icon name="edit" />
                      Editar
                    </button>
                  ) : null}
                  {canEdit ? (
                    <button
                      className="inline-flex items-center gap-2 rounded-md border border-[#fecaca] px-3 py-2 text-[#b91c1c] dark:border-[#7f1d1d] dark:text-[#fca5a5]"
                      onClick={(event) => {
                        event.stopPropagation();
                        setDeleteTarget(product);
                      }}
                      type="button"
                    >
                      <Icon name="delete" />
                      Eliminar
                    </button>
                  ) : null}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>

      {deleteTarget ? createPortal(
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.55)", padding: "1rem" }} onClick={() => setDeleteTarget(null)}>
          <div style={{ width: "100%", maxWidth: "24rem" }} className="rounded-2xl border border-[#dfe7db] bg-white p-5 shadow-[0_24px_60px_rgba(24,51,37,0.16)] dark:border-[#23314d] dark:bg-[#111827]" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-[#183325] dark:text-[#f8fafc]">Eliminar producto</h2>
            <p className="mt-1 text-sm leading-6 text-[#5b6d61] dark:text-[#c7d2e0]">Esta accion no se puede deshacer. ¿Eliminar {deleteTarget?.nombre || "producto"}?</p>
            <div className="mt-5 flex gap-3">
              <button
                className="flex-1 rounded-2xl bg-[#b91c1c] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#991b1b]"
                onClick={() => {
                  onRemove(deleteTarget.id);
                  setDeleteTarget(null);
                }}
                type="button"
              >
                Eliminar
              </button>
              <button
                className="flex-1 rounded-2xl border border-[#d8dee4] px-5 py-3 text-sm font-semibold text-[#1f2937] transition hover:bg-[#f8fafc] dark:border-[#334155] dark:text-white dark:hover:bg-[#22304a]"
                onClick={() => setDeleteTarget(null)}
                type="button"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>,
        document.body
      ) : null}
    </>
  );
}
