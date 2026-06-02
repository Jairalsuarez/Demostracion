import { NavLink } from "react-router-dom";
import Icon from "../ui/Icon";
import ThemeSwitch from "../ui/ThemeSwitch";
import { getOptimizedImageUrl } from "../../services/storageService.js";
import { isNativeApp } from "../../utils/platform.js";

const FIZZIA_LOGO = "/images/Logo%20Fizzia.svg";

function fullName(user = {}) {
  return [user.nombre, user.apellido].filter(Boolean).join(" ").trim() || user.nombre || "Usuario";
}

function initials(user = {}) {
  const letters = [user.nombre, user.apellido]
    .map((value) => value?.trim()?.slice(0, 1)?.toUpperCase())
    .filter(Boolean)
    .slice(0, 2);
  return letters.join("") || "U";
}

function UserAvatar({ user }) {
  if (user?.avatarUrl) {
    return <img alt={fullName(user)} className="h-9 w-9 rounded-full object-cover sm:h-10 sm:w-10" decoding="async" loading="lazy" src={getOptimizedImageUrl(user.avatarUrl, { width: 72, height: 72 })} />;
  }

  return <div className="grid h-9 w-9 place-items-center rounded-full border border-[#e1ece3] bg-white text-sm font-semibold text-[#183325] dark:border-[#333] dark:bg-[#0a0a0a] dark:text-white sm:h-10 sm:w-10">{initials(user)}</div>;
}

function NavItem({ link, landingMobile = false }) {
  const className = landingMobile
    ? "inline-flex w-full items-center justify-center rounded-xl border border-[#dce7dd] bg-[#f7faf6] px-4 py-3 text-sm font-semibold text-[#183325] transition hover:border-[#c6d8ca] hover:bg-white dark:border-[#333] dark:bg-[#0a0a0a] dark:text-white dark:hover:bg-[#111]"
    : "inline-flex items-center rounded-md px-3 py-2 text-sm font-medium text-[#56685d] transition hover:bg-[#f4f7f2] hover:text-[#183325] dark:text-[#aaa] dark:hover:bg-[#151515] dark:hover:text-white";

  if (link.to) {
    return (
      <NavLink className={className} key={link.label} to={link.to}>
        {link.label}
      </NavLink>
    );
  }

  return (
    <a className={className} href={link.href} key={link.label}>
      {link.label}
    </a>
  );
}

