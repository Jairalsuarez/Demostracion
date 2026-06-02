import { Navigate, Outlet, useLocation } from "react-router-dom";
import AuthCheckingScreen from "../components/ui/AuthCheckingScreen.jsx";
import { useAppContext } from "../context/AppContext";

export default function ProtectedRoute({ allowedRoles = [] }) {
  const { authChecking, session, syncing, user } = useAppContext();
  const location = useLocation();

  if (authChecking) {
    return <AuthCheckingScreen />;
  }

  if (!session) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }

  if (syncing) {
    return <AuthCheckingScreen />;
  }

  if (allowedRoles.length && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/panel" replace />;
  }

  return <Outlet />;
}
