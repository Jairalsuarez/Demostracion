import { useEffect, useMemo, useState } from "react";
import Modal, { registerAppBackHandler } from "../Modal";
import Icon from "../ui/Icon";

const fieldClassName =
  "rounded-md border border-[#dfe7db] bg-[#f8faf6] px-4 py-3 text-[#183325] transition focus:border-[#f59e0b] focus:outline-none focus:ring-2 focus:ring-[#f59e0b]/20 dark:border-[#314056] dark:bg-[#0f172a] dark:text-white";

const subtleButtonClassName =
  "rounded-md border border-[#dfe7db] px-4 py-3 text-sm font-medium text-[#183325] transition hover:bg-[#f7faf6] dark:border-[#314056] dark:bg-[#0f172a] dark:text-white dark:hover:bg-[#182235]";

const primaryButtonClassName =
  "rounded-md bg-[#1f7a3a] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#17612d] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-[linear-gradient(135deg,#2563eb,#1d4ed8)] dark:hover:brightness-110";

const steps = [
  { id: 1, title: "Distribuidor" },
  { id: 2, title: "Valor" },
  { id: 3, title: "Productos" },
  { id: 4, title: "Resumen" },
];

function parseMoneyInput(value) {
  const normalized = String(value || "")
    .replace(",", ".")
    .replace(/[^\d.]/g, "");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeMoneyInput(value) {
  const raw = String(value ?? "").replace(",", ".").replace(/[^\d.]/g, "");
  const parts = raw.split(".");
  if (parts.length <= 1) return parts[0];
  return `${parts[0]}.${parts.slice(1).join("").slice(0, 2)}`;
}

function ProductPickerModal({ onClose, onSelect, open, products, selectedProductId }) {
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!open) return undefined;
    return registerAppBackHandler(onClose, 30);
  }, [onClose, open]);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    const source = query
      ? products.filter((product) =>
          [product.nombre, product.categoria, product.marca, product.descripcion]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(query))
        )
      : products;
    return source.sort((a, b) => String(a.nombre || "").localeCompare(String(b.nombre || ""))).slice(0, 50);
  }, [products, search]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] grid place-items-end bg-[#0b1220]/55 p-2 sm:place-items-center sm:p-4" onClick={onClose}>
      <div className="flex max-h-[min(78dvh,620px)] w-full max-w-[520px] flex-col overflow-hidden rounded-2xl border border-[#dfe7db] bg-white p-4 shadow-[0_24px_60px_rgba(15,23,42,0.22)] dark:border-[#23314d] dark:bg-[#111827]" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-[#183325] dark:text-[#f8fafc]">Seleccionar producto</h3>
            <p className="mt-1 text-sm text-[#5b6d61] dark:text-[#c7d2e0]">Busca o toca un producto para agregar inventario.</p>
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
        </label>

        <div className="mt-4 min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
          {filteredProducts.length ? (
            filteredProducts.map((product) => {
              const selected = selectedProductId === product.id;
              return (
                <button
                  className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition active:scale-[0.99] ${
                    selected ? "border-[#f59e0b]/50 bg-[#fff7ed] dark:border-[#314056] dark:bg-[#182235]" : "border-[#e4ece2] bg-white active:bg-[#f7faf6] dark:border-[#23314d] dark:bg-[#111827] dark:active:bg-[#182235]"
                  }`}
                  key={product.id}
                  onClick={() => onSelect(product.id)}
                  type="button"
                >
                  <span className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-xl bg-[#eef2ff] text-[#2563eb]">
                    {product.imagen_url ? <img alt={product.nombre} className="h-full w-full object-cover" src={product.imagen_url} /> : <Icon name="inventory_2" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <strong className="block truncate text-sm font-semibold text-[#183325] dark:text-[#f8fafc]">{product.nombre}</strong>
                    <span className="mt-1 block text-xs text-[#5b6d61] dark:text-[#c7d2e0]">Local {product.stockLocal} - Deposito {product.stockDeposito}</span>
                  </span>
                  <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${selected ? "bg-[#f59e0b] text-white" : "bg-[#edf1ea] text-[#5b6d61] dark:bg-[#0f172a] dark:text-[#94a3b8]"}`}>
                    <Icon name={selected ? "check" : "add"} />
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

export default function MerchandiseModal({
  createMerchandiseExpense,
  distributors,
  merchandise,
  merchandiseLines,
  merchandiseSubmitting,
  money,
  onClose,
  open,
  presentation = "modal",
  products,
  setMerchandise,
  setMerchandiseLines,
  wallet,
}) {
  const [step, setStep] = useState(1);
  const [pickerLineIndex, setPickerLineIndex] = useState(null);
  const activeProducts = useMemo(() => products.filter((product) => product.activo), [products]);
  const sortedDistributors = useMemo(() => [...distributors].sort((a, b) => a.nombre.localeCompare(b.nombre)), [distributors]);
  const amount = parseMoneyInput(merchandise.amountInput || merchandise.amount);
  const distributorName = merchandise.isNewDistributor ? merchandise.newDistributorName.trim() : merchandise.distributorName.trim();
  const selectedLines = useMemo(
    () =>
      merchandiseLines
        .map((line) => {
          const product = activeProducts.find((item) => item.id === line.productId);
          return product ? { ...line, product, cantidad: Number(line.cantidad || 0) } : null;
        })
        .filter(Boolean),
    [activeProducts, merchandiseLines]
  );
  const canContinueDistributor = Boolean(distributorName);
  const canContinueAmount = amount > 0;
  const canContinueProducts = selectedLines.length > 0 && selectedLines.every((line) => line.cantidad > 0);
  const nextWalletTotal = Number(wallet?.saldoActual || 0) - amount;

  const updateMerchandise = (patch) => setMerchandise((current) => ({ ...current, ...patch }));
  useEffect(() => {
    if (!open || step <= 1) return undefined;
    return registerAppBackHandler(() => setStep((current) => Math.max(current - 1, 1)), 10);
  }, [open, step]);

  const nextStep = () => {
    if (step === 1 && !canContinueDistributor) return;
    if (step === 2 && !canContinueAmount) return;
    if (step === 3 && !canContinueProducts) return;
    setStep((current) => Math.min(current + 1, 4));
  };
  const prevStep = () => setStep((current) => Math.max(current - 1, 1));

  const setLineProduct = (index, productId) => {
    setMerchandiseLines((current) => {
      const existingIndex = current.findIndex((item, idx) => idx !== index && item.productId === productId);
      if (existingIndex >= 0) {
        return current
          .map((item, idx) => (idx === existingIndex ? { ...item, cantidad: Number(item.cantidad || 1) + 1 } : item))
          .filter((_, idx) => idx !== index);
      }
      return current.map((item, idx) => (idx === index ? { ...item, productId, cantidad: Math.max(1, Number(item.cantidad || 1)) } : item));
    });
    setPickerLineIndex(null);
  };

  const adjustLineQuantity = (index, delta) => {
    setMerchandiseLines((current) =>
      current.map((item, idx) => (idx === index ? { ...item, cantidad: Math.max(1, Number(item.cantidad || 1) + delta) } : item))
    );
  };

  const removeLine = (index) => setMerchandiseLines((current) => current.filter((_, idx) => idx !== index));
  const openProductPicker = () => {
    const emptyIndex = merchandiseLines.findIndex((line) => !line.productId);
    if (emptyIndex >= 0) {
      setPickerLineIndex(emptyIndex);
      return;
    }
    setMerchandiseLines((current) => [...current, { productId: "", cantidad: 1 }]);
    setPickerLineIndex(merchandiseLines.length);
  };

  return (
    <Modal open={open} onClose={onClose} text="Registra mercaderia, descuenta saldo y aumenta inventario." title="Mercaderia" variant={presentation === "page" ? "page" : "default"} wide>
      <div className="grid gap-5">
        <div className="flex items-center justify-center gap-3 rounded-2xl border border-[#edf1ea] bg-[#fbfcfa] px-4 py-3 dark:border-[#23314d] dark:bg-[#111827]">
          {steps.map((item) => {
            const active = step === item.id;
            const completed = step > item.id;
            return (
              <button
                key={item.id}
                aria-label={item.title}
                className={`grid h-9 w-9 place-items-center rounded-full text-sm font-semibold transition ${
                  active ? "bg-[#f59e0b] text-white shadow-[0_8px_18px_rgba(245,158,11,0.22)] dark:bg-[#2563eb]" : completed ? "bg-[#1f7a3a] text-white dark:bg-[#2563eb]" : "bg-[#edf1ea] text-[#183325] dark:bg-[#0f172a] dark:text-[#f8fafc]"
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
          <div className="grid gap-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <button className={`${subtleButtonClassName} text-left ${!merchandise.isNewDistributor ? "border-[#f59e0b]/50 bg-[#fff7ed] dark:bg-[#182235]" : ""}`} onClick={() => updateMerchandise({ isNewDistributor: false, newDistributorName: "" })} type="button">
                Elegir distribuidor
              </button>
              <button className={`${subtleButtonClassName} text-left ${merchandise.isNewDistributor ? "border-[#f59e0b]/50 bg-[#fff7ed] dark:bg-[#182235]" : ""}`} onClick={() => updateMerchandise({ isNewDistributor: true, distributorId: "", distributorName: "" })} type="button">
                Crear distribuidor
              </button>
            </div>
            {merchandise.isNewDistributor ? (
              <label className="grid gap-2 text-sm font-semibold text-[#183325] dark:text-white">
                Nombre del distribuidor
                <input className={fieldClassName} onChange={(event) => updateMerchandise({ newDistributorName: event.target.value, distributorName: event.target.value })} placeholder="Ej. Distribuidora El Proveedor" value={merchandise.newDistributorName} />
              </label>
            ) : (
              <label className="grid gap-2 text-sm font-semibold text-[#183325] dark:text-white">
                Distribuidor
                <select
                  className={fieldClassName}
                  onChange={(event) => {
                    const selected = sortedDistributors.find((item) => item.id === event.target.value);
                    updateMerchandise({ distributorId: event.target.value, distributorName: selected?.nombre || "" });
                  }}
                  value={merchandise.distributorId}
                >
                  <option value="">Selecciona un distribuidor</option>
                  {sortedDistributors.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.nombre}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>
        ) : null}

        {step === 2 ? (
          <div className="grid gap-4">
            <div className="grid gap-2">
              <span className="text-sm font-semibold text-[#183325] dark:text-white">Ubicacion de ingreso</span>
              <div className="grid gap-2 sm:grid-cols-2">
                {[
                  { value: "deposito", label: "Deposito", icon: "warehouse" },
                  { value: "local", label: "Local", icon: "storefront" },
                ].map((option) => (
                  <button
                    className={`${subtleButtonClassName} flex items-center justify-center gap-2 ${merchandise.location === option.value ? "border-[#f59e0b]/50 bg-[#fff7ed] dark:bg-[#182235]" : ""}`}
                    key={option.value}
                    onClick={() => updateMerchandise({ location: option.value })}
                    type="button"
                  >
                    <Icon name={option.icon} />
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <label className="grid gap-2 text-sm font-semibold text-[#183325] dark:text-white">
              Valor de la mercaderia
              <input
                className={fieldClassName}
                inputMode="decimal"
                onChange={(event) => updateMerchandise({ amountInput: normalizeMoneyInput(event.target.value), amount: parseMoneyInput(event.target.value) })}
                placeholder="Ej. 120.00"
                type="text"
                value={merchandise.amountInput}
              />
            </label>
            <div className="rounded-lg border border-[#e4ece2] bg-[#f8faf6] p-4 dark:border-[#23314d] dark:bg-[#182235]">
              <span className="block text-sm text-[#5b6d61] dark:text-[#c7d2e0]">Saldo luego</span>
              <strong className="mt-1 block text-3xl font-black tracking-tight text-[#b42318] dark:text-[#fca5a5]">{money(nextWalletTotal)}</strong>
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="max-h-[min(70vh,32rem)] overflow-y-auto pr-1">
            <div className="rounded-2xl border border-[#e4ece2] bg-white p-3 dark:border-[#23314d] dark:bg-[#111827]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-[#183325] dark:text-[#f8fafc]">Productos</p>
                  <p className="mt-1 text-xs text-[#6a7b70] dark:text-[#94a3b8]">{selectedLines.length ? `${selectedLines.length} producto(s) para aumentar` : "Agrega productos desde el selector."}</p>
                </div>
                <button className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1f7a3a] text-white shadow-[0_8px_18px_rgba(31,122,58,0.18)] dark:bg-[#2563eb]" onClick={openProductPicker} type="button">
                  <Icon name="add" />
                </button>
              </div>
              <div className="mt-3 space-y-2">
                {selectedLines.length ? (
                  selectedLines.map((line, index) => (
                    <article key={`${line.productId}-${index}`} className="rounded-xl border border-[#edf1ea] bg-[#f8faf6] p-3 dark:border-[#314056] dark:bg-[#0f172a]">
                      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
                        <button className="grid min-w-0 grid-cols-[44px_minmax(0,1fr)] items-center gap-3 text-left" onClick={() => setPickerLineIndex(index)} type="button">
                          <span className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-xl bg-[#eef2ff] text-[#2563eb]">
                            {line.product.imagen_url ? <img alt={line.product.nombre} className="h-full w-full object-cover" src={line.product.imagen_url} /> : <Icon name="inventory_2" />}
                          </span>
                          <span className="min-w-0">
                            <strong className="block max-w-full whitespace-normal break-words text-sm font-semibold leading-5 text-[#183325] dark:text-[#f8fafc]">{line.product.nombre}</strong>
                            <span className="mt-1 block text-xs text-[#5b6d61] dark:text-[#c7d2e0]">Local {line.product.stockLocal} - Deposito {line.product.stockDeposito}</span>
                          </span>
                        </button>
                        <div className="grid shrink-0 grid-cols-[32px_34px_32px_32px] items-center rounded-xl border border-[#dfe7db] bg-white p-1 dark:border-[#314056] dark:bg-[#182235]">
                          <button className="grid h-8 w-8 place-items-center rounded-lg text-[#183325] disabled:opacity-40 dark:text-white" disabled={line.cantidad <= 1} onClick={() => adjustLineQuantity(index, -1)} type="button">
                            <Icon name="remove" />
                          </button>
                          <span className="text-center text-sm font-bold text-[#183325] dark:text-[#f8fafc]">{line.cantidad}</span>
                          <button className="grid h-8 w-8 place-items-center rounded-lg text-[#183325] dark:text-white" onClick={() => adjustLineQuantity(index, 1)} type="button">
                            <Icon name="add" />
                          </button>
                          <button className="grid h-8 w-8 place-items-center rounded-lg text-[#dc2626] dark:text-[#fca5a5]" onClick={() => removeLine(index)} type="button">
                            <Icon name="delete" />
                          </button>
                        </div>
                      </div>
                    </article>
                  ))
                ) : (
                  <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[#dfe7db] px-4 py-6 text-sm font-semibold text-[#5b6d61] active:bg-[#f7faf6] dark:border-[#314056] dark:text-[#c7d2e0] dark:active:bg-[#182235]" onClick={openProductPicker} type="button">
                    <Icon name="add_circle" />
                    Agregar producto
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : null}

        {step === 4 ? (
          <div className="grid gap-3">
            <div className="rounded-lg border border-[#e4ece2] bg-white p-3 dark:border-[#23314d] dark:bg-[#111827]">
              <div className="space-y-2 text-sm text-[#5b6d61] dark:text-[#c7d2e0]">
                <div className="flex items-center justify-between gap-3">
                  <span>Distribuidor</span>
                  <strong className="text-[#183325] dark:text-[#f8fafc]">{distributorName}</strong>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Ingreso a</span>
                  <strong className="text-[#183325] dark:text-[#f8fafc]">{merchandise.location === "local" ? "Local" : "Deposito"}</strong>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Valor</span>
                  <strong className="text-[#183325] dark:text-[#f8fafc]">{money(amount)}</strong>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Saldo luego</span>
                  <strong className="text-[#b42318] dark:text-[#fca5a5]">{money(nextWalletTotal)}</strong>
                </div>
              </div>
            </div>
            <div className="grid max-h-40 gap-2 overflow-y-auto pr-1">
              {selectedLines.map((line) => (
                <article key={line.productId} className="flex items-center justify-between gap-3 rounded-lg border border-[#edf1ea] px-3 py-2 dark:border-[#23314d] dark:bg-[#182235]">
                  <span className="min-w-0 truncate text-sm font-semibold text-[#183325] dark:text-[#f8fafc]">{line.product.nombre}</span>
                  <strong className="text-sm text-[#1f7a3a] dark:text-[#93c5fd]">+{line.cantidad}</strong>
                </article>
              ))}
            </div>
          </div>
        ) : null}

        <div className="sticky bottom-0 z-10 -mx-1 flex flex-col-reverse gap-3 border-t border-[#edf1ea] bg-white/95 px-1 pt-3 backdrop-blur dark:bg-[#111827]/95 sm:flex-row sm:items-center sm:justify-between">
          <button className={`${subtleButtonClassName} w-full sm:w-auto`} onClick={step === 1 ? onClose : prevStep} type="button">
            {step === 1 ? "Cancelar" : "Volver"}
          </button>
          {step < 4 ? (
            <button className={`${primaryButtonClassName} w-full sm:w-auto`} disabled={(step === 1 && !canContinueDistributor) || (step === 2 && !canContinueAmount) || (step === 3 && !canContinueProducts)} onClick={nextStep} type="button">
              Continuar
            </button>
          ) : (
            <button className={`${primaryButtonClassName} w-full sm:w-auto`} disabled={merchandiseSubmitting || !canContinueDistributor || !canContinueAmount || !canContinueProducts} onClick={createMerchandiseExpense} type="button">
              {merchandiseSubmitting ? "Procesando..." : "Confirmar mercaderia"}
            </button>
          )}
        </div>
      </div>
      <ProductPickerModal
        onClose={() => setPickerLineIndex(null)}
        onSelect={(productId) => {
          if (pickerLineIndex !== null) setLineProduct(pickerLineIndex, productId);
        }}
        open={pickerLineIndex !== null}
        products={activeProducts}
        selectedProductId={pickerLineIndex !== null ? merchandiseLines[pickerLineIndex]?.productId : ""}
      />
    </Modal>
  );
}
