import { useState } from "react";
import Icon from "../ui/Icon";

function ToastCard({ toast, onDismiss }) {
  const [drag, setDrag] = useState({ active: false, startX: 0, currentX: 0 });
  const offsetX = drag.active ? drag.currentX - drag.startX : 0;
  const dismissThreshold = 90;
  const opacity = Math.max(0.35, 1 - Math.min(Math.abs(offsetX), 160) / 220);
  const dismissing = Math.abs(offsetX) >= dismissThreshold;

  const resetDrag = () => setDrag({ active: false, startX: 0, currentX: 0 });

  const finishDrag = () => {
    if (Math.abs(offsetX) >= dismissThreshold) {
      onDismiss(toast.id);
      resetDrag();
      return;
    }

    resetDrag();
  };

  return (
    <div className="pointer-events-auto relative w-full overflow-hidden rounded-xl sm:min-w-[280px] sm:max-w-[360px]">
      <div className={`absolute inset-y-0 ${offsetX >= 0 ? "left-0" : "right-0"} flex w-20 items-center ${offsetX >= 0 ? "justify-start pl-4" : "justify-end pr-4"} bg-[#fee2e2] text-[#dc2626] transition-opacity dark:bg-[#3b1115] dark:text-[#fca5a5] ${dismissing ? "opacity-100" : "opacity-0"}`}>
        <Icon name="delete" />
      </div>
    <div
      className="relative flex w-full touch-pan-y select-none items-center justify-between gap-3 rounded-xl border border-[#f3e7bd] bg-[#fff9e8] px-3 py-2.5 shadow-[0_10px_24px_rgba(15,23,42,0.12)] transition-[opacity,transform] dark:border-[#3c3341] dark:bg-[#171827] sm:px-4"
      onPointerCancel={finishDrag}
      onPointerDown={(event) => {
        event.currentTarget.setPointerCapture?.(event.pointerId);
        setDrag({ active: true, startX: event.clientX, currentX: event.clientX });
      }}
      onPointerMove={(event) => {
        if (!drag.active) return;
        setDrag((current) => ({ ...current, currentX: event.clientX }));
      }}
      onPointerUp={finishDrag}
      style={{ opacity, transform: `translateX(${offsetX}px)` }}
    >
      <div className="flex min-w-0 items-center gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white text-[#f97316] shadow-sm dark:bg-[#0f172a]">
          <Icon name={toast.type === "error" ? "error" : toast.type === "success" ? "check_circle" : "notifications"} />
        </span>
        <div className="min-w-0">
          <strong className="block truncate text-sm font-semibold text-[#2b2b2b] dark:text-white">{toast.type === "error" ? "Aviso" : toast.type === "success" ? "Listo" : "Notificacion"}</strong>
          <p className="line-clamp-2 text-sm leading-5 text-[#5f5f5f] dark:text-[#c7d2e0]">{toast.message}</p>
        </div>
      </div>
      <button
        className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-sm text-[#5b6d61] transition active:bg-white dark:text-[#c7d2e0] dark:active:bg-[#182235]"
        onClick={() => onDismiss(toast.id)}
        onPointerDown={(event) => event.stopPropagation()}
        type="button"
      >
        <Icon name="close" />
      </button>
      <span className="absolute inset-x-0 bottom-0 h-1 origin-left animate-[toastProgress_2.2s_linear] bg-[#f59e0b]" />
    </div>
    </div>
  );
}

export default function ToastViewport({ suspended = false, toasts, onDismiss }) {
  if (suspended) return null;

  return (
    <div className="pointer-events-none fixed inset-x-3 top-[calc(env(safe-area-inset-top)+0.5rem)] z-[70] space-y-2 sm:inset-x-auto sm:right-4 sm:top-4 sm:space-y-3">
      {toasts.map((toast) => (
        <ToastCard key={toast.id} onDismiss={onDismiss} toast={toast} />
      ))}
    </div>
  );
}
