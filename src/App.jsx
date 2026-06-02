import { Suspense, lazy, useEffect } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import ProductDetailsModal from "./components/modals/ProductDetailsModal";
import CashWithdrawalModal from "./components/modals/CashWithdrawalModal";
import ExpenseModal from "./components/modals/ExpenseModal";
import InformalSaleModal from "./components/modals/InformalSaleModal";
import MerchandiseModal from "./components/modals/MerchandiseModal";
import SaleModal from "./components/modals/SaleModal";
import WalletModal from "./components/modals/WalletModal";
import WalletPage from "./pages/finance/WalletPage";
import ToastViewport from "./components/notifications/ToastViewport";
import ProductModal from "./components/modals/ProductModal";
import AdOverlay from "./components/ui/AdOverlay.jsx";
import CookieBanner from "./components/CookieBanner.jsx";
import NativeBootSplash from "./components/ui/NativeBootSplash.jsx";
import PageSkeleton from "./components/ui/PageSkeleton.jsx";
import RouteErrorBoundary from "./components/ui/RouteErrorBoundary.jsx";
import { useAppContext } from "./context/AppContext";
import PanelLayout from "./layouts/PanelLayout.jsx";
import ProtectedRoute from "./routes/ProtectedRoute";
import { isNativeApp } from "./utils/platform.js";

const ProfilePage = lazy(() => import("./pages/account/ProfilePage.jsx"));
const LoginPage = lazy(() => import("./pages/auth/LoginPage.jsx"));
const ProductsPage = lazy(() => import("./pages/catalog/ProductsPage.jsx"));
const DashboardPage = lazy(() => import("./pages/dashboard/DashboardPage.jsx"));
const SalesPage = lazy(() => import("./pages/sales/SalesPage.jsx"));

