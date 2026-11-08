/** ID de medición GA4 (formato G-XXXXXXXX). Vacío = Analytics desactivado. */
export function gaMeasurementId(): string | null {
  const id = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim();
  if (!id || !/^G-[A-Z0-9]+$/i.test(id)) return null;
  return id;
}

export function analyticsEnabled() {
  return Boolean(gaMeasurementId());
}

/** Rutas internas que no aportan a la audiencia pública. */
export function shouldTrackPath(pathname: string) {
  if (pathname.startsWith("/admin")) return false;
  if (pathname.startsWith("/auth")) return false;
  return true;
}

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function pagePath(pathname: string, search: string) {
  return search ? `${pathname}${search}` : pathname;
}

/** Envía un page_view (útil tras navegación del App Router). */
export function trackPageView(measurementId: string, path: string) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("config", measurementId, {
    page_path: path,
  });
}

/** Evento personalizado GA4 (p. ej. búsqueda, publicar reseña). */
export function trackEvent(
  name: string,
  params?: Record<string, string | number | boolean | undefined>,
) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", name, params);
}
