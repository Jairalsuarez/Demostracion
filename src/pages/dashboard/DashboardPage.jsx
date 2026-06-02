import { useMemo } from "react";
import { useAppContext } from "../../context/AppContext";
import AdminDashboardPage from "../admin/AdminDashboardPage";
import SellerDashboardPage from "../seller/SellerDashboardPage";
import { buildShiftSummary } from "../../services/shiftSummaryService.js";

export default function DashboardPage({ onNewProduct, onNewSale, onNewInformalSale, onOpenCashWithdrawal }) {
  const { activeShift, adminStats, app, recentActivity, sellerStats, upcomingSchedules, user, visibleProducts, startShift, closeShift, money, formatDate } = useAppContext();
  const sellerSchedules = useMemo(() => {
    if (user?.role !== "vendedor") return [];

    const normalizedTargets = new Set(
      [user.displayName, [user.nombre, user.apellido].filter(Boolean).join(" ").trim(), user.nombre, user.email]
        .map((value) => String(value || "").trim().toLowerCase())
        .filter(Boolean)
    );

    return (app.schedules || [])
      .filter((item) => normalizedTargets.has(String(item.responsable || "").trim().toLowerCase()))
      .sort((a, b) => new Date(`${a.fecha}T${a.inicio || "00:00"}`).getTime() - new Date(`${b.fecha}T${b.inicio || "00:00"}`).getTime())
      .slice(0, 6);
  }, [app.schedules, user?.apellido, user?.displayName, user?.email, user?.nombre, user?.role]);
  const sellerShiftRows = useMemo(() => {
    if (user?.role !== "admin") return [];

    return (app.users || [])
      .filter((item) => item.role === "vendedor")
      .map((seller) => {
        const activeSellerShift = (app.turnos || []).find((turno) => turno.userId === seller.id && turno.estado === "abierto") || null;
        return {
          id: seller.id,
          name: [seller.nombre, seller.apellido].filter(Boolean).join(" ").trim() || seller.nombre || "Vendedor",
          activeShift: activeSellerShift,
          shiftSummary: activeSellerShift
            ? buildShiftSummary({
                shift: activeSellerShift,
                sales: app.sales || [],
                schedules: app.schedules || [],
                money,
              })
            : null,
          statusLabel: activeSellerShift ? "Tiene un turno abierto en este momento." : "No tiene turnos activos.",
        };
      })
      .sort((a, b) => Number(Boolean(b.activeShift)) - Number(Boolean(a.activeShift)) || a.name.localeCompare(b.name));
  }, [app.schedules, app.sales, app.turnos, app.users, money, user?.role]);

  const sellerRecentActivity = useMemo(() => {
    if (user?.role !== "vendedor") return recentActivity;

    const mySales = (app.sales || [])
      .filter((sale) => sale.userId === user.id)
      .slice(0, 5)
      .map((sale) => ({
        id: `sale-${sale.id}`,
        title: "Registraste una venta",
        subtitle: `${money(sale.total)} • ${formatDate(sale.createdAt, { dateStyle: "medium", timeStyle: "short" })}`,
      }));

    const myShifts = (app.turnos || [])
      .filter((turno) => turno.userId === user.id)
      .slice(0, 2)
      .map((turno) => ({
        id: `shift-${turno.id}`,
        title: turno.estado === "abierto" ? "Tu turno esta activo" : "Cerraste tu turno",
        subtitle: formatDate(turno.closedAt || turno.startedAt, { dateStyle: "medium", timeStyle: "short" }),
      }));

    return [...mySales, ...myShifts].slice(0, 6);
  }, [app.sales, app.turnos, formatDate, money, recentActivity, user?.id, user?.role]);
  const canSellerCloseShift = useMemo(() => {
    if (user?.role !== "vendedor" || !activeShift?.startedAt) return false;
    return Date.now() >= new Date(activeShift.startedAt).getTime() + 5 * 60 * 60 * 1000;
  }, [activeShift?.startedAt, user?.role]);

  const sellerShiftSummary = useMemo(
    () =>
      activeShift
        ? buildShiftSummary({
            shift: activeShift,
            sales: app.sales || [],
            schedules: app.schedules || [],
            money,
          })
        : null,
    [activeShift, app.schedules, app.sales, money]
  );

  if (user?.role === "admin") {
    return (
      <AdminDashboardPage
        adminStats={adminStats}
        formatDate={formatDate}
        onCloseShift={closeShift}
        onNewInformalSale={onNewInformalSale}
        onNewProduct={onNewProduct}
        onNewSale={onNewSale}
        onOpenCashWithdrawal={onOpenCashWithdrawal}
        upcomingSchedules={upcomingSchedules}
        recentActivity={recentActivity}
        sellerShiftRows={sellerShiftRows}
        visibleProducts={visibleProducts}
        money={money}
      />
    );
  }

  return (
    <SellerDashboardPage
      activeShift={activeShift}
      canCloseShift={canSellerCloseShift}
      formatDate={formatDate}
      onCloseShift={closeShift}
      onNewInformalSale={onNewInformalSale}
      onNewSale={onNewSale}
      onStartShift={startShift}
      recentActivity={sellerRecentActivity}
      sellerStats={sellerStats}
      sellerSchedules={sellerSchedules}
      shiftSummary={sellerShiftSummary}
      visibleProducts={visibleProducts}
      money={money}
    />
  );
}
