/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import useAccountActions from "../hooks/useAccountActions.jsx";
import useAuthSession from "../hooks/useAuthSession.jsx";
import useCatalogActions from "../hooks/useCatalogActions.jsx";
import useDashboardMetrics from "../hooks/useDashboardMetrics.jsx";
import useCookieState from "../hooks/useCookieState.jsx";
import useNotificationCenter from "../hooks/useNotificationCenter.jsx";
import useOperationsActions from "../hooks/useOperationsActions.jsx";
import useProductEditor from "../hooks/useProductEditor.jsx";
import useToastQueue from "../hooks/useToastQueue.jsx";
import { getAppData, saveAppData } from "../services/appDataService.js";
import { getSession } from "../services/authService.js";
import { mergeUsers } from "../services/profileService.js";
import { uploadImage } from "../services/storageService.js";

const AppContext = createContext(null);

const LOW_STOCK_LIMIT = 5;
const ADS = [
  { image: "/images/ad%201.jpeg", alt: "Anuncio de Fizzia" },
  { image: "/images/ad%202.jpeg", alt: "Anuncio de Fizzia" },
];
const AD_ACTION_THRESHOLD = 3;
const EMPTY_PRODUCT = {
  nombre: "", categoria: "Bebidas", marca: "", descripcion: "", precio: 0, costo: 0, stock: 0, imagen_url: "", activo: true,
};
const EMPTY_WALLET_FORM = { saldo: 0, motivo: "", confirmationAccepted: false };
const EMPTY_CASH_WITHDRAWAL_FORM = { amount: 0, amountInput: "", motivo: "" };
const EMPTY_EXPENSE = {
  categoria: "Mercaderia", categoryId: "", categoryName: "Mercaderia", isNewCategory: false, newCategoryName: "",
  descripcion: "", detalleOferta: "", distributorId: "", distributorName: "", isNewDistributor: false,
  newDistributorName: "", evidenceUrl: "", evidencePreviewUrl: "", evidenceName: "", cantidad: 1,
  unitCost: 0, monto: 0, montoInput: "", fundingSource: "", confirmationAccepted: false,
};
const EMPTY_SALE_PAYMENT = { method: "efectivo", evidenceUrl: "", evidenceName: "" };
const EMPTY_INFORMAL_SALE = { total: 0, totalInput: "", description: "" };
const EMPTY_MERCHANDISE = {
  distributorId: "", distributorName: "", isNewDistributor: false, newDistributorName: "",
  location: "deposito", amount: 0, amountInput: "",
};
const EMPTY_SCHEDULE_FORM = { fecha: "", inicio: "", fin: "", responsable: "", turno: "Mañana", notas: "" };

const money = (n) => new Intl.NumberFormat("es-EC", { style: "currency", currency: "USD" }).format(Number(n || 0));
const shortTime = (value) => new Intl.DateTimeFormat("es-EC", { timeStyle: "short" }).format(new Date(value));
const formatDate = (value, config = { dateStyle: "medium" }) => new Intl.DateTimeFormat("es-EC", config).format(new Date(value));
const personName = (person = {}) => [person.nombre, person.apellido].filter(Boolean).join(" ").trim() || person.nombre || "Usuario";

