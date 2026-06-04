export const cloudinaryReady = Boolean(
  import.meta.env.VITE_CLOUDINARY_CLOUD_NAME && import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
);

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("No se pudo leer la imagen local."));
    reader.readAsDataURL(file);
  });
}

export function getOptimizedImageUrl(url, options = {}) {
  const source = String(url || "").trim();
  if (!source) return "";
  const { width, height, crop = "fill", gravity = "auto", quality = "auto", format = "auto" } = options;
  if (!source.includes("res.cloudinary.com") || source.includes("/image/upload/")) {
    if (!source.includes("res.cloudinary.com")) return source;
  }
  const transformations = [
    `f_${format}`, `q_${quality}`,
    width ? `w_${width}` : "", height ? `h_${height}` : "",
    width || height ? `c_${crop}` : "", width || height ? `g_${gravity}` : "",
  ].filter(Boolean);
  if (!transformations.length) return source;
  return source.replace("/image/upload/", `/image/upload/${transformations.join(",")}/`);
}

async function uploadToCloudinary(file) {
  const form = new FormData();
  form.append("file", file);
  form.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
  form.append("folder", import.meta.env.VITE_CLOUDINARY_FOLDER || "productos");
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 30000);
  let res;
  try {
    res = await fetch(`https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`, {
      method: "POST", body: form, signal: controller.signal,
    });
  } catch (error) {
    if (error?.name === "AbortError") throw new Error("La subida tardo demasiado.");
    throw new Error("No se pudo conectar para subir el archivo.");
  } finally {
    window.clearTimeout(timeout);
  }
  if (!res.ok) throw new Error("Fallo la subida del archivo.");
  const data = await res.json();
  return data.secure_url;
}

export async function uploadImage(file, folder = "products") {
  if (cloudinaryReady) {
    return uploadToCloudinary(file);
  }
  return fileToDataUrl(file);
}
