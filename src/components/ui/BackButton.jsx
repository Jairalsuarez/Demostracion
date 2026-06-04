import { useLocation, useNavigate } from "react-router-dom";
import Icon from "./Icon";

export default function BackButton() {
  const navigate = useNavigate();
  const location = useLocation();

  if (location.pathname === "/panel") return null;

  return (
    <button
      className="fixed right-4 top-1/2 z-50 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-[#dce8df] bg-white/90 shadow-[0_4px_12px_rgba(47,168,79,0.1)] backdrop-blur transition active:scale-90 dark:border-[#333] dark:bg-black/80"
      onClick={() => navigate(-1)}
      type="button"
      aria-label="Volver"
    >
      <Icon className="text-[#0f1f16] dark:text-white" name="arrow_back" />
    </button>
  );
}
