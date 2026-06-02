import { useEffect, useMemo, useState } from "react";
import PublicProductCard from "../../components/catalog/PublicProductCard.jsx";
import PublicSearchBox from "../../components/catalog/PublicSearchBox.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";
import Icon from "../../components/ui/Icon";
import PageSkeleton from "../../components/ui/PageSkeleton.jsx";
import TopNav from "../../components/shell/TopNav";
import { trackPublicPageVisit } from "../../services/publicAnalyticsService.js";
import { openWhatsAppChat, resolveBusinessWhatsapp } from "../../services/publicContactService.js";
import { getOptimizedImageUrl } from "../../services/storageService.js";

const PRICE_RANGES = [
  { label: "Todos los precios", value: "todos" },
  { label: "Hasta $1", value: "under-1", min: 0, max: 1 },
  { label: "$1 a $3", value: "1-3", min: 1, max: 3 },
  { label: "$3 a $5", value: "3-5", min: 3, max: 5 },
  { label: "Mas de $5", value: "over-5", min: 5 },
];

function SectionHeading({ title, action }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="text-2xl font-semibold text-[#183325] sm:text-3xl">{title}</h2>
      </div>
      {action}
    </div>
  );
}

function FilterDropdown({ activeLabel, children, icon, name, onToggle, open }) {
  return (
    <div className="relative w-full sm:w-auto">
      <button
        className={`inline-flex w-full min-w-0 items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold transition sm:min-w-[170px] sm:w-auto ${
          open ? "border-[#1f7a3a] bg-white text-[#1f7a3a] shadow-[0_14px_28px_rgba(31,122,58,0.12)]" : "border-[#dfe7db] bg-white text-[#183325] hover:border-[#b9d2bf]"
        }`}
        onClick={onToggle}
        type="button"
      >
        <span className="inline-flex items-center gap-2">
          <Icon className="text-[18px]" name={icon} />
          {name}
        </span>
        <span className="inline-flex items-center gap-1 text-xs font-medium text-[#6a7b70]">
          {activeLabel}
          <Icon className="text-[18px]" name={open ? "keyboard_arrow_up" : "keyboard_arrow_down"} />
        </span>
      </button>

      <div className={`absolute left-0 right-0 top-[calc(100%+10px)] z-20 min-w-full rounded-2xl border border-[#dfe7db] bg-white p-2 shadow-[0_22px_45px_rgba(15,23,42,0.12)] sm:right-auto sm:min-w-[240px] ${open ? "block" : "hidden"}`}>
        {children}
      </div>
    </div>
  );
}