function App() {
  const navigate = useNavigate();
  const nativeApp = isNativeApp();
  const {
    activeShift,
    app,
    createExpense,
    createInformalSale,
    createMerchandiseExpense,
    createSale,
    cashWithdrawalForm,
    cashWithdrawalModal,
    dismissToast,
    expense,
    expenseModal,
    expenseSubmitting,
    informalSale,
    informalSaleModal,
    informalSalePayment,
    informalSaleSubmitting,
    merchandise,
    merchandiseLines,
    merchandiseSubmitting,
    formatDate,
    money,
    openMerchandiseFlow,
    saleLines,
    salePayment,
    saleModal,
    saleSubmitting,
    saleTotal,
    saveProfile,
    selected,
    session,
    authChecking,
    adOverlay,
    setAdOverlay,
    setExpense,
    setCashWithdrawalForm,
    setCashWithdrawalModal,
    setExpenseModal,
    setInformalSale,
    setInformalSaleModal,
    setInformalSalePayment,
    setMerchandise,
    setMerchandiseLines,
    setSaleLines,
    setSaleModal,
    setSalePayment,
    setSelected,
    setWalletForm,
    setWalletModal,
    syncing,
    toasts,
    uploading,
    uploadError,
    uploadInformalSaleEvidence,
    uploadSaleEvidence,
    uploadProductImage,
    uploadProfileAvatar,
    user,
    visibleProducts,
    editing,
    openEditProduct,
    saveProduct,
    removeProduct,
    productForm,
    productModal,
    setProductForm,
    setProductModal,
    resetProductFlow,
    walletForm,
    walletModal,
    adjustWallet,
    withdrawCashToWallet,
    distributors,
    theme,
  } = useAppContext();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const goBack = (fallback = "/panel") => {
    const historyIndex = window.history.state?.idx;
    if (typeof historyIndex === "number" && historyIndex > 0) navigate(-1);
    else navigate(fallback);
  };
  const openSaleAction = () => navigate("/panel/ventas/nueva");
  const openInformalSaleAction = () => navigate("/panel/ventas/informal");
  const openExpenseAction = () => navigate("/panel/saldo/egreso");
  const openMerchandiseAction = () => {
    openMerchandiseFlow({ asPage: true });
    navigate("/panel/saldo/mercaderia");
  };
  const openProductCreateAction = () => navigate("/panel/productos");
  const openTransferInventoryAction = () => navigate("/panel/productos");

  return (
    <>
      {!nativeApp ? <CookieBanner /> : null}
      <NativeBootSplash checking={authChecking || syncing} />
      <ToastViewport onDismiss={dismissToast} suspended={authChecking || syncing} toasts={toasts} />
      <RouteErrorBoundary>
        <Suspense fallback={<PageSkeleton />}>
        <Routes>
          <Route path="/" element={<Navigate replace to={session ? "/panel" : "/login"} />} />
          <Route path="/login" element={<LoginPage />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<PanelLayout />}>
              <Route
                index
                path="/panel"
                element={
                  <DashboardPage
                    onNewProduct={openProductCreateAction}
                    onNewInformalSale={openInformalSaleAction}
                    onNewSale={openSaleAction}
                    onOpenCashWithdrawal={() => setCashWithdrawalModal(true)}
                    onOpenExpense={openExpenseAction}
                    onOpenWallet={() => setWalletModal(true)}
                  />
                }
              />
              <Route path="/panel/ventas" element={<SalesPage />} />
              <Route
                path="/panel/ventas/nueva"
                element={
                  <SaleModal
                    activeShift={activeShift}
                    app={app}
                    cashBox={app.cashBox}
                    createSale={async () => {
                      const saved = await createSale();
                      if (saved) goBack("/panel");
                      return saved;
                    }}
                    money={money}
                    onClose={() => goBack("/panel")}
                    open
                    presentation="page"
                    saleLines={saleLines}
                    salePayment={salePayment}
                    saleSubmitting={saleSubmitting}
                    saleTotal={saleTotal}
                    setSaleLines={setSaleLines}
                    setSalePayment={setSalePayment}
                    uploadError={uploadError}
                    uploadSaleEvidence={uploadSaleEvidence}
                    uploading={uploading}
                    userRole={user?.role}
                    wallet={app.wallet}
                  />
                }
              />
              <Route
                path="/panel/ventas/informal"
                element={
                  <InformalSaleModal
                    activeShift={activeShift}
                    cashBox={app.cashBox}
                    createInformalSale={async () => {
                      const saved = await createInformalSale();
                      if (saved) goBack("/panel");
                      return saved;
                    }}
                    informalSale={informalSale}
                    informalSalePayment={informalSalePayment}
                    informalSaleSubmitting={informalSaleSubmitting}
                    money={money}
                    onClose={() => goBack("/panel")}
                    open
                    presentation="page"
                    setInformalSale={setInformalSale}
                    setInformalSalePayment={setInformalSalePayment}
                    uploadError={uploadError}
                    uploadInformalSaleEvidence={uploadInformalSaleEvidence}
                    uploading={uploading}
                    userRole={user?.role}
                    wallet={app.wallet}
                  />
                }
              />
              <Route
                path="/panel/saldo"
                element={
                  <WalletPage
                    cashBox={app.cashBox}
                    expenses={app.expenses || []}
                    formatDate={formatDate}
                    isAdmin={user?.role === "admin"}
                    money={money}
                    onOpenCashWithdrawal={() => setCashWithdrawalModal(true)}
                    onOpenExpense={openExpenseAction}
                    onOpenMerchandise={openMerchandiseAction}
                    onOpenWallet={() => setWalletModal(true)}
                    wallet={app.wallet}
                  />
                }
              />
              <Route
                path="/panel/saldo/egreso"
                element={
                  <ExpenseModal
                    cashBox={app.cashBox}
                    createExpense={async () => {
                      const saved = await createExpense();
                      if (saved) goBack("/panel/saldo");
                      return saved;
                    }}
                    expense={expense}
                    expenseSubmitting={expenseSubmitting}
                    money={money}
                    onClose={() => goBack("/panel/saldo")}
                    open
                    presentation="page"
                    setExpense={setExpense}
                    wallet={app.wallet}
                  />
                }
              />
              <Route
                path="/panel/saldo/mercaderia"
                element={
                  <MerchandiseModal
                    createMerchandiseExpense={async () => {
                      const saved = await createMerchandiseExpense();
                      if (saved) navigate("/panel/saldo");
                      return saved;
                    }}
                    distributors={distributors || []}
                    merchandise={merchandise}
                    merchandiseLines={merchandiseLines}
                    merchandiseSubmitting={merchandiseSubmitting}
                    money={money}
                    onClose={() => navigate("/panel/saldo")}
                    open
                    presentation="page"
                    products={app.products || []}
                    setMerchandise={setMerchandise}
                    setMerchandiseLines={setMerchandiseLines}
                    wallet={app.wallet}
                  />
                }
              />
              <Route path="/panel/cartera" element={<Navigate replace to="/panel/saldo" />} />
              <Route path="/panel/cartera/egreso" element={<Navigate replace to="/panel/saldo/egreso" />} />
              <Route
                path="/panel/productos"
                element={
                  <ProductsPage
                    app={app}
                    canCreate={user?.role === "admin"}
                    canEdit={user?.role === "admin"}
                    money={money}
                    onEdit={openEditProduct}
                    onNewProduct={openProductCreateAction}
                    onRemove={removeProduct}
                    onTransfer={openTransferInventoryAction}
                    onView={setSelected}
                    products={(user?.role === "admin" ? app.products : visibleProducts).slice(0, 6)}
                  />
                }
              />
              <Route
                path="/panel/productos/transferir"
                element={<Navigate replace to="/panel/productos" />}
              />
              <Route
                path="/panel/productos/nuevo"
                element={<Navigate replace to="/panel/productos" />}
              />
              <Route
                path="/panel/productos/:productId/editar"
                element={<Navigate replace to="/panel/productos" />}
              />
              <Route path="/panel/perfil" element={<ProfilePage onSave={saveProfile} onUploadAvatar={uploadProfileAvatar} user={user} />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route element={<PanelLayout />}>
              <Route
                path="/panel/agenda"
                element={<Navigate replace to="/panel" />}
              />
              <Route path="/panel/analitica" element={<Navigate replace to="/panel" />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate replace to={session ? "/panel" : nativeApp ? "/login" : "/"} />} />
        </Routes>
      </Suspense>
      </RouteErrorBoundary>

      <SaleModal
        activeShift={activeShift}
        app={app}
        cashBox={app.cashBox}
        createSale={async () => {
          const saved = await createSale();
          if (saved) navigate("/panel");
          return saved;
        }}
        money={money}
        onClose={() => setSaleModal(false)}
        open={saleModal}
        saleLines={saleLines}
        salePayment={salePayment}
        saleSubmitting={saleSubmitting}
        saleTotal={saleTotal}
        setSaleLines={setSaleLines}
        setSalePayment={setSalePayment}
        uploadError={uploadError}
        uploadSaleEvidence={uploadSaleEvidence}
        uploading={uploading}
        userRole={user?.role}
        wallet={app.wallet}
      />

      <InformalSaleModal
        activeShift={activeShift}
        cashBox={app.cashBox}
        createInformalSale={async () => {
          const saved = await createInformalSale();
          if (saved) navigate("/panel");
          return saved;
        }}
        informalSale={informalSale}
        informalSalePayment={informalSalePayment}
        informalSaleSubmitting={informalSaleSubmitting}
        money={money}
        onClose={() => setInformalSaleModal(false)}
        open={informalSaleModal}
        setInformalSale={setInformalSale}
        setInformalSalePayment={setInformalSalePayment}
        uploadError={uploadError}
        uploadInformalSaleEvidence={uploadInformalSaleEvidence}
        uploading={uploading}
        userRole={user?.role}
        wallet={app.wallet}
      />

      <ExpenseModal
        cashBox={app.cashBox}
        createExpense={createExpense}
        expense={expense}
        expenseSubmitting={expenseSubmitting}
        money={money}
        onClose={() => setExpenseModal(false)}
        open={expenseModal}
        setExpense={setExpense}
        wallet={app.wallet}
      />
      <WalletModal adjustWallet={adjustWallet} onClose={() => setWalletModal(false)} open={walletModal} setWalletForm={setWalletForm} walletForm={walletForm} />
      <CashWithdrawalModal
        cashBox={app.cashBox}
        cashWithdrawalForm={cashWithdrawalForm}
        money={money}
        onClose={() => setCashWithdrawalModal(false)}
        open={cashWithdrawalModal}
        setCashWithdrawalForm={setCashWithdrawalForm}
        withdrawCashToWallet={withdrawCashToWallet}
      />
      <ProductModal
        editing={editing}
        onClose={() => {
          setProductForm(editing || { nombre: "", categoria: "", marca: "", precio: "", stockLocal: 0, stockDeposito: 0, descripcion: "", imagen_url: "", activo: true });
          setProductModal(false);
        }}
        open={productModal}
        productForm={productForm || { nombre: "", categoria: "", marca: "", precio: "", stockLocal: 0, stockDeposito: 0, descripcion: "", imagen_url: "", activo: true }}
        removeProduct={removeProduct}
        saveProduct={saveProduct}
        setProductForm={setProductForm}
        uploadError={uploadError}
        uploadProductImage={uploadProductImage}
        uploading={uploading}
      />
      <ProductDetailsModal money={money} onClose={() => setSelected(null)} open={Boolean(selected)} product={selected} variant={session || nativeApp ? "default" : "public"} whatsappNumber={app.business.whatsapp} />
      {adOverlay ? <AdOverlay ad={adOverlay} onClose={() => setAdOverlay(null)} /> : null}
    </>
  );
}

export default App;
