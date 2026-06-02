import { useEffect, useMemo, useState } from "react";
import Modal, { registerAppBackHandler } from "../Modal";
import EvidenceViewer from "./EvidenceViewer";
import Icon from "../ui/Icon";
import PaymentMethodCard from "../sales/PaymentMethodCard";
import SelectedSaleProductCard from "../sales/SelectedSaleProductCard";

const fieldClassName =
  "rounded-md border border-[#dfe7db] bg-[#f8faf6] px-4 py-3 text-[#183325] transition focus:border-[#f59e0b] focus:outline-none focus:ring-2 focus:ring-[#f59e0b]/20 dark:border-[#314056] dark:bg-[#0f172a] dark:text-white";

const subtleButtonClassName =
  "rounded-md border border-[#dfe7db] px-4 py-3 text-sm font-medium text-[#183325] transition hover:bg-[#f7faf6] dark:border-[#314056] dark:bg-[#0f172a] dark:text-white dark:hover:bg-[#182235]";

const primaryButtonClassName =
  "rounded-md bg-[#1f7a3a] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#17612d] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-[linear-gradient(135deg,#2563eb,#1d4ed8)] dark:hover:brightness-110";

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
  { id: 1, title: "Productos" },
  { id: 2, title: "Metodo de pago" },
  { id: 3, title: "Resumen" },
];

