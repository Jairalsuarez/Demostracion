import { useEffect, useState } from "react";
import Modal, { registerAppBackHandler } from "../Modal";
import EvidenceViewer from "./EvidenceViewer";
import Icon from "../ui/Icon";
import PaymentMethodCard from "../sales/PaymentMethodCard";

const fieldClassName =
  "rounded-md border border-[#dfe7db] bg-[#f8faf6] px-4 py-3 text-[#183325] transition focus:border-[#f59e0b] focus:outline-none focus:ring-2 focus:ring-[#f59e0b]/20 dark:border-[#314056] dark:bg-[#0f172a] dark:text-white";

const subtleButtonClassName =
  "rounded-md border border-[#dfe7db] px-4 py-3 text-sm font-medium text-[#183325] transition hover:bg-[#f7faf6] dark:border-[#314056] dark:bg-[#0f172a] dark:text-white dark:hover:bg-[#182235]";

const primaryButtonClassName =
  "rounded-md bg-[#111827] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#1f2937] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-[#f97316] dark:text-[#fff7ed] dark:hover:bg-[#ea580c]";

const paymentOptions = [
  {
    value: "efectivo",
    label: "Efectivo",
    description: "Pago inmediato en caja, sin comprobante adicional.",
    icon: "payments",
    accentClassName: "bg-[#eaf7ee] text-[#1f7a3a]",
  },
  {
    value: "transferencia_directa",
    label: "Transferencia directa",
    description: "Necesita comprobante para registrar la venta.",
    icon: "account_balance",
    accentClassName: "bg-[#fff2e2] text-[#f59e0b]",
  },
];

const steps = [
  { id: 1, title: "Detalle" },
  { id: 2, title: "Metodo de pago" },
  { id: 3, title: "Resumen" },
];

