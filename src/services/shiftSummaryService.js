import { cleanTurnoLabel } from "./normalizers.js";

const SCHEDULE_MATCH_TOLERANCE_MINUTES = 45;

const normalizeText = (value = "") =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();

const toMinutes = (value = "") => {
  const [hours = "0", minutes = "0"] = String(value || "").split(":");
  return Number(hours) * 60 + Number(minutes);
};

const formatLocalDate = (value) =>
  new Intl.DateTimeFormat("sv-SE", {
    timeZone: "America/Guayaquil",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));

const formatLocalTime = (value) =>
  new Intl.DateTimeFormat("en-GB", {
    timeZone: "America/Guayaquil",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));

export function formatShiftLongDate(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat("es-EC", {
    timeZone: "America/Guayaquil",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

export function inferShiftTurno(shift, schedules = []) {
  if (!shift?.startedAt) return "Turno";

  const localDate = formatLocalDate(shift.startedAt);
  const startMinutes = toMinutes(formatLocalTime(shift.startedAt));
  const normalizedUserName = normalizeText(shift.userName);

  const matchedSchedule = [...(schedules || [])]
    .filter((schedule) => {
      if (schedule.fecha !== localDate) return false;
      if (normalizeText(schedule.responsable) !== normalizedUserName) return false;
      const scheduleStart = toMinutes(schedule.inicio);
      const scheduleEnd = toMinutes(schedule.fin);
      return startMinutes >= scheduleStart - SCHEDULE_MATCH_TOLERANCE_MINUTES && startMinutes <= scheduleEnd;
    })
    .sort((a, b) => Math.abs(toMinutes(a.inicio) - startMinutes) - Math.abs(toMinutes(b.inicio) - startMinutes))[0];

  if (matchedSchedule?.turno) return cleanTurnoLabel(matchedSchedule.turno);

  if (startMinutes < 13 * 60 + 30) return "Mañana";
  if (startMinutes < 17 * 60) return "Tarde";
  return "Noche";
}

export function buildShiftSummary({ shift, sales = [], schedules = [], money }) {
  if (!shift) return null;

  const shiftSales = (sales || [])
    .filter((sale) => sale.shiftId === shift.id)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  const informalSales = shiftSales.filter((sale) => sale.informal);
  const formalSales = shiftSales.filter((sale) => !sale.informal);
  const totalAmount = shiftSales.reduce((acc, sale) => acc + Number(sale.total || 0), 0);
  const turnoLabel = inferShiftTurno(shift, schedules);
  const dateLabel = formatShiftLongDate(shift.startedAt);

  return {
    shift,
    dateLabel,
    turnoLabel,
    totalSales: shiftSales.length,
    formalSales: formalSales.length,
    informalSales: informalSales.length,
    totalAmount,
    totalAmountLabel: typeof money === "function" ? money(totalAmount) : totalAmount,
    shiftSales,
  };
}
