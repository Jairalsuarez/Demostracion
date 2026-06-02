import Modal from "../Modal";

export default function CloseShiftModal({ onClose, onConfirm, open, text = "Desea cerrar el turno actual?", title = "Cerrar turno" }) {
  return (
    <Modal containerClassName="max-w-[420px] p-4" open={open} onClose={onClose} text={text} title={title}>
      <div className="mx-auto w-full max-w-[280px]">
        <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
          <button
            className="rounded-xl bg-[#dc2626] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#b91c1c] dark:bg-[#ef4444] dark:hover:bg-[#dc2626]"
            onClick={onConfirm}
            type="button"
          >
            Cerrar turno
          </button>
          <button
            className="rounded-xl border border-[#d8dee4] px-5 py-3 text-sm font-semibold text-[#1f2937] transition hover:bg-[#f8fafc] dark:border-[#334155] dark:bg-[#172033] dark:text-white dark:hover:bg-[#22304a]"
            onClick={onClose}
            type="button"
          >
            Cancelar
          </button>
        </div>
      </div>
    </Modal>
  );
}
