import { useEffect, useState } from "react";
import { isNativeApp } from "../../utils/platform.js";

const LOGO_URL = "/images/Logo%20Fizzia.svg";

export default function NativeBootSplash({ checking = false }) {
  const [visible, setVisible] = useState(() => isNativeApp());
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (!visible) return undefined;
    if (checking) return undefined;
    const leaveTimer = window.setTimeout(() => setLeaving(true), 180);
    const hideTimer = window.setTimeout(() => setVisible(false), 520);
    return () => {
      window.clearTimeout(leaveTimer);
      window.clearTimeout(hideTimer);
    };
  }, [checking, visible]);

  if (!visible) return null;

  return (
    <div className={`native-boot-splash ${checking ? "native-boot-splash--checking" : ""} ${leaving ? "native-boot-splash--leave" : ""}`} aria-hidden="true">
      <div className="native-boot-splash__logo">
        <img alt="" src={LOGO_URL} />
      </div>
    </div>
  );
}
