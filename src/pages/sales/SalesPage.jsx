import { useCallback, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import SaleDetailsModal from "../../components/modals/SaleDetailsModal";
import EmptyState from "../../components/ui/EmptyState";
import Icon from "../../components/ui/Icon";
import PageHeader from "../../components/ui/PageHeader";
import SectionBlock from "../../components/ui/SectionBlock";
import { useAppContext } from "../../context/AppContext";

function startOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfWeek(date) {
  const d = startOfWeek(date);
  d.setDate(d.getDate() + 7);
  return new Date(d.getTime() - 1);
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

function formatPaymentMethod(value = "") {
  const map = { efectivo: "Efectivo", transferencia_directa: "Transferencia", deuna: "Deuna" };
  return map[value] || value || "Sin definir";
}

function getDayLabel(date) {
  const days = ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"];
  return days[new Date(date).getDay()];
}

function getShortDate(value) {
  return new Intl.DateTimeFormat("es-EC", { day: "numeric", month: "short" }).format(new Date(value));
}

function sumAmount(items, key) {
  return items.reduce((acc, item) => acc + Number(item?.[key] || 0), 0);
}

function getWeekNumber(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
  const week1 = new Date(d.getFullYear(), 0, 4);
  return 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
}

export default function SalesPage() {
  const navigate = useNavigate();
  const { app, money, formatDate } = useAppContext();
  const [selectedSaleId, setSelectedSaleId] = useState(null);
  const [sellerFilter, setSellerFilter] = useState("todos");
  const printRef = useRef(null);

  const sales = app.sales || [];
  const products = app.products || [];
  const users = app.users || [];

  const now = new Date();
  const weekStart = startOfWeek(now);
  const weekEnd = endOfWeek(now);
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

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
    if (sellerFilter === "todos") return sales;
    return sales.filter((s) => s.userId === sellerFilter);
  }, [sales, sellerFilter]);

  const weekSales = useMemo(
    () => filteredSales.filter((s) => {
      const t = new Date(s.createdAt).getTime();
      return t >= weekStart.getTime() && t <= weekEnd.getTime() && !s.informal;
    }),
    [filteredSales, weekStart, weekEnd]
  );

  const monthSales = useMemo(
    () => filteredSales.filter((s) => {
      const t = new Date(s.createdAt).getTime();
      return t >= monthStart.getTime() && t <= monthEnd.getTime() && !s.informal;
    }),
    [filteredSales, monthStart, monthEnd]
  );

  const weekRevenue = sumAmount(weekSales, "total");
  const monthRevenue = sumAmount(monthSales, "total");

  const weekCost = useMemo(() => {
    return weekSales.reduce((acc, sale) => {
      (sale.items || []).forEach((item) => {
        const product = products.find((p) => p.id === item.productId);
        acc += (Number(product?.costo || 0) * Number(item.cantidad || 0));
      });
      return acc;
    }, 0);
  }, [weekSales, products]);

  const weekProfit = weekRevenue - weekCost;

  const dailySales = useMemo(() => {
    const map = new Map();
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      map.set(key, { date: key, label: `${getDayLabel(d)} ${d.getDate()}`, total: 0, cost: 0, profit: 0 });
    }
    weekSales.forEach((sale) => {
      const key = new Date(sale.createdAt).toISOString().slice(0, 10);
      if (map.has(key)) {
        const entry = map.get(key);
        entry.total += Number(sale.total || 0);
        (sale.items || []).forEach((item) => {
          const product = products.find((p) => p.id === item.productId);
          entry.cost += (Number(product?.costo || 0) * Number(item.cantidad || 0));
        });
        entry.profit = entry.total - entry.cost;
      }
    });
    return [...map.values()];
  }, [weekSales, products, weekStart]);

  const maxTotal = Math.max(...dailySales.map((d) => d.total), 1);

  const topProduct = useMemo(() => {
    const counts = new Map();
    monthSales.forEach((sale) => {
      (sale.items || []).forEach((item) => {
        const current = counts.get(item.productId) || { nombre: item.nombre, cantidad: 0, total: 0 };
        current.cantidad += Number(item.cantidad || 0);
        current.total += Number(item.subtotal || 0);
        counts.set(item.productId, current);
      });
    });
    const sorted = [...counts.entries()].sort((a, b) => b[1].cantidad - a[1].cantidad);
    return sorted.length ? { id: sorted[0][0], ...sorted[0][1] } : null;
  }, [monthSales]);

  const topSeller = useMemo(() => {
    const counts = new Map();
    monthSales.forEach((sale) => {
      const current = counts.get(sale.userId) || { userName: sale.userName || "Vendedor", total: 0, count: 0 };
      current.total += Number(sale.total || 0);
      current.count += 1;
      counts.set(sale.userId, current);
    });
    const sorted = [...counts.entries()].sort((a, b) => b[1].total - a[1].total);
    return sorted.length ? { id: sorted[0][0], ...sorted[0][1] } : null;
  }, [monthSales]);

  const allSalesSorted = useMemo(
    () => [...filteredSales].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [filteredSales]
  );

  const selectedSale = selectedSaleId ? sales.find((s) => s.id === selectedSaleId) || null : null;

  const formatDateTime = (value) =>
    new Intl.DateTimeFormat("es-EC", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));

  const downloadPDF = useCallback(async () => {
    const { default: jsPDF } = await import("jspdf");
    const html2canvas = (await import("html2canvas")).default;
    if (!printRef.current) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "visible";

    const canvas = await html2canvas(printRef.current, { scale: 2, useCORS: true, backgroundColor: "#ffffff", logging: false, windowWidth: 1200 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 10;
    const usableWidth = pageWidth - margin * 2;
    const imgHeight = (canvas.height * usableWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "PNG", margin, position + margin, usableWidth, imgHeight);
    heightLeft -= pageHeight - margin * 2;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight + margin;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", margin, position + margin, usableWidth, imgHeight);
      heightLeft -= pageHeight - margin * 2;
    }

    document.body.style.overflow = originalOverflow;
    pdf.save(`reporte-semanal-ventas-${new Date().toISOString().slice(0, 10)}.pdf`);
  }, []);

  const weekNumber = getWeekNumber(now);
  const previewCount = 5;

  return (
    <div className="space-y-6">
      <PageHeader
        action={
          <div className="flex flex-wrap gap-3">
            <button
              className="inline-flex min-h-[52px] items-center justify-center gap-3 rounded-xl bg-[#1f7a3a] px-5 py-3 text-base font-semibold text-white shadow-[0_12px_26px_rgba(31,122,58,0.20)] transition active:scale-[0.99] dark:bg-[linear-gradient(135deg,#2563eb,#1d4ed8)]"
              onClick={downloadPDF}
              type="button"
            >
              <Icon name="picture_as_pdf" />
              Descargar PDF
            </button>
          </div>
        }
        eyebrow="Reportes"
        title="Analítica de ventas"
        description={`Semana ${weekNumber} — ${getShortDate(weekStart)} al ${getShortDate(weekEnd)}`}
      />

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#dfe7db] bg-white px-4 py-3 dark:border-[#333] dark:bg-[#0a0a0a]">
        <div className="flex items-center gap-3">
          <Icon className="text-[#5b6d61] dark:text-[#aaa]" name="person" />
          <select
            className="bg-transparent text-sm font-semibold text-[#183325] outline-none dark:text-white"
            value={sellerFilter}
            onChange={(e) => setSellerFilter(e.target.value)}
          >
            <option value="todos">Todos los vendedores</option>
            {sellerList.map((seller) => (
              <option key={seller.id} value={seller.id}>{seller.name}</option>
            ))}
          </select>
        </div>
        <button
          className="inline-flex items-center gap-2 rounded-xl border border-[#dfe7db] bg-white px-4 py-2.5 text-sm font-semibold text-[#183325] transition hover:bg-[#f8fafc] active:scale-[0.99] dark:border-[#333] dark:bg-[#0a0a0a] dark:text-white dark:hover:bg-[#111]"
          onClick={() => navigate("/panel/ventas/registro")}
          type="button"
        >
          <Icon name="list_alt" />
          Ver todas las ventas
        </button>
      </div>

      <div className="space-y-6" ref={printRef}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricPanel icon="trending_up" label="Ventas semanales" value={money(weekRevenue)} tone="blue" />
          <MetricPanel icon="money_off" label="Costo semanal" value={money(weekCost)} tone="orange" />
          <MetricPanel icon="account_balance" label="Ganancia semanal" value={money(weekProfit)} tone={weekProfit >= 0 ? "green" : "red"} />
          <MetricPanel icon="payments" label="Ventas del mes" value={money(monthRevenue)} tone="purple" />
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
          <SectionBlock title="Ventas diarias de la semana">
            {dailySales.length ? (
              <div className="space-y-4">
                <SalesBarChart data={dailySales} money={money} maxTotal={maxTotal} />
                <div className="grid grid-cols-3 gap-3 rounded-xl border border-[#e4ece2] bg-white p-3 dark:border-[#23314d] dark:bg-[#111827]">
                  <div className="text-center">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#5b6d61] dark:text-[#94a3b8]">Ingresos</p>
                    <strong className="mt-1 block text-sm text-[#166534] dark:text-[#86efac]">{money(weekRevenue)}</strong>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#5b6d61] dark:text-[#94a3b8]">Costos</p>
                    <strong className="mt-1 block text-sm text-[#c2410c] dark:text-[#fdba74]">{money(weekCost)}</strong>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#5b6d61] dark:text-[#94a3b8]">Ganancia</p>
                    <strong className="mt-1 block text-sm text-[#166534] dark:text-[#86efac]">{money(weekProfit)}</strong>
                  </div>
                </div>
              </div>
            ) : (
              <EmptyState title="Sin ventas esta semana" description="Las ventas formales apareceran aqui." />
            )}
          </SectionBlock>

          <div className="space-y-4">
            <MetricCard
              icon="star"
              iconBg="bg-[#fff7ed] text-[#c2410c] dark:bg-[#2b1b10] dark:text-[#fdba74]"
              label="Mas vendido"
              title={topProduct?.nombre}
              subtitle={topProduct ? `${topProduct.cantidad} vendido(s) - ${money(topProduct.total)}` : null}
              emptyText="Sin datos este mes"
            />
            <MetricCard
              icon="person"
              iconBg="bg-[#eff6ff] text-[#1d4ed8] dark:bg-[#172554] dark:text-[#93c5fd]"
              label="Mejor vendedor"
              title={topSeller?.userName}
              subtitle={topSeller ? `${topSeller.count} venta(s) - ${money(topSeller.total)}` : null}
              emptyText="Sin datos este mes"
            />
          </div>
        </div>
      </div>

      <SaleDetailsModal formatDateTime={formatDateTime} money={money} onClose={() => setSelectedSaleId(null)} open={Boolean(selectedSale)} sale={selectedSale} />
    </div>
  );
}