function ProductPickerModal({ money, onClose, onSelect, open, products, selectedProductId }) {
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!open) return undefined;
    return registerAppBackHandler(onClose, 30);
  }, [onClose, open]);

  useEffect(() => {
    if (open) setSearch("");
  }, [open]);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    const source = query
      ? products.filter((product) =>
          [product.nombre, product.categoria, product.marca, product.descripcion]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(query))
        )
      : products;
    return source
      .sort((a, b) => Number(b.stockLocal > 0) - Number(a.stockLocal > 0) || String(a.nombre || "").localeCompare(String(b.nombre || "")))
      .slice(0, 40);
  }, [products, search]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] grid place-items-end bg-[#0b1220]/55 p-2 sm:place-items-center sm:p-4" onClick={onClose}>
      <div className="flex max-h-[min(78dvh,620px)] w-full max-w-[520px] flex-col overflow-hidden rounded-2xl border border-[#dfe7db] bg-white p-4 shadow-[0_24px_60px_rgba(15,23,42,0.22)] dark:border-[#23314d] dark:bg-[#111827]" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-[#183325] dark:text-[#f8fafc]">Seleccionar producto</h3>
            <p className="mt-1 text-sm text-[#5b6d61] dark:text-[#c7d2e0]">Busca o toca un producto para agregarlo.</p>
          </div>
          <button className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-[#dfe7db] text-[#183325] dark:border-[#314056] dark:text-[#f8fafc]" onClick={onClose} type="button">
            <Icon name="close" />
          </button>
        </div>

        <label className="mt-4 flex items-center gap-3 rounded-2xl border border-[#dfe7db] bg-[#f8faf6] px-4 py-3 dark:border-[#314056] dark:bg-[#0f172a]">
          <Icon className="text-[#f59e0b] dark:text-[#60a5fa]" name="search" />
          <input
            className="w-full bg-transparent text-sm text-[#183325] outline-none placeholder:text-[#7b8b80] dark:text-white dark:placeholder:text-[#94a3b8]"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar producto"
            value={search}
          />
          {search ? (
            <button className="grid h-8 w-8 place-items-center rounded-xl text-[#5b6d61] active:bg-white dark:text-[#c7d2e0] dark:active:bg-[#182235]" onClick={() => setSearch("")} type="button">
              <Icon name="close" />
            </button>
          ) : null}
        </label>

        <div className="mt-4 min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
          {filteredProducts.length ? (
            filteredProducts.map((product) => {
              const selected = selectedProductId === product.id;
              return (
                <button
                  className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition active:scale-[0.99] ${
                    Number(product.stockLocal || 0) <= 0
                      ? "border-[#e5e7eb] bg-[#f3f4f6] opacity-70 dark:border-[#23314d] dark:bg-[#0f172a]"
                    : selected
                      ? "border-[#f59e0b]/50 bg-[#fff7ed] dark:border-[#314056] dark:bg-[#182235]"
                      : "border-[#e4ece2] bg-white active:bg-[#f7faf6] dark:border-[#23314d] dark:bg-[#111827] dark:active:bg-[#182235]"
                  }`}
                  disabled={Number(product.stockLocal || 0) <= 0}
                  key={product.id}
                  onClick={() => onSelect(product.id)}
                  type="button"
                >
                  <span className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-xl bg-[#eef2ff] text-[#2563eb]">
                    {product.imagen_url ? <img alt={product.nombre} className="h-full w-full object-cover" src={product.imagen_url} /> : <Icon name="inventory_2" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <strong className="block truncate text-sm font-semibold text-[#183325] dark:text-[#f8fafc]">{product.nombre}</strong>
                    <span className="mt-1 block text-xs text-[#5b6d61] dark:text-[#c7d2e0]">{money(product.precio)} - {Number(product.stockLocal || 0) <= 0 ? "sin stock en local" : `local ${product.stockLocal}`}</span>
                  </span>
                  <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${Number(product.stockLocal || 0) <= 0 ? "bg-[#e5e7eb] text-[#9ca3af] dark:bg-[#1f2937]" : selected ? "bg-[#f59e0b] text-white" : "bg-[#edf1ea] text-[#5b6d61] dark:bg-[#0f172a] dark:text-[#94a3b8]"}`}>
                    <Icon name={Number(product.stockLocal || 0) <= 0 ? "block" : selected ? "check" : "add"} />
                  </span>
                </button>
              );
            })
          ) : (
            <div className="rounded-2xl border border-dashed border-[#dfe7db] px-4 py-6 text-center text-sm text-[#5b6d61] dark:border-[#314056] dark:text-[#c7d2e0]">
              No encontramos productos con esa busqueda.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SaleModal({
  activeShift,
  app,
  cashBox,
  createSale,
  money,
  onClose,
  open,
  presentation = "modal",
  saleLines,
  salePayment,
  saleSubmitting,
  saleTotal,
  setSaleLines,
  setSalePayment,
  uploadError,
  uploadSaleEvidence,
  uploading,
  userRole,
  wallet,
}) {
  const [step, setStep] = useState(1);
  const [activeLineIndex, setActiveLineIndex] = useState(0);
  const [pickerLineIndex, setPickerLineIndex] = useState(null);
  const [evidenceViewerOpen, setEvidenceViewerOpen] = useState(false);
  const stepPanelClassName = "max-h-[min(58vh,26rem)] overflow-y-auto pr-1 sm:min-h-[26rem] sm:max-h-[26rem]";

  useEffect(() => {
    if (open) {
      setStep(1);
      setActiveLineIndex(0);
      setPickerLineIndex(null);
      setEvidenceViewerOpen(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open || step <= 1) return undefined;
    return registerAppBackHandler(() => setStep((current) => Math.max(current - 1, 1)), 10);
  }, [open, step]);

  useEffect(() => {
    if (activeLineIndex > saleLines.length - 1) {
      setActiveLineIndex(Math.max(saleLines.length - 1, 0));
    }
  }, [activeLineIndex, saleLines.length]);

  const activeProducts = useMemo(() => app.products.filter((product) => product.activo), [app.products]);

  const requiresShift = userRole === "vendedor";
  const salePreview = useMemo(
    () =>
      saleLines
        .map((line) => {
          const product = app.products.find((item) => item.id === line.productId);
          return product
            ? {
                productId: product.id,
                nombre: product.nombre,
                precio: product.precio,
                cantidad: Number(line.cantidad || 0),
                subtotal: product.precio * Number(line.cantidad || 0),
              }
            : null;
        })
        .filter(Boolean),
    [app.products, saleLines]
  );

  const selectedPayment = paymentOptions.find((item) => item.value === salePayment.method) || paymentOptions[0];
  const nextCashTotal = salePayment.method === "efectivo" ? Number(cashBox?.saldoActual || 0) + Number(saleTotal || 0) : Number(cashBox?.saldoActual || 0);
  const nextWalletTotal = salePayment.method === "efectivo" ? Number(wallet?.saldoActual || 0) : Number(wallet?.saldoActual || 0) + Number(saleTotal || 0);
  const paymentNeedsEvidence = ["transferencia_directa"].includes(salePayment.method);
  const paymentMethodLabelMap = {
    efectivo: "Pago en efectivo",
    transferencia_directa: "Transferencia directa",
  };

  const canContinueProducts =
    (!requiresShift || activeShift) &&
    salePreview.length > 0 &&
    salePreview.every((line) => line.cantidad > 0) &&
    !salePreview.some((line) => (app.products.find((product) => product.id === line.productId)?.stockLocal || 0) < line.cantidad);

  const canContinuePayment = salePayment.method && (!paymentNeedsEvidence || Boolean(salePayment.evidenceUrl));

  const nextStep = () => {
    if (step === 1 && !canContinueProducts) return;
    if (step === 2 && !canContinuePayment) return;
    setStep((current) => Math.min(current + 1, 3));
  };

  const prevStep = () => setStep((current) => Math.max(current - 1, 1));

  const setLineProduct = (index, productId) => {
    const selectedProduct = activeProducts.find((item) => item.id === productId);
    if (!selectedProduct || Number(selectedProduct.stockLocal || 0) <= 0) return;
    setSaleLines((current) => {
      const existingIndex = current.findIndex((item, idx) => idx !== index && item.productId === productId);
      if (existingIndex >= 0) {
        const next = current
          .map((item, idx) => {
            if (idx !== existingIndex) return item;
            return { ...item, cantidad: Math.min(Number(selectedProduct.stockLocal || 1), Number(item.cantidad || 1) + 1) };
          })
          .filter((_, idx) => idx !== index);
        setActiveLineIndex(existingIndex);
        return next.length ? next : [{ productId, cantidad: 1 }];
      }

      return current.map((item, idx) => {
        if (idx !== index) return item;
        const nextQuantity = Math.max(1, Math.min(Number(item.cantidad || 1), Number(selectedProduct?.stockLocal || item.cantidad || 1)));
        return {
          ...item,
          productId,
          cantidad: nextQuantity,
        };
      });
    });
    setActiveLineIndex(index);
    setPickerLineIndex(null);
  };

  const adjustLineQuantity = (index, delta) => {
    setSaleLines((current) =>
      current.map((item, idx) => {
        if (idx !== index) return item;
        const selectedProduct = activeProducts.find((product) => product.id === item.productId);
        const stockLimit = Number(selectedProduct?.stockLocal || 99);
        const nextQuantity = Math.max(1, Math.min(stockLimit, Number(item.cantidad || 1) + delta));
        return { ...item, cantidad: nextQuantity };
      })
    );
    setActiveLineIndex(index);
  };

  const removeLine = (index) => {
    setSaleLines((current) => current.filter((_, idx) => idx !== index));
    setPickerLineIndex((current) => (current === index ? null : current));
  };

  const addSaleLine = () => {
    setSaleLines((current) => [...current, { productId: "", cantidad: 1 }]);
    setActiveLineIndex(saleLines.length);
    setPickerLineIndex(saleLines.length);
  };

  const openProductPicker = () => {
    const emptyIndex = saleLines.findIndex((line) => !line.productId);
    if (emptyIndex >= 0) {
      setActiveLineIndex(emptyIndex);
      setPickerLineIndex(emptyIndex);
      return;
    }
    addSaleLine();
  };

  const renderProductOption = (product, index, mode = "recent") => {
    const selected = saleLines[index]?.productId === product.id;
    return (
      <button
        className={`cursor-pointer rounded-xl border px-3 py-2.5 text-left transition ${
          selected
            ? "border-[#f59e0b]/40 bg-[#fff7ed] shadow-[0_14px_30px_rgba(245,158,11,0.12)] dark:border-[#314056] dark:bg-[#182235]"
            : "border-[#e4ece2] bg-white hover:bg-[#fafcf9] dark:border-[#23314d] dark:bg-[#111827] dark:hover:bg-[#182235]"
        }`}
        key={`${mode}-${product.id}`}
        onClick={() => setLineProduct(index, product.id)}
        type="button"
      >
        <div className="flex items-center justify-between gap-2">
          <span
            className={`inline-flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl text-xl ${
              selected ? "bg-white text-[#183325] dark:bg-[#0f172a] dark:text-[#93c5fd]" : "bg-[#eef2ff] text-[#2563eb]"
            }`}
          >
            {product.imagen_url ? (
              <img alt={product.nombre} className="h-full w-full object-cover" src={product.imagen_url} />
            ) : (
              <Icon name="inventory_2" />
            )}
          </span>
          <span className={`inline-flex shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold ${selected ? "bg-[#f59e0b] text-white" : "bg-[#edf1ea] text-[#5b6d61] dark:bg-[#0f172a] dark:text-[#94a3b8]"}`}>
            {selected ? "Agregado" : mode === "recent" ? "Reciente" : "Resultado"}
          </span>
        </div>
        <strong className="mt-2 block text-sm font-semibold text-[#183325] dark:text-[#f8fafc]">{product.nombre}</strong>
        <span className="mt-0.5 block text-xs leading-5 text-[#5b6d61] dark:text-[#c7d2e0]">
          {money(product.precio)} • local {product.stockLocal}
        </span>
        <span className="mt-1.5 inline-flex items-center gap-2 text-[10px] font-medium text-[#6a7b70] dark:text-[#94a3b8]">
          <Icon className="text-base" name={selected ? "check_circle" : "arrow_forward"} />
          {selected ? "Ya esta en la venta" : "Agregar rapido"}
        </span>
      </button>
    );
  };

  const renderPaymentSummary = () => {
    if (salePayment.method === "efectivo") {
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
          <p className="text-sm font-semibold text-[#183325]">{paymentMethodLabelMap[salePayment.method]}</p>
          <p className="mt-1 text-sm text-[#5b6d61]">Adjunta el comprobante antes de continuar con el registro.</p>
          <div className="mt-4 grid min-w-0 gap-3 sm:grid-cols-[auto_auto_minmax(0,1fr)] sm:items-center">
            <label className={`${subtleButtonClassName} inline-flex min-w-0 items-center justify-center gap-2`}>
              {uploading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#f59e0b]/30 border-t-[#f59e0b]" /> : null}
              <span className="truncate">{uploading ? "Subiendo..." : salePayment.evidenceUrl ? "Tomar otra foto" : "Tomar foto"}</span>
              <input
                accept="image/*"
                capture="environment"
                className="hidden"
                disabled={uploading}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) uploadSaleEvidence(file);
                }}
                type="file"
              />
            </label>
            <label className={`${subtleButtonClassName} inline-flex min-w-0 justify-center`}>
              <span className="truncate">{salePayment.evidenceUrl ? "Elegir otra foto" : "Elegir foto"}</span>
              <input
                accept="image/*"
                className="hidden"
                disabled={uploading}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) uploadSaleEvidence(file);
                }}
                type="file"
              />
            </label>
            {salePayment.evidenceName ? <span className="min-w-0 truncate text-sm text-[#5b6d61]">{salePayment.evidenceName}</span> : null}
          </div>
          {uploading ? <p className="mt-3 text-sm font-medium text-[#f59e0b]">Subiendo evidencia. Mantén esta pantalla abierta.</p> : null}
          {uploadError ? <p className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{uploadError}</p> : null}
        </div>

        {salePayment.evidenceUrl ? (
          <button className={`${subtleButtonClassName} inline-flex w-full min-w-0 items-center justify-center gap-2 sm:w-fit`} onClick={() => setEvidenceViewerOpen(true)} type="button">
            <Icon name="visibility" />
            <span className="truncate">Ver evidencia</span>
          </button>
        ) : null}
      </div>
    );
  };

  return (
    <Modal open={open} onClose={onClose} text={presentation === "page" ? "" : "Registra la venta en tres pasos claros."} title="Nueva venta" variant={presentation === "page" ? "page" : "default"} wide>
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
          <div className="max-h-[min(70vh,32rem)] overflow-y-auto pr-1">
            <div className="grid gap-4">
              <div className="rounded-2xl border border-[#e4ece2] bg-white p-3 dark:border-[#23314d] dark:bg-[#111827]">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-[#183325] dark:text-[#f8fafc]">Productos</p>
                    <p className="mt-1 text-xs text-[#6a7b70] dark:text-[#94a3b8]">{salePreview.length ? `${salePreview.length} producto(s) en la venta` : "Agrega productos desde el selector."}</p>
                  </div>
                  <button className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1f7a3a] text-white shadow-[0_8px_18px_rgba(31,122,58,0.18)] dark:bg-[#2563eb]" onClick={openProductPicker} type="button">
                    <Icon name="add" />
                  </button>
                </div>

                <div className="mt-3 space-y-2">
                  {saleLines.filter((line) => line.productId).length ? (
                    saleLines.map((line, index) => {
                      const product = activeProducts.find((item) => item.id === line.productId);
                      if (!product) return null;
                      return (
                        <SelectedSaleProductCard
                          index={index}
                          key={`${index}-${line.productId}`}
                          line={line}
                          money={money}
                          onAdjust={adjustLineQuantity}
                          onChange={(lineIndex) => {
                            setActiveLineIndex(lineIndex);
                            setPickerLineIndex(lineIndex);
                          }}
                          onRemove={removeLine}
                          product={product}
                        />
                      );
                    })
                  ) : (
                    <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[#dfe7db] px-4 py-6 text-sm font-semibold text-[#5b6d61] active:bg-[#f7faf6] dark:border-[#314056] dark:text-[#c7d2e0] dark:active:bg-[#182235]" onClick={openProductPicker} type="button">
                      <Icon name="add_circle" />
                      Agregar producto
                    </button>
                  )}
                </div>
              </div>


            <div className="rounded-lg border border-[#e4ece2] bg-[#f8faf6] p-4 dark:border-[#23314d] dark:bg-[#182235]">
              <span className="block text-sm text-[#5b6d61] dark:text-[#c7d2e0]">Total calculado</span>
              <strong className="mt-1 block text-3xl font-black tracking-tight text-[#20130A] dark:text-[#f8fafc]">{money(saleTotal)}</strong>
            </div>
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div className={stepPanelClassName}>
            <div className="grid gap-4">
            <div className="grid gap-2 sm:grid-cols-2">
              {paymentOptions.map((option) => {
                const selected = salePayment.method === option.value;
                return (
                  <PaymentMethodCard
                    icon={option.icon}
                    key={option.value}
                    label={option.label}
                    onClick={() => setSalePayment((current) => ({ ...current, method: option.value, evidenceUrl: "", evidenceName: "" }))}
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
            <div className="rounded-lg border border-[#e4ece2] bg-white p-3 dark:border-[#23314d] dark:bg-[#111827]">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold text-[#183325] dark:text-[#f8fafc]">Detalle</h3>
                <span className="text-xs font-semibold text-[#6a7b70] dark:text-[#94a3b8]">{salePreview.length} producto(s)</span>
              </div>
              <div className="mt-3 grid max-h-36 gap-2 overflow-y-auto pr-1">
                {salePreview.map((line) => (
                  <article key={`${line.productId}-${line.nombre}`} className="flex items-center justify-between gap-3 rounded-lg border border-[#edf1ea] px-3 py-2 dark:border-[#23314d] dark:bg-[#182235]">
                    <div className="min-w-0">
                      <strong className="block truncate text-sm font-semibold text-[#183325] dark:text-[#f8fafc]">{line.nombre}</strong>
                      <span className="text-xs text-[#5b6d61] dark:text-[#c7d2e0]">
                        {line.cantidad} x {money(line.precio)}
                      </span>
                    </div>
                    <strong className="text-sm font-semibold text-[#183325] dark:text-[#f8fafc]">{money(line.subtotal)}</strong>
                  </article>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-[#e4ece2] bg-[#f8faf6] p-3 dark:border-[#23314d] dark:bg-[#182235]">
              <div className="space-y-2 text-sm text-[#5b6d61] dark:text-[#c7d2e0]">
                <div className="flex items-center justify-between gap-3">
                  <span>Metodo de pago</span>
                  <strong className="text-[#183325] dark:text-[#f8fafc]">{selectedPayment.label}</strong>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Total de la venta</span>
                  <strong className="text-[#183325] dark:text-[#f8fafc]">{money(saleTotal)}</strong>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>{salePayment.method === "efectivo" ? "Caja luego" : "Saldo luego"}</span>
                  <strong className="text-[#1f7a3a] dark:text-[#93c5fd]">{money(salePayment.method === "efectivo" ? nextCashTotal : nextWalletTotal)}</strong>
                </div>
                {salePayment.evidenceName ? <div className="truncate rounded-md border border-[#dbe6d8] bg-white px-3 py-2 text-xs text-[#5b6d61] dark:border-[#314056] dark:bg-[#0f172a] dark:text-[#c7d2e0]">Evidencia: {salePayment.evidenceName}</div> : null}
              </div>

              {salePayment.evidenceUrl ? <button className="mt-3 inline-flex min-w-0 items-center gap-2 text-xs font-semibold text-[#1f7a3a] dark:text-[#93c5fd]" onClick={() => setEvidenceViewerOpen(true)} type="button"><Icon className="text-base" name="visibility" /><span className="truncate">Ver evidencia</span></button> : null}
            </div>
          </div>
        ) : null}

        <div className="sticky bottom-0 z-10 -mx-1 flex flex-col-reverse gap-3 border-t border-[#edf1ea] bg-white/95 px-1 pt-3 backdrop-blur dark:bg-[#111827]/95 sm:flex-row sm:items-center sm:justify-between">
          <button className={`${subtleButtonClassName} w-full sm:w-auto`} onClick={step === 1 ? onClose : prevStep} type="button">
            {step === 1 ? "Cancelar" : "Volver"}
          </button>

          <div className="flex w-full flex-wrap gap-3 sm:w-auto sm:justify-end">
            {step < 3 ? (
              <button
                className={`${primaryButtonClassName} w-full sm:w-auto`}
                disabled={(step === 1 && !canContinueProducts) || (step === 2 && !canContinuePayment) || uploading}
                onClick={nextStep}
                type="button"
              >
                Continuar
              </button>
            ) : (
              <button className={`${primaryButtonClassName} w-full sm:w-auto`} disabled={saleSubmitting || !canContinuePayment || !canContinueProducts} onClick={async () => {
                const saved = await createSale();
                if (saved && presentation === "page") onClose();
              }} type="button">
                {saleSubmitting ? "Procesando..." : "Finalizar venta"}
              </button>
            )}
          </div>
        </div>
      </div>
      <ProductPickerModal
        money={money}
        onClose={() => setPickerLineIndex(null)}
        onSelect={(productId) => {
          if (pickerLineIndex !== null) setLineProduct(pickerLineIndex, productId);
        }}
        open={pickerLineIndex !== null}
        products={activeProducts}
        selectedProductId={pickerLineIndex !== null ? saleLines[pickerLineIndex]?.productId : ""}
      />
      <EvidenceViewer
        name={salePayment.evidenceName || "Evidencia del pago"}
        onClose={() => setEvidenceViewerOpen(false)}
        open={evidenceViewerOpen}
        url={salePayment.evidenceUrl}
      />
    </Modal>
  );
}
