import { useEffect, useState } from "react";
import Modal from "../Modal";

const primaryButtonClassName =
  "rounded-md bg-[#1f7a3a] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#17612d] disabled:cursor-not-allowed disabled:opacity-60";

const subtleButtonClassName =
  "rounded-md border border-[#dfe7db] px-4 py-3 text-sm font-medium text-[#183325] transition hover:bg-[#f7faf6] dark:border-white/10 dark:text-white dark:hover:bg-[#183325]";

export default function StartShiftModal({ onClose, onConfirm, open }) {
  const [confirmationAccepted, setConfirmationAccepted] = useState(false);

  useEffect(() => {
    if (open) setConfirmationAccepted(false);
  }, [open]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      text="Confirma el inicio del turno antes de habilitar tus ventas."
      title="Confirmar inicio de turno"
    >
      <div className="grid gap-4">
        <div className="rounded-lg border border-[#e4ece2] bg-[#f8faf6] p-4 text-sm leading-6 text-[#5b6d61]">
          Una vez inicies tu turno, no podras cerrarlo hasta que hayan pasado al menos 5 horas desde la activacion.
        </div>

        <label className="flex items-start gap-3 rounded-lg border border-[#dbe6d8] bg-white px-4 py-3">
          <input
            checked={confirmationAccepted}
            className="mt-1 h-4 w-4 rounded border-[#d0dcd0] text-[#1f7a3a] focus:ring-[#1f7a3a]"
            onChange={(e) => setConfirmationAccepted(e.target.checked)}
            type="checkbox"
          />
          <span className="text-sm leading-6 text-[#5b6d61]">
            Confirmo que entiendo esta condicion y acepto que el turno no podra cerrarse antes de 5 horas.
          </span>
        </label>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#edf1ea] pt-4">
          <button className={subtleButtonClassName} onClick={onClose} type="button">
            Cancelar
          </button>
          <button className={primaryButtonClassName} disabled={!confirmationAccepted} onClick={onConfirm} type="button">
            Iniciar turno
          </button>
        </div>
      </div>
    </Modal>
  );
}
