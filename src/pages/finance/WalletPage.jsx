import { useMemo, useState } from "react";
import ExpenseDetailsModal from "../../components/modals/ExpenseDetailsModal";
import Icon from "../../components/ui/Icon";
import PageHeader from "../../components/ui/PageHeader";
import Pagination from "../../components/ui/Pagination";
import SectionBlock from "../../components/ui/SectionBlock";
import StatCard from "../../components/ui/StatCard";

const isToday = (value) => new Date(value).toDateString() === new Date().toDateString();
const EXPENSES_PER_PAGE = 8;

export default function WalletPage({ cashBox, expenses, formatDate, isAdmin, money, onOpenCashWithdrawal, onOpenExpense, onOpenMerchandise, onOpenWallet, wallet }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [showExpenseMovements, setShowExpenseMovements] = useState(false);
  const [selectedExpenseId, setSelectedExpenseId] = useState(null);
  const selectedExpense = selectedExpenseId ? expenses.find((e) => e.id === selectedExpenseId) || null : null;
  const expensesToday = expenses.filter((item) => isToday(item.createdAt)).reduce((acc, item) => acc + Number(item.monto || 0), 0);
  const orderedExpenses = useMemo(
    () => [...expenses].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [expenses]
  );
  const totalPages = Math.max(1, Math.ceil(orderedExpenses.length / EXPENSES_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const latestExpenses = useMemo(() => {
    const start = (safeCurrentPage - 1) * EXPENSES_PER_PAGE;
    return orderedExpenses.slice(start, start + EXPENSES_PER_PAGE);
  }, [orderedExpenses, safeCurrentPage]);

  const stats = [
    { label: "Caja", value: money(cashBox?.saldoActual || 0), detail: "Efectivo disponible para retirar" },
    { label: "Saldo general", value: money(wallet?.saldoActual || 0), detail: "Sube al retirar dinero de caja" },
    { label: "Egresos de hoy", value: money(expensesToday), detail: `${expenses.filter((item) => isToday(item.createdAt)).length} movimientos hoy` },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Saldo"
        title="Control de saldo"
        action={
          <>
            <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-[linear-gradient(135deg,#1f7a3a,#2b8e46)] px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_26px_rgba(31,122,58,0.22)] transition active:scale-[0.99] dark:bg-[linear-gradient(135deg,#2563eb,#1d4ed8)]" onClick={onOpenExpense} type="button">
              <Icon name="add" />
              Registrar egreso
            </button>
            <button className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#dfe7db] bg-white px-5 py-3 text-sm font-semibold text-[#183325] transition active:scale-[0.99] dark:border-[#314056] dark:bg-[#182235] dark:text-[#f8fafc]" onClick={onOpenMerchandise} type="button">
              <Icon name="inventory_2" />
              Mercaderia
            </button>
            {isAdmin ? (
              <>
                <button className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#dfe7db] bg-white px-5 py-3 text-sm font-semibold text-[#183325] transition active:scale-[0.99] dark:border-[#314056] dark:bg-[#182235] dark:text-[#f8fafc]" onClick={onOpenCashWithdrawal} type="button">
                  <Icon name="point_of_sale" />
                  Retirar caja
                </button>
                <button className="px-1 py-3 text-sm font-semibold text-[#5b6d61] underline decoration-[#dfe7db] underline-offset-4 transition active:text-[#183325] dark:text-[#c7d2e0] dark:decoration-[#314056] dark:active:text-white" onClick={onOpenWallet} type="button">
                  Ajustar saldo
                </button>
              </>
            ) : null}
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        {stats.map((stat, index) => (
          <StatCard key={stat.label} accent={index === 1 ? "orange" : "green"} detail={stat.detail} label={stat.label} value={stat.value} />
        ))}
      </div>

      <SectionBlock title="Movimientos de egresos">
        <button
          className="flex w-full items-center justify-between gap-4 rounded-xl border border-[#dfe7db] bg-white px-5 py-4 text-left transition hover:border-[#1f7a3a] dark:border-white/10 dark:bg-white/[0.03]"
          onClick={() => setShowExpenseMovements((current) => !current)}
          type="button"
        >
          <span>
            <span className="block text-sm font-semibold text-[#183325] dark:text-white">Ver movimientos de egresos</span>
            <span className="mt-1 block text-sm text-[#5b6d61] dark:text-white/65">{orderedExpenses.length} egreso(s) registrados</span>
          </span>
          <Icon className="text-[#1f7a3a]" name={showExpenseMovements ? "keyboard_arrow_up" : "keyboard_arrow_down"} />
        </button>

        {showExpenseMovements ? (
          latestExpenses.length ? (
            <div className="mt-4 space-y-4">
              <div className="space-y-3">
              {latestExpenses.map((expense) => (
                <button key={expense.id} className="flex w-full flex-col gap-3 rounded-lg border border-[#e4ece2] px-4 py-4 text-left transition hover:border-[#1f7a3a] dark:border-white/10 dark:hover:border-[#2fa84f] md:flex-row md:items-center md:justify-between" onClick={() => setSelectedExpenseId(expense.id)} type="button">
                  <div className="min-w-0">
                    <strong className="block text-sm font-semibold text-[#183325] dark:text-white">{expense.descripcion}</strong>
                    <p className="mt-1 text-sm text-[#5b6d61] dark:text-white/68">
                      {expense.categoria}
                      {expense.userName ? ` • ${expense.userName}` : ""}
                    </p>
                  </div>
                  <div className="shrink-0 text-left md:text-right">
                    <strong className="block text-sm font-semibold text-[#c2410c]">{money(expense.monto)}</strong>
                    <span className="mt-1 block text-sm text-[#5b6d61] dark:text-white/65">
                      {new Intl.DateTimeFormat("es-EC", { dateStyle: "medium", timeStyle: "short" }).format(new Date(expense.createdAt))}
                    </span>
                  </div>
                </button>
              ))}
              </div>

            <Pagination
              currentPage={safeCurrentPage}
              itemLabel="egresos"
              onPageChange={setCurrentPage}
              pageSize={EXPENSES_PER_PAGE}
              totalItems={orderedExpenses.length}
              totalPages={totalPages}
            />
            </div>
          ) : (
            <p className="mt-4 text-sm text-[#5b6d61] dark:text-white/65">Todavia no hay egresos registrados.</p>
          )
        ) : null}
      </SectionBlock>

      <ExpenseDetailsModal
        expense={selectedExpense}
        formatDate={formatDate}
        money={money}
        onClose={() => setSelectedExpenseId(null)}
        open={Boolean(selectedExpense)}
      />
    </div>
  );
}
