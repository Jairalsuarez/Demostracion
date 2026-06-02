import { useRef, useState } from "react";
import Icon from "../ui/Icon";

const DELETE_THRESHOLD = 84;
const MAX_DRAG = 124;

export function formatNoteDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "00/00/0000 - 00:00";

  const twoDigits = (number) => String(number).padStart(2, "0");
  return `${twoDigits(date.getDate())}/${twoDigits(date.getMonth() + 1)}/${date.getFullYear()} - ${twoDigits(date.getHours())}:${twoDigits(date.getMinutes())}`;
}

export function getNoteTitle(note) {
  const firstLine = String(note?.text || "").split("\n").find((line) => line.trim());
  return firstLine?.trim() || "Nota sin titulo";
}

export function getNotePreview(note) {
  const text = String(note?.text || "").replace(/\s+/g, " ").trim();
  return text || "Toca para escribir esta nota.";
}

export default function NoteListCard({ note, onDelete, onEdit, onOpen }) {
  const [dragX, setDragX] = useState(0);
  const startXRef = useRef(null);
  const dragXRef = useRef(0);
  const movedRef = useRef(false);

  const resetDrag = () => {
    dragXRef.current = 0;
    startXRef.current = null;
    setDragX(0);
    window.setTimeout(() => {
      movedRef.current = false;
    }, 0);
  };

  const finishDrag = () => {
    const shouldDelete = Math.abs(dragXRef.current) >= DELETE_THRESHOLD;
    if (shouldDelete) {
      onDelete(note.id);
    }
    resetDrag();
  };

  return (
    <article className="relative h-[62px] overflow-hidden rounded-lg border border-[#dfe7db] bg-[#dc2626] dark:border-[#314056]">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex w-28 items-center justify-center text-sm font-semibold text-white">
        Eliminar
      </div>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex w-28 items-center justify-center text-sm font-semibold text-white">
        Eliminar
      </div>
      <div
        className="relative grid h-full touch-pan-y grid-cols-[minmax(0,1fr)_auto] items-center gap-2 bg-white px-3 py-2 transition-transform dark:bg-[#111827]"
        onClick={() => {
          if (!movedRef.current) onOpen(note.id);
        }}
        onPointerCancel={resetDrag}
        onPointerDown={(event) => {
          startXRef.current = event.clientX;
          dragXRef.current = 0;
          movedRef.current = false;
          event.currentTarget.setPointerCapture?.(event.pointerId);
        }}
        onPointerMove={(event) => {
          if (startXRef.current === null) return;
          const nextDragX = Math.max(-MAX_DRAG, Math.min(MAX_DRAG, event.clientX - startXRef.current));
          dragXRef.current = nextDragX;
          if (Math.abs(nextDragX) > 8) movedRef.current = true;
          setDragX(nextDragX);
        }}
        onPointerUp={finishDrag}
        style={{ transform: `translateX(${dragX}px)` }}
      >
        <button className="grid h-full min-w-0 content-center text-left" type="button">
          <span className="line-clamp-2 text-xs leading-4 text-[#183325] dark:text-[#f8fafc]">{getNotePreview(note)}</span>
          <span className="mt-0.5 block truncate text-[10px] font-medium text-[#8a9a90] dark:text-[#94a3b8]">{formatNoteDate(note.updatedAt)}</span>
        </button>
        <button
          aria-label="Editar nota"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[#dfe7db] bg-[#f8faf6] text-[#1f7a3a] transition hover:bg-white dark:border-[#314056] dark:bg-[#182235] dark:text-[#93c5fd] dark:hover:bg-[#22304a]"
          onClick={(event) => {
            event.stopPropagation();
            onEdit(note.id);
          }}
          type="button"
        >
          <Icon name="edit" />
        </button>
      </div>
    </article>
  );
}
