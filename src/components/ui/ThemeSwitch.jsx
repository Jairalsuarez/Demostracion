import Icon from "./Icon";

export default function ThemeSwitch({ darkMode, onToggle, compact = false }) {
  return (
    <button
      aria-label={darkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      aria-pressed={darkMode}
      className={`relative inline-flex shrink-0 items-center rounded-full border transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2fa84f] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#07110b] ${
        compact ? "h-8 w-[62px]" : "h-11 w-20"
      } border-[#dce8df] bg-white shadow-[inset_0_1px_0_rgba(255,255,255,0.85),0_10px_24px_rgba(47,168,79,0.10)] hover:border-[#2fa84f] dark:border-[#1d3b28] dark:bg-[#0b1a10] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_14px_30px_rgba(0,0,0,0.28)]`}
      onClick={onToggle}
      type="button"
    >
      <span className="pointer-events-none absolute inset-0 grid grid-cols-2">
        <span className={`grid place-items-center transition ${darkMode ? "text-[#6f8b76]" : "scale-110 text-[#2fa84f]"}`}>
          <Icon className="text-[18px]" name="light_mode" />
        </span>
        <span className={`grid place-items-center transition ${darkMode ? "scale-110 text-[#65d984]" : "text-[#9aa8a0]"}`}>
          <Icon className="text-[18px]" name="dark_mode" />
        </span>
      </span>
      <span
        className={`absolute top-1 grid place-items-center rounded-full bg-white text-[#0f1f16] shadow-[0_8px_18px_rgba(47,168,79,0.18)] transition-transform duration-200 dark:bg-[#eaffee] dark:text-[#07110b] ${
          compact ? "h-6 w-6" : "h-9 w-9"
        } ${darkMode ? (compact ? "translate-x-[32px]" : "translate-x-[39px]") : "translate-x-1"}`}
      >
        <Icon className={compact ? "text-[15px]" : "text-[20px]"} name={darkMode ? "dark_mode" : "light_mode"} />
      </span>
    </button>
  );
}
