import { trackWhatsAppClick } from "./publicAnalyticsService.js";

export function sanitizeWhatsappNumber(value) {
  const digits = String(value || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("593")) return digits;
  if (digits.length === 10 && digits.startsWith("0")) return `593${digits.slice(1)}`;
  if (digits.length === 9 && digits.startsWith("9")) return `593${digits}`;
  return digits;
}

export function resolveBusinessWhatsapp(app) {
  return {
    phone: sanitizeWhatsappNumber(app?.business?.whatsapp || app?.business?.telefono),
    label: app?.business?.nombre || "administracion",
    source: "business",
  };
}

export function buildWhatsAppMessage(label, productName = "") {
  const product = productName ? `me interesa ${productName}` : "quiero hacer un pedido";
  return `Hola, ${product}`;
}

export function openWhatsAppChat({ phone, text }) {
  const cleanPhone = sanitizeWhatsappNumber(phone);
  if (!cleanPhone || typeof window === "undefined") return false;

  const encodedText = encodeURIComponent(text || "");
  const webUrl = `https://wa.me/${cleanPhone}${encodedText ? `?text=${encodedText}` : ""}`;
  trackWhatsAppClick();
  window.open(webUrl, "_blank", "noopener,noreferrer");

  return true;
}
