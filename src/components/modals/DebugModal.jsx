import { useState } from "react";
import Icon from "../ui/Icon";

const APP_KEY = "ventas-app-v2";
const SESSION_KEY = "ventas-local-session-v2";

function readLocalStorage(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function DebugModal({ open, onClose }) {
  const [expanded, setExpanded] = useState({});

  if (!open) return null;

  const appData = readLocalStorage(APP_KEY);
  const session = readLocalStorage(SESSION_KEY);
  const cookieRaw = document.cookie;

  const toggleKey = (key) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const data = {
    "Session (localStorage)": session,
    "App Data Keys": appData ? Object.keys(appData) : null,
    "Productos": appData?.products?.length ?? 0,
    "Ventas": appData?.sales?.length ?? 0,
    "Gastos": appData?.expenses?.length ?? 0,
    "Turnos": appData?.turnos?.length ?? 0,
    "Usuarios": appData?.users?.length ?? 0,
    "Cookies": cookieRaw || "(ninguna)",
    "User Agent": navigator.userAgent,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full max-h-[80vh] overflow-auto m-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <h2 className="text-lg font-bold">Debug Local</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
            <Icon name="close" />
          </button>
        </div>

        <div className="p-4 space-y-3">
          {Object.entries(data).map(([key, value]) => (
            <div key={key} className="border rounded p-3 text-sm dark:border-gray-600">
              <div className="flex items-center justify-between">
                <span className="font-semibold">{key}</span>
                <button onClick={() => toggleKey(key)} className="text-xs text-blue-600 underline">
                  {expanded[key] ? "Colapsar" : "Expandir"}
                </button>
              </div>
              {expanded[key] && (
                <pre className="mt-2 text-xs bg-gray-100 dark:bg-gray-900 p-2 rounded overflow-auto max-h-48 whitespace-pre-wrap">
                  {typeof value === "object" ? JSON.stringify(value, null, 2) : String(value)}
                </pre>
              )}
              {!expanded[key] && typeof value === "number" && (
                <p className="mt-1 text-gray-600 dark:text-gray-400">{value}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
