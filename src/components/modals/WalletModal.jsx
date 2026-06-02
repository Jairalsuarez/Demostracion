import Modal from "../Modal";
export default function WalletModal({ adjustWallet, onClose, open, setWalletForm, walletForm }) {
  const canSave =
    String(walletForm.motivo || "").trim() &&
    String(walletForm.saldo || "") !== "" &&
    String(walletForm.password || "").trim() &&
    Boolean(walletForm.confirmationAccepted);
  const fieldClassName =
    "w-full rounded-xl border border-[#dfe7db] bg-[#f8faf6] px-4 py-3 text-[#183325] shadow-[inset_0_1px_0_rgba(255,255,255,0.45)] transition placeholder:text-[#8a988f] focus:border-[#f59e0b] focus:outline-none focus:ring-2 focus:ring-[#f59e0b]/15 dark:border-[#314056] dark:bg-[#0f172a] dark:text-white dark:placeholder:text-[#7f8ea3]";

  return (
    <Modal open={open} onClose={onClose} text="Ajuste manual para administracion con motivo obligatorio." title="Cambiar saldo general">
      <div className="grid gap-4">
        <label className="grid gap-2 text-sm font-semibold text-[#183325] dark:text-white">
          Nuevo saldo
          <input className={fieldClassName} onChange={(e) => setWalletForm((current) => ({ ...current, saldo: e.target.value }))} step="0.01" type="number" value={walletForm.saldo} />
        </label>

        <label className="grid gap-2 text-sm font-semibold text-[#183325] dark:text-white">
          Motivo del cambio
          <textarea className={`${fieldClassName} min-h-28 resize-none`} onChange={(e) => setWalletForm((current) => ({ ...current, motivo: e.target.value }))} rows="3" value={walletForm.motivo} />
        </label>

        <label className="grid gap-2 text-sm font-semibold text-[#183325] dark:text-white">
          Contrasena del administrador
          <input
            autoComplete="current-password"
            className={fieldClassName}
            onChange={(e) => setWalletForm((current) => ({ ...current, password: e.target.value }))}
            placeholder="Ingresa tu contrasena actual"
            type="password"
            value={walletForm.password || ""}
          />
        </label>

        <label className="flex items-start gap-3 rounded-xl border border-[#dbe6d8] bg-[#f8faf6] px-4 py-3 dark:border-[#314056] dark:bg-[#182235]">
          <input
            checked={Boolean(walletForm.confirmationAccepted)}
            className="mt-1 h-4 w-4 rounded border-[#d0dcd0] text-[#1f7a3a] focus:ring-[#1f7a3a] dark:border-[#4b5c74] dark:bg-[#0f172a] dark:text-[#60a5fa] dark:focus:ring-[#60a5fa]"
            onChange={(e) => setWalletForm((current) => ({ ...current, confirmationAccepted: e.target.checked }))}
            type="checkbox"
          />
          <span className="text-sm leading-6 text-[#5b6d61] dark:text-[#c7d2e0]">
            Confirmo que entiendo este ajuste manual y que modificara directamente el saldo actual del negocio.
          </span>
        </label>

        <button
          className="rounded-xl bg-[#1f7a3a] px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_26px_rgba(31,122,58,0.18)] transition hover:bg-[#17612d] hover:shadow-[0_14px_28px_rgba(31,122,58,0.24)] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[linear-gradient(135deg,#2563eb,#1d4ed8)] dark:shadow-[0_14px_28px_rgba(37,99,235,0.24)] dark:hover:brightness-110"
          disabled={!canSave}
          onClick={adjustWallet}
          type="button"
        >
          Guardar saldo
        </button>
      </div>
    </Modal>
  );
}
