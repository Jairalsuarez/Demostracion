import Modal from "../Modal";

export default function CashWithdrawalModal({ cashBox, cashWithdrawalForm, money, onClose, open, setCashWithdrawalForm, withdrawCashToWallet }) {
  const amount = Number(cashWithdrawalForm.amount || 0);
  const reason = String(cashWithdrawalForm.motivo || "").trim();
  const canSave = amount > 0 && amount <= Number(cashBox?.saldoActual || 0) && Boolean(reason);
  const fieldClassName =
    "w-full rounded-xl border border-[#dfe7db] bg-[#f8faf6] px-4 py-3 text-[#183325] shadow-[inset_0_1px_0_rgba(255,255,255,0.45)] transition placeholder:text-[#8a988f] focus:border-[#f59e0b] focus:outline-none focus:ring-2 focus:ring-[#f59e0b]/15 dark:border-[#314056] dark:bg-[#0f172a] dark:text-white dark:placeholder:text-[#7f8ea3]";

  return (
    <Modal open={open} onClose={onClose} text="Mueve efectivo desde caja hacia el saldo general del negocio." title="Retirar caja">
      <div className="grid gap-4">
        <div className="rounded-lg border border-[#e4ece2] bg-[#f8faf6] p-4 dark:border-[#23314d] dark:bg-[#182235]">
          <span className="block text-sm text-[#5b6d61] dark:text-[#c7d2e0]">Caja disponible</span>
          <strong className="mt-1 block text-2xl font-semibold text-[#183325] dark:text-[#f8fafc]">{money(cashBox?.saldoActual || 0)}</strong>
        </div>

        <label className="grid gap-2 text-sm font-semibold text-[#183325] dark:text-white">
          Monto a retirar
          <input
            className={fieldClassName}
            min="0"
            onChange={(e) => {
              const value = e.target.value;
              const parsed = Number(String(value || "").replace(",", "."));
              setCashWithdrawalForm((current) => ({ ...current, amountInput: value, amount: Number.isFinite(parsed) ? parsed : 0 }));
            }}
            step="0.01"
            type="number"
            value={cashWithdrawalForm.amountInput}
          />
        </label>

        <label className="grid gap-2 text-sm font-semibold text-[#183325] dark:text-white">
          Motivo del retiro
          <textarea className={`${fieldClassName} min-h-24 resize-none`} onChange={(e) => setCashWithdrawalForm((current) => ({ ...current, motivo: e.target.value }))} rows="3" value={cashWithdrawalForm.motivo} />
        </label>

        <button
          className="rounded-xl bg-[#1f7a3a] px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_26px_rgba(31,122,58,0.18)] transition hover:bg-[#17612d] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[linear-gradient(135deg,#2563eb,#1d4ed8)]"
          disabled={!canSave}
          onClick={withdrawCashToWallet}
          type="button"
        >
          Registrar retiro
        </button>
      </div>
    </Modal>
  );
}
