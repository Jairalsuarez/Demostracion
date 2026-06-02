import Icon from "../../components/ui/Icon";
import PublicPageShell from "../../components/public/PublicPageShell.jsx";

const BUSINESS_ADDRESS = "Calle 7 de Agosto y Franklin Torres, Parque Infantil local #4, Buena Fe, Ecuador";
const GOOGLE_MAPS_QUERY = encodeURIComponent(BUSINESS_ADDRESS);
const GOOGLE_MAPS_EMBED = `https://www.google.com/maps?q=${GOOGLE_MAPS_QUERY}&output=embed`;
const GOOGLE_MAPS_DIRECTIONS = `https://www.google.com/maps/dir/?api=1&destination=${GOOGLE_MAPS_QUERY}`;

export default function DirectionsPage({ app }) {
  return (
    <PublicPageShell
      app={app}
      badge="Visitanos"
      description="Encuentra la tienda fisica, revisa la direccion completa y abre la ruta en Google Maps con un solo toque."
      title="Como llegar"
    >
      <div className="grid gap-6 lg:grid-cols-[420px_minmax(0,1fr)]">
        <article className="rounded-[28px] border border-[#e4ece2] bg-white p-6 shadow-[0_18px_40px_rgba(24,51,37,0.06)]">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#f97316]">Visita la tienda</span>
          <h2 className="mt-3 text-2xl font-semibold">Ven directo al local</h2>
          <div className="mt-5 space-y-4 text-sm leading-7 text-[#5b6d61]">
            <p>
              <strong className="text-[#183325]">Direccion:</strong> Calle 7 de Agosto y Franklin Torres, en el Parque Infantil local #4.
            </p>
            <p>
              <strong className="text-[#183325]">Referencia:</strong> Buena Fe, Ecuador.
            </p>
            <p>
              <strong className="text-[#183325]">WhatsApp:</strong> {app.business.telefono}
            </p>
          </div>

          <div className="mt-6 grid gap-3">
            <a className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1f7a3a] px-4 py-3 text-sm font-medium text-white" href={GOOGLE_MAPS_DIRECTIONS} rel="noreferrer" target="_blank">
              <Icon name="near_me" />
              Visitar tienda
            </a>
            <a className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#dfe7db] bg-white px-4 py-3 text-sm font-medium text-[#183325]" href={`https://wa.me/${app.business.whatsapp}`} rel="noreferrer" target="_blank">
              <Icon name="chat" />
              Consultar por WhatsApp
            </a>
          </div>
        </article>

        <article className="overflow-hidden rounded-[28px] border border-[#e4ece2] bg-white shadow-[0_18px_40px_rgba(24,51,37,0.06)]">
          <iframe className="h-[420px] w-full border-0" loading="lazy" referrerPolicy="no-referrer-when-downgrade" src={GOOGLE_MAPS_EMBED} title="Mapa de la tienda" />
        </article>
      </div>
    </PublicPageShell>
  );
}
