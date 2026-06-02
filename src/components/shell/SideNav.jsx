import { NavLink } from "react-router-dom";
import Icon from "../ui/Icon";
import InstallPWA from "./InstallPWA";

const baseLink = "flex items-center gap-3 rounded-md px-4 py-3 text-base font-medium transition whitespace-nowrap";

export default function SideNav({ businessName = "Demo", open = false, onClose = () => {}, user }) {
  const links = [
    { to: "/panel", label: "Resumen", icon: "dashboard", end: true },
    { to: "/panel/ventas", label: "Ventas", icon: "receipt_long" },
    { to: "/panel/saldo", label: "Saldo", icon: "account_balance_wallet" },
    { to: "/panel/productos", label: "Inventario", icon: "inventory_2" },
  ];

  return (
    <>
    <button
      aria-label="Cerrar menu"
      className={`fixed inset-0 z-40 bg-[#07110b]/35 backdrop-blur-[2px] transition-opacity duration-300 lg:hidden ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
      onClick={onClose}
      type="button"
    />
    <aside className={`fixed inset-y-0 left-0 z-50 w-[min(84vw,320px)] origin-left overflow-hidden border-r border-[#dce8df] bg-white shadow-[24px_0_70px_rgba(15,31,22,0.16)] transition-[opacity,transform] duration-300 ease-out dark:border-[#222] dark:bg-black lg:sticky lg:top-[65px] lg:z-auto lg:h-[calc(100dvh-65px)] lg:w-[270px] lg:translate-x-0 lg:border-r lg:opacity-100 lg:shadow-none ${open ? "translate-x-0 opacity-100" : "pointer-events-none -translate-x-full opacity-0 lg:pointer-events-auto"}`}>
        <div className="bg-white px-5 pb-5 pt-[calc(env(safe-area-inset-top)+1.25rem)] dark:bg-[#0a0a0a] lg:hidden">
          <div className="flex items-start justify-between gap-3">
            <span className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-2xl bg-white text-[#2fa84f] shadow-sm dark:bg-black dark:text-[#2fa84f]">
              {user?.avatarUrl ? <img alt={user.displayName || user.email || "Usuario"} className="h-full w-full object-cover" src={user.avatarUrl} /> : <Icon name="person" />}
            </span>
            <button className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-[#5c7162] transition active:bg-white dark:text-[#aaa] dark:active:bg-black" onClick={onClose} type="button">
              <Icon name="close" />
            </button>
          </div>
          <div className="mt-4 min-w-0">
            <strong className="block truncate text-base font-semibold text-[#0f1f16] dark:text-white">{user?.displayName || businessName}</strong>
            <span className="mt-1 block truncate text-xs text-[#5c7162] dark:text-[#aaa]">{user?.email || "Panel administrativo"}</span>
          </div>
        </div>
      <nav className="grid gap-1 p-3 lg:p-4">
        {links.map((link) => (
          <NavLink
            key={link.to}
            className={({ isActive }) =>
              `${baseLink} min-h-[48px] min-w-0 ${
                isActive
                  ? "bg-[#edf8f0] text-[#167232] dark:bg-[#111] dark:text-[#2fa84f]"
                  : "text-[#435648] hover:bg-[#f5fbf6] dark:text-[#aaa] dark:hover:bg-[#0a0a0a]"
              }`
            }
            end={link.end}
            onClick={onClose}
            to={link.to}
          >
            <Icon className="text-[23px]" name={link.icon} />
            <span className="max-w-full truncate">{link.label}</span>
          </NavLink>
        ))}
      </nav>
      <InstallPWA />
    </aside>
    </>
  );
}