function parseMoneyInput(value) {
  const normalized = String(value || "")
    .replace(",", ".")
    .replace(/[^\d.]/g, "");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

export default function InformalSaleModal({
  activeShift,
  cashBox,
  createInformalSale,
  informalSale,
  informalSalePayment,
  informalSaleSubmitting,
  money,
  onClose,
  open,
  presentation = "modal",
  setInformalSale,
  setInformalSalePayment,
  uploadError,
  uploadInformalSaleEvidence,
  uploading,
  userRole,
  wallet,
}) {
  const [step, setStep] = useState(1);
  const [evidenceViewerOpen, setEvidenceViewerOpen] = useState(false);
  const stepPanelClassName = "max-h-[min(58vh,24rem)] overflow-y-auto pr-1 sm:min-h-[24rem] sm:max-h-[24rem]";

  useEffect(() => {
    if (open) {
      setStep(1);
      setEvidenceViewerOpen(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open || step <= 1) return undefined;
    return registerAppBackHandler(() => setStep((current) => Math.max(current - 1, 1)), 10);
  }, [open, step]);

  const requiresShift = userRole === "vendedor";
  const paymentNeedsEvidence = informalSalePayment.method === "transferencia_directa";
  const totalAmount = parseMoneyInput(informalSale.totalInput || informalSale.total);
  const nextCashTotal = informalSalePayment.method === "efectivo" ? Number(cashBox?.saldoActual || 0) + totalAmount : Number(cashBox?.saldoActual || 0);
  const nextWalletTotal = informalSalePayment.method === "efectivo" ? Number(wallet?.saldoActual || 0) : Number(wallet?.saldoActual || 0) + totalAmount;
  const selectedPayment = paymentOptions.find((item) => item.value === informalSalePayment.method) || paymentOptions[0];

  const canContinueDetail = totalAmount > 0 && Boolean(informalSale.description.trim());
  const canContinuePayment = informalSalePayment.method && (!paymentNeedsEvidence || Boolean(informalSalePayment.evidenceUrl));

  const nextStep = () => {
    if (step === 1 && !canContinueDetail) return;
    if (step === 2 && !canContinuePayment) return;
    setStep((current) => Math.min(current + 1, 3));
  };

  const prevStep = () => setStep((current) => Math.max(current - 1, 1));

  const renderPaymentSummary = () => {
    if (informalSalePayment.method === "efectivo") {
      return (
        <div className="rounded-lg border border-[#dbe6d8] bg-[#f8faf6] p-4">
          <p className="text-sm font-semibold text-[#183325]">Pago en efectivo</p>
          <p className="mt-1 text-sm text-[#5b6d61]">No necesitas adjuntar evidencia para completar esta venta.</p>
        </div>
      );
    }

    return (
      <div className="grid gap-4">
        <div className="rounded-lg border border-[#dbe6d8] bg-[#f8faf6] p-4">
          <p className="text-sm font-semibold text-[#183325]">{selectedPayment.label}</p>
          <p className="mt-1 text-sm text-[#5b6d61]">Adjunta el comprobante antes de continuar con el registro.</p>
          <div className="mt-4 grid min-w-0 gap-3 sm:grid-cols-[auto_auto_minmax(0,1fr)] sm:items-center">
            <label className={`${subtleButtonClassName} inline-flex min-w-0 items-center justify-center gap-2`}>
              {uploading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#f59e0b]/30 border-t-[#f59e0b]" /> : null}
              <span className="truncate">{uploading ? "Subiendo..." : informalSalePayment.evidenceUrl ? "Tomar otra foto" : "Tomar foto"}</span>
              <input
                accept="image/*"
                capture="environment"
                className="hidden"
                disabled={uploading}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) uploadInformalSaleEvidence(file);
                }}
                type="file"
              />
            </label>
            <label className={`${subtleButtonClassName} inline-flex min-w-0 justify-center`}>
              <span className="truncate">{informalSalePayment.evidenceUrl ? "Elegir otra foto" : "Elegir foto"}</span>
              <input
                accept="image/*"
                className="hidden"
                disabled={uploading}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) uploadInformalSaleEvidence(file);
                }}
                type="file"
              />
            </label>
            {informalSalePayment.evidenceName ? <span className="min-w-0 truncate text-sm text-[#5b6d61]">{informalSalePayment.evidenceName}</span> : null}
          </div>
          {uploading ? <p className="mt-3 text-sm font-medium text-[#f59e0b]">Subiendo evidencia. Mantén esta pantalla abierta.</p> : null}
          {uploadError ? <p className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{uploadError}</p> : null}
        </div>

        {informalSalePayment.evidenceUrl ? (
          <button className={`${subtleButtonClassName} inline-flex w-full min-w-0 items-center justify-center gap-2 sm:w-fit`} onClick={() => setEvidenceViewerOpen(true)} type="button">
            <Icon name="visibility" />
            <span className="truncate">Ver evidencia</span>
          </button>
        ) : null}
      </div>
    );
  };

  return (
    <Modal open={open} onClose={onClose} text={presentation === "page" ? "" : "Registra una venta sin afectar stock, solo balance y actividad."} title="Agregar venta informal" variant={presentation === "page" ? "page" : "default"} wide>
      <div className="grid gap-5">
        {requiresShift && !activeShift ? <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 dark:border-[#4b5563] dark:bg-[#172033] dark:text-[#fca5a5]">Debes iniciar un turno antes de vender.</div> : null}

        <div className="flex items-center justify-center gap-3 rounded-2xl border border-[#edf1ea] bg-[#fbfcfa] px-4 py-3 dark:border-[#23314d] dark:bg-[#111827]">
          {steps.map((item) => {
            const active = step === item.id;
            const completed = step > item.id;
            return (
              <button
                key={item.id}
                aria-label={item.title}
                className={`grid h-9 w-9 place-items-center rounded-full text-sm font-semibold transition ${
                  active
                    ? "bg-[#f59e0b] text-white shadow-[0_8px_18px_rgba(245,158,11,0.22)] dark:bg-[#2563eb]"
                    : completed
                      ? "bg-[#1f7a3a] text-white dark:bg-[#2563eb]"
                      : "bg-[#edf1ea] text-[#183325] dark:bg-[#0f172a] dark:text-[#f8fafc]"
                }`}
                onClick={() => {
                  if (item.id < step) setStep(item.id);
                }}
                type="button"
              >
                {completed ? <Icon name="check" /> : item.id}
              </button>
            );
          })}
        </div>

        {step === 1 ? (
          <div className={stepPanelClassName}>
            <div className="grid gap-4">
              <label className="grid gap-2 text-sm font-semibold text-[#183325] dark:text-white">
                Valor total
                <input
                  className={fieldClassName}
                  min="0"
                  onChange={(e) => setInformalSale((current) => ({ ...current, totalInput: e.target.value, total: parseMoneyInput(e.target.value) }))}
                  placeholder="0.00"
                  step="0.01"
                  type="number"
                  value={informalSale.totalInput}
                />
              </label>

              <label className="grid gap-2 text-sm font-semibold text-[#183325] dark:text-white">
                Descripcion de la venta
                <textarea
                  className={`${fieldClassName} min-h-[180px] resize-none`}
                  onChange={(e) => setInformalSale((current) => ({ ...current, description: e.target.value }))}
                  placeholder="Describe que se esta vendiendo. Este campo es obligatorio."
                  rows="6"
                  value={informalSale.description}
                />
              </label>

              <div className="rounded-lg border border-[#e4ece2] bg-[#f8faf6] p-4 dark:border-[#23314d] dark:bg-[#182235]">
                <span className="block text-sm text-[#5b6d61] dark:text-[#c7d2e0]">Total calculado</span>
                <strong className="mt-1 block text-3xl font-black tracking-tight text-[#20130A] dark:text-[#f8fafc]">{money(totalAmount)}</strong>
              </div>
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div className={stepPanelClassName}>
            <div className="grid gap-4">
              <div className="grid gap-2 sm:grid-cols-2">
                {paymentOptions.map((option) => {
                  const selected = informalSalePayment.method === option.value;
                  return (
                    <PaymentMethodCard
                      icon={option.icon}
                      key={option.value}
                      label={option.label}
                      onClick={() => setInformalSalePayment((current) => ({ ...current, method: option.value, evidenceUrl: "", evidenceName: "" }))}
                      selected={selected}
                    />
                  );
                })}
              </div>

              {renderPaymentSummary()}
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="grid gap-3">
              <div className="rounded-lg border border-[#e4ece2] bg-[#f8faf6] p-3 dark:border-[#23314d] dark:bg-[#182235]">
                <div className="space-y-2 text-sm text-[#5b6d61] dark:text-[#c7d2e0]">
                  <div className="flex items-center justify-between gap-3">
                    <span>Metodo de pago</span>
                    <strong className="text-[#183325] dark:text-[#f8fafc]">{selectedPayment.label}</strong>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span>Total de la venta</span>
                    <strong className="text-[#183325] dark:text-[#f8fafc]">{money(totalAmount)}</strong>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span>{informalSalePayment.method === "efectivo" ? "Caja luego" : "Saldo luego"}</span>
                    <strong className="text-[#1f7a3a] dark:text-[#93c5fd]">{money(informalSalePayment.method === "efectivo" ? nextCashTotal : nextWalletTotal)}</strong>
                  </div>
                  {informalSale.description ? <div className="line-clamp-3 rounded-md border border-[#dbe6d8] bg-white px-3 py-2 text-xs text-[#5b6d61] dark:border-[#314056] dark:bg-[#0f172a] dark:text-[#c7d2e0]">{informalSale.description.trim()}</div> : null}
                  {informalSalePayment.evidenceUrl ? <button className="inline-flex min-w-0 items-center gap-2 text-xs font-semibold text-[#1f7a3a] dark:text-[#93c5fd]" onClick={() => setEvidenceViewerOpen(true)} type="button"><Icon className="text-base" name="visibility" /><span className="truncate">Ver evidencia</span></button> : null}
                </div>
              </div>
          </div>
        ) : null}

        <div className="flex flex-col-reverse gap-3 border-t border-[#edf1ea] pt-4 sm:flex-row sm:items-center sm:justify-between">
          <button className={`${subtleButtonClassName} w-full sm:w-auto`} onClick={step === 1 ? onClose : prevStep} type="button">
            {step === 1 ? "Cancelar" : "Volver"}
          </button>

          <div className="flex w-full flex-wrap gap-3 sm:w-auto sm:justify-end">
            {step < 3 ? (
              <button
                className={`${primaryButtonClassName} w-full sm:w-auto`}
                disabled={(step === 1 && !canContinueDetail) || (step === 2 && !canContinuePayment) || uploading}
                onClick={nextStep}
                type="button"
              >
                Continuar
              </button>
            ) : (
              <button className={`${primaryButtonClassName} w-full sm:w-auto`} disabled={informalSaleSubmitting || !canContinueDetail || !canContinuePayment} onClick={async () => {
                const saved = await createInformalSale();
                if (saved && presentation === "page") onClose();
              }} type="button">
                {informalSaleSubmitting ? "Procesando..." : "Finalizar venta informal"}
              </button>
            )}
          </div>
        </div>
        <EvidenceViewer
          name={informalSalePayment.evidenceName || "Evidencia del pago"}
          onClose={() => setEvidenceViewerOpen(false)}
          open={evidenceViewerOpen}
          url={informalSalePayment.evidenceUrl}
        />
      </div>
    </Modal>
  );
}
