import { useEffect, useMemo, useState } from "react";
import SaleDetailsModal from "../../components/modals/SaleDetailsModal";
import EmptyState from "../../components/ui/EmptyState";
import Icon from "../../components/ui/Icon";
import PageHeader from "../../components/ui/PageHeader";
import Pagination from "../../components/ui/Pagination";
import SectionBlock from "../../components/ui/SectionBlock";
import { useAppContext } from "../../context/AppContext";

const SALES_PER_PAGE = 5;

function formatPaymentMethod(value = "") {
  const map = { efectivo: "Efectivo", transferencia_directa: "Transferencia", deuna: "Deuna" };
  return map[value] || value || "Sin definir";
}

export default function SalesRegistryPage() {
  const { app, money } = useAppContext();
  const [selectedSaleId, setSelectedSaleId] = useState(null);
  const [sellerFilter, setSellerFilter] = useState("todos");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("todos");
  const [typeFilter, setTypeFilter] = useState("todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("fecha_desc");

  const sales = app.sales || [];
  const users = app.users || [];

  const sellerList = useMemo(() => {
    const map = new Map();
    sales.forEach((s) => {
      if (s.userId && !map.has(s.userId)) {
        map.set(s.userId, { id: s.userId, name: s.userName || "Vendedor" });
      }
    });
    users.forEach((u) => {
      if (u.role === "vendedor" || u.role === "admin") {
        map.set(u.id, { id: u.id, name: [u.nombre, u.apellido].filter(Boolean).join(" ") || u.nombre || u.email });
      }
    });
    return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [sales, users]);

  const filteredSales = useMemo(() => {
    let result = [...sales];

    if (sellerFilter !== "todos") {
      result = result.filter((s) => s.userId === sellerFilter);
    }

    if (dateFrom) {
      const from = new Date(dateFrom);
      from.setHours(0, 0, 0, 0);
      result = result.filter((s) => new Date(s.createdAt).getTime() >= from.getTime());
    }

    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      result = result.filter((s) => new Date(s.createdAt).getTime() <= to.getTime());
    }

    if (paymentFilter !== "todos") {
      result = result.filter((s) => s.paymentMethod === paymentFilter);
    }

    if (typeFilter === "formal") {
      result = result.filter((s) => !s.informal);
    } else if (typeFilter === "informal") {
      result = result.filter((s) => s.informal);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((s) => {
        if (s.userName?.toLowerCase().includes(q)) return true;
        if (s.id?.toLowerCase().includes(q)) return true;
        if (s.paymentMethod?.toLowerCase().includes(q)) return true;
        if (s.items?.some((item) => item.nombre?.toLowerCase().includes(q))) return true;
        return false;
      });
    }

    result.sort((a, b) => {
      const da = new Date(a.createdAt).getTime();
      const db = new Date(b.createdAt).getTime();
      if (sortBy === "fecha_asc") return da - db;
      if (sortBy === "monto_desc") return (b.total || 0) - (a.total || 0);
      if (sortBy === "monto_asc") return (a.total || 0) - (b.total || 0);
      return db - da;
    });

    return result;
  }, [sales, sellerFilter, dateFrom, dateTo, paymentFilter, typeFilter, searchQuery, sortBy]);

  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(filteredSales.length / SALES_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedSales = useMemo(() => {
    const start = (safePage - 1) * SALES_PER_PAGE;
    return filteredSales.slice(start, start + SALES_PER_PAGE);
  }, [filteredSales, safePage]);

  useEffect(() => { setCurrentPage(1); }, [filteredSales]);

  const hasAnyFilter = sellerFilter !== "todos" || dateFrom || dateTo || paymentFilter !== "todos" || typeFilter !== "todos" || searchQuery;

  const selectedSale = selectedSaleId ? sales.find((s) => s.id === selectedSaleId) || null : null;

  const formatDateTime = (value) =>
    new Intl.DateTimeFormat("es-EC", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));

  const clearFilters = () => {
    setSellerFilter("todos");
    setDateFrom("");
    setDateTo("");
    setPaymentFilter("todos");
    setTypeFilter("todos");
    setSearchQuery("");
    setSortBy("fecha_desc");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Reportes"
        title="Todas las ventas"
      />

      <div className="grid gap-3 rounded-xl border border-[#dfe7db] bg-white p-4 dark:border-[#333] dark:bg-[#0a0a0a] sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <div>
          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.1em] text-[#5b6d61] dark:text-[#94a3b8]">Vendedor</label>
          <select
            className="w-full rounded-lg border border-[#dfe7db] bg-white px-3 py-2 text-sm font-semibold text-[#183325] outline-none dark:border-[#333] dark:bg-[#0a0a0a] dark:text-white"
            value={sellerFilter}
            onChange={(e) => setSellerFilter(e.target.value)}
          >
            <option value="todos">Todos</option>
            {sellerList.map((seller) => (
              <option key={seller.id} value={seller.id}>{seller.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.1em] text-[#5b6d61] dark:text-[#94a3b8]">Desde</label>
          <input
            className="w-full rounded-lg border border-[#dfe7db] bg-white px-3 py-2 text-sm text-[#183325] outline-none dark:border-[#333] dark:bg-[#0a0a0a] dark:text-white"
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.1em] text-[#5b6d61] dark:text-[#94a3b8]">Hasta</label>
          <input
            className="w-full rounded-lg border border-[#dfe7db] bg-white px-3 py-2 text-sm text-[#183325] outline-none dark:border-[#333] dark:bg-[#0a0a0a] dark:text-white"
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.1em] text-[#5b6d61] dark:text-[#94a3b8]">Metodo de pago</label>
          <select
            className="w-full rounded-lg border border-[#dfe7db] bg-white px-3 py-2 text-sm font-semibold text-[#183325] outline-none dark:border-[#333] dark:bg-[#0a0a0a] dark:text-white"
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
          >
            <option value="todos">Todos</option>
            <option value="efectivo">Efectivo</option>
            <option value="transferencia_directa">Transferencia</option>
            <option value="deuna">Deuna</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.1em] text-[#5b6d61] dark:text-[#94a3b8]">Tipo</label>
          <select
            className="w-full rounded-lg border border-[#dfe7db] bg-white px-3 py-2 text-sm font-semibold text-[#183325] outline-none dark:border-[#333] dark:bg-[#0a0a0a] dark:text-white"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="todos">Todos</option>
            <option value="formal">Formal</option>
            <option value="informal">Informal</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.1em] text-[#5b6d61] dark:text-[#94a3b8]">Ordenar</label>
          <select
            className="w-full rounded-lg border border-[#dfe7db] bg-white px-3 py-2 text-sm font-semibold text-[#183325] outline-none dark:border-[#333] dark:bg-[#0a0a0a] dark:text-white"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="fecha_desc">Mas reciente</option>
            <option value="fecha_asc">Mas antiguo</option>
            <option value="monto_desc">Mayor monto</option>
            <option value="monto_asc">Menor monto</option>
          </select>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <Icon className="shrink-0 text-[#5b6d61] dark:text-[#94a3b8]" name="search" />
          <input
            className="flex-1 rounded-lg border border-[#dfe7db] bg-white px-3 py-2 text-sm text-[#183325] outline-none placeholder:text-[#bbb] dark:border-[#333] dark:bg-[#0a0a0a] dark:text-white dark:placeholder:text-[#555]"
            type="text"
            placeholder="Buscar por nombre, producto..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {hasAnyFilter ? (
          <button
            className="text-sm font-semibold text-[#b42318] underline underline-offset-4 transition hover:text-[#8a1c14] dark:text-[#fca5a5] dark:hover:text-[#f87171]"
            onClick={clearFilters}
            type="button"
          >
            Limpiar filtros
          </button>
        ) : null}
      </div>

      <SectionBlock title={`Resultados (${filteredSales.length})`}>
        {paginatedSales.length ? (
          <div className="space-y-2">
            {paginatedSales.map((sale) => (
              <button
                key={sale.id}
                className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-[#edf1ea] bg-white p-3 text-left dark:border-[#23314d] dark:bg-[#111827]"
                onClick={() => setSelectedSaleId(sale.id)}
                type="button"
              >
                <span className="min-w-0">
                  <span className="flex items-center gap-2">
                    <strong className="truncate text-sm font-semibold text-[#183325] dark:text-[#f8fafc]">{sale.userName || "Sin nombre"}</strong>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${sale.informal ? "bg-[#fff7ed] text-[#c2410c] dark:bg-[#3b1d12] dark:text-[#fdba74]" : "bg-[#eff6ff] text-[#1d4ed8] dark:bg-[#172554] dark:text-[#93c5fd]"}`}>
                      {sale.informal ? "Informal" : "Formal"}
                    </span>
                  </span>
                  <span className="mt-1 block truncate text-xs text-[#5b6d61] dark:text-[#c7d2e0]">
                    {formatDateTime(sale.createdAt)} — {formatPaymentMethod(sale.paymentMethod)}
                  </span>
                </span>
                <strong className="text-sm text-[#183325] dark:text-[#f8fafc]">{money(sale.total)}</strong>
              </button>
            ))}
          </div>
        ) : (
          <EmptyState
            title="Sin resultados"
            description={hasAnyFilter ? "Intenta con otros filtros." : "Cuando registres ventas apareceran aqui."}
          />
        )}

        <Pagination
          currentPage={safePage}
          itemLabel="ventas"
          onPageChange={setCurrentPage}
          pageSize={SALES_PER_PAGE}
          totalItems={filteredSales.length}
          totalPages={totalPages}
        />
      </SectionBlock>

      <SaleDetailsModal
        formatDateTime={formatDateTime}
        money={money}
        onClose={() => setSelectedSaleId(null)}
        open={Boolean(selectedSale)}
        sale={selectedSale}
      />
    </div>
  );
}
