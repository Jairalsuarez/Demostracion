import { useMemo, useState } from "react";
import SaleDetailsModal from "../../components/modals/SaleDetailsModal";
import EmptyState from "../../components/ui/EmptyState";
import Icon from "../../components/ui/Icon";
import PageHeader from "../../components/ui/PageHeader";
import Pagination from "../../components/ui/Pagination";
import { useAppContext } from "../../context/AppContext";

const SALES_PER_PAGE = 10;

function formatPaymentMethod(value = "") {
  const map = {
    efectivo: "Efectivo",
    transferencia_directa: "Transferencia",
    deuna: "Deuna",
  };
  return map[value] || value || "Sin definir";
}

export default function SalesPage() {
  const { app, money, formatDate } = useAppContext();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSaleId, setSelectedSaleId] = useState(null);

  const sales = app.sales || [];

  const orderedSales = useMemo(
    () => [...sales].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [sales]
  );

  const totalPages = Math.max(1, Math.ceil(orderedSales.length / SALES_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);

  const pageSales = useMemo(() => {
    const start = (safePage - 1) * SALES_PER_PAGE;
    return orderedSales.slice(start, start + SALES_PER_PAGE);
  }, [orderedSales, safePage]);

  const selectedSale = selectedSaleId ? sales.find((sale) => sale.id === selectedSaleId) || null : null;

  const formatDt = (value) =>
    formatDate(value, { dateStyle: "medium", timeStyle: "short" });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ventas"
        description={`${sales.length} venta(s) registrada(s)`}
      />

      {pageSales.length ? (
        <div className="space-y-2">
          {pageSales.map((sale) => (
            <button
              key={sale.id}
              className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-[#edf1ea] bg-white p-3 text-left dark:border-[#23314d] dark:bg-[#111827]"
              onClick={() => setSelectedSaleId(sale.id)}
              type="button"
            >
              <span className="min-w-0">
                <span className="flex items-center gap-2">
                  <strong className="truncate text-sm font-semibold text-[#183325] dark:text-[#f8fafc]">
                    {sale.userName || "Sin nombre"}
                  </strong>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${sale.informal ? "bg-[#fff7ed] text-[#c2410c] dark:bg-[#3b1d12] dark:text-[#fdba74]" : "bg-[#eff6ff] text-[#1d4ed8] dark:bg-[#172554] dark:text-[#93c5fd]"}`}>
                    {sale.informal ? "Informal" : "Formal"}
                  </span>
                </span>
                <span className="mt-1 block truncate text-xs text-[#5b6d61] dark:text-[#c7d2e0]">
                  {formatDt(sale.createdAt)} &middot; {formatPaymentMethod(sale.paymentMethod)}
                </span>
              </span>
              <strong className="text-sm text-[#183325] dark:text-[#f8fafc]">
                {money(sale.total)}
              </strong>
            </button>
          ))}
        </div>
      ) : (
        <EmptyState
          icon="receipt_long"
          title="Sin ventas"
          description="Cuando registres ventas apareceran aqui."
        />
      )}

      {totalPages > 1 ? (
        <Pagination current={safePage} onChange={setCurrentPage} total={totalPages} />
      ) : null}

      <SaleDetailsModal
        formatDateTime={formatDt}
        money={money}
        onClose={() => setSelectedSaleId(null)}
        open={Boolean(selectedSale)}
        sale={selectedSale}
      />
    </div>
  );
}
