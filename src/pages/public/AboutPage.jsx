import PublicPageShell from "../../components/public/PublicPageShell.jsx";
import Icon from "../../components/ui/Icon";

export default function AboutPage({ app }) {
  return (
    <PublicPageShell
      app={app}
      badge="Nuestra esencia"
      description="Conoce mejor como trabajamos, que tipo de productos ofrecemos y por que nuestra experiencia esta pensada para que elegir y pedir sea algo rapido y claro."
      title="About us"
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-[28px] border border-[#e1ece3] bg-white p-6 shadow-[0_24px_48px_rgba(24,51,37,0.06)]">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-[#e1ece3] bg-white text-[#1f7a3a]">
            <Icon name="storefront" />
          </span>
          <h2 className="mt-5 text-2xl font-semibold">Nuestra propuesta</h2>
          <p className="mt-3 text-sm leading-7 text-[#5b6d61]">
            Trabajamos con bebidas, jugos y productos frescos pensados para venta diaria, atencion agil y una experiencia simple para el cliente. Queremos que pedir sea tan facil como ver, elegir y escribir.
          </p>
        </article>

        <article className="rounded-[28px] border border-[#e1ece3] bg-white p-6 shadow-[0_24px_48px_rgba(24,51,37,0.06)]">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-[#e1ece3] bg-white text-[#f97316]">
            <Icon name="support_agent" />
          </span>
          <h2 className="mt-5 text-2xl font-semibold">Como atendemos</h2>
          <p className="mt-3 text-sm leading-7 text-[#5b6d61]">
            La operacion esta organizada para que administracion, ventas y catalogo publico trabajen conectados. Eso nos ayuda a mantener mejor control de productos, pedidos y disponibilidad real.
          </p>
        </article>
      </div>
    </PublicPageShell>
  );
}