function FilterOption({ active, children, onClick }) {
  return (
    <button
      className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition ${
        active ? "bg-[#1f7a3a] font-semibold text-white" : "bg-white text-[#183325] hover:bg-white"
      }`}
      onClick={onClick}
      type="button"
    >
      {children}
      {active ? <Icon className="text-[18px]" name="check" /> : null}
    </button>
  );
}

function ProductCarouselCard({ money, onView, onWhatsApp, product }) {
  const description = product.descripcion?.trim() || "Sin descripcion";
  const optimizedImage = getOptimizedImageUrl(product.imagen_url, { width: 440, height: 360 });

  return (
    <article className="group flex min-w-[230px] max-w-[230px] flex-col overflow-hidden rounded-[22px] border border-[#e3e9e4] bg-white shadow-[0_14px_28px_rgba(15,23,42,0.06)] transition hover:-translate-y-1 hover:shadow-[0_22px_36px_rgba(15,23,42,0.1)] sm:min-w-[220px] sm:max-w-[220px]">
      <div className="relative p-3">
        <button
          className="absolute right-3 top-3 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/80 bg-white/90 text-[#6c7f73] shadow-sm"
          onClick={() => onView(product)}
          type="button"
        >
          <Icon className="text-[18px]" name="north_east" />
        </button>
        <button className="h-[180px] w-full overflow-hidden rounded-[18px] bg-[#f7faf8]" onClick={() => onView(product)} type="button">
          <img
            alt={product.nombre}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            decoding="async"
            fetchPriority="high"
            src={optimizedImage}
          />
        </button>
      </div>

      <div className="flex flex-1 flex-col p-4 pt-0">
        <div className="flex items-center gap-1 text-[#f6b400]">
          {Array.from({ length: 5 }).map((_, index) => (
            <Icon key={`${product.id}-star-${index}`} className="text-[14px]" name="star" />
          ))}
        </div>
        <h3 className="mt-3 text-lg font-semibold text-[#183325]">{product.nombre}</h3>
        <p className="mt-1 line-clamp-2 text-sm leading-5 text-[#5b6d61]">{description}</p>
        <p className="mt-1 text-xs uppercase tracking-[0.16em] text-[#6f8277]">{product.categoria}</p>
        <div className="mt-4 flex items-center justify-between gap-3">
          <strong className="text-lg font-semibold text-[#183325]">{money(product.precio)}</strong>
          <button className="inline-flex items-center gap-1 text-sm font-semibold text-[#1f7a3a]" onClick={() => onWhatsApp(product.nombre)} type="button">
            <Icon className="text-[18px]" name="chat" />
          </button>
        </div>
      </div>
    </article>
  );
}

export default function PublicCatalogPage({ app, money, onOpenLoginPage, onView, products }) {
  const contact = resolveBusinessWhatsapp(app);
  const [activeBrand, setActiveBrand] = useState("Todas");
  const [activeCategory, setActiveCategory] = useState("Todas");
  const [heroIndex, setHeroIndex] = useState(0);
  const [openFilter, setOpenFilter] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [priceRange, setPriceRange] = useState("todos");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("featured");

  const categories = useMemo(() => ["Todas", ...new Set(products.map((item) => item.categoria).filter(Boolean))], [products]);
  const brands = useMemo(() => {
    const uniqueBrands = [...new Set(products.map((item) => item.marca?.trim()).filter(Boolean))];
    const hasUnbranded = products.some((item) => !item.marca?.trim());
    return ["Todas", ...uniqueBrands, ...(hasUnbranded ? ["Sin marca"] : [])];
  }, [products]);
  const heroProducts = useMemo(() => products.slice(0, 5), [products]);
  const selectedPriceRange = PRICE_RANGES.find((item) => item.value === priceRange) || PRICE_RANGES[0];

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    const list = products.filter((product) => {
      const brand = product.marca?.trim() || "Sin marca";
      const price = Number(product.precio || 0);
      const selectedRange = PRICE_RANGES.find((item) => item.value === priceRange) || PRICE_RANGES[0];
      const matchesText =
        !query ||
        product.nombre?.toLowerCase().includes(query) ||
        product.descripcion?.toLowerCase().includes(query) ||
        product.categoria?.toLowerCase().includes(query) ||
        product.marca?.toLowerCase().includes(query);
      const matchesCategory = activeCategory === "Todas" || product.categoria === activeCategory;
      const matchesBrand = activeBrand === "Todas" || brand === activeBrand;
      const matchesPrice =
        selectedRange.value === "todos" ||
        (selectedRange.max ? price >= selectedRange.min && price <= selectedRange.max : price > selectedRange.min);

      return matchesText && matchesCategory && matchesBrand && matchesPrice;
    });

    if (sortBy === "price-asc") return [...list].sort((a, b) => Number(a.precio || 0) - Number(b.precio || 0));
    if (sortBy === "price-desc") return [...list].sort((a, b) => Number(b.precio || 0) - Number(a.precio || 0));
    if (sortBy === "name") return [...list].sort((a, b) => String(a.nombre || "").localeCompare(String(b.nombre || "")));

    return [...list].sort((a, b) => Number(b.stock || 0) - Number(a.stock || 0));
  }, [activeBrand, activeCategory, priceRange, products, search, sortBy]);

  const featuredProducts = filteredProducts;
  const visibleHeroProducts = useMemo(() => {
    if (!heroProducts.length) return [];
    const size = Math.min(4, heroProducts.length);
    return Array.from({ length: size }, (_, index) => heroProducts[(heroIndex + index) % heroProducts.length]);
  }, [heroIndex, heroProducts]);

  useEffect(() => {
    if (!heroProducts.length) return undefined;
    const timeout = window.setTimeout(() => {
      setHeroIndex((current) => (current + 1) % heroProducts.length);
    }, 5500);

    return () => window.clearTimeout(timeout);
  }, [heroIndex, heroProducts]);

  useEffect(() => {
    if (typeof window === "undefined" || !heroProducts.length) return;

    const preloadIndexes = [
      heroIndex,
      (heroIndex + 1) % heroProducts.length,
      (heroIndex + 2) % heroProducts.length,
      (heroIndex - 1 + heroProducts.length) % heroProducts.length,
    ];

    preloadIndexes.forEach((index) => {
      const imageUrl = getOptimizedImageUrl(heroProducts[index]?.imagen_url, { width: 440, height: 360 });
      if (!imageUrl) return;
      const image = new window.Image();
      image.src = imageUrl;
    });
  }, [heroIndex, heroProducts]);

  useEffect(() => {
    const timeout = window.setTimeout(() => setPageLoading(false), 420);
    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    trackPublicPageVisit();
  }, []);

  const openCatalogWhatsApp = (productName = "") => {
    const text = productName ? `Hola, me interesa ${productName}` : "Hola, quiero hacer un pedido";
    openWhatsAppChat({
      phone: contact.phone,
      text,
    });
  };

  if (pageLoading) {
    return <PageSkeleton />;
  }

  return (
    <div className="min-h-screen bg-white text-[#183325]">
      <TopNav
        businessName={app.business.nombre}
        darkMode={false}
        onOpenLoginPage={onOpenLoginPage}
        publicActions={null}
        publicSearch={
          <PublicSearchBox onChange={setSearch} products={products} value={search} />
        }
        publicLinks={[
          { label: "About us", to: "/about-us" },
          { label: "Como llegar", to: "/como-llegar" },
        ]}
        publicVariant="catalog"
        session={null}
        showThemeToggle={false}
        user={null}
      />

      <main className="mx-auto max-w-[1440px] px-4 py-6 lg:px-6 lg:py-10">
        <div className="space-y-8">
          {heroProducts.length ? (
            <section className="relative overflow-hidden rounded-[28px] border border-[#dfe7db] bg-white p-4 text-[#183325] shadow-[0_24px_60px_rgba(24,51,37,0.08)] sm:rounded-[34px] sm:p-6">
              <div className="relative z-10 flex flex-col gap-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex-1 text-center">
                    <h2 className="text-2xl font-semibold text-[#183325] sm:text-3xl">Recomendados del momento</h2>
                  </div>

                  <div className="flex items-center gap-2">
                    <button className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#dce7dd] bg-white text-[#183325]" onClick={() => setHeroIndex((heroIndex - 1 + heroProducts.length) % heroProducts.length)} type="button">
                      <Icon name="chevron_left" />
                    </button>
                    <button className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#dce7dd] bg-white text-[#183325]" onClick={() => setHeroIndex((heroIndex + 1) % heroProducts.length)} type="button">
                      <Icon name="chevron_right" />
                    </button>
                  </div>
                </div>

                <div className="-mx-1 flex gap-4 overflow-x-auto px-1 pb-1">
                  {visibleHeroProducts.map((product) => (
                    <ProductCarouselCard
                      key={`hero-${product.id}`}
                      money={money}
                      onView={onView}
                      onWhatsApp={openCatalogWhatsApp}
                      product={product}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-2 border-t border-[#eef3ef] pt-4">
                  {heroProducts.map((item, index) => (
                    <button
                      key={item.id}
                      aria-label={`Ir al producto ${index + 1}`}
                      className={`rounded-full transition ${index === heroIndex ? "h-2.5 w-8 bg-[#1f7a3a]" : "h-2.5 w-2.5 bg-[#c8d5cc]"}`}
                      onClick={() => setHeroIndex(index)}
                      type="button"
                    />
                  ))}
                </div>
              </div>
            </section>
          ) : null}

          <div className="space-y-8">
            <section className="rounded-[28px] border border-[#dbe8dd] bg-white p-4 shadow-[0_24px_55px_rgba(15,23,42,0.06)] sm:rounded-[32px] sm:p-6">
              <SectionHeading
                title="Todos los productos"
                action={
                  <button className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#dfe7db] bg-white px-4 py-3 text-sm font-semibold text-[#183325] sm:w-auto" onClick={() => {
                    setSearch("");
                    setActiveBrand("Todas");
                    setActiveCategory("Todas");
                    setOpenFilter(null);
                    setPriceRange("todos");
                    setSortBy("featured");
                  }} type="button">
                    <Icon name="restart_alt" />
                    Reiniciar filtros
                  </button>
                }
              />

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <FilterDropdown
                  activeLabel={activeCategory}
                  icon="category"
                  name="Categoria"
                  onToggle={() => setOpenFilter((current) => (current === "category" ? null : "category"))}
                  open={openFilter === "category"}
                >
                  {categories.map((category) => (
                    <FilterOption
                      key={category}
                      active={activeCategory === category}
                      onClick={() => {
                        setActiveCategory(category);
                        setOpenFilter(null);
                      }}
                    >
                      <span>{category}</span>
                    </FilterOption>
                  ))}
                </FilterDropdown>

                <FilterDropdown
                  activeLabel={selectedPriceRange.label}
                  icon="payments"
                  name="Precio"
                  onToggle={() => setOpenFilter((current) => (current === "price" ? null : "price"))}
                  open={openFilter === "price"}
                >
                  {PRICE_RANGES.map((range) => (
                    <FilterOption
                      key={range.value}
                      active={priceRange === range.value}
                      onClick={() => {
                        setPriceRange(range.value);
                        setOpenFilter(null);
                      }}
                    >
                      <span>{range.label}</span>
                    </FilterOption>
                  ))}
                </FilterDropdown>

                <FilterDropdown
                  activeLabel={activeBrand}
                  icon="sell"
                  name="Marcas"
                  onToggle={() => setOpenFilter((current) => (current === "brand" ? null : "brand"))}
                  open={openFilter === "brand"}
                >
                  {brands.map((brand) => (
                    <FilterOption
                      key={brand}
                      active={activeBrand === brand}
                      onClick={() => {
                        setActiveBrand(brand);
                        setOpenFilter(null);
                      }}
                    >
                      <span>{brand}</span>
                    </FilterOption>
                  ))}
                </FilterDropdown>
              </div>

              {featuredProducts.length ? (
                <div className="mt-8 grid items-stretch gap-4 sm:gap-5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                  {featuredProducts.map((product) => (
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
                <div className="mt-6 rounded-[24px] border border-dashed border-[#d8e4da] bg-[#fbfdfb] p-6">
                  <EmptyState description="No encontramos productos con esos filtros. Intenta con otra categoria, disponibilidad o termino de busqueda." title="Sin resultados" />
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
