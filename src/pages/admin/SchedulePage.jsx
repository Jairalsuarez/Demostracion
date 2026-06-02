import { useMemo, useState } from "react";
import EmptyState from "../../components/ui/EmptyState";
import Icon from "../../components/ui/Icon";
import PageHeader from "../../components/ui/PageHeader";
import SectionBlock from "../../components/ui/SectionBlock";

const SHIFT_TIMES = {
  Manana: { label: "Manana", inicio: "08:00", fin: "13:30" },
  Tarde: { label: "Tarde", inicio: "13:30", fin: "17:00" },
  Noche: { label: "Noche", inicio: "17:00", fin: "22:00" },
};

const sellerName = (seller = {}) => [seller.nombre, seller.apellido].filter(Boolean).join(" ").trim() || seller.nombre || "Sin nombre";

const normalizeShiftKey = (turno = "") => {
  const value = String(turno).toLowerCase();
  if (value.includes("tarde")) return "Tarde";
  if (value.includes("noche")) return "Noche";
  return "Manana";
};

const formatEcShortDate = (value) => {
  if (!value) return "";
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat("es-EC", {
    timeZone: "America/Guayaquil",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(parsed);
};

export default function SchedulePage({
  createSchedule,
  deleteSchedule,
  scheduleForm,
  setScheduleForm,
  upcomingSchedules,
  updateScheduleStatus,
  users = [],
}) {
  const [sellerOpen, setSellerOpen] = useState(false);
  const [turnoOpen, setTurnoOpen] = useState(false);
  const sellers = useMemo(() => users.filter((item) => item.role === "vendedor"), [users]);
  const currentShiftKey = normalizeShiftKey(scheduleForm.turno);
  const selectedShift = SHIFT_TIMES[currentShiftKey] || SHIFT_TIMES.Manana;
  const formStart = scheduleForm.inicio || selectedShift.inicio;
  const formEnd = scheduleForm.fin || selectedShift.fin;

  const availableSellers = useMemo(() => {
    if (!scheduleForm.fecha || !formStart || !formEnd) return sellers;

    return sellers.filter((seller) => {
      const name = sellerName(seller);
      const hasConflict = upcomingSchedules.some(
        (item) =>
          item.estado === "programado" &&
          item.fecha === scheduleForm.fecha &&
          item.responsable === name &&
          formStart < item.fin &&
          formEnd > item.inicio
      );
      return !hasConflict || scheduleForm.responsableId === seller.id;
    });
  }, [formEnd, formStart, scheduleForm.fecha, scheduleForm.responsableId, sellers, upcomingSchedules]);

  const handleSellerSelect = (sellerId) => {
    const selectedSeller = sellers.find((item) => item.id === sellerId);
    setScheduleForm((current) => ({
      ...current,
      responsableId: selectedSeller?.id || "",
      responsable: selectedSeller ? sellerName(selectedSeller) : "",
    }));
    setSellerOpen(false);
  };

  const handleShiftSelect = (turno) => {
    const hours = SHIFT_TIMES[turno] || SHIFT_TIMES.Manana;
    setScheduleForm((current) => ({ ...current, turno, inicio: hours.inicio, fin: hours.fin }));
    setTurnoOpen(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Agenda" title="Turnos y plan semanal" />

      <SectionBlock title="Nuevo turno">
        <div className="space-y-5">
          <div className="rounded-3xl border border-[#e4ece2] bg-white p-4 shadow-[0_18px_50px_rgba(24,51,37,0.08)] dark:border-[#23314d] dark:bg-[#182235]">
            <div className="grid gap-4 xl:grid-cols-[1fr_1fr_320px]">
              <label className="grid gap-2 text-sm">
                <span className="font-semibold text-[#183325] dark:text-[#f8fafc]">Fecha</span>
                <input
                  className="min-h-[64px] cursor-pointer rounded-2xl border border-[#dfe7db] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#1f7a3a] focus:ring-4 focus:ring-[#1f7a3a]/10 dark:border-[#314056] dark:bg-[#0f172a] dark:text-[#f8fafc] dark:focus:border-[#60a5fa] dark:focus:ring-[#60a5fa]/10 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:scale-125 [&::-webkit-calendar-picker-indicator]:opacity-90"
                  onChange={(event) => setScheduleForm((current) => ({ ...current, fecha: event.target.value }))}
                  type="date"
                  value={scheduleForm.fecha}
                />
              </label>

              <label className="grid gap-2 text-sm">
                <span className="font-semibold text-[#183325] dark:text-[#f8fafc]">Vendedor</span>
                <div className="relative">
                  <button
                    className="flex min-h-[64px] w-full cursor-pointer items-center justify-between rounded-2xl border border-[#dfe7db] bg-white px-4 py-3 text-left text-sm outline-none transition hover:border-[#1f7a3a] focus:border-[#1f7a3a] focus:ring-4 focus:ring-[#1f7a3a]/10 dark:border-[#314056] dark:bg-[#0f172a] dark:text-[#f8fafc] dark:hover:border-[#60a5fa] dark:focus:border-[#60a5fa] dark:focus:ring-[#60a5fa]/10"
                    onClick={() => setSellerOpen((current) => !current)}
                    type="button"
                  >
                    <span className="block font-semibold text-[#183325] dark:text-[#f8fafc]">
                      {scheduleForm.responsable || "Selecciona un vendedor"}
                    </span>
                    <Icon className="text-[#1f7a3a] dark:text-[#60a5fa]" name={sellerOpen ? "keyboard_arrow_up" : "keyboard_arrow_down"} />
                  </button>

                  {sellerOpen ? (
                    <div className="absolute left-0 top-[calc(100%+10px)] z-20 w-full rounded-2xl border border-[#dfe7db] bg-white p-2 shadow-[0_22px_45px_rgba(15,23,42,0.12)] dark:border-[#314056] dark:bg-[#0f172a]">
                      <button
                        className={`mb-2 flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-3 text-left transition ${
                          !scheduleForm.responsableId
                            ? "bg-[#1f7a3a] text-white dark:bg-[#2563eb]"
                            : "bg-white text-[#183325] hover:bg-[#f7faf6] dark:bg-[#0f172a] dark:text-[#f8fafc] dark:hover:bg-[#182235]"
                        }`}
                        onClick={() => handleSellerSelect("")}
                        type="button"
                      >
                        <span className="block font-semibold">Selecciona un vendedor</span>
                        {!scheduleForm.responsableId ? <Icon name="check" /> : null}
                      </button>

                      {availableSellers.map((seller) => {
                        const selected = scheduleForm.responsableId === seller.id;
                        return (
                          <button
                            className={`mb-2 flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-3 text-left transition last:mb-0 ${
                              selected
                                ? "bg-[#1f7a3a] text-white dark:bg-[#2563eb]"
                                : "bg-white text-[#183325] hover:bg-[#f7faf6] dark:bg-[#0f172a] dark:text-[#f8fafc] dark:hover:bg-[#182235]"
                            }`}
                            key={seller.id}
                            onClick={() => handleSellerSelect(seller.id)}
                            type="button"
                          >
                            <span className="block font-semibold">{sellerName(seller)}</span>
                            {selected ? <Icon name="check" /> : null}
                          </button>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
                {!availableSellers.length ? <span className="text-xs text-[#c2410c]">No hay vendedores disponibles para ese turno.</span> : null}
              </label>

              <div className="grid gap-2 text-sm">
                <span className="font-semibold text-[#183325] dark:text-[#f8fafc]">Turno</span>
                <div className="relative">
                  <button
                    className="flex min-h-[64px] w-full cursor-pointer items-center justify-between rounded-2xl border border-[#dfe7db] bg-white px-4 py-3 text-left text-sm transition hover:border-[#1f7a3a] dark:border-[#314056] dark:bg-[#0f172a] dark:text-[#f8fafc] dark:hover:border-[#60a5fa]"
                    onClick={() => setTurnoOpen((current) => !current)}
                    type="button"
                  >
                    <span>
                      <span className="block font-semibold text-[#183325] dark:text-[#f8fafc]">{selectedShift.label}</span>
                      <span className="block text-xs text-[#5b6d61] dark:text-[#94a3b8]">
                        {selectedShift.inicio} - {selectedShift.fin}
                      </span>
                    </span>
                    <Icon className="text-[#1f7a3a] dark:text-[#60a5fa]" name={turnoOpen ? "keyboard_arrow_up" : "keyboard_arrow_down"} />
                  </button>

                  {turnoOpen ? (
                    <div className="absolute left-0 top-[calc(100%+10px)] z-20 w-full rounded-2xl border border-[#dfe7db] bg-white p-2 shadow-[0_22px_45px_rgba(15,23,42,0.12)] dark:border-[#314056] dark:bg-[#0f172a]">
                      {Object.values(SHIFT_TIMES).map((shift) => {
                        const selected = currentShiftKey === shift.label;
                        return (
                          <button
                            className={`mb-2 flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-3 text-left transition last:mb-0 ${
                              selected
                                ? "bg-[#1f7a3a] text-white dark:bg-[#2563eb]"
                                : "bg-white text-[#183325] hover:bg-[#f7faf6] dark:bg-[#0f172a] dark:text-[#f8fafc] dark:hover:bg-[#182235]"
                            }`}
                            key={shift.label}
                            onClick={() => handleShiftSelect(shift.label)}
                            type="button"
                          >
                            <span>
                              <span className="block font-semibold">{shift.label}</span>
                              <span className={`block text-xs ${selected ? "text-white/80" : "text-[#5b6d61] dark:text-[#94a3b8]"}`}>
                                {shift.inicio} - {shift.fin}
                              </span>
                            </span>
                            {selected ? <Icon name="check" /> : null}
                          </button>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="mt-4 grid gap-3">
              <label className="grid gap-2 text-sm">
                <span className="font-semibold text-[#183325] dark:text-[#f8fafc]">Notas opcionales</span>
                <input
                  className="h-12 rounded-2xl border border-[#dfe7db] bg-white px-4 text-sm outline-none transition focus:border-[#1f7a3a] focus:ring-4 focus:ring-[#1f7a3a]/10 dark:border-[#314056] dark:bg-[#0f172a] dark:text-[#f8fafc] dark:focus:border-[#60a5fa] dark:focus:ring-[#60a5fa]/10"
                  onChange={(event) => setScheduleForm((current) => ({ ...current, notas: event.target.value }))}
                  placeholder="Ejemplo: cubrir caja, revisar inventario o apoyar cierre."
                  value={scheduleForm.notas}
                />
              </label>

              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#edf3ec] bg-[#fbfdfb] px-4 py-3 dark:border-[#2b3a55] dark:bg-[#0f172a]">
                <div className="text-sm">
                  <p className="font-semibold text-[#183325] dark:text-[#f8fafc]">{selectedShift.label}</p>
                  <p className="text-[#5b6d61] dark:text-[#94a3b8]">
                    Horario automatico: {selectedShift.inicio} - {selectedShift.fin}
                  </p>
                </div>
                <button
                  className="cursor-pointer rounded-xl bg-[#1f7a3a] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#1f7a3a]/20 transition hover:bg-[#17642f] dark:bg-[linear-gradient(135deg,#2563eb,#1d4ed8)] dark:shadow-[0_16px_30px_rgba(37,99,235,0.24)]"
                  onClick={createSchedule}
                  type="button"
                >
                  Guardar turno
                </button>
              </div>
            </div>
          </div>
        </div>
      </SectionBlock>

      <SectionBlock title="Agenda programada">
        {upcomingSchedules.length ? (
          <div className="space-y-3">
            {upcomingSchedules.map((item) => (
              <article key={item.id} className="flex flex-col gap-4 rounded-lg border border-[#e4ece2] p-4 dark:border-[#23314d] dark:bg-[#182235] lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <strong className="block text-sm font-semibold text-[#183325] dark:text-[#f8fafc]">{item.responsable}</strong>
                  <p className="mt-1 text-sm text-[#5b6d61] dark:text-[#c7d2e0]">
                    {formatEcShortDate(item.fecha)} - {item.inicio} a {item.fin} - {item.turno}
                  </p>
                  {item.notas ? <p className="mt-1 text-sm text-[#5b6d61] dark:text-[#94a3b8]">{item.notas}</p> : null}
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-[#f4f8ef] px-3 py-2 text-xs font-semibold text-[#56705d] dark:bg-[#0f172a] dark:text-[#93c5fd]">{item.estado}</span>
                  <button className="cursor-pointer rounded-md border border-[#dfe7db] px-3 py-2 text-sm dark:border-[#314056] dark:text-[#f8fafc]" onClick={() => updateScheduleStatus(item.id, "completado")} type="button">
                    Completar
                  </button>
                  <button className="cursor-pointer rounded-md border border-[#dfe7db] px-3 py-2 text-sm dark:border-[#314056] dark:text-[#f8fafc]" onClick={() => updateScheduleStatus(item.id, "cancelado")} type="button">
                    Cancelar
                  </button>
                  <button className="cursor-pointer rounded-md border border-[#f7c2bf] px-3 py-2 text-sm text-[#c2410c] dark:border-[#4b5563] dark:bg-[#111827] dark:text-[#fca5a5]" onClick={() => deleteSchedule(item.id)} type="button">
                    Eliminar
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState description="Todavia no hay turnos programados." title="Agenda vacia" />
        )}
      </SectionBlock>
    </div>
  );
}