export default function TopNav({
  activeShift,
  businessName,
  darkMode,
  notificationButton,
  onLogout,
  onOpenLoginPage,
  onToggleTheme,
  publicLinks = [],
  publicActions = null,
  publicSearch = null,
  publicVariant = "catalog",
  session,
  showThemeToggle = true,
  mobileMenuButton = null,
  user,
}) {
  const isPublic = !session;
  const showActiveShiftBadge = session && user?.role === "vendedor" && activeShift;
  const isLanding = isPublic && publicVariant === "landing";
  const nativeApp = isNativeApp();

  return (
    <header className={isLanding ? "sticky top-0 z-40 px-3 pt-2 lg:px-6 lg:pt-5" : `sticky top-0 z-40 border-b border-[#dce8df] bg-white/95 backdrop-blur dark:border-[#222] dark:bg-black/95 ${nativeApp ? "pt-[env(safe-area-inset-top)]" : ""}`}>
      <div className={isLanding ? "mx-auto max-w-[1440px]" : `mx-auto max-w-[1440px] px-3 sm:px-4 lg:px-6`}>
        <div
          className={
            isLanding
              ? "mx-auto flex w-full max-w-[1320px] flex-row items-center justify-between gap-2 rounded-2xl border border-white/70 bg-white/88 px-3 py-2 shadow-[0_8px_24px_rgba(24,51,37,0.08)] backdrop-blur-md sm:px-5 sm:py-3 lg:flex-wrap"
              : `flex w-full items-center justify-between gap-2 ${isPublic ? "py-3 sm:py-4" : "py-3.5 sm:py-3"}`
          }
        >
          {session && mobileMenuButton ? <div className="shrink-0 lg:hidden">{mobileMenuButton}</div> : null}

          <NavLink className={`flex min-w-0 items-center gap-2 ${isLanding ? "flex-1 text-left lg:flex-1" : "flex-1 sm:flex-none"}`} to={session ? "/panel" : "/"}>
            <img alt="Fizzia" className={`shrink-0 object-contain ${isLanding ? "h-9 w-9 sm:h-12 sm:w-12" : "h-9 w-9 sm:h-11 sm:w-11"}`} src={FIZZIA_LOGO} />
            <div className="min-w-0">
              <strong className={`block truncate font-semibold text-[#0f1f16] dark:text-white ${session ? "text-sm sm:text-base" : "text-sm sm:text-[17px]"}`}>{businessName}</strong>
            </div>
          </NavLink>

          {!session && publicSearch ? <div className="order-3 w-full lg:order-none lg:flex-1 lg:px-4 xl:flex xl:min-w-[360px] xl:justify-center">{publicSearch}</div> : null}

          <div className="flex shrink-0 items-center justify-end gap-1.5 sm:gap-2">
            {!session && publicLinks.length ? <nav className="hidden items-center gap-1 lg:flex">{publicLinks.map((link) => <NavItem key={link.label} link={link} />)}</nav> : null}

            {showActiveShiftBadge ? (
              <div className="hidden items-center gap-2 rounded-xl border border-[#cfe5d5] bg-white px-3 py-2 text-sm font-semibold text-[#1f7a3a] shadow-[0_8px_20px_rgba(31,122,58,0.08)] dark:border-[#333] dark:bg-[#0a0a0a] dark:text-[#2fa84f] dark:shadow-[0_8px_20px_rgba(47,168,79,0.12)] md:inline-flex">
                <span className="relative inline-flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#2b8e46]/35 dark:bg-[#2fa84f]/35" />
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-[#1f7a3a] dark:bg-[#2fa84f]" />
                </span>
                Turno activo
              </div>
            ) : null}

            {!session ? publicActions : null}

            {showThemeToggle && !(nativeApp && session) ? (
              <>
                <span className="hidden sm:inline-flex">
                  <ThemeSwitch darkMode={darkMode} onToggle={onToggleTheme} />
                </span>
                <span className="inline-flex sm:hidden">
                  <ThemeSwitch compact darkMode={darkMode} onToggle={onToggleTheme} />
                </span>
              </>
            ) : null}

            {session ? (
              <>
                {nativeApp ? null : <div className="min-w-0">{notificationButton}</div>}
                <NavLink className="hidden rounded-md px-2 py-2 text-sm font-medium text-[#5b6d61] dark:text-white lg:block" to="/panel/perfil">
                  {fullName(user)}
                </NavLink>
                {nativeApp ? null : (
                  <NavLink aria-label="Abrir perfil" to="/panel/perfil">
                    <UserAvatar user={user} />
                  </NavLink>
                )}
                <button
                  className={`inline-flex h-9 w-9 items-center justify-center gap-2 rounded-xl bg-[#2fa84f] text-sm font-medium text-white shadow-[0_8px_18px_rgba(47,168,79,0.18)] transition hover:-translate-y-0.5 hover:bg-[#238b3e] hover:shadow-lg dark:bg-[#2fa84f] dark:text-white sm:h-auto sm:w-auto ${
                    isLanding
                      ? "rounded-xl px-4 py-2.5 shadow-[0_10px_24px_rgba(31,122,58,0.18)]"
                      : "sm:rounded-md sm:px-3 sm:py-2.5 sm:shadow-[0_8px_20px_rgba(47,168,79,0.14)]"
                  }`}
                  onClick={onLogout}
                  type="button"
                >
                  <Icon name="logout" />
                  <span className="hidden md:inline">Salir</span>
                </button>
              </>
            ) : (
              <button
                className={`inline-flex items-center justify-center gap-2 rounded-md bg-[#2fa84f] px-3 py-2.5 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(47,168,79,0.22)] transition hover:-translate-y-0.5 hover:bg-[#238b3e] hover:shadow-lg dark:bg-[#2fa84f] dark:text-white ${isLanding ? "flex-1 sm:flex-none" : ""} sm:px-4`}
                onClick={onOpenLoginPage}
                type="button"
              >
                <Icon name="login" />
                <span className={`${isLanding ? "inline" : "hidden md:inline"}`}>Iniciar sesion</span>
              </button>
            )}
          </div>

          {!session && publicLinks.length && !isLanding ? (
            <nav className={`order-4 w-full lg:hidden ${isLanding ? "grid grid-cols-2 gap-2" : "flex overflow-x-auto gap-2 pb-1"}`}>
              {publicLinks.map((link) => (
                <NavItem key={link.label} landingMobile={isLanding} link={link} />
              ))}
            </nav>
          ) : null}
        </div>
      </div>
    </header>
  );
}