function SalesBarChart({ data, money, maxTotal }) {
  const chartHeight = 260;
  const barWidth = 40;
  const chartPad = 20;
  const usableHeight = chartHeight - chartPad * 2;

  const formatTick = (v) => `$${v}`;

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${data.length * 80 + 60} ${chartHeight}`} className="w-full" style={{ maxHeight: chartHeight }}>
        <defs>
          <linearGradient id="barTotal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1f7a3a" />
            <stop offset="100%" stopColor="#166534" />
          </linearGradient>
        </defs>
        {data.map((day, i) => {
          const x = 30 + i * (data.length > 1 ? (data.length * 80) / data.length : 80);
          const barW = Math.min(barWidth, 60);
          const totalH = Math.max((day.total / maxTotal) * usableHeight, 2);
          const costH = Math.max((day.cost / maxTotal) * usableHeight, 2);
          const profitH = Math.max((day.profit / maxTotal) * usableHeight, 2);
          return (
            <g key={day.date}>
              <rect x={x} y={chartHeight - chartPad - totalH} width={barW} height={totalH} fill="url(#barTotal)" rx={4}>
                <title>{`${day.label}: ${money(day.total)}`}</title>
              </rect>
              <rect x={x + barW + 4} y={chartHeight - chartPad - costH} width={barW} height={costH} fill="#c2410c" rx={4} opacity={0.85}>
                <title>{`${day.label}: costo ${money(day.cost)}`}</title>
              </rect>
              <rect x={x + (barW + 4) * 2} y={chartHeight - chartPad - profitH} width={barW} height={profitH} fill="#166534" rx={4} opacity={0.6}>
                <title>{`${day.label}: ganancia ${money(day.profit)}`}</title>
              </rect>
              <text x={x + barW * 1.5 + 4} y={chartHeight - 4} textAnchor="middle" fill="#5b6d61" fontSize={10}>
                {day.label}
              </text>
            </g>
          );
        })}

        <line x1={20} y1={chartHeight - chartPad} x2={data.length * 80 + 40} y2={chartHeight - chartPad} stroke="#e4ece2" strokeWidth={1} />

        {[0.25, 0.5, 0.75, 1].map((pct) => {
          const y = chartHeight - chartPad - usableHeight * pct;
          return (
            <g key={pct}>
              <line x1={20} y1={y} x2={data.length * 80 + 40} y2={y} stroke="#e4ece2" strokeWidth={1} strokeDasharray="4 4" />
              <text x={18} y={y + 4} textAnchor="end" fill="#5b6d61" fontSize={10}>
                {formatTick(Math.round(maxTotal * pct))}
              </text>
            </g>
          );
        })}

        <text x={data.length * 40 + 20} y={16} textAnchor="middle" fill="#5b6d61" fontSize={11}>
          Ingresos Costos Ganancias
        </text>
      </svg>
    </div>
  );
}

function MetricPanel({ icon, label, value, tone = "green" }) {
  const tones = {
    green: "bg-[#eaf7ee] text-[#166534] dark:bg-[#14281d] dark:text-[#86efac]",
    orange: "bg-[#fff7ed] text-[#c2410c] dark:bg-[#2b1b10] dark:text-[#fdba74]",
    blue: "bg-[#eff6ff] text-[#1d4ed8] dark:bg-[#172554] dark:text-[#93c5fd]",
    red: "bg-[#fff1f2] text-[#b91c1c] dark:bg-[#1f2937] dark:text-[#fca5a5]",
    purple: "bg-[#f5f3ff] text-[#7c3aed] dark:bg-[#1e1b4b] dark:text-[#a78bfa]",
  };
  return (
    <article className="rounded-xl border border-[#e4ece2] bg-white p-4 dark:border-[#23314d] dark:bg-[#111827]">
      <div className="flex items-center gap-3">
        <span className={`grid h-10 w-10 place-items-center rounded-xl ${tones[tone] || tones.green}`}>
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

function MetricCard({ icon, iconBg, label, title, subtitle, emptyText }) {
  return (
    <article className="rounded-xl border border-[#e4ece2] bg-white p-4 dark:border-[#23314d] dark:bg-[#111827]">
      <div className="flex items-center gap-3">
        <span className={`grid h-10 w-10 place-items-center rounded-xl ${iconBg}`}>
          <Icon name={icon} />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6a7b70] dark:text-[#94a3b8]">{label}</p>
          {title ? (
            <>
              <strong className="mt-1 block truncate text-base font-semibold text-[#183325] dark:text-[#f8fafc]">{title}</strong>
              {subtitle && <p className="mt-0.5 text-xs text-[#5b6d61] dark:text-[#c7d2e0]">{subtitle}</p>}
            </>
          ) : (
            <p className="mt-1 text-sm text-[#5b6d61] dark:text-[#c7d2e0]">{emptyText}</p>
          )}
        </div>
      </div>
    </article>
  );
}
