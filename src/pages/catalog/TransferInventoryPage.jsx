import { useMemo, useState } from "react";
import Icon from "../../components/ui/Icon";
import PageHeader from "../../components/ui/PageHeader";
import SectionBlock from "../../components/ui/SectionBlock";
import useCatalogFilters from "../../hooks/useCatalogFilters.jsx";

export default function TransferInventoryPage({ money, onBack, products, transferInventory }) {
  const [selectedProductId, setSelectedProductId] = useState("");
  const [from, setFrom] = useState("deposito");
  const [to, setTo] = useState("local");
  const [quantity, setQuantity] = useState("");
  const { filteredProducts, search, setSearch } = useCatalogFilters(products);
  const selectedProduct = useMemo(() => products.find((item) => item.id === selectedProductId) || null, [products, selectedProductId]);
  const available = selectedProduct ? Number(selectedProduct[from === "local" ? "stockLocal" : "stockDeposito"] || 0) : 0;
  const canSubmit = selectedProduct && from !== to && Number(quantity || 0) > 0 && Number(quantity || 0) <= available;

  const swapLocations = () => {
    setFrom(to);
    setTo(from);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Inventario"
        title="Transferir stock"
        action={
          <button className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-[#dfe7db] px-4 py-3 text-sm font-semibold text-[#183325] dark:border-[#314056] dark:bg-[#182235] dark:text-[#f8fafc]" onClick={onBack} type="button">
            <Icon name="arrow_back" />
            Volver
          </button>
        }
      />

      <SectionBlock title="Producto">
        <div className="grid gap-3">
          <label className="flex min-h-[54px] items-center gap-3 rounded-xl border border-[#dfe7db] bg-[#fbfcfa] px-4 py-3 dark:border-[#314056] dark:bg-[#0f172a]">
            <Icon className="shrink-0 text-[#1f7a3a] dark:text-[#93c5fd]" name="search" />
            <input className="min-w-0 flex-1 bg-transparent text-base text-[#183325] outline-none dark:text-[#f8fafc]" onChange={(event) => setSearch(event.target.value)} placeholder="Buscar producto" value={search} />
          </label>

          <div className="grid max-h-[320px] gap-2 overflow-y-auto pr-1">
            {filteredProducts.slice(0, 30).map((product) => (
              <button
                className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left ${selectedProductId === product.id ? "border-[#1f7a3a] bg-[#eef6f0] dark:border-[#60a5fa] dark:bg-[#182235]" : "border-[#e4ece2] bg-white dark:border-[#23314d] dark:bg-[#111827]"}`}
                key={product.id}
                onClick={() => setSelectedProductId(product.id)}
                type="button"
              >
                <span className="min-w-0">
                  <strong className="block truncate text-sm font-semibold text-[#183325] dark:text-[#f8fafc]">{product.nombre}</strong>
                  <span className="mt-1 block text-xs text-[#5b6d61] dark:text-[#c7d2e0]">Local {product.stockLocal} - Deposito {product.stockDeposito} - {money(product.precio)}</span>
                </span>
                <Icon className="shrink-0 text-[#1f7a3a] dark:text-[#93c5fd]" name={selectedProductId === product.id ? "check_circle" : "radio_button_unchecked"} />
              </button>
            ))}
          </div>
        </div>
      </SectionBlock>

      <SectionBlock title="Movimiento">
        <div className="grid gap-4">
          <div className="grid grid-cols-[minmax(0,1fr)_48px_minmax(0,1fr)] items-end gap-2">
            <label className="grid gap-2 text-sm font-semibold text-[#183325] dark:text-white">
              Desde
              <select className="rounded-xl border border-[#dfe7db] bg-[#fbfcfa] px-3 py-3 dark:border-[#314056] dark:bg-[#0f172a]" onChange={(event) => setFrom(event.target.value)} value={from}>
                <option value="deposito">Deposito</option>
                <option value="local">Local</option>
              </select>
            </label>
            <button className="grid h-12 w-12 place-items-center rounded-xl border border-[#dfe7db] text-[#183325] dark:border-[#314056] dark:bg-[#182235] dark:text-[#f8fafc]" onClick={swapLocations} type="button">
              <Icon name="swap_horiz" />
            </button>
            <label className="grid gap-2 text-sm font-semibold text-[#183325] dark:text-white">
              Hacia
              <select className="rounded-xl border border-[#dfe7db] bg-[#fbfcfa] px-3 py-3 dark:border-[#314056] dark:bg-[#0f172a]" onChange={(event) => setTo(event.target.value)} value={to}>
                <option value="local">Local</option>
                <option value="deposito">Deposito</option>
              </select>
            </label>
          </div>

          <label className="grid gap-2 text-sm font-semibold text-[#183325] dark:text-white">
            Cantidad
            <input className="rounded-xl border border-[#dfe7db] bg-[#fbfcfa] px-4 py-3 dark:border-[#314056] dark:bg-[#0f172a]" min="1" onChange={(event) => setQuantity(event.target.value)} placeholder={`Disponible: ${available}`} type="number" value={quantity} />
          </label>

          <button
            className="min-h-[52px] rounded-xl bg-[#1f7a3a] px-5 py-3 text-base font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[linear-gradient(135deg,#2563eb,#1d4ed8)]"
            disabled={!canSubmit}
            onClick={async () => {
              const saved = await transferInventory({ productId: selectedProductId, from, to, quantity: Number(quantity) });
              if (saved) onBack();
            }}
            type="button"
          >
            Confirmar transferencia
          </button>
        </div>
      </SectionBlock>
    </div>
  );
}
