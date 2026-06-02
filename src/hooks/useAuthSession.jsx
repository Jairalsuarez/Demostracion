import { useState } from "react";
import { clearSession, loginUser, logoutSupabaseSession } from "../services/authService.js";

const REMEMBER_LOGIN_KEY = "sabores-remember-login-v2";
const LEGACY_REMEMBER_LOGIN_KEY = "sabores-remember-login-v1";

function getRememberedLogin() {
  try {
    return JSON.parse(window.localStorage.getItem(REMEMBER_LOGIN_KEY) || window.localStorage.getItem(LEGACY_REMEMBER_LOGIN_KEY) || "null");
  } catch {
    return null;
  }
}

function saveRememberedLogin({ email, password, rememberLogin }) {
  try {
    if (!rememberLogin) {
      window.localStorage.removeItem(REMEMBER_LOGIN_KEY);
      window.localStorage.removeItem(LEGACY_REMEMBER_LOGIN_KEY);
      return;
    }

    window.localStorage.setItem(
      REMEMBER_LOGIN_KEY,
      JSON.stringify({
        email: email || "",
        password: password || "",
        rememberLogin: true,
      })
    );
    window.localStorage.removeItem(LEGACY_REMEMBER_LOGIN_KEY);
  } catch {
    // If storage is unavailable, login still works normally.
  }
}

export default function useAuthSession({ inform, personName, setSession, setSkipNextSessionRestore }) {
  const rememberedLogin = getRememberedLogin();
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [authChecking, setAuthChecking] = useState(true);
  const [loginForm, setLoginForm] = useState({
    email: rememberedLogin?.email || "",
    password: rememberedLogin?.password || "",
    rememberLogin: Boolean(rememberedLogin?.rememberLogin),
  });

  const handleLogin = async () => {
    setLoginLoading(true);
    setLoginError("");
    const result = await loginUser(loginForm);
    setLoginLoading(false);

    if (!result.ok) {
      setLoginError(result.error);
      return false;
    }

    saveRememberedLogin(loginForm);
    setAuthChecking(true);
    setSession(result.session);
    setLoginForm((current) => ({
      email: current.rememberLogin ? current.email : "",
      password: current.rememberLogin ? current.password : "",
      rememberLogin: current.rememberLogin,
    }));
    inform(`Bienvenida, ${result.session.displayName || personName(result.session)}.`, "success");
    return true;
  };

  const logout = () => {
    setSkipNextSessionRestore(true);
    setAuthChecking(false);
    clearSession();
    logoutSupabaseSession();
    setSession(null);
  };

  return {
    loginLoading,
    authChecking,
    setAuthChecking,
    loginError,
    loginForm,
    setLoginForm,
    handleLogin,
    logout,
  };
}
