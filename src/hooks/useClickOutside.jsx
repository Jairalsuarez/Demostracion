import { useEffect } from "react";

export default function useClickOutside(ref, enabled, onOutsideClick) {
  useEffect(() => {
    if (!enabled) return undefined;

    const handlePointerDown = (event) => {
      if (!ref.current?.contains(event.target)) {
        onOutsideClick();
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [enabled, onOutsideClick, ref]);
}
