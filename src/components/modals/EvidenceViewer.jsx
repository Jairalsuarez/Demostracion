import { useEffect } from "react";
import { registerAppBackHandler } from "../Modal";
import Icon from "../ui/Icon";

export default function EvidenceViewer({ name = "Evidencia del pago", onClose, open, url }) {
  useEffect(() => {
    if (!open || !url) return undefined;
    return registerAppBackHandler(onClose, 30);
  }, [onClose, open, url]);

  if (!open || !url) return null;

  return (
    <div className="fixed inset-0 z-[90] flex flex-col bg-[#06120c]/95 p-3 text-white" role="dialog" aria-modal="true" aria-label={name}>
      <div className="mx-auto flex w-full max-w-[720px] shrink-0 items-center justify-between gap-3 rounded-2xl bg-white/10 px-3 py-2 backdrop-blur">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/60">Evidencia</p>
          <h3 className="truncate text-sm font-semibold">{name}</h3>
        </div>
        <button className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-[#183325]" onClick={onClose} type="button" aria-label="Cerrar evidencia">
          <Icon name="close" />
        </button>
      </div>

      <div className="mx-auto mt-3 grid min-h-0 w-full max-w-[720px] flex-1 place-items-center overflow-hidden rounded-2xl bg-black/30">
        <img alt={name} className="max-h-full max-w-full object-contain" src={url} />
      </div>
    </div>
  );
}
