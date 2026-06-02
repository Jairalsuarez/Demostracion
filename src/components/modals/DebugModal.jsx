import { useEffect, useState } from "react";
import useSupabaseDebug from "../../hooks/useSupabaseDebug";
import Icon from "../ui/Icon";

export default function DebugModal({ open, onClose }) {
  const { results, loading, runDiagnotics } = useSupabaseDebug();
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    if (open && !results) {
      runDiagnotics();
    }
  }, [open, results, runDiagnotics]);

  if (!open) return null;

  const toggleExpand = (key) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const renderValue = (key, value) => {
    if (value === null || value === undefined) return <span className="text-gray-400">null</span>;
    if (typeof value === "boolean") return <span className={value ? "text-green-600" : "text-red-600"}>{value.toString()}</span>;
    if (typeof value === "object") {
      return (
        <div className="ml-2">
          <button onClick={() => toggleExpand(key)} className="text-xs text-blue-600 underline">
            {expanded[key] ? "Colapsar" : "Expandir"}
          </button>
          {expanded[key] && (
            <pre className="mt-1 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
              {JSON.stringify(value, null, 2)}
            </pre>
          )}
        </div>
      );
    }
    return <span className="text-sm">{String(value)}</span>;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full max-h-[80vh] overflow-auto m-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <h2 className="text-lg font-bold">Debug Supabase</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
            <Icon name="close" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {loading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-sm text-gray-600">Ejecutando diagnósticos...</p>
            </div>
          )}

          {!loading && !results && (
            <button
              onClick={runDiagnotics}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Ejecutar Diagnóstico
            </button>
          )}

          {results && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="font-semibold">Supabase Ready:</div>
                <div>{renderValue("ready", results.supabaseReady)}</div>
                
                <div className="font-semibold">URL:</div>
                <div>{renderValue("url", results.url)}</div>
                
                <div className="font-semibold">API Key:</div>
                <div>{renderValue("key", results.key)}</div>
              </div>

              {results.session && (
                <div className="border-t pt-3">
                  <h3 className="font-semibold mb-2">Sesión</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="font-semibold">Existe:</div>
                    <div>{renderValue("session.exists", results.session.exists)}</div>
                    
                    {results.session.exists && (
                      <>
                        <div className="font-semibold">User ID:</div>
                        <div className="text-xs break-all">{renderValue("session.userId", results.session.userId)}</div>
                        
                        <div className="font-semibold">Email:</div>
                        <div className="text-xs">{renderValue("session.email", results.session.email)}</div>
                      </>
                    )}
                    
                    {results.session.error && (
                      <>
                        <div className="font-semibold text-red-600">Error:</div>
                        <div className="text-red-600">{results.session.error}</div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {results.tests && (
                <div className="border-t pt-3">
                  <h3 className="font-semibold mb-2">Pruebas</h3>
                  <div className="space-y-2">
                    {Object.entries(results.tests).map(([key, test]) => (
                      <div key={key} className="border rounded p-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{key}</span>
                          {test.success !== undefined && (
                            <span className={test.success ? "text-green-600" : "text-red-600"}>
                              {test.success ? "✓ OK" : "✗ Falló"}
                            </span>
                          )}
                        </div>
                        
                        {test.error && (
                          <div className="mt-1 text-xs text-red-600 bg-red-50 p-2 rounded">
                            {typeof test.error === "object" ? (
                              <pre className="whitespace-pre-wrap">{JSON.stringify(test.error, null, 2)}</pre>
                            ) : (
                              test.error
                            )}
                          </div>
                        )}
                        
                        {test.data !== undefined && (
                          <div className="mt-1 text-xs">
                            <span className="font-medium">Datos: </span>
                            {renderValue(key + "_data", test.data)}
                          </div>
                        )}
                        
                        {test.count !== undefined && (
                          <div className="mt-1 text-xs">
                            <span className="font-medium">Cantidad: </span>{test.count}
                          </div>
                        )}
                        
                        {test.functions && (
                          <div className="mt-1 text-xs">
                            <span className="font-medium">Funciones: </span>{test.functions.join(", ") || "Ninguna"}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={runDiagnotics}
                disabled={loading}
                className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Ejecutando..." : "Repetir Diagnóstico"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
