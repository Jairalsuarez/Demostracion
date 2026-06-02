import Modal from "../Modal";
import Icon from "../ui/Icon";
import { trackWhatsAppClick } from "../../services/publicAnalyticsService.js";

export default function ProductDetailsModal({ money, onClose, open, product, variant = "default", whatsappNumber }) {
  const isPublic = variant === "public";
  const stockTone =
    Number(product?.stock) <= 0
      ? "bg-[#fff1f2] text-[#b91c1c]"
      : Number(product?.stock) <= 5
        ? "bg-[#fff7ed] text-[#c2410c]"
        : "bg-[#f0fdf4] text-[#166534]";
  const description = product?.descripcion?.trim() || "Sin descripcion";
  const whatsapp = product ? `https://wa.me/${whatsappNumber || ""}?text=${encodeURIComponent(`Hola, me interesa ${product.nombre}`)}` : "#";

  return (
    <Modal closeOnBackdrop open={open} onClose={onClose} text={product?.categoria || ""} title={product?.nombre || "Producto"} variant={variant} wide>
      <div className="grid gap-5 lg:grid-cols-[minmax(320px,1fr)_380px] lg:items-stretch">
        <div className={`overflow-hidden p-3 sm:p-4 dark:bg-[#0d1710] ${isPublic ? "rounded-[24px] bg-white" : "rounded-xl bg-white"}`}>
          <div className={`flex h-[280px] items-center justify-center overflow-hidden sm:h-[420px] lg:h-[520px] dark:bg-[#122117] ${isPublic ? "rounded-[20px] bg-white" : "rounded-lg bg-white"}`}>
            <img className="h-full w-full object-contain" src={product?.imagen_url} alt={product?.nombre} />
          </div>
        </div>
        <div className={`flex min-h-0 flex-col border p-4 sm:p-5 dark:border-white/10 dark:bg-[#122117] lg:h-[520px] ${isPublic ? "rounded-[24px] border-[#dceadf] bg-white" : "rounded-xl border-[#e4ece2] bg-white"}`}>
          <div className="space-y-5">
            <div className="space-y-2">
              <span className="inline-flex rounded-full bg-[#f4f8ef] px-3 py-1 text-xs font-semibold text-[#56705d] dark:bg-[#1d3425] dark:text-white/70">{product?.categoria}</span>
              <h3 className="text-2xl font-semibold text-[#183325] dark:text-white sm:text-3xl">{product?.nombre}</h3>
              <p className="text-sm leading-7 text-[#5b6d61] dark:text-white/68">{description}</p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <strong className="text-3xl font-semibold text-[#183325] dark:text-white sm:text-4xl">{money(product?.precio)}</strong>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${stockTone}`}>{Number(product?.stock) > 0 ? `${product?.stock} disponibles` : "Agotado"}</span>
            </div>

            <div className={`border p-4 dark:border-white/10 dark:bg-[#0d1710] ${isPublic ? "rounded-[20px] border-[#edf1ea] bg-white" : "rounded-lg border-[#edf1ea] bg-white"}`}>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#f97316]">Detalles del producto</p>
              <ul className="mt-3 space-y-2 text-sm text-[#5b6d61] dark:text-white/65">
                <li>Categoria: {product?.categoria}</li>
                <li>Marca: {product?.marca?.trim() || "Sin marca"}</li>
                <li>Precio: {money(product?.precio)}</li>
                <li>Stock disponible: {product?.stock}</li>
              </ul>
            </div>
          </div>

          <div className="mt-auto grid gap-3 pt-5">
            {isPublic ? (
              <a className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#25d366] px-4 py-3 text-sm font-medium text-white" href={whatsapp} onClick={trackWhatsAppClick} rel="noreferrer" target="_blank">
                <Icon name="chat" />
                Consultar por WhatsApp
              </a>
            ) : null}

            <button className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-[#dfe7db] px-4 py-3 text-sm font-medium dark:border-white/10" onClick={onClose} type="button">
              <Icon name="close" />
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
