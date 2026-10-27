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

export function siteOrigin() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}
