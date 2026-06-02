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
import useSupabaseSync from "../hooks/useSupabaseSync.jsx";
import useToastQueue from "../hooks/useToastQueue.jsx";
import { getAppData, saveAppData } from "../services/appDataService.js";
import { getSession, restoreSupabaseSession, verifySupabasePassword } from "../services/authService.js";
import { registerPlugin } from "@capacitor/core";
import {
  createRemoteDistributor,
  createRemoteCommunityFeedback,
  createRemoteExpense,
  createRemoteInformalSale,
  createRemoteNotification,
  createRemoteSale,
  createRemoteSchedule,
  createRemoteShift,
  createRemoteWalletMovement,
  upsertRemoteCashState,
  deleteRemoteCommunityFeedback,
  deleteRemoteSchedule,
  fetchRemoteCommunityFeedback,
  updateRemoteScheduleStatus,
  updateRemoteShift,
  upsertRemoteWalletState,
} from "../services/operationsService.js";
import { mergeUsers, updateRemoteProfile } from "../services/profileService.js";
import { deleteRemoteProduct, upsertRemoteProduct } from "../services/productService.js";
import { storageReady, uploadImage } from "../services/storageService.js";
import { isNativeApp } from "../utils/platform.js";

const AppContext = createContext(null);
const NativeNotifier = registerPlugin("NativeNotifier");

const LOW_STOCK_LIMIT = 5;
const DEVICE_NOTIFICATION_ICON = "/images/Logo%20Fizzia.svg";
const ADS = [
  { image: "/images/ad%201.jpeg", alt: "Anuncio de Fizzia" },
  { image: "/images/ad%202.jpeg", alt: "Anuncio de Fizzia" },
];
const AD_ACTION_THRESHOLD = 3;
const EMPTY_PRODUCT = {
  nombre: "",
  categoria: "Bebidas",
  marca: "",
  descripcion: "",
  precio: 0,
  stockLocal: 0,
  stockDeposito: 0,
  stock: 0,
  imagen_url: "",
  activo: true,
};
const EMPTY_WALLET_FORM = { saldo: 0, motivo: "", password: "", confirmationAccepted: false };
const EMPTY_CASH_WITHDRAWAL_FORM = { amount: 0, amountInput: "", motivo: "" };
const EMPTY_EXPENSE = {
  categoria: "Mercaderia",
  categoryId: "",
  categoryName: "Mercaderia",
  isNewCategory: false,
  newCategoryName: "",
  descripcion: "",
  detalleOferta: "",
  distributorId: "",
  distributorName: "",
  isNewDistributor: false,
  newDistributorName: "",
  evidenceUrl: "",
  evidencePreviewUrl: "",
  evidenceName: "",
  cantidad: 1,
  unitCost: 0,
  monto: 0,
  montoInput: "",
  fundingSource: "",
  confirmationAccepted: false,
};
const EMPTY_SALE_PAYMENT = { method: "efectivo", evidenceUrl: "", evidenceName: "" };
const EMPTY_INFORMAL_SALE = { total: 0, totalInput: "", description: "" };
const EMPTY_MERCHANDISE = {
  distributorId: "",
  distributorName: "",
  isNewDistributor: false,
  newDistributorName: "",
  location: "deposito",
  amount: 0,
  amountInput: "",
};
const EMPTY_SCHEDULE_FORM = { fecha: "", inicio: "", fin: "", responsable: "", turno: "Mañana", notas: "" };

let nativeNotificationChannelReady = false;

