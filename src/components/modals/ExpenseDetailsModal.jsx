import Modal from "../Modal";

const fundingLabels = {
  cash: "Caja",
  wallet: "Saldo general",
};

export default function ExpenseDetailsModal({ expense, formatDate, money, onClose, open }) {
  if (!expense) return <Modal open={open} onClose={onClose} title="Detalle de egreso" text="" />;

  const fundingLabel = fundingLabels[expense.fundingSource] || expense.fundingSource || "Sin definir";

  return (
    <Modal open={open} onClose={onClose} title="Detalle de egreso" text="Revisa la informacion completa del egreso." wide>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
        <section className="rounded-lg border border-[#e4ece2] bg-white p-4 dark:border-[#23314d] dark:bg-[#111827]">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6a7b70] dark:text-[#94a3b8]">Registrado por</p>
              <h3 className="mt-1 text-lg font-semibold text-[#183325] dark:text-[#f8fafc]">{expense.userName || "Sin nombre"}</h3>
              <p className="mt-1 text-sm text-[#5b6d61] dark:text-[#c7d2e0]">{formatDate(expense.createdAt, { dateStyle: "medium", timeStyle: "short" })}</p>
            </div>
            <span className="inline-flex rounded-full bg-[#fff7ed] px-3 py-1 text-xs font-semibold text-[#c2410c] dark:bg-[#3b1d12] dark:text-[#fdba74]">
              {expense.categoria || "Egreso"}
            </span>
          </div>

          <div className="mt-4 rounded-lg border border-[#edf1ea] bg-[#f8faf6] px-4 py-3 dark:border-[#23314d] dark:bg-[#182235]">
            <p className="text-sm leading-6 text-[#5b6d61] dark:text-[#c7d2e0]">{expense.descripcion}</p>
          </div>
        </section>

        <aside className="rounded-lg border border-[#e4ece2] bg-[#f8faf6] p-4 dark:border-[#23314d] dark:bg-[#182235]">
          <h3 className="text-base font-semibold text-[#183325] dark:text-[#f8fafc]">Resumen</h3>
          <div className="mt-4 space-y-3 text-sm text-[#5b6d61] dark:text-[#c7d2e0]">
            <div className="flex items-center justify-between gap-3">
              <span>Origen</span>
              <strong className="text-right text-[#183325] dark:text-[#f8fafc]">{fundingLabel}</strong>
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-[#edf1ea] pt-3 dark:border-[#23314d]">
              <span>Monto</span>
              <strong className="text-lg text-[#c2410c]">{money(expense.monto)}</strong>
            </div>
          </div>
        </aside>
      </div>
    </Modal>
  );
}
