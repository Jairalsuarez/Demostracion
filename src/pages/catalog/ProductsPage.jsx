import { useMemo, useState } from "react";
import ProductListTable from "../../components/catalog/ProductListTable";
import Icon from "../../components/ui/Icon";
import PageHeader from "../../components/ui/PageHeader";
import Pagination from "../../components/ui/Pagination";
import SectionBlock from "../../components/ui/SectionBlock";
import useCatalogFilters from "../../hooks/useCatalogFilters.jsx";

const PRODUCTS_PER_PAGE = 8;

function ProductsInventoryView({ canCreate, canEdit, money, onEdit, onNewProduct, onRemove, onView, products }) {
  const { filteredProducts, search, setSearch } = useCatalogFilters(products);
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedProducts = useMemo(() => {
    const start = (safeCurrentPage - 1) * PRODUCTS_PER_PAGE;
    return filteredProducts.slice(start, start + PRODUCTS_PER_PAGE);
  }, [filteredProducts, safeCurrentPage]);

  return (
    <div className="space-y-6">
      <PageHeader
        action={
          canCreate || canEdit ? (
            <div className="grid w-full gap-3 sm:flex sm:w-auto sm:flex-wrap sm:justify-end">
              {canCreate ? (
                <button className="inline-flex min-h-[56px] items-center justify-center gap-3 rounded-xl bg-[#1f7a3a] px-6 py-4 text-base font-semibold text-white shadow-[0_12px_26px_rgba(31,122,58,0.20)] transition active:scale-[0.99] dark:bg-[linear-gradient(135deg,#2563eb,#1d4ed8)]" onClick={onNewProduct} type="button">
                  <Icon name="add" />
                  Agregar producto
                </button>
              ) : null}
            </div>
          ) : null
        }
        eyebrow="Inventario"
        title={canEdit ? "Productos del panel" : "Productos disponibles"}
      />

      <SectionBlock title="Buscar producto">
        <label className="flex min-h-[54px] items-center gap-3 rounded-xl border border-[#dfe7db] bg-[#fbfcfa] px-4 py-3 dark:border-[#314056] dark:bg-[#0f172a]">
          <Icon className="shrink-0 text-[#1f7a3a] dark:text-[#93c5fd]" name="search" />
          <input
            className="min-w-0 flex-1 bg-transparent text-base text-[#183325] outline-none placeholder:text-[#7b8b80] dark:text-[#f8fafc] dark:placeholder:text-[#94a3b8]"
            onChange={(event) => {
              setSearch(event.target.value);
              setCurrentPage(1);
            }}
            placeholder="Buscar por nombre, marca o categoria"
            value={search}
          />
          {search ? (
            <button className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-[#5b6d61] active:bg-white dark:text-[#c7d2e0] dark:active:bg-[#182235]" onClick={() => setSearch("")} type="button">
              <Icon name="close" />
            </button>
          ) : null}
        </label>
      </SectionBlock>

      <SectionBlock description={`${filteredProducts.length} productos encontrados.`} title="Listado de productos">
        <div className="space-y-4">
          <ProductListTable
            canEdit={canEdit}
            emptyMessage="No hay productos con esos filtros."
            money={money}
            onEdit={onEdit}
            onRemove={onRemove}
            onView={onView}
            products={paginatedProducts}
          />

          <Pagination
            currentPage={safeCurrentPage}
            itemLabel="productos"
            onPageChange={setCurrentPage}
            pageSize={PRODUCTS_PER_PAGE}
            totalItems={filteredProducts.length}
            totalPages={totalPages}
          />
        </div>
      </SectionBlock>
    </div>
  );
}

export default function ProductsPage({ canCreate, canEdit, money, onNewProduct, onEdit, onRemove, onView, products }) {
  return <ProductsInventoryView canCreate={canCreate} canEdit={canEdit} money={money} onEdit={onEdit} onNewProduct={onNewProduct} onRemove={onRemove} onView={onView} products={products} />;
}
