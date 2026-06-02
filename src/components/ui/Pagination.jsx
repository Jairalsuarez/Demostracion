function buildPageItems(currentPage, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, "...", totalPages];
  }

  if (currentPage >= totalPages - 3) {
    return [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }

  return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
}

export default function Pagination({
  currentPage,
  itemLabel = "elementos",
  onPageChange,
  pageSize,
  totalItems,
  totalPages,
}) {
  if (!totalItems) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);
  const pageItems = buildPageItems(currentPage, totalPages);

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-[#e4ece2] bg-white px-4 py-3 dark:border-[#23314d] dark:bg-[#111827] sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-[#5b6d61] dark:text-[#c7d2e0]">
        Mostrando {startItem}-{endItem} de {totalItems} {itemLabel}
      </p>

      {totalPages > 1 ? (
        <nav aria-label={`Paginacion de ${itemLabel}`} className="flex flex-wrap items-center gap-2">
          <button
            className="rounded-md border border-[#dfe7db] px-3 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#314056] dark:text-[#f8fafc]"
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
            type="button"
          >
            Anterior
          </button>

          {pageItems.map((item, index) =>
            item === "..." ? (
              <span key={`ellipsis-${index}`} className="px-2 text-sm text-[#6a7b70] dark:text-[#94a3b8]">
                ...
              </span>
            ) : (
              <button
                key={item}
                aria-current={item === currentPage ? "page" : undefined}
                className={`min-w-10 rounded-md px-3 py-2 text-sm font-medium transition ${
                  item === currentPage
                    ? "bg-[#1f7a3a] text-white"
                    : "border border-[#dfe7db] text-[#183325] hover:bg-[#f7faf6] dark:border-[#314056] dark:text-[#f8fafc] dark:hover:bg-[#1e293b]"
                }`}
                onClick={() => onPageChange(item)}
                type="button"
              >
                {item}
              </button>
            )
          )}

          <button
            className="rounded-md border border-[#dfe7db] px-3 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#314056] dark:text-[#f8fafc]"
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            type="button"
          >
            Siguiente
          </button>
        </nav>
      ) : null}
    </div>
  );
}
