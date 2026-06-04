import { useState } from "react";
import Icon from "../ui/Icon";

export default function SelectedSaleProductCard({ line, index, product, money, onAdjust, onChange, onRemove }) {
  const [drag, setDrag] = useState({ active: false, startX: 0, currentX: 0 });
  const offsetX = drag.active ? drag.currentX - drag.startX : 0;
  const clampedOffset = Math.max(-96, Math.min(96, offsetX));
  const dismissing = Math.abs(offsetX) > 64;

  const finishDrag = () => {
    if (dismissing) onRemove(index);
    setDrag({ active: false, startX: 0, currentX: 0 });
  };

  return (
    <article className="relative w-full max-w-full overflow-hidden rounded-xl touch-pan-y">
      <div className={`absolute inset-y-0 ${clampedOffset >= 0 ? "left-0" : "right-0"} flex w-24 items-center ${clampedOffset >= 0 ? "justify-start pl-4" : "justify-end pr-4"} bg-[#fee2e2] text-[#dc2626] dark:bg-[#3b1115] dark:text-[#fca5a5]`}>
        <Icon name="delete" />
      </div>
      <div
        className="relative w-full max-w-full rounded-xl border border-[#edf1ea] bg-[#f8faf6] p-3 transition-[opacity,transform] dark:border-[#314056] dark:bg-[#0f172a]"
        onPointerCancel={finishDrag}
        onPointerDown={(event) => {
          if (event.pointerType === "mouse" && event.button !== 0) return;
          event.currentTarget.setPointerCapture?.(event.pointerId);
          setDrag({ active: true, startX: event.clientX, currentX: event.clientX });
        }}
        onPointerMove={(event) => {
          if (!drag.active) return;
          const nextOffset = event.clientX - drag.startX;
          if (Math.abs(nextOffset) > 8) event.preventDefault();
          setDrag((current) => ({ ...current, currentX: event.clientX }));
        }}
        onPointerUp={finishDrag}
        style={{ opacity: Math.max(0.55, 1 - Math.min(Math.abs(clampedOffset), 96) / 160), transform: `translateX(${clampedOffset}px)` }}
      >
        <div className="grid w-full max-w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
          <button className="grid min-w-0 grid-cols-[44px_minmax(0,1fr)] items-center gap-3 text-left" onClick={() => onChange(index)} type="button">
            <span className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-xl bg-[#eef2ff] text-[#2563eb]">
              {product.imagen_url ? <img alt={product.nombre} className="h-full w-full object-cover" src={product.imagen_url} /> : <Icon name="inventory_2" />}
            </span>
            <span className="min-w-0">
              <strong className="block max-w-full whitespace-normal break-words text-sm font-semibold leading-5 text-[#183325] dark:text-[#f8fafc]">{product.nombre}</strong>
              <span className="mt-1 block text-xs text-[#5b6d61] dark:text-[#c7d2e0]">{money(product.precio)} - stock {product.stock}</span>
            </span>
          </button>
          <div className="grid shrink-0 grid-cols-[32px_30px_32px] items-center rounded-xl border border-[#dfe7db] bg-white p-1 dark:border-[#314056] dark:bg-[#182235]">
            <button
              className="grid h-8 w-8 place-items-center rounded-lg text-[#183325] disabled:opacity-40 dark:text-white"
              disabled={Number(line.cantidad || 1) <= 1}
              onClick={() => onAdjust(index, -1)}
              onPointerDown={(event) => event.stopPropagation()}
              type="button"
            >
              <Icon name="remove" />
            </button>
            <span className="text-center text-sm font-bold text-[#183325] dark:text-[#f8fafc]">{line.cantidad || 1}</span>
            <button
              className="grid h-8 w-8 place-items-center rounded-lg text-[#183325] disabled:opacity-40 dark:text-white"
              disabled={Number(line.cantidad || 1) >= Number(product.stock || 0)}
              onClick={() => onAdjust(index, 1)}
              onPointerDown={(event) => event.stopPropagation()}
              type="button"
            >
              <Icon name="add" />
            </button>
          </div>
        </div>
        <p className="mt-2 text-[11px] font-medium text-[#9a3412] opacity-80 dark:text-[#fdba74]">Desliza para quitar</p>
      </div>
    </article>
  );
}
