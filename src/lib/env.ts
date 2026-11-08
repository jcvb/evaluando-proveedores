export function supabaseConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export function localAuthAllowed() {
  return !supabaseConfigured() && process.env.NODE_ENV !== "production";
}

export function adminEmails() {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string) {
  return adminEmails().includes(email.toLowerCase());
}

const CANONICAL_PRODUCTION_ORIGIN = "https://www.burodeoficios.com";

/** Corrige typos frecuentes (p. ej. ttps://) y valida el origen del sitio. */
export function normalizeSiteOrigin(value: string | undefined | null): string | null {
  if (!value) return null;
  let raw = value.trim().replace(/\s+/g, "").replace(/\/$/, "");
  if (!raw) return null;

  // Typos comunes al pegar la URL en Vercel
  if (raw.startsWith("ttps://")) raw = `h${raw}`;
  if (raw.startsWith("ttp://")) raw = `h${raw}`;
  if (raw.startsWith("://")) raw = `https${raw}`;
  if (raw.startsWith("//")) raw = `https:${raw}`;
  if (!/^https?:\/\//i.test(raw)) raw = `https://${raw}`;

  try {
    const url = new URL(raw);
    if (!url.hostname.includes(".")) return null;
    return `${url.protocol}//${url.host}`;
  } catch {
    return null;
  }
}

export function siteOrigin() {
  const fromEnv = normalizeSiteOrigin(process.env.NEXT_PUBLIC_SITE_URL);
  if (fromEnv) return fromEnv;
  if (process.env.NODE_ENV === "production") return CANONICAL_PRODUCTION_ORIGIN;
  return "http://localhost:3000";
}

export function googleMapsConfigured() {
  return Boolean(process.env.GOOGLE_MAPS_API_KEY?.trim());
}
