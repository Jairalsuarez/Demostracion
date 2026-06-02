import { Link } from "react-router-dom";
import AppFooter from "../shell/AppFooter.jsx";
import TopNav from "../shell/TopNav";
import Icon from "../ui/Icon";
import { trackWhatsAppClick } from "../../services/publicAnalyticsService.js";

function StatPill({ icon, label, value }) {
  return (
    <div className="rounded-[22px] border border-[#e1ece3] bg-white px-4 py-3 shadow-[0_14px_32px_rgba(24,51,37,0.08)]">
      <div className="flex items-center gap-3">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#e1ece3] bg-white text-[#1f7a3a]">
          <Icon name={icon} />
        </span>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#718579]">{label}</p>
          <p className="mt-1 text-sm font-semibold text-[#183325]">{value}</p>
        </div>
      </div>
    </div>
  );
}

export default function PublicPageShell({ app, children, title, description, badge = "Atencion directa", actions = null, stats = [] }) {
  const summaryStats = stats.length
    ? stats
    : [
        { icon: "chat", label: "WhatsApp", value: app.business.whatsapp || "Disponible" },
        { icon: "schedule", label: "Horario", value: app.business.horario || "Atencion diaria" },
        { icon: "location_on", label: "Ubicacion", value: app.business.ubicacion || "Buena Fe, Ecuador" },
  ];

  return (
    <div className="min-h-screen bg-white text-[#183325]">
      <TopNav
        businessName={app.business.nombre}
        darkMode={false}
        onOpenLoginPage={() => {
          window.location.href = "/login";
        }}
        publicActions={null}
        publicLinks={[
          { label: "About us", to: "/about-us" },
          { label: "Como llegar", to: "/como-llegar" },
        ]}
        publicVariant="catalog"
        session={null}
        showThemeToggle={false}
        user={null}
      />

      <main className="relative overflow-hidden bg-white px-4 py-8 lg:px-6 lg:py-10">
        <div className="relative mx-auto max-w-[1440px] space-y-8">
          <section className="overflow-hidden rounded-[34px] border border-[#deebe0] bg-white p-6 shadow-[0_30px_70px_rgba(24,51,37,0.08)] lg:p-8">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_420px] lg:items-center">
              <div className="space-y-5">
                <span className="inline-flex rounded-full border border-[#f5d6bf] bg-[#fff5ee] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#f97316]">
                  {badge}
                </span>
                <div className="space-y-3">
                  <h1 className="max-w-3xl text-4xl font-semibold tracking-[-0.03em] text-[#183325] sm:text-5xl">{title}</h1>
                  <p className="max-w-3xl text-base leading-8 text-[#5b6d61]">{description}</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  {actions || (
                    <>
                      <Link
                        className="inline-flex items-center gap-2 rounded-xl bg-[linear-gradient(135deg,#1f7a3a,#2b8e46)] px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_30px_rgba(31,122,58,0.18)] transition hover:-translate-y-0.5"
                        state={{ fromPublicPage: true }}
                        to="/productos"
                      >
                        <Icon name="storefront" />
                        Ver catalogo
                      </Link>
                      <a
                        className="inline-flex items-center gap-2 rounded-xl border border-[#d9e5db] bg-white px-5 py-3 text-sm font-semibold text-[#183325]"
                        href={`https://wa.me/${app.business.whatsapp}`}
                        onClick={trackWhatsAppClick}
                        rel="noreferrer"
                        target="_blank"
                      >
                        <Icon name="chat" />
                        Escribir por WhatsApp
                      </a>
                    </>
                  )}
                </div>
              </div>

              <div className="grid gap-3">
                {summaryStats.map((item) => (
                  <StatPill key={`${item.label}-${item.value}`} icon={item.icon} label={item.label} value={item.value} />
                ))}
              </div>
            </div>
          </section>

          <section className="relative">{children}</section>
        </div>
      </main>

      <AppFooter />
    </div>
  );
}
