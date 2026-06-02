const FIZZIA_URL = "https://fizzia.vercel.app/";

export default function AppFooter() {
  return (
    <footer className="bg-[#0f3b1d] px-4 py-14 text-[#dff7e5]">
      <div className="mx-auto grid max-w-[1440px] gap-10 lg:grid-cols-[1.2fr_0.9fr_1fr] lg:px-6">
        <div>
          <img alt="Fizzia" className="h-12 w-12 object-contain" src="/images/Logo%20Fizzia.svg" />
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.26em] text-[#65d984]">Fizzia</p>
          <p className="mt-4 max-w-md text-sm leading-7">
            Esta demo fue preparada por Fizzia para mostrar como una operacion comercial puede verse mas clara, rapida y profesional.
          </p>
        </div>

        <div>
          <p className="text-lg font-semibold text-white">Demo comercial</p>
          <ul className="mt-4 space-y-3 text-sm">
            <li>Ventas, caja e inventario en un recorrido controlado.</li>
            <li>Marca consistente para presentaciones con clientes.</li>
            <li>Datos locales para probar sin depender de servicios externos.</li>
          </ul>
        </div>

        <div>
          <p className="text-lg font-semibold text-white">Conoce Fizzia</p>
          <p className="mt-4 text-sm leading-7">Creamos interfaces, sistemas y experiencias digitales que ayudan a vender mejor.</p>
          <a
            className="mt-4 inline-flex items-center gap-3 rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-[#0f3b1d] transition hover:bg-[#eaffee]"
            href={FIZZIA_URL}
            rel="noreferrer"
            target="_blank"
          >
            fizzia.vercel.app
          </a>
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-[1440px] border-t border-white/10 pt-5 text-center text-xs text-[#a7cdb0] lg:px-6">
        Fizzia Ventas Demo - Todos los derechos reservados.
      </div>
    </footer>
  );
}
