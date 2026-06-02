import { useMemo, useState } from "react";
import SaleDetailsModal from "../../components/modals/SaleDetailsModal";
import ShiftSummaryModal from "../../components/modals/ShiftSummaryModal";
import EmptyState from "../../components/ui/EmptyState";
import Icon from "../../components/ui/Icon";
import PageHeader from "../../components/ui/PageHeader";
import SectionBlock from "../../components/ui/SectionBlock";
import { buildShiftSummary } from "../../services/shiftSummaryService.js";

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

function sumAmount(items, key) {
  return items.reduce((acc, item) => acc + Number(item?.[key] || 0), 0);
}

function formatPaymentMethod(value = "") {
  const map = {
    efectivo: "Efectivo",
    transferencia_directa: "Transferencia",
    deuna: "Deuna",
  };
  return map[value] || value || "Sin definir";
}

function getMonthKey(value) {
  const date = new Date(value);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function getMonthRange(key) {
  const [year, month] = key.split("-").map(Number);
  const date = new Date(year, month - 1, 1);
  return { start: startOfMonth(date), end: endOfMonth(date) };
}

function MetricPanel({ icon, label, value, tone = "green" }) {
  const tones = {
    green: "bg-[#eaf7ee] text-[#166534] dark:bg-[#14281d] dark:text-[#86efac]",
    orange: "bg-[#fff7ed] text-[#c2410c] dark:bg-[#2b1b10] dark:text-[#fdba74]",
    blue: "bg-[#eff6ff] text-[#1d4ed8] dark:bg-[#172554] dark:text-[#93c5fd]",
  };

  return (
    <article className="rounded-xl border border-[#e4ece2] bg-white p-4 dark:border-[#23314d] dark:bg-[#111827]">
      <div className="flex items-center gap-3">
        <span className={`grid h-10 w-10 place-items-center rounded-xl ${tones[tone]}`}>
          <Icon name={icon} />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6a7b70] dark:text-[#94a3b8]">{label}</p>
          <strong className="mt-1 block truncate text-xl font-semibold text-[#183325] dark:text-[#f8fafc]">{value}</strong>
        </div>
      </div>
    </article>
  );
}

function HubCard({ count, icon, onClick, title, value }) {
  return (
    <button className="rounded-xl border border-[#e4ece2] bg-white p-4 text-left transition active:scale-[0.99] dark:border-[#23314d] dark:bg-[#111827]" onClick={onClick} type="button">
      <div className="flex items-start justify-between gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#eef6f0] text-[#1f7a3a] dark:bg-[#172554] dark:text-[#93c5fd]">
          <Icon name={icon} />
        </span>
        <Icon className="text-[#6a7b70] dark:text-[#94a3b8]" name="chevron_right" />
      </div>
      <strong className="mt-4 block text-base font-semibold text-[#183325] dark:text-[#f8fafc]">{title}</strong>
      <p className="mt-1 text-sm text-[#5b6d61] dark:text-[#c7d2e0]">{value}</p>
      <span className="mt-4 inline-flex rounded-full bg-[#f6f8f4] px-3 py-1 text-xs font-semibold text-[#5b6d61] dark:bg-[#182235] dark:text-[#c7d2e0]">{count}</span>
    </button>
  );
}

export default function SalesAnalyticsPage({ expenses, money, sales, schedules = [], turnos = [] }) {
  const [view, setView] = useState("home");
  const [selectedSaleId, setSelectedSaleId] = useState(null);
  const [selectedShiftId, setSelectedShiftId] = useState(null);
  const currentMonthKey = getMonthKey(new Date());
  const [selectedMonth, setSelectedMonth] = useState(currentMonthKey);

  const monthOptions = useMemo(() => {
    const keys = new Set([currentMonthKey]);
    [...sales, ...expenses].forEach((item) => {
      if (item.createdAt) keys.add(getMonthKey(item.createdAt));
    });
    return [...keys]
      .sort((a, b) => b.localeCompare(a))
      .map((key) => {
        const [year, month] = key.split("-").map(Number);
        const label = new Intl.DateTimeFormat("es-EC", { month: "long", year: "numeric" }).format(new Date(year, month - 1, 1));
        return { key, label: label.charAt(0).toUpperCase() + label.slice(1) };
      });
  }, [currentMonthKey, expenses, sales]);

  const selectedRange = useMemo(() => getMonthRange(selectedMonth), [selectedMonth]);
  const monthSales = useMemo(
    () => sales.filter((item) => {
      const time = new Date(item.createdAt).getTime();
      return time >= selectedRange.start.getTime() && time <= selectedRange.end.getTime();
    }),
    [sales, selectedRange]
  );
  const monthExpenses = useMemo(
    () => expenses.filter((item) => {
      const time = new Date(item.createdAt).getTime();
      return time >= selectedRange.start.getTime() && time <= selectedRange.end.getTime();
    }),
    [expenses, selectedRange]
  );

  const recentSales = useMemo(() => [...sales].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()), [sales]);
  const income = sumAmount(monthSales, "total");
  const expenseTotal = sumAmount(monthExpenses, "monto");
  const net = income - expenseTotal;
  const movementMax = Math.max(income, expenseTotal, 1);

  const paymentRows = useMemo(() => {
    const map = new Map();
    monthSales.forEach((sale) => {
      const key = formatPaymentMethod(sale.paymentMethod);
      const current = map.get(key) || { label: key, total: 0, count: 0 };
      current.total += Number(sale.total || 0);
      current.count += 1;
      map.set(key, current);
    });
    return [...map.values()].sort((a, b) => b.total - a.total);
  }, [monthSales]);

  const closedShiftSummaries = useMemo(
    () =>
      (turnos || [])
        .filter((shift) => shift.estado === "cerrado")
        .map((shift) => buildShiftSummary({ shift, sales, schedules, money }))
        .filter(Boolean)
        .sort((a, b) => new Date(b.shift.closedAt || b.shift.startedAt).getTime() - new Date(a.shift.closedAt || a.shift.startedAt).getTime()),
    [money, schedules, sales, turnos]
  );

  const selectedSale = selectedSaleId ? sales.find((sale) => sale.id === selectedSaleId) || null : null;
  const selectedShiftSummary = closedShiftSummaries.find((summaryItem) => summaryItem.shift.id === selectedShiftId) || null;

  const formatDateTime = (value) =>
    new Intl.DateTimeFormat("es-EC", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));

  const BackButton = () => (
    <button className="inline-flex items-center gap-2 rounded-xl border border-[#dfe7db] px-3 py-2 text-sm font-semibold text-[#183325] dark:border-[#314056] dark:text-[#f8fafc]" onClick={() => setView("home")} type="button">
      <Icon name="arrow_back" />
      Volver
    </button>
  );

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Admin" title="Ventas" description={view === "home" ? "Elige que quieres revisar." : ""} />

      {view === "home" ? (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <MetricPanel icon="payments" label="Ingresos del mes" tone="green" value={money(income)} />
            <MetricPanel icon="shopping_cart" label="Ventas" tone="blue" value={monthSales.length} />
            <MetricPanel icon="receipt_long" label="Egresos" tone="orange" value={money(expenseTotal)} />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <HubCard count={`${recentSales.length} registro(s)`} icon="receipt_long" onClick={() => setView("records")} title="Registro de ventas" value="Historial compacto y detalles." />
            <HubCard count={`${monthSales.length} venta(s)`} icon="query_stats" onClick={() => setView("analysis")} title="Analisis del mes" value="Ingresos, egresos y pagos." />
            <HubCard count={`${closedShiftSummaries.length} turno(s)`} icon="groups" onClick={() => setView("shifts")} title="Resumen de turnos" value="Cierre diario por vendedor." />
          </div>
        </>
      ) : null}

      {view === "records" ? (
        <SectionBlock title="Registro de ventas" action={<BackButton />}>
          {recentSales.length ? (
            <div className="space-y-2">
              {recentSales.map((sale) => (
                <button key={sale.id} className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-[#edf1ea] bg-white p-3 text-left dark:border-[#23314d] dark:bg-[#111827]" onClick={() => setSelectedSaleId(sale.id)} type="button">
                  <span className="min-w-0">
                    <span className="flex items-center gap-2">
                      <strong className="truncate text-sm font-semibold text-[#183325] dark:text-[#f8fafc]">{sale.userName || "Sin nombre"}</strong>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${sale.informal ? "bg-[#fff7ed] text-[#c2410c] dark:bg-[#3b1d12] dark:text-[#fdba74]" : "bg-[#eff6ff] text-[#1d4ed8] dark:bg-[#172554] dark:text-[#93c5fd]"}`}>{sale.informal ? "Informal" : "Formal"}</span>
                    </span>
                    <span className="mt-1 block truncate text-xs text-[#5b6d61] dark:text-[#c7d2e0]">{formatDateTime(sale.createdAt)} - {formatPaymentMethod(sale.paymentMethod)}</span>
                  </span>
                  <strong className="text-sm text-[#183325] dark:text-[#f8fafc]">{money(sale.total)}</strong>
                </button>
              ))}
            </div>
          ) : (
            <EmptyState title="Sin ventas" description="Cuando registres ventas apareceran aqui." />
          )}
        </SectionBlock>
      ) : null}

      {view === "analysis" ? (
        <SectionBlock
          title="Analisis"
          action={
            <>
              <select className="rounded-xl border border-[#dfe7db] bg-white px-3 py-2 text-sm font-semibold text-[#183325] dark:border-[#314056] dark:bg-[#0f172a] dark:text-[#f8fafc]" onChange={(event) => setSelectedMonth(event.target.value)} value={selectedMonth}>
                {monthOptions.map((item) => <option key={item.key} value={item.key}>{item.label}</option>)}
              </select>
              <BackButton />
            </>
          }
        >
          <div className="grid gap-4 sm:grid-cols-3">
            <MetricPanel icon="payments" label="Ingresos" value={money(income)} />
            <MetricPanel icon="remove_circle" label="Egresos" tone="orange" value={money(expenseTotal)} />
            <MetricPanel icon="account_balance_wallet" label="Neto" tone={net >= 0 ? "green" : "orange"} value={money(net)} />
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
            <article className="rounded-xl border border-[#e4ece2] bg-white p-4 dark:border-[#23314d] dark:bg-[#111827]">
              <h3 className="text-sm font-semibold text-[#183325] dark:text-[#f8fafc]">Movimiento del mes</h3>
              <div className="mt-4 space-y-4">
                {[
                  ["Ingresos", income, "#1f7a3a"],
                  ["Egresos", expenseTotal, "#f97316"],
                ].map(([label, value, color]) => (
                  <div key={label}>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="text-[#5b6d61] dark:text-[#c7d2e0]">{label}</span>
                      <strong className="text-[#183325] dark:text-[#f8fafc]">{money(value)}</strong>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-[#edf1ea] dark:bg-[#182235]">
                      <div className="h-full rounded-full" style={{ width: `${Math.max(6, (Number(value) / movementMax) * 100)}%`, backgroundColor: color }} />
                    </div>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-xl border border-[#e4ece2] bg-white p-4 dark:border-[#23314d] dark:bg-[#111827]">
              <h3 className="text-sm font-semibold text-[#183325] dark:text-[#f8fafc]">Pagos</h3>
              <div className="mt-4 space-y-3">
                {paymentRows.length ? paymentRows.map((row) => (
                  <div key={row.label} className="rounded-lg bg-[#f8faf6] p-3 dark:bg-[#182235]">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm text-[#5b6d61] dark:text-[#c7d2e0]">{row.label}</span>
                      <strong className="text-sm text-[#183325] dark:text-[#f8fafc]">{money(row.total)}</strong>
                    </div>
                    <p className="mt-1 text-xs text-[#6a7b70] dark:text-[#94a3b8]">{row.count} venta(s)</p>
                  </div>
                )) : <EmptyState title="Sin pagos" description="No hay ventas en este mes." />}
              </div>
            </article>
          </div>
        </SectionBlock>
      ) : null}

      {view === "shifts" ? (
        <SectionBlock title="Resumen de turnos" action={<BackButton />}>
          {closedShiftSummaries.length ? (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {closedShiftSummaries.map((item) => (
                <button key={item.shift.id} className="rounded-xl border border-[#e4ece2] bg-white p-4 text-left dark:border-[#23314d] dark:bg-[#111827]" onClick={() => setSelectedShiftId(item.shift.id)} type="button">
                  <div className="flex items-start justify-between gap-3">
                    <span className="min-w-0">
                      <strong className="block truncate text-sm font-semibold text-[#183325] dark:text-[#f8fafc]">{item.shift.userName || "Vendedor"}</strong>
                      <span className="mt-1 block text-xs text-[#5b6d61] dark:text-[#c7d2e0]">{item.dateLabel} - {item.turnoLabel}</span>
                    </span>
                    <span className="rounded-full bg-[#eaf7ee] px-2.5 py-1 text-xs font-semibold text-[#166534] dark:bg-[#1e293b] dark:text-[#93c5fd]">{item.totalSales}</span>
                  </div>
                  <strong className="mt-4 block text-2xl font-semibold text-[#183325] dark:text-[#f8fafc]">{item.totalAmountLabel}</strong>
                </button>
              ))}
            </div>
          ) : (
            <EmptyState title="Sin turnos cerrados" description="Cuando un vendedor cierre su turno, el resumen aparecera aqui." />
          )}
        </SectionBlock>
      ) : null}

      <SaleDetailsModal formatDateTime={formatDateTime} money={money} onClose={() => setSelectedSaleId(null)} open={Boolean(selectedSale)} sale={selectedSale} />
      <ShiftSummaryModal money={money} onClose={() => setSelectedShiftId(null)} open={Boolean(selectedShiftSummary)} summary={selectedShiftSummary} />
    </div>
  );
}
