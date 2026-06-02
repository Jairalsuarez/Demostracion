import { useState } from "react";
import Modal from "../Modal";
import EvidenceViewer from "./EvidenceViewer";
import Icon from "../ui/Icon";

const paymentLabels = {
  efectivo: "Efectivo",
  transferencia_directa: "Transferencia directa",
  deuna: "Deuna",
};

export default function SaleDetailsModal({ formatDateTime, money, onClose, open, sale }) {
  const [evidenceViewerOpen, setEvidenceViewerOpen] = useState(false);

  if (!sale) return <Modal open={open} onClose={onClose} title="Detalle de venta" text="" />;

  const items = sale.items || [];
  const paymentLabel = paymentLabels[sale.paymentMethod] || sale.paymentMethod || "Sin definir";

  return (
    <Modal open={open} onClose={onClose} title="Detalle de venta" text="Revisa el registro completo, productos y evidencia del pago." wide>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="rounded-lg border border-[#e4ece2] bg-white p-4 dark:border-[#23314d] dark:bg-[#111827]">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6a7b70] dark:text-[#94a3b8]">Vendedor</p>
              <h3 className="mt-1 text-lg font-semibold text-[#183325] dark:text-[#f8fafc]">{sale.userName || "Sin nombre"}</h3>
              <p className="mt-1 text-sm text-[#5b6d61] dark:text-[#c7d2e0]">{formatDateTime(sale.createdAt)}</p>
            </div>
            <span
              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                sale.informal
                  ? "bg-[#fff7ed] text-[#c2410c] dark:bg-[#3b1d12] dark:text-[#fdba74]"
                  : "bg-[#eff6ff] text-[#1d4ed8] dark:bg-[#172554] dark:text-[#93c5fd]"
              }`}
            >
              {sale.informal ? "Informal" : "Formal"}
            </span>
          </div>

          {sale.description ? (
            <div className="mt-4 rounded-lg border border-[#edf1ea] bg-[#f8faf6] px-4 py-3 dark:border-[#23314d] dark:bg-[#182235]">
              <p className="text-sm leading-6 text-[#5b6d61] dark:text-[#c7d2e0]">{sale.description}</p>
            </div>
          ) : null}

          <div className="mt-4 space-y-3">
            {items.length ? (
              items.map((item) => (
                <article key={item.id || `${item.productId}-${item.nombre}`} className="flex items-center justify-between gap-3 rounded-lg border border-[#edf1ea] px-4 py-3 dark:border-[#23314d] dark:bg-[#182235]">
                  <div className="min-w-0">
                    <strong className="block text-sm font-semibold text-[#183325] dark:text-[#f8fafc]">{item.nombre}</strong>
                    <span className="text-sm text-[#5b6d61] dark:text-[#c7d2e0]">
                      {item.cantidad} x {money(item.precio)}
                    </span>
                  </div>
                  <strong className="shrink-0 text-sm font-semibold text-[#183325] dark:text-[#f8fafc]">{money(item.subtotal)}</strong>
                </article>
              ))
            ) : (
              <div className="rounded-lg border border-[#edf1ea] px-4 py-4 text-sm text-[#5b6d61] dark:border-[#23314d] dark:bg-[#182235] dark:text-[#c7d2e0]">
                Esta venta fue informal y no tiene productos vinculados al inventario.
              </div>
            )}
          </div>
        </section>

        <aside className="rounded-lg border border-[#e4ece2] bg-[#f8faf6] p-4 dark:border-[#23314d] dark:bg-[#182235]">
          <h3 className="text-base font-semibold text-[#183325] dark:text-[#f8fafc]">Resumen</h3>
          <div className="mt-4 space-y-3 text-sm text-[#5b6d61] dark:text-[#c7d2e0]">
            <div className="flex items-center justify-between gap-3">
              <span>Metodo de pago</span>
              <strong className="text-right text-[#183325] dark:text-[#f8fafc]">{paymentLabel}</strong>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span>Total</span>
              <strong className="text-lg text-[#183325] dark:text-[#f8fafc]">{money(sale.total)}</strong>
            </div>
          </div>

          <div className="mt-5">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#6a7b70] dark:text-[#94a3b8]">Evidencia</p>
            {sale.paymentEvidenceUrl ? (
              <button className="block w-full overflow-hidden rounded-lg border border-[#dbe6d8] bg-white text-left dark:border-[#314056] dark:bg-[#111827]" onClick={() => setEvidenceViewerOpen(true)} type="button">
                <img alt={sale.paymentEvidenceName || "Evidencia del pago"} className="h-64 w-full object-contain" src={sale.paymentEvidenceUrl} />
                <span className="flex items-center justify-between gap-2 border-t border-[#edf1ea] px-3 py-2 text-sm font-medium text-[#183325] dark:border-[#314056] dark:text-[#f8fafc]">
                  <span className="min-w-0 truncate">{sale.paymentEvidenceName || "Ver evidencia"}</span>
                  <Icon className="shrink-0" name="visibility" />
                </span>
              </button>
            ) : (
              <div className="rounded-lg border border-dashed border-[#dbe6d8] bg-white px-4 py-5 text-sm text-[#5b6d61] dark:border-[#314056] dark:bg-[#111827] dark:text-[#c7d2e0]">
                Esta venta no tiene evidencia adjunta.
              </div>
            )}
          </div>
        </aside>
      </div>
      <EvidenceViewer
        name={sale.paymentEvidenceName || "Evidencia del pago"}
        onClose={() => setEvidenceViewerOpen(false)}
        open={evidenceViewerOpen}
        url={sale.paymentEvidenceUrl}
      />
    </Modal>
  );
}
