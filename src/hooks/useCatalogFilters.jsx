import { useMemo, useState } from "react";

function normalizeSearchText(value = "") {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ñ/g, "n")
    .replace(/Ñ/g, "n")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function levenshteinDistance(a = "", b = "") {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  const previous = Array.from({ length: b.length + 1 }, (_, index) => index);
  const current = Array.from({ length: b.length + 1 }, () => 0);

  for (let i = 1; i <= a.length; i += 1) {
    current[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      current[j] = Math.min(previous[j] + 1, current[j - 1] + 1, previous[j - 1] + cost);
    }
    for (let j = 0; j <= b.length; j += 1) previous[j] = current[j];
  }

  return previous[b.length];
}

function tokenMatches(queryToken, targetWords, compactTarget) {
  if (!queryToken) return true;
  if (compactTarget.includes(queryToken)) return true;

  return targetWords.some((word) => {
    if (word.includes(queryToken) || queryToken.includes(word)) return true;
    if (queryToken.length < 3 || word.length < 3) return false;
    const limit = queryToken.length <= 4 ? 1 : Math.min(2, Math.floor(queryToken.length / 4));
    return levenshteinDistance(queryToken, word) <= limit;
  });
}

function productSearchScore(product, queryTokens) {
  const text = normalizeSearchText([product.nombre, product.categoria, product.marca, product.descripcion].filter(Boolean).join(" "));
  const words = text.split(" ").filter(Boolean);
  const compact = words.join("");

  if (!queryTokens.every((token) => tokenMatches(token, words, compact))) return -1;

  const name = normalizeSearchText(product.nombre);
  return queryTokens.reduce((score, token) => {
    if (name.startsWith(token)) return score + 8;
    if (name.includes(token)) return score + 5;
    if (compact.includes(token)) return score + 3;
    return score + 1;
  }, 0);
}

export default function useCatalogFilters(products = [], initialState = {}) {
  const [search, setSearch] = useState(initialState.search || "");

  const filteredProducts = useMemo(() => {
    const queryTokens = normalizeSearchText(search).split(" ").filter(Boolean);
    if (!queryTokens.length) {
      return [...products].sort((a, b) => String(a.nombre || "").localeCompare(String(b.nombre || "")));
    }

    return products
      .map((product) => ({ product, score: productSearchScore(product, queryTokens) }))
      .filter((item) => item.score >= 0)
      .sort((a, b) => b.score - a.score || String(a.product.nombre || "").localeCompare(String(b.product.nombre || "")))
      .map((item) => item.product);
  }, [products, search]);

  return {
    search,
    setSearch,
    filteredProducts,
  };
}
