import Modal from "../Modal";

function SummaryCard({ label, value, tone = "default" }) {
  const toneClassName =
    tone === "green"
      ? "border-[#dcebdc] bg-[#f5fbf5] text-[#166534]"
      : tone === "orange"
        ? "border-[#f5dcc2] bg-[#fff7ed] text-[#c2410c]"
        : "border-[#e4ece2] bg-white text-[#183325]";

  return (
    <article className={`rounded-xl border px-4 py-4 ${toneClassName} dark:border-[#314056] dark:bg-[#182235] dark:text-[#f8fafc]`}>
      <span className="block text-xs font-semibold uppercase tracking-[0.14em] opacity-70">{label}</span>
      <strong className="mt-2 block text-2xl font-semibold">{value}</strong>
    </article>
  );
}

export default function ShiftSummaryModal({ open, onClose, summary, money }) {
  if (!summary) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      text={`${summary.dateLabel} - ${summary.turnoLabel}`}
      title={`Resumen del turno de ${summary.shift.userName || "vendedor"}`}
    >
      <div className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard label="Ventas totales" value={summary.totalSales} />
          <SummaryCard label="Formales" tone="green" value={summary.formalSales} />
          <SummaryCard label="Informales" tone="orange" value={summary.informalSales} />
          <SummaryCard label="Total ingresado" value={summary.totalAmountLabel} />
        </div>

        <div className="rounded-xl border border-[#e4ece2] bg-[#fbfcfa] p-4 dark:border-[#314056] dark:bg-[#111827]">
          <strong className="block text-sm font-semibold text-[#183325] dark:text-[#f8fafc]">Detalle del turno</strong>
          <div className="mt-3 space-y-2 text-sm text-[#5b6d61] dark:text-[#c7d2e0]">
            <p>Inicio: {new Intl.DateTimeFormat("es-EC", { dateStyle: "medium", timeStyle: "short" }).format(new Date(summary.shift.startedAt))}</p>
            <p>Cierre: {summary.shift.closedAt ? new Intl.DateTimeFormat("es-EC", { dateStyle: "medium", timeStyle: "short" }).format(new Date(summary.shift.closedAt)) : "Turno aun abierto"}</p>
            <p>Turno: {summary.turnoLabel}</p>
          </div>
        </div>

        <div>
          <strong className="block text-sm font-semibold text-[#183325] dark:text-[#f8fafc]">Ventas registradas en este turno</strong>
          {summary.shiftSales.length ? (
            <div className="mt-3 space-y-3">
              {summary.shiftSales.map((sale) => (
                <article key={sale.id} className="rounded-xl border border-[#e4ece2] px-4 py-4 dark:border-[#23314d] dark:bg-[#182235]">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <strong className="block text-sm font-semibold text-[#183325] dark:text-[#f8fafc]">{sale.informal ? "Venta informal" : "Venta formal"}</strong>
                      <p className="mt-1 text-sm text-[#5b6d61] dark:text-[#c7d2e0]">
                        {new Intl.DateTimeFormat("es-EC", { dateStyle: "medium", timeStyle: "short" }).format(new Date(sale.createdAt))}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-[#183325] dark:text-[#f8fafc]">{typeof money === "function" ? money(sale.total) : sale.total}</span>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-[#5b6d61] dark:text-[#c7d2e0]">Todavia no hay ventas registradas dentro de este turno.</p>
          )}
        </div>
      </div>
    </Modal>
  );
}
