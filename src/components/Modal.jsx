import { useEffect } from "react";
import { createPortal } from "react-dom";

const modalBackStack = [];
let modalBackOrder = 0;

function getTopBackEntry() {
  return modalBackStack.reduce((top, entry) => {
    if (!top) return entry;
    if (entry.priority > top.priority) return entry;
    if (entry.priority === top.priority && entry.order > top.order) return entry;
    return top;
  }, null);
}

export function registerAppBackHandler(onBack, priority = 0) {
  if (typeof window === "undefined") return () => {};

  const entry = { id: Symbol("modal-back"), onBack, order: modalBackOrder += 1, priority };
  modalBackStack.push(entry);

  const handleBack = (event) => {
    if (event.defaultPrevented || getTopBackEntry()?.id !== entry.id) return;
    event.preventDefault();
    onBack?.();
  };

  window.addEventListener("app-modal-back", handleBack);
  return () => {
    window.removeEventListener("app-modal-back", handleBack);
    const index = modalBackStack.findIndex((item) => item.id === entry.id);
    if (index >= 0) modalBackStack.splice(index, 1);
  };
}

export default function Modal({ open, title, text, onClose, children, wide = false, closeOnBackdrop = false, variant = "default", containerClassName = "" }) {
  useEffect(() => {
    if (!open || variant === "page") return undefined;
    const previousOverflow = document.body.style.overflow;
    const previousOverscroll = document.documentElement.style.overscrollBehavior;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overscrollBehavior = "none";
    return () => {
      document.body.style.overflow = previousOverflow;
      document.documentElement.style.overscrollBehavior = previousOverscroll;
    };
  }, [open]);

  useEffect(() => {
    if (!open || variant === "page" || typeof window === "undefined") return undefined;
    return registerAppBackHandler(onClose);
  }, [onClose, open, variant]);

  if (!open) return null;

  const isPublic = variant === "public";
  const isPage = variant === "page";

  if (isPage) {
    return (
      <section className={`mx-auto w-full ${wide ? "max-w-[1024px]" : "max-w-[672px]"}`}>
        <div className={`flex w-full flex-col overflow-hidden rounded-2xl border border-[#dfe7db] bg-white p-4 shadow-[0_16px_36px_rgba(24,51,37,0.08)] dark:border-[#23314d] dark:bg-[#111827] sm:p-5 ${containerClassName}`}>
          <div className="mb-4 flex shrink-0 items-start justify-between gap-3 sm:mb-5">
            <div className="min-w-0">
              <h2 className="text-lg font-semibold leading-tight text-[#183325] dark:text-[#f8fafc] sm:text-2xl">{title}</h2>
              {text ? <p className="mt-1 text-sm leading-6 text-[#5b6d61] dark:text-[#c7d2e0]">{text}</p> : null}
            </div>
            <button
              aria-label="Cerrar"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-[#dfe7db] bg-white text-base font-semibold text-[#183325] transition hover:bg-white dark:border-[#314056] dark:bg-[#182235] dark:text-[#f8fafc] dark:hover:bg-[#1e293b]"
              onClick={onClose}
              type="button"
            >
              <span className="-mt-px">x</span>
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-visible">{children}</div>
        </div>
      </section>
    );
  }

  return createPortal(
    <div style={{ position: "fixed", inset: 0, zIndex: 50, overflowY: "auto", padding: "0.5rem", backgroundColor: "rgba(0,0,0,0.55)" }} className="backdrop-blur-sm sm:grid sm:place-items-center sm:p-4" onClick={closeOnBackdrop ? onClose : undefined}>
      <div
        className={`mx-auto mt-2 flex w-full max-h-[calc(100dvh-1rem)] flex-col overflow-hidden border p-4 shadow-[0_24px_60px_rgba(24,51,37,0.16)] dark:border-[#23314d] dark:bg-[#111827] sm:mt-0 sm:max-h-[calc(100dvh-2rem)] sm:p-5 ${
          isPublic
            ? "rounded-[28px] border-[#d6e6d9] bg-white"
            : "rounded-lg border-[#dfe7db] bg-white"
        } ${wide ? "max-w-[min(1024px,calc(100vw-1rem))]" : "max-w-[min(672px,calc(100vw-1rem))]"} ${containerClassName}`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex shrink-0 items-start justify-between gap-3 sm:mb-5">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold leading-tight text-[#183325] dark:text-[#f8fafc] sm:text-2xl">{title}</h2>
            {text ? <p className="mt-1 text-sm leading-6 text-[#5b6d61] dark:text-[#c7d2e0]">{text}</p> : null}
          </div>
          <button
            aria-label="Cerrar modal"
            className={`grid h-10 w-10 shrink-0 place-items-center text-base font-semibold text-[#183325] transition dark:border-[#314056] dark:bg-[#182235] dark:text-[#f8fafc] dark:hover:bg-[#1e293b] ${
              isPublic
                ? "rounded-full border border-[#d6e6d9] bg-white hover:bg-white"
                : "rounded-md border border-[#dfe7db] bg-white hover:bg-white"
            }`}
            onClick={onClose}
            type="button"
          >
            <span className="-mt-px">x</span>
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto pr-0.5">{children}</div>
      </div>
    </div>,
    document.body
  );
}