export function AppProvider({ children }) {
  const [app, setApp] = useState(() => getAppData());
  const [session, setSession] = useState(() => getSession());
  const [theme, setTheme] = useCookieState("ventas-theme", "light");
  const [selected, setSelected] = useState(null);
  const [saleModal, setSaleModal] = useState(false);
  const [informalSaleModal, setInformalSaleModal] = useState(false);
  const [expenseModal, setExpenseModal] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [merchandiseModal, setMerchandiseModal] = useState(false);
  const [walletModal, setWalletModal] = useState(false);
  const [cashWithdrawalModal, setCashWithdrawalModal] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [skipNextSessionRestore, setSkipNextSessionRestore] = useState(false);
  const [adOverlay, setAdOverlay] = useState(null);
  const [adActionCount, setAdActionCount] = useCookieState("ventas-ad-count", "0");
  const [adShownIndices, setAdShownIndices] = useCookieState("ventas-ad-shown", "[]");
  const [demoPaused, setDemoPaused] = useState(false);
  const [expense, setExpense] = useState(EMPTY_EXPENSE);
  const [walletForm, setWalletForm] = useState(() => ({ ...EMPTY_WALLET_FORM, saldo: getAppData().wallet.saldoActual }));
  const [cashWithdrawalForm, setCashWithdrawalForm] = useState(EMPTY_CASH_WITHDRAWAL_FORM);
  const [shiftCash, setShiftCash] = useState(0);
  const [saleLines, setSaleLines] = useState([{ productId: "", cantidad: 1 }]);
  const [salePayment, setSalePayment] = useState(EMPTY_SALE_PAYMENT);
  const [informalSale, setInformalSale] = useState(EMPTY_INFORMAL_SALE);
  const [informalSalePayment, setInformalSalePayment] = useState(EMPTY_SALE_PAYMENT);
  const [merchandise, setMerchandise] = useState(EMPTY_MERCHANDISE);
  const [merchandiseLines, setMerchandiseLines] = useState([{ productId: "", cantidad: 1 }]);
  const [scheduleForm, setScheduleForm] = useState(EMPTY_SCHEDULE_FORM);
  const [saleSubmitting, setSaleSubmitting] = useState(false);
  const [informalSaleSubmitting, setInformalSaleSubmitting] = useState(false);
  const [expenseSubmitting, setExpenseSubmitting] = useState(false);
  const [merchandiseSubmitting, setMerchandiseSubmitting] = useState(false);
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const { toasts, pushToast, dismissToast } = useToastQueue();
  const { editing, productForm, productModal, setProductForm, setProductModal, resetProductFlow, openCreateProduct, openEditProduct } = useProductEditor(EMPTY_PRODUCT);

  const commit = (updater) => setApp((current) => (typeof updater === "function" ? updater(current) : updater));
  const { notify, markNotificationRead, markAllNotificationsRead, clearAllNotifications } = useNotificationCenter(commit);

  const inform = (message, type = "info", shouldStore = false, action = null) => {
    pushToast(message, type, "", action);
    if (shouldStore) notify(message, personName(user) || "Fizzia", type);
  };
  const { loginLoading, authChecking, setAuthChecking, loginError, loginForm, setLoginForm, handleLogin, logout } = useAuthSession({
    inform, personName, setSession, setSkipNextSessionRestore,
  });

  useEffect(() => { document.documentElement.dataset.theme = theme; }, [theme]);
  useEffect(() => saveAppData(app), [app]);
  useEffect(() => setWalletForm((current) => ({ ...current, saldo: app.wallet.saldoActual })), [app.wallet.saldoActual]);

  const user = useMemo(() => {
    if (!session) return null;
    const localUser = app.users.find((item) => item.id === session.userId);
    if (localUser) {
      return { ...localUser, apellido: localUser.apellido || session.apellido || "", email: localUser.email || session.email, telefono: localUser.telefono || session.telefono || "", avatarUrl: localUser.avatarUrl || session.avatarUrl || "", displayName: personName(localUser) };
    }
    return { id: session.userId, nombre: session.nombre, apellido: session.apellido || "", email: session.email, telefono: session.telefono || "", role: session.role, avatarUrl: session.avatarUrl || "", displayName: session.displayName || personName(session), source: session.mode };
  }, [app.users, session]);

  useEffect(() => {
    if (!session) return;
    if (!syncing) setAuthChecking(false);
  }, [session, syncing, setAuthChecking]);

  const authCheckTimedOut = useRef(false);
  useEffect(() => {
    if (!authChecking) return;
    const timer = setTimeout(() => { authCheckTimedOut.current = true; setAuthChecking(false); }, 8000);
    return () => clearTimeout(timer);
  }, [authChecking, setAuthChecking]);

  const {
    activeShift, lowStock, featuredProduct, upcomingSchedules, visibleProducts,
    salePreview, saleTotal, salesToday, mySalesToday, unreadNotifications, adminStats, sellerStats,
  } = useDashboardMetrics({ app, session, user, saleLines, lowStockLimit: LOW_STOCK_LIMIT, money, formatDate, personName });

  const recentActivity = useMemo(() => {
    const sales = app.sales.slice(0, 4).map((sale) => ({
      id: `sale-${sale.id}`, title: `${sale.userName} registro una venta`,
      subtitle: `${money(sale.total)} • ${formatDate(sale.createdAt, { dateStyle: "medium", timeStyle: "short" })}`, tone: "success",
    }));
    const alerts = lowStock.slice(0, 3).map((product) => ({
      id: `stock-${product.id}`, title: `${product.nombre} necesita reposicion`,
      subtitle: `${product.stock} unidades disponibles`, tone: "warning",
    }));
    return [...sales, ...alerts];
  }, [app.sales, lowStock]);

  useEffect(() => {
    if (user?.role !== "admin" || !lowStock.length) return;
    const existingIds = new Set((app.notifications || []).map((n) => n.id));
    const stockNotifications = lowStock.filter((p) => Number(p.stock) <= LOW_STOCK_LIMIT).map((p) => ({
      id: `low-stock-${p.id}-${p.stock}`, message: `Reponer ${p.nombre}: quedan ${p.stock} unidad(es).`,
      actorName: "Inventario", type: "warning", read: false, createdAt: new Date().toISOString(),
    })).filter((n) => !existingIds.has(n.id));
    if (!stockNotifications.length) return;
    commit((current) => ({ ...current, notifications: [...stockNotifications, ...(current.notifications || [])].slice(0, 60) }));
  }, [app.notifications, lowStock, user?.role]);

  const openSaleFlow = () => {
    if (user?.role === "vendedor" && !activeShift) return inform("Debes iniciar un turno antes de registrar ventas.", "warning");
    setSaleLines([{ productId: "", cantidad: 1 }]);
    setSalePayment(EMPTY_SALE_PAYMENT);
    setSaleModal(true);
  };

  const openInformalSaleFlow = () => {
    if (user?.role === "vendedor" && !activeShift) return inform("Debes iniciar un turno antes de registrar ventas.", "warning");
    setInformalSale(EMPTY_INFORMAL_SALE);
    setInformalSalePayment(EMPTY_SALE_PAYMENT);
    setInformalSaleModal(true);
  };

  const openMerchandiseFlow = ({ asPage = false } = {}) => {
    setMerchandise(EMPTY_MERCHANDISE);
    setMerchandiseLines([{ productId: "", cantidad: 1 }]);
    setMerchandiseModal(!asPage);
  };

  const uploadAsset = async (file, folder = "products") => {
    try {
      setUploading(true);
      setUploadError("");
      const url = await uploadImage(file, folder);
      return url;
    } catch (error) {
      const message = error?.message || "No se pudo subir el archivo.";
      setUploadError(message);
      inform(message, "error");
      return "";
    } finally {
      setUploading(false);
    }
  };

  const uploadProductImage = async (file) => {
    const url = await uploadAsset(file, "products");
    if (url) { setProductForm((current) => ({ ...current, imagen_url: url })); inform("Imagen subida correctamente.", "success"); }
  };
  const uploadSaleEvidence = async (file) => {
    const url = await uploadAsset(file, "sales");
    if (url) { setSalePayment((current) => ({ ...current, evidenceUrl: url, evidenceName: file.name || "evidencia" })); inform("Evidencia subida.", "success"); }
  };
  const uploadInformalSaleEvidence = async (file) => {
    const url = await uploadAsset(file, "sales");
    if (url) { setInformalSalePayment((current) => ({ ...current, evidenceUrl: url, evidenceName: file.name || "evidencia" })); inform("Evidencia subida.", "success"); }
  };
  const uploadExpenseEvidence = async (file) => {
    const previewUrl = URL.createObjectURL(file);
    const url = await uploadAsset(file, "expenses");
    if (url) { setExpense((current) => ({ ...current, evidenceUrl: url, evidencePreviewUrl: previewUrl, evidenceName: file.name || "evidencia" })); inform("Evidencia subida.", "success"); }
  };

  const { saveProduct, removeProduct, setFeaturedProduct } = useCatalogActions({
    app, user, editing, productForm, commit, inform, personName, resetProductFlow,
  });

  const { startShift, closeShift, createSale, createInformalSale, createExpense, createMerchandiseExpense, adjustWallet, withdrawCashToWallet, createSchedule, updateScheduleStatus, deleteSchedule } = useOperationsActions({
    app, session, user, activeShift, shiftCash, cashBox: app.cashBox,
    setSaleLines, salePayment, setSalePayment, informalSale, setInformalSale,
    informalSalePayment, setInformalSalePayment, salePreview, saleTotal,
    saleSubmitting, setSaleSubmitting, informalSaleSubmitting, setInformalSaleSubmitting,
    setSaleModal, setInformalSaleModal,
    expense, distributors: app.distributors || [], setExpense, expenseSubmitting, setExpenseSubmitting, setExpenseModal,
    merchandise, setMerchandise, merchandiseLines, setMerchandiseLines, merchandiseSubmitting, setMerchandiseSubmitting, setMerchandiseModal,
    walletForm, setWalletForm, setWalletModal, cashWithdrawalForm, setCashWithdrawalForm, setCashWithdrawalModal,
    scheduleForm, setScheduleForm, commit, inform, personName, money, shortTime,
    emptyWalletForm: EMPTY_WALLET_FORM, emptyScheduleForm: EMPTY_SCHEDULE_FORM,
  });

  const incrementAdCounter = useCallback(() => {
    if (!session) return;
    const count = parseInt(adActionCount || "0", 10) + 1;
    setAdActionCount(String(count));
    if (count >= AD_ACTION_THRESHOLD && !adOverlay) {
      const shown = (() => { try { return JSON.parse(adShownIndices || "[]"); } catch { return []; } })();
      const nextIdx = ADS.findIndex((_, i) => !shown.includes(i));
      if (nextIdx !== -1) { setAdOverlay(ADS[nextIdx]); setAdShownIndices(JSON.stringify([...shown, nextIdx])); }
      setAdActionCount("0");
    }
  }, [session, adActionCount, adOverlay, adShownIndices, setAdActionCount, setAdShownIndices, setAdOverlay]);

  const guardPaused = (name) => {
    if (demoPaused) { inform(`No puedes realizar ${name} mientras el demo esta pausado.`, "warning"); return true; }
    return false;
  };

  const wrappedCreateSale = useCallback(async (...args) => { if (guardPaused("ventas")) return false; const r = await createSale(...args); if (r) incrementAdCounter(); return r; }, [createSale, incrementAdCounter, demoPaused]);
  const wrappedCreateInformalSale = useCallback(async (...args) => { if (guardPaused("ventas")) return false; const r = await createInformalSale(...args); if (r) incrementAdCounter(); return r; }, [createInformalSale, incrementAdCounter, demoPaused]);
  const wrappedCreateExpense = useCallback(async (...args) => { if (guardPaused("egresos")) return false; const r = await createExpense(...args); if (r) incrementAdCounter(); return r; }, [createExpense, incrementAdCounter, demoPaused]);
  const wrappedCreateMerchandiseExpense = useCallback(async (...args) => { if (guardPaused("compras")) return false; const r = await createMerchandiseExpense(...args); if (r) incrementAdCounter(); return r; }, [createMerchandiseExpense, incrementAdCounter, demoPaused]);
  const wrappedAdjustWallet = useCallback(async (...args) => { if (guardPaused("ajustes")) return false; return await adjustWallet(...args); }, [adjustWallet, demoPaused]);
  const wrappedWithdrawCashToWallet = useCallback(async (...args) => { if (guardPaused("retiros")) return false; return await withdrawCashToWallet(...args); }, [withdrawCashToWallet, demoPaused]);
  const wrappedSaveProduct = useCallback(async (...args) => { if (guardPaused("la creacion de productos")) return false; return await saveProduct(...args); }, [saveProduct, demoPaused]);
  const wrappedRemoveProduct = useCallback(async (...args) => { if (guardPaused("la eliminacion de productos")) return false; return await removeProduct(...args); }, [removeProduct, demoPaused]);

  const uploadProfileAvatar = async (file) => { const url = await uploadAsset(file, "avatars"); if (url) inform("Foto actualizada.", "success"); return url; };

  const { saveProfile } = useAccountActions({ session, user, commit, setSession, inform, personName, mergeUsers });

  const value = {
    app, session, user, theme, setTheme, selected, setSelected,
    productModal, setProductModal, saleModal, setSaleModal,
    informalSaleModal, setInformalSaleModal, expenseModal, setExpenseModal,
    walletModal, setWalletModal, cashWithdrawalModal, setCashWithdrawalModal,
    editing, syncing, uploading, uploadError, saleSubmitting, informalSaleSubmitting,
    expenseSubmitting, merchandiseSubmitting, feedbackSubmitting,
    authChecking, loginLoading, loginError, loginForm, setLoginForm,
    productForm, setProductForm, expense, setExpense, walletForm, setWalletForm,
    cashWithdrawalForm, setCashWithdrawalForm, shiftCash, setShiftCash,
    saleLines, setSaleLines, salePayment, setSalePayment,
    informalSale, setInformalSale, informalSalePayment, setInformalSalePayment,
    merchandise, setMerchandise, merchandiseLines, setMerchandiseLines,
    scheduleForm, setScheduleForm, adOverlay, setAdOverlay,
    activeShift, lowStock, featuredProduct, upcomingSchedules, visibleProducts,
    salePreview, saleTotal, salesToday, mySalesToday, recentActivity,
    adminStats, sellerStats, toasts, dismissToast, demoPaused, setDemoPaused,
    notifications: app.notifications || [], communityFeedbacks: app.communityFeedbacks || [],
    distributors: app.distributors || [], expenseCategories: app.expenseCategories || [],
    unreadNotifications, money, formatDate,
    resetProductFlow, openCreateProduct, openEditProduct,
    openSaleFlow, openInformalSaleFlow, openMerchandiseFlow,
    handleLogin, saveProduct: wrappedSaveProduct, removeProduct: wrappedRemoveProduct,
    uploadProductImage, uploadSaleEvidence, uploadInformalSaleEvidence, uploadExpenseEvidence,
    startShift, closeShift, createSale: wrappedCreateSale, createInformalSale: wrappedCreateInformalSale,
    createExpense: wrappedCreateExpense, createMerchandiseExpense: wrappedCreateMerchandiseExpense,
    adjustWallet: wrappedAdjustWallet, withdrawCashToWallet: wrappedWithdrawCashToWallet,
    createSchedule, deleteSchedule, updateScheduleStatus, setFeaturedProduct,
    saveProfile, uploadProfileAvatar, inform, logout, clearAllNotifications,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppContext must be used within AppProvider");
  return context;
}
