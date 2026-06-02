import { useEffect } from "react";
import Icon from "./Icon";

const FIZZIA_URL = "https://fizzia.vercel.app/";

export default function AdOverlay({ ad, onClose }) {
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4">
      <div className="relative inline-block max-h-[90dvh] max-w-[90vw]">
        <button
          aria-label="Cerrar anuncio"
          className="absolute -right-3 -top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-[#2fa84f] text-white shadow-lg transition hover:bg-[#238b3e]"
          onClick={onClose}
          type="button"
        >
          <Icon className="text-[18px]" name="close" />
        </button>
        <a
          href={FIZZIA_URL}
          rel="noreferrer"
          target="_blank"
          className="block"
        >
          <img
            alt={ad.alt}
            className="max-h-[90dvh] max-w-[90vw] rounded-xl object-contain shadow-2xl"
            src={ad.image}
          />
        </a>
      </div>
    </div>
  );
}
