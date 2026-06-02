import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import AppFooter from "../../components/shell/AppFooter";
import TopNav from "../../components/shell/TopNav";
import Icon from "../../components/ui/Icon";

const HERO_SLIDES = [
  { src: "/images/ad%201.jpeg", type: "image" },
  { src: "/images/ad%202.jpeg", type: "image" },
  { src: "/images/buenafe.png", type: "image" },
  { src: "/images/trabajando.png", type: "image" },
];

export default function HomePage({ app, onOpenLoginPage }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const timeoutRef = useRef(null);
  const activeSlide = useMemo(() => HERO_SLIDES[activeIndex] || HERO_SLIDES[0], [activeIndex]);

  useEffect(() => {
    if (!activeSlide || activeSlide.type !== "image") return undefined;
    timeoutRef.current = window.setTimeout(() => {
      setActiveIndex((current) => (current + 1) % HERO_SLIDES.length);
    }, 30000);

    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, [activeSlide]);

  const goNext = () => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }
    setActiveIndex((current) => (current + 1) % HERO_SLIDES.length);
  };

  const goPrev = () => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }
    setActiveIndex((current) => (current - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  };

  return (
    <div className="min-h-screen bg-white text-[#183325]">
      <main className="relative min-h-screen overflow-hidden">
        <div className="absolute inset-x-0 top-0 z-30">
          <TopNav
            businessName={app.business.nombre}
            darkMode={false}
            onOpenLoginPage={onOpenLoginPage}
            publicActions={null}
            publicLinks={[
              { label: "About us", to: "/about-us" },
              { label: "Como llegar", to: "/como-llegar" },
            ]}
            publicVariant="landing"
            session={null}
            showThemeToggle={false}
            user={null}
          />
        </div>

        <section className="relative flex min-h-screen items-center justify-center px-4 pb-8 pt-24 sm:pt-32 lg:px-6 lg:pt-32">
          <div className="absolute inset-0">
            {activeSlide?.type === "video" ? (
              <video autoPlay className="h-full w-full object-cover" key={activeSlide.src} muted onEnded={goNext} playsInline src={activeSlide.src} />
            ) : (
              <img alt="Fondo de la tienda" className="h-full w-full object-cover" src={activeSlide?.src} />
            )}
          </div>

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(24,51,37,0.06),rgba(12,24,16,0.72)_72%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,17,10,0.18),rgba(7,17,10,0.5))]" />
          <div className="absolute inset-0 bg-[#112116]/22" />

          <div className="absolute bottom-5 right-5 z-10 hidden items-center gap-2 rounded-full border border-white/20 bg-[#102316]/36 px-3 py-2 backdrop-blur-sm md:flex">
            <button aria-label="Anterior" className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/18 bg-white/10 text-white/90 transition hover:bg-white/18" onClick={goPrev} type="button">
              <Icon name="chevron_left" />
            </button>
            <div className="flex items-center gap-2">
              {HERO_SLIDES.map((item, index) => (
                <button
                  key={item.src}
                  aria-label={`Ir al fondo ${index + 1}`}
                  className={`h-2.5 rounded-full transition ${index === activeIndex ? "w-6 bg-white" : "w-2.5 bg-white/45 hover:bg-white/70"}`}
                  onClick={() => setActiveIndex(index)}
                  type="button"
                />
              ))}
            </div>
            <button aria-label="Siguiente" className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/18 bg-white/10 text-white/90 transition hover:bg-white/18" onClick={goNext} type="button">
              <Icon name="chevron_right" />
            </button>
          </div>

          <div className="relative z-10 mx-auto w-full max-w-[620px] translate-y-8 sm:translate-y-4 lg:translate-y-14">
            <div className="rounded-[22px] border border-white bg-white p-4 text-center shadow-[0_22px_70px_rgba(12,24,16,0.2)] sm:p-5">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#f97316]">Bienvenido a</p>
                <h1 className="mt-3 text-[1.75rem] font-semibold leading-tight text-[#183325] sm:text-[2.35rem]">Demo</h1>
                <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-[#718579]">Horario de atencion</p>
                <p className="mt-2 text-sm font-semibold text-[#183325]">{app.business.horario}</p>

                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
                  <Link className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#1f7a3a] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#17612d] sm:w-auto" state={{ fromHome: true }} to="/productos">
                    <Icon name="storefront" />
                    Ver productos
                  </Link>
                  <Link className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#d7dfd2] bg-white px-4 py-2.5 text-sm font-semibold text-[#183325] transition hover:bg-white sm:w-auto" to="/como-llegar">
                    <Icon name="map" />
                    Como llegar
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <AppFooter />
    </div>
  );
}
