import { useState } from "react";

const MESSAGES = [
  "Visita nuestra pagina web y recibe un 50% de descuento",
  "Si estas interesado en un sistema similar pero personalizado, visita nuestra pagina web",
  "Escribenos directamente por Whatsapp al 0989200977",
  "Transforma tu negocio con un sistema a tu medida — Contáctame",
];

export default function TopMarquee() {
  const [index, setIndex] = useState(0);

  const handleAnimationEnd = () => {
    setIndex((i) => (i + 1) % MESSAGES.length);
  };

  return (
    <div className="relative h-9 overflow-hidden bg-[#1f7a3a] dark:bg-[#2fa84f]">
      <div className="flex h-full items-center whitespace-nowrap px-0">
        <span
          className="animate-marquee inline-block text-xs font-semibold text-white"
          key={index}
          onAnimationEnd={handleAnimationEnd}
          style={{ animationDuration: "12s" }}
        >
          {MESSAGES[index]}
        </span>
      </div>
    </div>
  );
}