const money = (n) => new Intl.NumberFormat("es-EC", { style: "currency", currency: "USD" }).format(Number(n || 0));
const shortTime = (value) => new Intl.DateTimeFormat("es-EC", { timeStyle: "short" }).format(new Date(value));
const formatDate = (value, config = { dateStyle: "medium" }) => new Intl.DateTimeFormat("es-EC", config).format(new Date(value));
const personName = (person = {}) => [person.nombre, person.apellido].filter(Boolean).join(" ").trim() || person.nombre || "Usuario";
const getBrowserNotificationPermission = () => {
  if (isNativeApp()) return "default";
  if (typeof window === "undefined" || !("Notification" in window)) return "unsupported";
  return window.Notification.permission;
};
const notificationId = (value) => {
  const text = String(value || Date.now());
  return text.split("").reduce((acc, char) => ((acc * 31 + char.charCodeAt(0)) & 0x7fffffff), 17) || Math.floor(Date.now() % 2147483647);
};
const ensureNativeNotificationChannel = async () => {
  const { LocalNotifications } = await import("@capacitor/local-notifications");
  if (!nativeNotificationChannelReady) {
    try {
      await LocalNotifications.deleteChannel?.({ id: "sabores-general" });
    } catch {
      // Android may throw when the channel does not exist yet.
    }
  }
  await LocalNotifications.createChannel?.({
    id: "sabores-general",
    name: "Fizzia",
    description: "Alertas de la demo comercial",
    importance: 5,
    visibility: 1,
    lights: true,
    vibration: true,
  });
  nativeNotificationChannelReady = true;
  return LocalNotifications;
};

const isMissingRelationError = (error = "") => {
  const text = String(error || "").toLowerCase();
  return text.includes("could not find the table") || text.includes("relation") || text.includes("schema cache") || text.includes("column");
};

