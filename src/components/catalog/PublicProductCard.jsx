import Icon from "../ui/Icon";
import { getOptimizedImageUrl } from "../../services/storageService.js";

export default function PublicProductCard({ money, onView, onWhatsApp, product }) {
  const description = product.descripcion?.trim() || "Sin descripcion";
  const stockTone =
    Number(product.stock) <= 0
      ? "bg-[#fff1f2] text-[#b91c1c]"
      : Number(product.stock) <= 5
        ? "bg-[#fff7ed] text-[#c2410c]"
        : "bg-[#f0fdf4] text-[#166534]";

  return (
    <article className="flex h-full min-h-[500px] flex-col overflow-hidden rounded-[28px] border border-[#e1ece3] bg-white shadow-[0_18px_34px_rgba(15,23,42,0.06)] transition hover:-translate-y-1 hover:shadow-[0_26px_45px_rgba(15,23,42,0.1)]">
      <button className="relative h-60 overflow-hidden bg-white" onClick={() => onView(product)} type="button">
        <img
          alt={product.nombre}
          className="h-full w-full object-cover transition duration-500 hover:scale-105"
          decoding="async"
          loading="lazy"
          src={getOptimizedImageUrl(product.imagen_url, { width: 640, height: 480 })}
        />
        <div className="absolute left-4 top-4 flex items-center gap-2">
          <span className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#5a7163] shadow-sm">{product.categoria}</span>
        </div>
      </button>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="line-clamp-1 text-xl font-semibold text-[#183325]">{product.nombre}</h3>
            <p className="mt-2 line-clamp-2 min-h-[48px] text-sm leading-6 text-[#5b6d61]">{description}</p>
          </div>
          <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${stockTone}`}>{Number(product.stock) > 0 ? `${product.stock} disp.` : "Agotado"}</span>
        </div>

        <div className="mt-auto pt-5">
          <div className="flex items-end justify-between gap-3">
            <strong className="text-3xl font-semibold text-[#183325]">{money(product.precio)}</strong>
            <button className="inline-flex items-center gap-2 text-sm font-semibold text-[#1f7a3a]" onClick={() => onView(product)} type="button">
              <Icon name="visibility" />
              Ver detalle
            </button>
          </div>

          <button className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#25d366] px-4 py-3 text-sm font-semibold text-white" onClick={() => onWhatsApp(product.nombre)} type="button">
            <Icon name="chat" />
            Consultar por WhatsApp
          </button>
        </div>
      </div>
    </article>
  );
}
