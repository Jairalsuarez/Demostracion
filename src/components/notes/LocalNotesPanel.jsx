import { useEffect, useMemo, useState } from "react";
import { registerAppBackHandler } from "../Modal";
import Icon from "../ui/Icon";
import NoteListCard, { formatNoteDate } from "./NoteListCard";

const STORAGE_KEY = "sabores-local-notes";

function createNote(text) {
  const now = new Date().toISOString();
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    text,
    createdAt: now,
    updatedAt: now,
  };
}

function readNotes() {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed.filter((note) => note?.id) : [];
  } catch {
    return [];
  }
}

export default function LocalNotesPanel({ open, onClose }) {
  const [notes, setNotes] = useState(() => readNotes());
  const [view, setView] = useState("list");
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  const [draftText, setDraftText] = useState("");
  const sortedNotes = useMemo(() => [...notes].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)), [notes]);
  const selectedNote = notes.find((note) => note.id === selectedNoteId);
  const editingExisting = view === "edit" && Boolean(selectedNoteId);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    }
  }, [notes]);

  useEffect(() => {
    if (!open) return undefined;
    setView("list");
    setSelectedNoteId(null);
    setDraftText("");
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open || view === "list") return undefined;
    return registerAppBackHandler(() => setView("list"), 20);
  }, [open, view]);

  if (!open) return null;

  const openNewNote = () => {
    setSelectedNoteId(null);
    setDraftText("");
    setView("edit");
  };

  const openNote = (id) => {
    setSelectedNoteId(id);
    setView("detail");
  };

  const editNote = (id) => {
    const note = notes.find((item) => item.id === id);
    setSelectedNoteId(id);
    setDraftText(note?.text || "");
    setView("edit");
  };

  const deleteNote = (id) => {
    setNotes((current) => current.filter((note) => note.id !== id));
    if (selectedNoteId === id) {
      setSelectedNoteId(null);
      setView("list");
    }
  };

  const saveNote = () => {
    const text = draftText.trim();
    if (!text) {
      setView("list");
      setSelectedNoteId(null);
      return;
    }

    if (editingExisting) {
      setNotes((current) =>
        current.map((note) => (note.id === selectedNoteId ? { ...note, text, updatedAt: new Date().toISOString() } : note))
      );
      setView("detail");
      return;
    }

    const note = createNote(text);
    setNotes((current) => [note, ...current]);
    setSelectedNoteId(note.id);
    setView("detail");
  };

  const goBackToList = () => {
    setView("list");
    setSelectedNoteId(null);
    setDraftText("");
  };

  const title = view === "list" ? "Notas" : view === "detail" ? "Nota" : editingExisting ? "Editar nota" : "Nueva nota";

  return (
    <div className="fixed inset-0 z-[70] bg-[#0b1220]/40 backdrop-blur-[2px]" onClick={onClose}>
      <aside
        aria-label="Notas locales"
        className="ml-auto flex h-full w-full max-w-[480px] flex-col border-l border-[#dfe7db] bg-white text-[#183325] shadow-[-24px_0_60px_rgba(15,23,42,0.18)] dark:border-[#23314d] dark:bg-[#0f172a] dark:text-[#f8fafc]"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-[#edf1ea] px-4 py-4 pt-[calc(env(safe-area-inset-top)+1rem)] dark:border-[#23314d]">
          <div className="flex min-w-0 items-center gap-2">
            {view !== "list" ? (
              <button
                aria-label="Volver a notas"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-[#dfe7db] bg-white text-[#183325] transition hover:bg-[#f8faf6] dark:border-[#314056] dark:bg-[#182235] dark:text-[#f8fafc] dark:hover:bg-[#22304a]"
                onClick={goBackToList}
                type="button"
              >
                <Icon name="arrow_back" />
              </button>
            ) : null}
            <div className="min-w-0">
              <h2 className="truncate text-lg font-semibold leading-tight">{title}</h2>
              <p className="mt-1 text-sm text-[#6b7d72] dark:text-[#c7d2e0]">Estas notas solo se guardan en su telefono.</p>
            </div>
          </div>
          <button
            aria-label="Cerrar notas"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-[#dfe7db] bg-white text-[#183325] transition hover:bg-[#f8faf6] dark:border-[#314056] dark:bg-[#182235] dark:text-[#f8fafc] dark:hover:bg-[#22304a]"
            onClick={onClose}
            type="button"
          >
            <Icon name="close" />
          </button>
        </header>

        {view === "list" ? (
          <>
            <div className="flex shrink-0 items-center justify-between gap-3 px-4 py-3">
              <span className="text-sm font-medium text-[#6b7d72] dark:text-[#c7d2e0]">{notes.length} notas</span>
              <button
                className="inline-flex items-center gap-2 rounded-md bg-[#1f7a3a] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#17662f] dark:bg-[#2563eb] dark:hover:bg-[#1d4ed8]"
                onClick={openNewNote}
                type="button"
              >
                <Icon name="add" />
                Nueva
              </button>
            </div>

            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
              {sortedNotes.length ? (
                sortedNotes.map((note) => <NoteListCard key={note.id} note={note} onDelete={deleteNote} onEdit={editNote} onOpen={openNote} />)
              ) : (
                <div className="mt-8 rounded-lg border border-dashed border-[#cbd8ce] bg-[#f8faf6] px-4 py-8 text-center text-sm text-[#6b7d72] dark:border-[#314056] dark:bg-[#111827] dark:text-[#c7d2e0]">
                  Todavia no hay notas.
                </div>
              )}
            </div>
          </>
        ) : null}

        {view === "detail" ? (
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="flex shrink-0 items-center justify-between gap-3 px-4 py-3">
              <span className="text-sm font-medium text-[#6b7d72] dark:text-[#c7d2e0]">{formatNoteDate(selectedNote?.updatedAt)}</span>
              <button
                className="inline-flex items-center gap-2 rounded-md border border-[#dfe7db] bg-[#f8faf6] px-3 py-2 text-sm font-semibold text-[#1f7a3a] transition hover:bg-white dark:border-[#314056] dark:bg-[#182235] dark:text-[#93c5fd] dark:hover:bg-[#22304a]"
                onClick={() => editNote(selectedNoteId)}
                type="button"
              >
                <Icon name="edit" />
                Editar
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
              <div className="min-h-full whitespace-pre-wrap rounded-lg border border-[#dfe7db] bg-[#f8faf6] p-4 text-sm leading-6 text-[#183325] dark:border-[#314056] dark:bg-[#111827] dark:text-[#f8fafc]">
                {selectedNote?.text || "Nota sin contenido."}
              </div>
            </div>
          </div>
        ) : null}

        {view === "edit" ? (
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="flex shrink-0 items-center justify-end gap-3 px-4 py-3">
              <button
                className="rounded-md border border-[#dfe7db] px-4 py-2.5 text-sm font-semibold text-[#183325] transition hover:bg-[#f8faf6] dark:border-[#314056] dark:bg-[#182235] dark:text-[#f8fafc] dark:hover:bg-[#22304a]"
                onClick={editingExisting ? () => setView("detail") : goBackToList}
                type="button"
              >
                Cancelar
              </button>
              <button
                className="inline-flex items-center gap-2 rounded-md bg-[#1f7a3a] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#17662f] dark:bg-[#2563eb] dark:hover:bg-[#1d4ed8]"
                onClick={saveNote}
                type="button"
              >
                <Icon name="save" />
                Guardar
              </button>
            </div>
            <div className="min-h-0 flex-1 px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
              <textarea
                aria-label="Contenido de la nota"
                autoFocus
                className="h-full min-h-[320px] w-full resize-none rounded-lg border border-[#dfe7db] bg-[#f8faf6] p-4 text-sm leading-6 text-[#183325] outline-none transition placeholder:text-[#8a9a90] focus:border-[#1f7a3a] focus:ring-2 focus:ring-[#1f7a3a]/15 dark:border-[#314056] dark:bg-[#111827] dark:text-[#f8fafc] dark:placeholder:text-[#94a3b8] dark:focus:border-[#60a5fa] dark:focus:ring-[#60a5fa]/15"
                onChange={(event) => setDraftText(event.target.value)}
                placeholder="Escribe tu nota..."
                value={draftText}
              />
            </div>
          </div>
        ) : null}
      </aside>
    </div>
  );
}