export function AppProvider({ children }) {
  const [app, setApp] = useState(() => getAppData());
  const [session, setSession] = useState(() => getSession());
  const [theme, setTheme] = useCookieState("ventas-theme", "light");
  const [selected, setSelected] = useState(null);
  const [saleModal, setSaleModal] = useState(false);
  const [informalSaleModal, setInformalSaleModal] = useState(false);
  const [expenseModal, setExpenseModal] = useState(false);
  const [merchandiseModal, setMerchandiseModal] = useState(false);
  const [walletModal, setWalletModal] = useState(false);
  const [cashWithdrawalModal, setCashWithdrawalModal] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncedSessionKey, setSyncedSessionKey] = useState("");
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
  const [notificationPermission, setNotificationPermission] = useState(getBrowserNotificationPermission);
  const { toasts, pushToast, dismissToast } = useToastQueue();
  const browserNotificationReadyRef = useRef(false);
  const shownBrowserNotificationIdsRef = useRef(new Set());
  const { editing, productForm, productModal, setProductForm, setProductModal, resetProductFlow, openCreateProduct, openEditProduct } =
    useProductEditor(EMPTY_PRODUCT);

  const commit = (updater) => setApp((current) => (typeof updater === "function" ? updater(current) : updater));
  const { notify, markNotificationRead, markAllNotificationsRead } = useNotificationCenter(commit);

  const inform = (message, type = "info", shouldStore = false) => {
    pushToast(message, type);
    if (shouldStore) notify(message, personName(user) || "Fizzia", type);
  };
  const { loginLoading, authChecking, setAuthChecking, loginError, loginForm, setLoginForm, handleLogin, logout } = useAuthSession({
    inform,
    personName,
    setSession,
    setSkipNextSessionRestore,
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    setNotificationPermission(getBrowserNotificationPermission());
  }, [session]);

  useEffect(() => saveAppData(app), [app]);
  useEffect(() => setWalletForm((current) => ({ ...current, saldo: app.wallet.saldoActual })), [app.wallet.saldoActual]);
  const sessionKey = session ? `${session.mode}:${session.userId || ""}` : "";
  const { syncRemoteData } = useSupabaseSync(session, setSession, commit, setSyncing, (syncedSession) => {
    if (syncedSession?.mode === "supabase") {
      setSyncedSessionKey(`${syncedSession.mode}:${syncedSession.userId || ""}`);
    }
  });
  useEffect(() => {
    if (session?.mode === "supabase") {
      setSyncedSessionKey("");
    }
  }, [sessionKey]);
  useEffect(() => {
    if (!session) return;
    if (session.mode === "supabase" && syncedSessionKey !== sessionKey) return;
    if (!syncing) {
      setAuthChecking(false);
    }
  }, [session, sessionKey, syncedSessionKey, syncing, setAuthChecking]);
  const authCheckTimedOut = useRef(false);
  useEffect(() => {
    if (!authChecking) return;
    const timer = setTimeout(() => {
      authCheckTimedOut.current = true;
      setAuthChecking(false);
    }, 8000);
    return () => clearTimeout(timer);
  }, [authChecking, setAuthChecking]);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (session) return;
      if (skipNextSessionRestore) {
        setSkipNextSessionRestore(false);
        setAuthChecking(false);
        return;
      }
      setAuthChecking(true);
      const localSession = getSession();
      if (localSession) {
        setSession(localSession);
        if (localSession.mode !== "supabase") {
          setAuthChecking(false);
        }
        return;
      }
      const restored = await restoreSupabaseSession();
      if (cancelled) return;
      if (restored.ok) {
        setSession(restored.session);
      }
      setAuthChecking(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [session, setAuthChecking, skipNextSessionRestore]);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const result = await fetchRemoteCommunityFeedback();
      if (!cancelled && result.ok) {
        commit((current) => ({ ...current, communityFeedbacks: result.feedbacks }));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const user = useMemo(() => {
    if (!session) return null;
    const localUser = app.users.find((item) => item.id === session.userId);
    if (localUser) {
      return {
        ...localUser,
        apellido: localUser.apellido || session.apellido || "",
        email: localUser.email || session.email,
        telefono: localUser.telefono || session.telefono || "",
        avatarUrl: localUser.avatarUrl || session.avatarUrl || "",
        displayName: personName(localUser),
      };
    }
    return {
      id: session.userId,
      nombre: session.nombre,
      apellido: session.apellido || "",
      email: session.email,
      telefono: session.telefono || "",
      role: session.role,
      avatarUrl: session.avatarUrl || "",
      displayName: session.displayName || personName(session),
      source: session.mode,
    };
  }, [app.users, session]);

  const requestBrowserNotificationPermission = async () => {
    if (isNativeApp()) {
      try {
        await ensureNativeNotificationChannel();
        const permission = await NativeNotifier.requestPermission();
        const granted = Boolean(permission?.granted);
        setNotificationPermission(granted ? "granted" : "denied");
        if (granted) {
          await NativeNotifier.show({
            id: notificationId(`enabled-${Date.now()}`),
            title: "Fizzia",
            body: "Notificaciones activadas.",
          });
        }
        pushToast(granted ? "Notificaciones del dispositivo activadas." : "No se concedio permiso para notificaciones.", granted ? "success" : "warning");
        return { ok: granted, permission: granted ? "granted" : "denied" };
      } catch (error) {
        pushToast(error?.message || "No se pudo activar notificaciones nativas.", "error");
        return { ok: false, permission: "unsupported" };
      }
    }

    if (typeof window === "undefined" || !("Notification" in window)) {
      pushToast("Este navegador no soporta notificaciones del dispositivo.", "warning");
      return { ok: false, permission: "unsupported" };
    }

    try {
      const permission = await window.Notification.requestPermission();
      setNotificationPermission(permission);

      if (permission === "granted") {
        pushToast("Notificaciones del dispositivo activadas.", "success");
        return { ok: true, permission };
      }

      if (permission === "denied") {
        pushToast("Bloqueaste las notificaciones del dispositivo para esta app.", "warning");
      }

      return { ok: false, permission };
    } catch (error) {
      pushToast(error?.message || "No se pudo solicitar el permiso de notificaciones.", "error");
      return { ok: false, permission: getBrowserNotificationPermission() };
    }
  };

  const showDeviceNotification = useCallback(async (notification) => {
    if (!session || notificationPermission !== "granted") return;

    const options = {
      body: notification.message || "Tienes una nueva notificacion.",
      icon: DEVICE_NOTIFICATION_ICON,
      badge: DEVICE_NOTIFICATION_ICON,
      tag: notification.id,
    };

    try {
      if (isNativeApp()) {
        await ensureNativeNotificationChannel();
        const permission = await NativeNotifier.requestPermission();
        if (!permission?.granted) {
          setNotificationPermission("denied");
          return;
        }
        await NativeNotifier.show({
          id: notificationId(notification.id),
        title: notification.actorName || "Fizzia",
          body: notification.message || "Tienes una nueva notificacion.",
        });
        return;
      }

      if (typeof window === "undefined" || !("Notification" in window)) return;

      if ("serviceWorker" in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration?.showNotification) {
        await registration.showNotification(notification.actorName || "Fizzia", options);
          return;
        }
      }

      const deviceNotification = new window.Notification(notification.actorName || "Fizzia", options);
      deviceNotification.onclick = () => {
        window.focus();
        deviceNotification.close();
      };
    } catch {
      // Device notifications are best-effort; in-app toasts still cover the event.
    }
  }, [notificationPermission, session]);

  useEffect(() => {
    const legacyAdminShifts = (app.turnos || []).filter((turno) => {
      if (turno.estado !== "abierto") return false;
      const owner = (app.users || []).find((item) => item.id === turno.userId);
      return owner?.role && owner.role !== "vendedor";
    });

    if (!legacyAdminShifts.length) return;

    const closedAt = new Date().toISOString();
    const salesTotals = new Map(
      legacyAdminShifts.map((turno) => [
        turno.id,
        (app.sales || []).filter((sale) => sale.shiftId === turno.id).reduce((acc, sale) => acc + Number(sale.total || 0), 0),
      ])
    );

    const sanitizedIds = new Set(legacyAdminShifts.map((turno) => turno.id));

    commit((current) => ({
      ...current,
      turnos: (current.turnos || []).map((turno) =>
        sanitizedIds.has(turno.id)
          ? {
              ...turno,
              estado: "cerrado",
              totalVentas: salesTotals.get(turno.id) || turno.totalVentas || 0,
              saldoFinal: Number(turno.saldoInicial || 0) + Number(salesTotals.get(turno.id) || turno.totalVentas || 0),
              closedAt: turno.closedAt || closedAt,
            }
          : turno
      ),
    }));

    legacyAdminShifts.forEach((turno) => {
      updateRemoteShift({
        ...turno,
        estado: "cerrado",
        totalVentas: salesTotals.get(turno.id) || turno.totalVentas || 0,
        saldoFinal: Number(turno.saldoInicial || 0) + Number(salesTotals.get(turno.id) || turno.totalVentas || 0),
        closedAt: turno.closedAt || closedAt,
      });
    });
  }, [app.sales, app.turnos, app.users]);

  const {
    activeShift,
    lowStock,
    featuredProduct,
    upcomingSchedules,
    visibleProducts,
    salePreview,
    saleTotal,
    salesToday,
    mySalesToday,
    unreadNotifications,
    adminStats,
    sellerStats,
  } = useDashboardMetrics({
    app,
    session,
    user,
    saleLines,
    lowStockLimit: LOW_STOCK_LIMIT,
    money,
    formatDate,
    personName,
  });
  const recentActivity = useMemo(() => {
    const sales = app.sales.slice(0, 4).map((sale) => ({
      id: `sale-${sale.id}`,
      title: `${sale.userName} registro una venta`,
      subtitle: `${money(sale.total)} • ${formatDate(sale.createdAt, { dateStyle: "medium", timeStyle: "short" })}`,
      tone: "success",
    }));
    const alerts = lowStock.slice(0, 3).map((product) => ({
      id: `stock-${product.id}`,
      title: `${product.nombre} necesita reposicion`,
      subtitle: `${product.stock} unidades disponibles`,
      tone: "warning",
    }));
    return [...sales, ...alerts];
  }, [app.sales, lowStock]);

  useEffect(() => {
    if (user?.role !== "admin" || !lowStock.length) return;

    const existingIds = new Set((app.notifications || []).map((notification) => notification.id));
    const stockNotifications = lowStock
      .filter((product) => Number(product.stock) <= LOW_STOCK_LIMIT)
      .map((product) => ({
        id: `low-stock-${product.id}-${product.stock}`,
        message: `Reponer ${product.nombre}: quedan ${product.stock} unidad(es) disponibles.`,
        actorName: "Inventario",
        type: "warning",
        read: false,
        createdAt: new Date().toISOString(),
      }))
      .filter((notification) => !existingIds.has(notification.id));

    if (!stockNotifications.length) return;

    commit((current) => ({
      ...current,
      notifications: [...stockNotifications, ...(current.notifications || [])].slice(0, 60),
    }));
  }, [app.notifications, lowStock, user?.role]);

  // Service worker registrado por vite-plugin-pwa

  useEffect(() => {
    if (!session || !user?.id) return;

    const visibleNotifications =
      user?.role === "admin"
        ? app.notifications || []
        : (app.notifications || []).filter((notification) => notification.actorId === user?.id || notification.actorName === user?.displayName);

    const seenStorageKey = user?.id ? `sabores-device-notifications-seen:${user.id}` : "sabores-device-notifications-seen:anon";
    const storedSeenIds = (() => {
      try {
        return new Set(JSON.parse(window.localStorage.getItem(seenStorageKey) || "[]"));
      } catch {
        return new Set();
      }
    })();

    if (!browserNotificationReadyRef.current) {
      shownBrowserNotificationIdsRef.current = new Set([
        ...storedSeenIds,
        ...visibleNotifications.map((notification) => notification.id).filter(Boolean),
      ]);
      browserNotificationReadyRef.current = true;
      try {
        window.localStorage.setItem(seenStorageKey, JSON.stringify([...shownBrowserNotificationIdsRef.current].slice(-120)));
      } catch {
        // Ignore storage errors; notifications still work in the current session.
      }
      return;
    }

    const now = Date.now();
    const freshNotifications = visibleNotifications.filter((notification) => {
      if (shownBrowserNotificationIdsRef.current.has(notification.id)) return false;
      if (notification.read) return false;
      const age = now - new Date(notification.createdAt || now).getTime();
      return age <= 24 * 60 * 60 * 1000;
    });

    freshNotifications.forEach((notification) => {
      shownBrowserNotificationIdsRef.current.add(notification.id);
      pushToast(notification.message || "Tienes una nueva notificacion.", notification.type || "info", `notification:${notification.id}`);
    });

    try {
      window.localStorage.setItem(seenStorageKey, JSON.stringify([...shownBrowserNotificationIdsRef.current].slice(-120)));
    } catch {
      // Ignore storage errors; notifications still work in the current session.
    }

    freshNotifications.forEach((notification) => showDeviceNotification(notification));
  }, [app.notifications, notificationPermission, pushToast, session, showDeviceNotification, user?.displayName, user?.id, user?.role]);

  const openSaleFlow = () => {
    if (user?.role === "vendedor" && !activeShift) {
      return inform("Debes iniciar un turno antes de registrar ventas.", "warning");
    }
    setSaleLines([{ productId: "", cantidad: 1 }]);
    setSalePayment(EMPTY_SALE_PAYMENT);
    setSaleModal(true);
  };

  const openInformalSaleFlow = () => {
    if (user?.role === "vendedor" && !activeShift) {
      return inform("Debes iniciar un turno antes de registrar ventas.", "warning");
    }
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
      const message = error?.message || "No se pudo subir el archivo. Revisa la conexion e intenta de nuevo.";
      setUploadError(message);
      inform(message, "error");
      return "";
    } finally {
      setUploading(false);
    }
  };

  const uploadProductImage = async (file) => {
    const url = await uploadAsset(file, "products");
    if (url) {
      setProductForm((current) => ({ ...current, imagen_url: url }));
      inform("Imagen subida correctamente.", "success");
    }
  };
  const uploadSaleEvidence = async (file) => {
    const url = await uploadAsset(file, "sales");
    if (url) {
      setSalePayment((current) => ({ ...current, evidenceUrl: url, evidenceName: file.name || "evidencia" }));
      inform("Evidencia subida correctamente.", "success");
    }
  };
  const uploadInformalSaleEvidence = async (file) => {
    const url = await uploadAsset(file, "sales");
    if (url) {
      setInformalSalePayment((current) => ({ ...current, evidenceUrl: url, evidenceName: file.name || "evidencia" }));
      inform("Evidencia subida correctamente.", "success");
    }
  };
  const uploadExpenseEvidence = async (file) => {
    const previewUrl = URL.createObjectURL(file);
    const url = await uploadAsset(file, "expenses");
    if (url) {
      setExpense((current) => ({ ...current, evidenceUrl: url, evidencePreviewUrl: previewUrl, evidenceName: file.name || "evidencia" }));
      inform("Evidencia subida correctamente.", "success");
    }
  };
  const { saveProduct, removeProduct, setFeaturedProduct } = useCatalogActions({
    app,
    session,
    user,
    editing,
    productForm,
    commit,
    notify,
    inform,
    personName,
    resetProductFlow,
    upsertRemoteProduct,
    deleteRemoteProduct,
  });
  const { startShift, closeShift, createSale, createInformalSale, createExpense, createMerchandiseExpense, transferInventory, adjustWallet, withdrawCashToWallet, createSchedule, updateScheduleStatus, deleteSchedule } =
    useOperationsActions({
      app,
      session,
      user,
      activeShift,
      shiftCash,
      cashBox: app.cashBox,
      setSaleLines,
      salePayment,
      setSalePayment,
      informalSale,
      setInformalSale,
      informalSalePayment,
      setInformalSalePayment,
      salePreview,
      saleTotal,
      saleSubmitting,
      setSaleSubmitting,
      informalSaleSubmitting,
      setInformalSaleSubmitting,
      setSaleModal,
      setInformalSaleModal,
      expense,
      distributors: app.distributors || [],
      setExpense,
      expenseSubmitting,
      setExpenseSubmitting,
      setExpenseModal,
      merchandise,
      setMerchandise,
      merchandiseLines,
      setMerchandiseLines,
      merchandiseSubmitting,
      setMerchandiseSubmitting,
      setMerchandiseModal,
      walletForm,
      setWalletForm,
      setWalletModal,
      cashWithdrawalForm,
      setCashWithdrawalForm,
      setCashWithdrawalModal,
      scheduleForm,
      setScheduleForm,
      commit,
      notify,
      inform,
      personName,
      money,
      shortTime,
      isMissingRelationError,
      emptyWalletForm: EMPTY_WALLET_FORM,
      emptyScheduleForm: EMPTY_SCHEDULE_FORM,
      createRemoteShift,
      updateRemoteShift,
      createRemoteSale,
      createRemoteInformalSale,
      upsertRemoteWalletState,
      upsertRemoteCashState,
      createRemoteWalletMovement,
      createRemoteExpense,
      createRemoteDistributor,
      upsertRemoteProduct,
      createRemoteNotification,
      createRemoteSchedule,
      updateRemoteScheduleStatus,
      deleteRemoteSchedule,
      verifySupabasePassword,
    });

  const incrementAdCounter = useCallback(() => {
    if (!session) return;
    const count = parseInt(adActionCount || "0", 10) + 1;
    setAdActionCount(String(count));
    if (count >= AD_ACTION_THRESHOLD && !adOverlay) {
      const shown = (() => { try { return JSON.parse(adShownIndices || "[]"); } catch { return []; } })();
      const nextIdx = ADS.findIndex((_, i) => !shown.includes(i));
      if (nextIdx !== -1) {
        setAdOverlay(ADS[nextIdx]);
        setAdShownIndices(JSON.stringify([...shown, nextIdx]));
      }
      setAdActionCount("0");
    }
  }, [session, adActionCount, adOverlay, adShownIndices, setAdActionCount, setAdShownIndices, setAdOverlay]);

  const guardPaused = (name) => {
    if (demoPaused) {
      inform(`No puedes realizar ${name} mientras el demo esta pausado.`, "warning");
      return true;
    }
    return false;
  };

  const wrappedCreateSale = useCallback(async (...args) => {
    if (guardPaused("ventas")) return false;
    const result = await createSale(...args);
    if (result) incrementAdCounter();
    return result;
  }, [createSale, incrementAdCounter, demoPaused]);

  const wrappedCreateInformalSale = useCallback(async (...args) => {
    if (guardPaused("ventas")) return false;
    const result = await createInformalSale(...args);
    if (result) incrementAdCounter();
    return result;
  }, [createInformalSale, incrementAdCounter, demoPaused]);

  const wrappedCreateExpense = useCallback(async (...args) => {
    if (guardPaused("egresos")) return false;
    const result = await createExpense(...args);
    if (result) incrementAdCounter();
    return result;
  }, [createExpense, incrementAdCounter, demoPaused]);

  const wrappedCreateMerchandiseExpense = useCallback(async (...args) => {
    if (guardPaused("compras de mercaderia")) return false;
    const result = await createMerchandiseExpense(...args);
    if (result) incrementAdCounter();
    return result;
  }, [createMerchandiseExpense, incrementAdCounter, demoPaused]);

  const wrappedAdjustWallet = useCallback(async (...args) => {
    if (guardPaused("ajustes de saldo")) return false;
    return await adjustWallet(...args);
  }, [adjustWallet, demoPaused]);

  const wrappedWithdrawCashToWallet = useCallback(async (...args) => {
    if (guardPaused("retiros de caja")) return false;
    return await withdrawCashToWallet(...args);
  }, [withdrawCashToWallet, demoPaused]);

  const wrappedTransferInventory = useCallback(async (...args) => {
    if (guardPaused("transferencias de inventario")) return false;
    return await transferInventory(...args);
  }, [transferInventory, demoPaused]);

  const wrappedSaveProduct = useCallback(async (...args) => {
    if (guardPaused("la creacion de productos")) return false;
    return await saveProduct(...args);
  }, [saveProduct, demoPaused]);

  const wrappedRemoveProduct = useCallback(async (...args) => {
    if (guardPaused("la eliminacion de productos")) return false;
    return await removeProduct(...args);
  }, [removeProduct, demoPaused]);

  const uploadProfileAvatar = async (file) => {
    const url = await uploadAsset(file, "avatars");
    if (url) inform("Foto actualizada.", "success");
    return url;
  };

  const submitCommunityFeedback = async ({ comment }) => {
    const cleanComment = comment.trim();
    if (!cleanComment) return inform("Escribe un comentario antes de enviarlo.", "warning");
    if (feedbackSubmitting) return;

    setFeedbackSubmitting(true);
    const draft = {
      id: crypto.randomUUID(),
      comment: cleanComment,
      createdAt: new Date().toISOString(),
    };

    commit((current) => ({
      ...current,
      communityFeedbacks: [draft, ...(current.communityFeedbacks || [])].slice(0, 60),
    }));
    inform("Gracias por compartir tu comentario.", "success");

    try {
      const remote = await createRemoteCommunityFeedback(draft);
      if (remote.ok) {
        commit((current) => ({
          ...current,
          communityFeedbacks: current.communityFeedbacks.map((item) => (item.id === draft.id ? remote.feedback : item)),
        }));
      }
    } finally {
      setFeedbackSubmitting(false);
    }

    return { ok: true };
  };

  const deleteCommunityFeedback = async (feedbackId) => {
    if (user?.role !== "admin") return inform("Solo administracion puede eliminar comentarios.", "warning");
    const target = (app.communityFeedbacks || []).find((item) => item.id === feedbackId);
    if (!target) return { ok: false };

    commit((current) => ({
      ...current,
      communityFeedbacks: (current.communityFeedbacks || []).filter((item) => item.id !== feedbackId),
    }));

    const remote = await deleteRemoteCommunityFeedback(feedbackId);
    if (session?.mode === "supabase" && !remote.ok) {
      commit((current) => ({
        ...current,
        communityFeedbacks: [target, ...(current.communityFeedbacks || [])].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
      }));
      inform("No se pudo eliminar el comentario. Intenta de nuevo.", "error");
      return { ok: false };
    }

    notify(`${personName(user)} elimino un comentario de la comunidad.`, personName(user), "warning");
    inform("Comentario eliminado.", "success");
    return { ok: true };
  };
  const { saveProfile } = useAccountActions({
    session,
    user,
    commit,
    setSession,
    notify,
    inform,
    personName,
    mergeUsers,
    updateRemoteProfile,
  });

  const value = {
    app,
    session,
    user,
    theme,
    setTheme,
    selected,
    setSelected,
    productModal,
    setProductModal,
    saleModal,
    setSaleModal,
    informalSaleModal,
    setInformalSaleModal,
    expenseModal,
    setExpenseModal,
    merchandiseModal,
    setMerchandiseModal,
    walletModal,
    setWalletModal,
    cashWithdrawalModal,
    setCashWithdrawalModal,
    editing,
    syncing,
    uploading,
    uploadError,
    saleSubmitting,
    informalSaleSubmitting,
    expenseSubmitting,
    merchandiseSubmitting,
    feedbackSubmitting,
    authChecking,
    loginLoading,
    loginError,
    loginForm,
    setLoginForm,
    productForm,
    setProductForm,
    expense,
    setExpense,
    walletForm,
    setWalletForm,
    cashWithdrawalForm,
    setCashWithdrawalForm,
    shiftCash,
    setShiftCash,
    saleLines,
    setSaleLines,
    salePayment,
    setSalePayment,
    informalSale,
    setInformalSale,
    informalSalePayment,
    setInformalSalePayment,
    merchandise,
    setMerchandise,
    merchandiseLines,
    setMerchandiseLines,
    scheduleForm,
    setScheduleForm,
    adOverlay,
    setAdOverlay,
    activeShift,
    lowStock,
    featuredProduct,
    upcomingSchedules,
    visibleProducts,
    salePreview,
    saleTotal,
    salesToday,
    mySalesToday,
    recentActivity,
    adminStats,
    sellerStats,
    toasts,
    dismissToast,
    demoPaused,
    setDemoPaused,
    notifications: app.notifications || [],
    communityFeedbacks: app.communityFeedbacks || [],
    distributors: app.distributors || [],
    expenseCategories: app.expenseCategories || [],
    unreadNotifications,
    notificationPermission,
    money,
    formatDate,
    storageReady,
    resetProductFlow,
    openCreateProduct,
    openEditProduct,
    openSaleFlow,
    openInformalSaleFlow,
    openMerchandiseFlow,
    handleLogin,
    saveProduct: wrappedSaveProduct,
    removeProduct: wrappedRemoveProduct,
    uploadProductImage,
    uploadSaleEvidence,
    uploadInformalSaleEvidence,
    uploadExpenseEvidence,
    startShift,
    closeShift,
    createSale: wrappedCreateSale,
    createInformalSale: wrappedCreateInformalSale,
    createExpense: wrappedCreateExpense,
    createMerchandiseExpense: wrappedCreateMerchandiseExpense,
    transferInventory: wrappedTransferInventory,
    adjustWallet: wrappedAdjustWallet,
    withdrawCashToWallet: wrappedWithdrawCashToWallet,
    createSchedule,
    deleteSchedule,
    updateScheduleStatus,
    setFeaturedProduct,
    saveProfile,
    uploadProfileAvatar,
    refreshAppData: syncRemoteData,
    submitCommunityFeedback,
    deleteCommunityFeedback,
    markNotificationRead,
    markAllNotificationsRead,
    requestBrowserNotificationPermission,
    inform,
    logout,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppContext must be used within AppProvider");
  return context;
}
