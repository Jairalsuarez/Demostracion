const getScheduleHours = (turno = "") => {
  const value = String(turno).toLowerCase();
  if (value.includes("tarde")) return { inicio: "13:30", fin: "17:00", turno: "Tarde" };
  if (value.includes("noche")) return { inicio: "17:00", fin: "22:00", turno: "Noche" };
  return { inicio: "08:00", fin: "13:30", turno: "Manana" };
};

const SCHEDULE_MATCH_TOLERANCE_MINUTES = 45;

const normalizeText = (value = "") =>
  String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase();

const toMinutes = (value = "") => {
  const [hours = "0", minutes = "0"] = String(value || "").split(":");
  return Number(hours) * 60 + Number(minutes);
};

const formatLocalDate = (value) =>
  new Intl.DateTimeFormat("sv-SE", { timeZone: "America/Guayaquil", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(value));

const formatLocalTime = (value) =>
  new Intl.DateTimeFormat("en-GB", { timeZone: "America/Guayaquil", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(value));

const findMatchingSchedule = ({ schedules = [], startedAt, userName }) => {
  const localDate = formatLocalDate(startedAt);
  const startMinutes = toMinutes(formatLocalTime(startedAt));
  const normalizedUserName = normalizeText(userName);
  const matches = schedules
    .filter((schedule) => {
      if (!["programado", "en_progreso"].includes(schedule.estado)) return false;
      if (schedule.fecha !== localDate) return false;
      if (normalizeText(schedule.responsable) !== normalizedUserName) return false;
      const scheduleStart = toMinutes(schedule.inicio);
      const scheduleEnd = toMinutes(schedule.fin);
      return startMinutes >= scheduleStart - SCHEDULE_MATCH_TOLERANCE_MINUTES && startMinutes <= scheduleEnd;
    })
    .sort((a, b) => Math.abs(toMinutes(a.inicio) - startMinutes) - Math.abs(toMinutes(b.inicio) - startMinutes));
  return matches[0] || null;
};

const completedScheduledShift = ({ closedAt, matchedSchedule, startedAt }) => {
  if (!matchedSchedule) return false;
  const realStartMinutes = toMinutes(formatLocalTime(startedAt));
  const realEndMinutes = toMinutes(formatLocalTime(closedAt));
  const scheduledStartMinutes = toMinutes(matchedSchedule.inicio);
  const scheduledEndMinutes = toMinutes(matchedSchedule.fin);
  return realStartMinutes <= scheduledStartMinutes + SCHEDULE_MATCH_TOLERANCE_MINUTES && realEndMinutes >= scheduledEndMinutes;
};

export default function useOperationsActions({
  app, session, user, activeShift, shiftCash, cashBox,
  setSaleLines, salePayment, setSalePayment,
  informalSale, setInformalSale, informalSalePayment, setInformalSalePayment,
  salePreview, saleTotal, saleSubmitting, setSaleSubmitting,
  informalSaleSubmitting, setInformalSaleSubmitting,
  setSaleModal, setInformalSaleModal,
  expense, distributors, setExpense, expenseSubmitting, setExpenseSubmitting, setExpenseModal,
  merchandise, setMerchandise, merchandiseLines, setMerchandiseLines,
  merchandiseSubmitting, setMerchandiseSubmitting, setMerchandiseModal,
  walletForm, setWalletForm, setWalletModal,
  cashWithdrawalForm, setCashWithdrawalForm, setCashWithdrawalModal,
  scheduleForm, setScheduleForm, commit, notify, inform, personName, money, shortTime,
  emptyWalletForm, emptyScheduleForm,
}) {
  const isAdminRole = user?.role === "admin";

  const findUserRoleById = (userId) => {
    if (!userId) return null;
    if (userId === user?.id) return user?.role || null;
    return app.users.find((item) => item.id === userId)?.role || null;
  };

  const parseMoneyInput = (value) => {
    const normalized = String(value || "").replace(",", ".").replace(/[^\d.]/g, "");
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const cleanName = (value) => String(value || "").trim();

  const startShift = async () => {
    if (user?.role !== "vendedor") return inform("Los turnos solo aplican para vendedores.", "warning");
    if (activeShift) return inform("Ya tienes un turno abierto.", "warning");
    const openShift = app.turnos.find((turno) => turno.estado === "abierto" && findUserRoleById(turno.userId) === "vendedor");
    if (openShift) return inform(`Ya hay un turno activo de ${openShift.userName}.`, "warning");

    const draftShift = {
      id: crypto.randomUUID(), userId: user.id, userName: personName(user),
      estado: "abierto", saldoInicial: Number(shiftCash || 0), saldoFinal: null,
      totalVentas: 0, startedAt: new Date().toISOString(), closedAt: null,
    };
    commit((current) => ({ ...current, turnos: [draftShift, ...current.turnos] }));

    const matchedSchedule = findMatchingSchedule({
      schedules: app.schedules || [], startedAt: draftShift.startedAt, userName: draftShift.userName,
    });
    if (matchedSchedule) {
      commit((current) => ({
        ...current,
        schedules: (current.schedules || []).map((item) => item.id === matchedSchedule.id ? { ...matchedSchedule, estado: "en_progreso" } : item),
      }));
    }
    notify(`${personName(user)} inicio un turno.`, personName(user), "success");
    inform(`Inicio de turno registrado a las ${shortTime(draftShift.startedAt)}.`, "success");
  };

  const closeShift = async (targetShift = activeShift) => {
    if (!targetShift) return;
    const targetRole = findUserRoleById(targetShift.userId);
    const isOwnShift = targetShift.userId === user?.id;
    const isAdminClosing = isAdminRole;
    if (!isAdminClosing && !isOwnShift) return inform("Solo puedes cerrar tu propio turno.", "warning");
    if (targetRole !== "vendedor") return inform("Solo se pueden cerrar turnos de vendedores.", "warning");
    if (!isAdminClosing) {
      const startedAt = new Date(targetShift.startedAt).getTime();
      if (Date.now() < startedAt + 5 * 60 * 60 * 1000) return inform("Debes esperar 5 horas.", "warning");
    }
    const total = app.sales.filter((sale) => sale.shiftId === targetShift.id).reduce((acc, item) => acc + item.total, 0);
    const closedShift = { ...targetShift, estado: "cerrado", saldoFinal: targetShift.saldoInicial + total, totalVentas: total, closedAt: new Date().toISOString() };
    commit((current) => ({ ...current, turnos: current.turnos.map((turno) => turno.id === targetShift.id ? closedShift : turno) }));

    const matchedSchedule = findMatchingSchedule({
      schedules: app.schedules || [], startedAt: targetShift.startedAt, userName: targetShift.userName,
    });
    if (matchedSchedule) {
      const nextStatus = completedScheduledShift({ closedAt: closedShift.closedAt, matchedSchedule, startedAt: targetShift.startedAt }) ? "completado" : "en_progreso";
      commit((current) => ({
        ...current,
        schedules: (current.schedules || []).map((item) => item.id === matchedSchedule.id ? { ...matchedSchedule, estado: nextStatus } : item),
      }));
    }
    notify(isAdminClosing ? `${personName(user)} cerro el turno de ${targetShift.userName}.` : `${personName(user)} cerro su turno.`, personName(user));
    inform(`Cierre de turno registrado a las ${shortTime(closedShift.closedAt)}.`, "success");
  };

  const createSale = async () => {
    if (saleSubmitting) return false;
    if (user?.role === "vendedor" && !activeShift) return inform("Debes iniciar un turno.", "warning");
    if (!salePreview.length || salePreview.some((line) => !line.cantidad)) return inform("Agrega productos validos.", "warning");
    if (!salePayment.method) return inform("Selecciona un metodo de pago.", "warning");
    if (["transferencia_directa", "deuna"].includes(salePayment.method) && !salePayment.evidenceUrl) return inform("Debes subir la evidencia.", "warning");
    const bad = salePreview.find((line) => (app.products.find((product) => product.id === line.productId)?.stock || 0) < line.cantidad);
    if (bad) return inform(`Sin stock suficiente para ${bad.nombre}.`, "warning");
    setSaleSubmitting(true);

    const sale = {
      id: crypto.randomUUID(), shiftId: activeShift?.id || null, userId: user.id, userName: personName(user),
      items: salePreview, total: saleTotal, paymentMethod: salePayment.method,
      paymentEvidenceUrl: salePayment.evidenceUrl || "", paymentEvidenceName: salePayment.evidenceName || "",
      createdAt: new Date().toISOString(),
    };
    const isCashSale = salePayment.method === "efectivo";
    const nextCashBox = isCashSale ? { saldoActual: Number(cashBox?.saldoActual || 0) + saleTotal, updatedAt: new Date().toISOString() } : cashBox;
    const nextWallet = !isCashSale ? { saldoActual: Number(app.wallet?.saldoActual || 0) + saleTotal, updatedAt: new Date().toISOString() } : app.wallet;
    const nextShift = activeShift ? { ...activeShift, totalVentas: activeShift.totalVentas + saleTotal } : null;
    commit((current) => ({
      ...current, sales: [sale, ...current.sales], cashBox: nextCashBox, wallet: nextWallet,
      products: current.products.map((product) => {
        const line = salePreview.find((item) => item.productId === product.id);
        return line ? { ...product, stock: Math.max(Number(product.stock || 0) - line.cantidad, 0) } : product;
      }),
      turnos: nextShift ? current.turnos.map((turno) => turno.id === activeShift.id ? nextShift : turno) : current.turnos,
    }));
    notify(`${personName(user)} registro una venta por ${money(saleTotal)}.`, personName(user), "success");
    setSaleLines([{ productId: "", cantidad: 1 }]);
    setSalePayment({ method: "efectivo", evidenceUrl: "", evidenceName: "" });
    setSaleModal(false);
    inform("Venta registrada con exito.", "success");
    setSaleSubmitting(false);
    return true;
  };

  const createInformalSale = async () => {
    if (informalSaleSubmitting) return false;
    if (user?.role === "vendedor" && !activeShift) return inform("Debes iniciar un turno.", "warning");
    const total = parseMoneyInput(informalSale.totalInput || informalSale.total);
    const description = String(informalSale.description || "").trim();
    if (total <= 0) return inform("Ingresa un valor valido.", "warning");
    if (!description) return inform("Escribe una descripcion.", "warning");
    if (!informalSalePayment.method) return inform("Selecciona un metodo de pago.", "warning");
    if (["transferencia_directa", "deuna"].includes(informalSalePayment.method) && !informalSalePayment.evidenceUrl) return inform("Debes subir la evidencia.", "warning");
    setInformalSaleSubmitting(true);

    const sale = {
      id: crypto.randomUUID(), shiftId: activeShift?.id && activeShift.id !== "" ? activeShift.id : null,
      userId: user.id, userName: personName(user), items: [], total, description, informal: true,
      paymentMethod: informalSalePayment.method, paymentEvidenceUrl: informalSalePayment.evidenceUrl || "",
      paymentEvidenceName: informalSalePayment.evidenceName || "", createdAt: new Date().toISOString(),
    };
    const isCashSale = informalSalePayment.method === "efectivo";
    const nextCashBox = isCashSale ? { saldoActual: Number(cashBox?.saldoActual || 0) + total, updatedAt: new Date().toISOString() } : cashBox;
    const nextWallet = !isCashSale ? { saldoActual: Number(app.wallet?.saldoActual || 0) + total, updatedAt: new Date().toISOString() } : app.wallet;
    const nextShift = activeShift ? { ...activeShift, totalVentas: activeShift.totalVentas + total } : null;
    commit((current) => ({
      ...current, sales: [sale, ...current.sales], cashBox: nextCashBox, wallet: nextWallet,
      turnos: nextShift ? current.turnos.map((turno) => turno.id === activeShift.id ? nextShift : turno) : current.turnos,
    }));
    notify(`${personName(user)} registro una venta informal por ${money(total)}.`, personName(user), "success");
    setInformalSale({ total: 0, totalInput: "", description: "" });
    setInformalSalePayment({ method: "efectivo", evidenceUrl: "", evidenceName: "" });
    setInformalSaleModal(false);
    inform("Venta informal registrada con exito.", "success");
    setInformalSaleSubmitting(false);
    return true;
  };

  const resetExpenseForm = () =>
    setExpense((current) => ({
      ...current, categoria: "Egreso", categoryId: "", categoryName: "Egreso",
      descripcion: "", detalleOferta: "", distributorId: "", distributorName: "",
      evidenceUrl: "", evidencePreviewUrl: "", evidenceName: "", cantidad: 1, unitCost: 0,
      monto: 0, montoInput: "", fundingSource: "", confirmationAccepted: false,
    }));

  const createExpense = async () => {
    if (expenseSubmitting) return false;
    const amount = parseMoneyInput(expense.montoInput || expense.monto);
    const description = cleanName(expense.descripcion);
    const fundingSource = expense.fundingSource === "cash" ? "cash" : expense.fundingSource === "wallet" ? "wallet" : "";
    if (!user || amount <= 0 || !description) return inform("Completa los datos del egreso.", "warning");
    if (!fundingSource) return inform("Selecciona el origen del egreso.", "warning");
    if (fundingSource === "cash" && amount > Number(cashBox?.saldoActual || 0)) return inform("No hay suficiente en caja.", "warning");
    if (fundingSource === "wallet" && amount > Number(app.wallet?.saldoActual || 0)) return inform("No hay suficiente saldo general.", "warning");
    setExpenseSubmitting(true);

    const draft = {
      id: crypto.randomUUID(), categoria: "Egreso", categoryId: null, categoryName: "Egreso",
      descripcion: description, detalleOferta: description, distributorId: null, distributorName: "",
      evidenceUrl: "", evidencePreviewUrl: "", evidenceName: "", cantidad: 1, unitCost: amount,
      confirmationAccepted: true, monto: amount, fundingSource, userId: user.id, userName: personName(user),
      createdAt: new Date().toISOString(),
    };
    const nextWallet = fundingSource === "wallet" ? { saldoActual: Number(app.wallet?.saldoActual || 0) - amount, updatedAt: new Date().toISOString() } : app.wallet;
    const nextCashBox = fundingSource === "cash" ? { saldoActual: Number(cashBox?.saldoActual || 0) - amount, updatedAt: new Date().toISOString() } : cashBox;
    commit((current) => ({ ...current, expenses: [draft, ...current.expenses], wallet: nextWallet, cashBox: nextCashBox }));
    notify(`${personName(user)} registro un egreso de ${money(amount)}.`, personName(user), "warning");
    resetExpenseForm();
    setExpenseModal(false);
    inform("Egreso registrado con exito.", "success");
    setExpenseSubmitting(false);
    return true;
  };

  const createMerchandiseExpense = async () => {
    if (merchandiseSubmitting) return false;
    const amount = parseMoneyInput(merchandise.amountInput || merchandise.amount);
    const distributorName = merchandise.isNewDistributor ? cleanName(merchandise.newDistributorName) : cleanName(merchandise.distributorName);
    const selectedLines = (merchandiseLines || []).map((line) => {
      const product = app.products.find((item) => item.id === line.productId);
      const quantity = Number(line.cantidad || 0);
      return product && quantity > 0 ? { productId: product.id, nombre: product.nombre, precio: product.precio, cantidad: quantity, subtotal: 0 } : null;
    }).filter(Boolean);
    if (!user || !distributorName || amount <= 0 || !selectedLines.length) return inform("Completa todos los campos.", "warning");
    setMerchandiseSubmitting(true);

    let nextDistributor = (distributors || []).find((item) =>
      merchandise.isNewDistributor ? cleanName(item?.nombre).toLowerCase() === distributorName.toLowerCase() : item.id === merchandise.distributorId
    ) || null;
    if (!nextDistributor && merchandise.isNewDistributor) {
      nextDistributor = { id: crypto.randomUUID(), nombre: distributorName, telefono: "", notas: "", createdAt: new Date().toISOString() };
    }

    const lineSummary = selectedLines.map((line) => `${line.nombre} x ${line.cantidad}`).join(", ");
    const draftExpense = {
      id: crypto.randomUUID(), categoria: "Mercaderia", categoryId: null, categoryName: "Mercaderia",
      descripcion: `Mercaderia - ${distributorName}`, detalleOferta: lineSummary,
      distributorId: nextDistributor?.id || merchandise.distributorId || null, distributorName,
      evidenceUrl: "", evidencePreviewUrl: "", evidenceName: "",
      cantidad: selectedLines.reduce((acc, line) => acc + line.cantidad, 0), unitCost: amount,
      confirmationAccepted: true, monto: amount, userId: user.id, userName: personName(user),
      createdAt: new Date().toISOString(),
    };
    const nextWallet = { saldoActual: app.wallet.saldoActual - amount, updatedAt: new Date().toISOString() };
    const nextProducts = app.products.map((product) => {
      const line = selectedLines.find((item) => item.productId === product.id);
      return line ? { ...product, stock: Number(product.stock || 0) + line.cantidad, updatedAt: new Date().toISOString() } : product;
    });
    commit((current) => ({
      ...current,
      distributors: nextDistributor && !(current.distributors || []).some((item) => item.id === nextDistributor.id)
        ? [nextDistributor, ...(current.distributors || [])] : current.distributors || [],
      expenses: [draftExpense, ...current.expenses], wallet: nextWallet,
      products: current.products.map((product) => nextProducts.find((item) => item.id === product.id) || product),
    }));
    notify(`${personName(user)} registro mercaderia por ${money(amount)}.`, personName(user), "warning");
    setMerchandise({ distributorId: "", distributorName: "", isNewDistributor: false, newDistributorName: "", location: "deposito", amount: 0, amountInput: "" });
    setMerchandiseLines([{ productId: "", cantidad: 1 }]);
    setMerchandiseModal(false);
    inform("Mercaderia registrada con exito.", "success");
    setMerchandiseSubmitting(false);
    return true;
  };

  const adjustWallet = async () => {
    if (!isAdminRole) return inform("Solo administracion puede cambiar el saldo.", "warning");
    const nextBalance = Number(walletForm.saldo || 0);
    const reason = walletForm.motivo.trim();
    const password = String(walletForm.password || "").trim();
    if (!Number.isFinite(nextBalance) || !reason) return inform("Indica el saldo y un motivo.", "warning");
    if (!password) return inform("Ingresa tu contrasena.", "warning");
    if (!walletForm.confirmationAccepted) return inform("Confirma el ajuste.", "warning");
    const localAdmin = app.users.find((item) => item.id === user?.id);
    if (!localAdmin || localAdmin.password !== password) return inform("Contrasena incorrecta.", "error");

    const draftWallet = { saldoActual: nextBalance, updatedAt: new Date().toISOString() };
    commit((current) => ({ ...current, wallet: draftWallet }));
    notify(`${personName(user)} ajusto el saldo general a ${money(draftWallet.saldoActual)}.`, personName(user));
    setWalletModal(false);
    setWalletForm({ ...emptyWalletForm, saldo: draftWallet.saldoActual, password: "", confirmationAccepted: false });
    inform("Saldo general actualizado.", "success");
  };

  const withdrawCashToWallet = async () => {
    if (!isAdminRole) return inform("Solo administracion puede retirar caja.", "warning");
    const amount = parseMoneyInput(cashWithdrawalForm.amountInput || cashWithdrawalForm.amount);
    const reason = cleanName(cashWithdrawalForm.motivo);
    if (amount <= 0 || !reason) return inform("Indica el monto y motivo.", "warning");
    if (amount > Number(cashBox?.saldoActual || 0)) return inform("No suficiente en caja.", "warning");
    const nextCashBox = { saldoActual: Number(cashBox?.saldoActual || 0) - amount, updatedAt: new Date().toISOString() };
    const nextWallet = { saldoActual: Number(app.wallet?.saldoActual || 0) + amount, updatedAt: new Date().toISOString() };
    commit((current) => ({ ...current, cashBox: nextCashBox, wallet: nextWallet }));
    notify(`${personName(user)} retiro ${money(amount)} de caja hacia saldo general.`, personName(user));
    setCashWithdrawalForm({ amount: 0, amountInput: "", motivo: "" });
    setCashWithdrawalModal(false);
    inform("Retiro de caja registrado.", "success");
    return true;
  };

  const createSchedule = async () => {
    if (!isAdminRole) return inform("Solo administracion puede programar agenda.", "warning");
    const scheduleHours = getScheduleHours(scheduleForm.turno);
    if (!scheduleForm.fecha || !scheduleForm.responsable.trim()) return inform("Completa fecha y responsable.", "warning");
    const schedule = {
      id: crypto.randomUUID(), ...scheduleForm, turno: scheduleHours.turno, inicio: scheduleHours.inicio,
      fin: scheduleHours.fin, responsable: scheduleForm.responsable.trim(), notas: scheduleForm.notas.trim(),
      estado: "programado", createdAt: new Date().toISOString(),
    };
    commit((current) => ({ ...current, schedules: [schedule, ...(current.schedules || [])] }));
    const assignedSeller = (app.users || []).find((item) => item.id === scheduleForm.responsableId);
    if (assignedSeller) {
      const notification = {
        id: crypto.randomUUID(), message: `Turno programado el ${schedule.fecha} de ${schedule.inicio} a ${schedule.fin}.`,
        type: "agenda", actorId: assignedSeller.id, actorName: personName(assignedSeller), read: false,
        createdAt: new Date().toISOString(),
      };
      commit((current) => ({ ...current, notifications: [notification, ...(current.notifications || [])].slice(0, 60) }));
    }
    notify(`${personName(user)} programo un turno para ${schedule.responsable} el ${schedule.fecha}.`, personName(user));
    setScheduleForm(emptyScheduleForm);
    inform("Turno agendado correctamente.", "success");
  };

  const updateScheduleStatus = async (id, estado) => {
    if (!isAdminRole) return inform("Solo administracion puede cambiar estados.", "warning");
    const target = (app.schedules || []).find((item) => item.id === id);
    if (!target) return;
    commit((current) => ({
      ...current,
      schedules: (current.schedules || []).map((item) => item.id === id ? { ...target, estado } : item),
    }));
    notify(`${personName(user)} marco la agenda de ${target.responsable} como ${estado}.`, personName(user));
    inform("Agenda actualizada.", "success");
  };

  const deleteSchedule = async (id) => {
    if (!isAdminRole) return inform("Solo administracion puede eliminar turnos.", "warning");
    const target = (app.schedules || []).find((item) => item.id === id);
    if (!target) return;
    commit((current) => ({ ...current, schedules: (current.schedules || []).filter((item) => item.id !== id) }));
    notify(`${personName(user)} elimino el turno de ${target.responsable}.`, personName(user), "warning");
    inform("Turno eliminado.", "success");
  };

  return { startShift, closeShift, createSale, createInformalSale, createExpense, createMerchandiseExpense, adjustWallet, withdrawCashToWallet, createSchedule, updateScheduleStatus, deleteSchedule };
}
