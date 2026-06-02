import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "../ui/Icon";
import { getOptimizedImageUrl } from "../../services/storageService.js";

const RECENT_SEARCHES_KEY = "public-catalog-recent-searches";

function matchesProduct(product, query) {
  const text = [product.nombre, product.categoria, product.marca, product.descripcion].filter(Boolean).join(" ").toLowerCase();
  return text.includes(query);
}

function getRecentSearches() {
  try {
    const parsed = JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY) || "[]");
    return Array.isArray(parsed) ? parsed.filter(Boolean).slice(0, 8) : [];
  } catch {
    return [];
  }
}

function saveRecentSearch(term) {
  const cleanTerm = term.trim();
  if (!cleanTerm) return;
  const recent = getRecentSearches().filter((item) => item.toLowerCase() !== cleanTerm.toLowerCase());
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify([cleanTerm, ...recent].slice(0, 8)));
}

export default function PublicSearchBox({ onChange, products, value }) {
  const navigate = useNavigate();
  const searchRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState(() => getRecentSearches());
  const query = value.trim().toLowerCase();
  const results = useMemo(() => {
    if (!query) return [];
    return products.filter((product) => matchesProduct(product, query)).slice(0, 5);
  }, [products, query]);

  const fillRecentSearch = (term) => {
    onChange(term);
    setOpen(true);
  };

  const goToResults = (term = value) => {
    const cleanTerm = term.trim();
    if (!cleanTerm) return;
    saveRecentSearch(cleanTerm);
    setRecentSearches(getRecentSearches());
    navigate(`/productos/resultados?q=${encodeURIComponent(cleanTerm)}`);
    setOpen(false);
  };

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!searchRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  return (
    <div className="relative w-full max-w-[560px]" ref={searchRef}>
      <label className="flex w-full items-center gap-3 rounded-full border border-[#dce7dd] bg-white px-5 py-3.5 shadow-[0_10px_24px_rgba(24,51,37,0.04)]">
        <Icon className="text-[#6c7f73]" name="search" />
        <input
          className="w-full border-0 bg-transparent text-[15px] text-[#183325] outline-none placeholder:text-[#819286]"
          onChange={(event) => {
            onChange(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              goToResults();
            }
          }}
          placeholder="Busca por nombre, categoria, marca o descripcion"
          value={value}
        />
      </label>

      {open ? (
        <div className="absolute left-0 right-0 top-[calc(100%+10px)] z-30 overflow-hidden rounded-[24px] border border-[#dfe7db] bg-white p-2 shadow-[0_24px_55px_rgba(15,23,42,0.14)]">
          <div className="flex items-center justify-between gap-3 px-3 py-2">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#f97316]">{query ? "Resultados" : "Busquedas recientes"}</span>
            {query ? (
              <button className="text-xs font-semibold text-[#1f7a3a]" onClick={() => goToResults()} type="button">
                Ver todos
              </button>
            ) : null}
          </div>

          {!query ? (
            <div className="grid gap-2 px-2 pb-2">
              {recentSearches.length ? (
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((term) => (
                  <button
                    className="inline-flex items-center gap-2 rounded-full border border-[#dfe7db] bg-white px-3 py-2 text-sm font-semibold text-[#183325] transition hover:border-[#1f7a3a] hover:text-[#1f7a3a]"
                    key={term}
                    onClick={() => fillRecentSearch(term)}
                    type="button"
                  >
                    <Icon className="text-[17px] text-[#1f7a3a]" name="history" />
                    {term}
                  </button>
                  ))}
                </div>
              ) : (
                <p className="px-1 py-2 text-sm text-[#5b6d61]">Tus busquedas recientes apareceran aqui.</p>
              )}
            </div>
          ) : results.length ? (
            <div className="max-h-[360px] overflow-y-auto">
              {results.map((product) => (
              <button
                className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#1f7a3a]/20"
                key={product.id}
                onClick={() => goToResults(product.nombre)}
                type="button"
              >
                <img alt={product.nombre} className="h-12 w-12 rounded-xl object-cover" decoding="async" loading="lazy" src={getOptimizedImageUrl(product.imagen_url, { width: 96, height: 96 })} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-[#183325]">{product.nombre}</span>
                  <span className="block truncate text-xs text-[#6a7b70]">{product.categoria}{product.marca ? ` - ${product.marca}` : ""}</span>
                </span>
                <Icon className="text-[#1f7a3a]" name="north_east" />
              </button>
              ))}
            </div>
          ) : (
            <button className="flex w-full items-center justify-between rounded-2xl px-3 py-3 text-left text-sm text-[#5b6d61]" onClick={() => goToResults()} type="button">
              Buscar "{value.trim()}"
              <Icon className="text-[#1f7a3a]" name="search" />
            </button>
          )}
        </div>
      ) : null}
    </div>
  );
}
