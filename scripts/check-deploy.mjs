#!/usr/bin/env node
/**
 * Valida que .env.production tenga lo mínimo para Vercel + Supabase (plan free).
 * Uso: npm run check:deploy
 */
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const file = resolve(process.cwd(), ".env.production");

function loadEnv(filePath) {
  const env = {};
  for (const line of readFileSync(filePath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

const required = [
  "APP_ENV",
  "DATABASE_URL",
  "DIRECT_URL",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "NEXT_PUBLIC_SITE_URL",
  "ADMIN_EMAILS",
  "SESSION_SECRET",
];

if (!existsSync(file)) {
  console.error("✗ Falta .env.production. Copia .env.example y completa los valores de Supabase.");
  process.exit(1);
}

const env = loadEnv(file);
const missing = required.filter((key) => !env[key]?.trim());
const warnings = [];

if (env.APP_ENV && env.APP_ENV !== "production") {
  warnings.push(`APP_ENV es "${env.APP_ENV}"; en Vercel debe ser "production".`);
}

if (env.DATABASE_URL?.includes("localhost") || env.DIRECT_URL?.includes("localhost")) {
  warnings.push("DATABASE_URL o DIRECT_URL apuntan a localhost. En Vercel deben ser las de Supabase.");
}

if (env.DATABASE_URL && !/[?&]pgbouncer=true/.test(env.DATABASE_URL) && /pooler\.supabase\.com|:6543\b/.test(env.DATABASE_URL)) {
  warnings.push('A DATABASE_URL del pooler conviene agregarle "?pgbouncer=true".');
}

if (env.NEXT_PUBLIC_SITE_URL?.includes("localhost")) {
  warnings.push("NEXT_PUBLIC_SITE_URL sigue en localhost. Pon https://www.burodeoficios.com");
}
if (env.NEXT_PUBLIC_SITE_URL && !env.NEXT_PUBLIC_SITE_URL.includes("burodeoficios.com")) {
  warnings.push("NEXT_PUBLIC_SITE_URL no apunta a www.burodeoficios.com");
}

if (env.SESSION_SECRET === "cambia-esta-cadena" || (env.SESSION_SECRET && env.SESSION_SECRET.length < 16)) {
  warnings.push("SESSION_SECRET es débil. Usa una cadena larga y aleatoria.");
}

if (env.NEXT_PUBLIC_SUPABASE_URL && !env.NEXT_PUBLIC_SUPABASE_URL.includes("supabase.co")) {
  warnings.push("NEXT_PUBLIC_SUPABASE_URL no parece un proyecto de Supabase.");
}

const gaId = env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim();
if (!gaId) {
  warnings.push("NEXT_PUBLIC_GA_MEASUREMENT_ID vacío: Google Analytics no se cargará en producción.");
} else if (!/^G-[A-Z0-9]+$/i.test(gaId)) {
  warnings.push(`NEXT_PUBLIC_GA_MEASUREMENT_ID ("${gaId}") no parece un ID GA4 (G-XXXXXXXX).`);
}

console.log("Revisión de .env.production para deploy free\n");

if (missing.length) {
  console.error("Faltan variables:");
  for (const key of missing) console.error(`  - ${key}`);
} else {
  console.log("✓ Están todas las variables obligatorias.");
}

if (warnings.length) {
  console.log("\nAvisos:");
  for (const warning of warnings) console.log(`  • ${warning}`);
}

if (!missing.length && !warnings.length) {
  console.log("\nListo para:");
  console.log("  1) npm run db:migrate:prod");
  console.log("  2) npm run db:seed:prod");
  console.log("  3) Conectar el repo en Vercel y pegar estas mismas variables.");
}

if (missing.length) process.exit(1);
