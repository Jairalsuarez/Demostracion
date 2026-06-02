import Icon from "../ui/Icon";

export default function PaymentMethodCard({ icon, label, selected, onClick }) {
  return (
    <button
      className={`flex min-h-[64px] w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition active:scale-[0.99] ${
        selected
          ? "border-[#f59e0b]/50 bg-[#fff7ed] shadow-[0_8px_18px_rgba(245,158,11,0.10)] dark:border-[#314056] dark:bg-[#182235]"
          : "border-[#e4ece2] bg-white active:bg-[#f7faf6] dark:border-[#23314d] dark:bg-[#111827] dark:active:bg-[#182235]"
      }`}
      onClick={onClick}
      type="button"
    >
      <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full text-xl ${selected ? "bg-[#f59e0b] text-white dark:bg-[#2563eb]" : "bg-[#eef6f0] text-[#1f7a3a] dark:bg-[#0f172a] dark:text-[#93c5fd]"}`}>
        <Icon name={icon} />
      </span>
      <span className="min-w-0 flex-1">
        <strong className="block truncate text-sm font-semibold text-[#183325] dark:text-[#f8fafc]">{label}</strong>
      </span>
      <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full ${selected ? "bg-[#1f7a3a] text-white dark:bg-[#2563eb]" : "bg-[#edf1ea] text-[#6a7b70] dark:bg-[#0f172a] dark:text-[#94a3b8]"}`}>
        <Icon className="text-base" name={selected ? "check" : "radio_button_unchecked"} />
      </span>
    </button>
  );
}
