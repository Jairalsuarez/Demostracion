import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import PublicProductCard from "../../components/catalog/PublicProductCard.jsx";
import PublicSearchBox from "../../components/catalog/PublicSearchBox.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";
import Icon from "../../components/ui/Icon";
import TopNav from "../../components/shell/TopNav";
import { trackPublicPageVisit } from "../../services/publicAnalyticsService.js";
import { openWhatsAppChat, resolveBusinessWhatsapp } from "../../services/publicContactService.js";

function productMatches(product, query) {
  const text = [product.nombre, product.categoria, product.marca, product.descripcion].filter(Boolean).join(" ").toLowerCase();
  return text.includes(query);
}

export default function PublicSearchResultsPage({ app, money, onOpenLoginPage, onView, products }) {
  const [params] = useSearchParams();
  const initialQuery = params.get("q") || "";
  const [search, setSearch] = useState(initialQuery);
  const contact = resolveBusinessWhatsapp(app);
  const query = initialQuery.trim().toLowerCase();

  const results = useMemo(() => {
    if (!query) return products;
    return products.filter((product) => productMatches(product, query));
  }, [products, query]);

  useEffect(() => {
    setSearch(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    trackPublicPageVisit();
  }, []);

  const openCatalogWhatsApp = (productName = "") => {
    openWhatsAppChat({
      phone: contact.phone,
      text: productName ? `Hola, me interesa ${productName}` : "Hola, quiero hacer un pedido",
    });
  };

  return (
    <div className="min-h-screen bg-white text-[#183325]">
      <TopNav
        businessName={app.business.nombre}
        darkMode={false}
        onOpenLoginPage={onOpenLoginPage}
        publicActions={null}
        publicSearch={<PublicSearchBox onChange={setSearch} products={products} value={search} />}
        publicLinks={[
          { label: "About us", to: "/about-us" },
          { label: "Como llegar", to: "/como-llegar" },
        ]}
        publicVariant="catalog"
        session={null}
        showThemeToggle={false}
        user={null}
      />

      <main className="mx-auto max-w-[1440px] px-4 py-8 lg:px-6 lg:py-10">
        <section className="rounded-[32px] border border-[#dbe8dd] bg-white p-6 shadow-[0_24px_55px_rgba(15,23,42,0.06)]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <Link className="inline-flex items-center gap-2 text-sm font-semibold text-[#1f7a3a]" to="/productos">
                <Icon name="arrow_back" />
                Volver al catalogo
              </Link>
              <h1 className="mt-4 text-3xl font-semibold text-[#183325]">Resultados de busqueda</h1>
              <p className="mt-2 text-sm text-[#5b6d61]">
                {query ? `Resultados para "${initialQuery}"` : "Explora todos los productos disponibles."}
              </p>
            </div>
          </div>

          {results.length ? (
            <div className="mt-8 grid items-stretch gap-5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {results.map((product) => (
                <PublicProductCard
                  key={product.id}
                  money={money}
                  onView={onView}
                  onWhatsApp={openCatalogWhatsApp}
                  product={product}
                />
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-[24px] border border-dashed border-[#d8e4da] bg-white p-6">
              <EmptyState description="Intenta buscar por nombre, categoria, marca o una palabra de la descripcion." title="Sin resultados" />
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
