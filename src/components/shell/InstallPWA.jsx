import { useCallback, useEffect, useState } from "react";
import Icon from "../ui/Icon";

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [installed, setInstalled] = useState(false);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    if (result.outcome === "accepted") {
      setInstalled(true);
      setDeferredPrompt(null);
    } else {
      setDeferredPrompt(null);
    }
  }, [deferredPrompt]);

  useEffect(() => {
    const beforeInstallHandler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const installedHandler = () => {
      setInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", beforeInstallHandler);
    window.addEventListener("appinstalled", installedHandler);

    return () => {
      window.removeEventListener("beforeinstallprompt", beforeInstallHandler);
      window.removeEventListener("appinstalled", installedHandler);
    };
  }, []);

  if (!deferredPrompt || installed) return null;

  return (
    <div className="border-t border-[#edf1ea] p-4 dark:border-[#23314d]">
      <button
        className="flex w-full items-center gap-3 rounded-xl bg-[linear-gradient(135deg,#1f7a3a,#2b8e46)] px-4 py-3 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(31,122,58,0.25)] transition active:scale-[0.98]"
        onClick={handleInstall}
        type="button"
      >
        <Icon name="install_mobile" />
        Instalar app
      </button>
    </div>
  );
}
