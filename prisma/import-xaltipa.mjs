/**
 * Importa proveedores de la lista de Xaltipa, Cuautitlán, Edo. Méx.
 * Uso: node scripts/with-env.mjs development -- node prisma/import-xaltipa.mjs
 */
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "@prisma/client";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rows = JSON.parse(readFileSync(resolve(__dirname, "data/xaltipa-cuautitlan.json"), "utf8"));

const PRIMARY_STATE = "México";
const PRIMARY_CITY = "Cuautitlán";
const LOCALITY = "Xaltipa";

/** @type {Array<{ test: RegExp; slugs: string[] }>} */
const WORK_MAP = [
  { test: /pasto\s*sint/i, slugs: ["jardineria"] },
  { test: /persian/i, slugs: ["persianas-cortinas"] },
  { test: /plomer/i, slugs: ["plomeria"] },
  { test: /electric/i, slugs: ["electricidad"] },
  { test: /herrer/i, slugs: ["herreria"] },
  { test: /protecci/i, slugs: ["herreria"] },
  { test: /cancel/i, slugs: ["aluminio"] },
  { test: /carpinter|ebanist/i, slugs: ["carpinteria"] },
  { test: /closet|cl[oó]set/i, slugs: ["closets"] },
  { test: /cocina/i, slugs: ["cocinas-integrales"] },
  { test: /mueble/i, slugs: ["muebles-medida"] },
  { test: /alba[nñ]il|acabad|construcci[oó]n|contratista/i, slugs: ["albanileria"] },
  { test: /domo|techo|techumbr/i, slugs: ["techumbres-lamina"] },
  { test: /p[eé]rgola|pergola/i, slugs: ["pergolas-terrazas"] },
  { test: /escalera/i, slugs: ["escaleras"] },
  { test: /piedra|cantera|m[aá]rmol|granito/i, slugs: ["marmol-granito"] },
  { test: /pintura/i, slugs: ["pintura"] },
  { test: /servicio\s*domestico|limpieza/i, slugs: ["limpieza-profunda"] },
  { test: /c[aá]mara|camara/i, slugs: ["domotica"] },
];

function normalizePhone(raw) {
  if (raw == null) return { primary: "", secondary: null };
  const text = String(raw).trim();
  if (!text || /boletin/i.test(text)) return { primary: "", secondary: null };
  const parts = text.split(/[\/|,;]+/).map((p) => p.replace(/\D/g, "")).filter(Boolean);
  const phones = parts
    .map((digits) => {
      let d = digits;
      if (d.startsWith("52") && d.length === 12) d = d.slice(2);
      return d.length === 10 ? d : null;
    })
    .filter(Boolean);
  return { primary: phones[0] ?? "", secondary: phones[1] ?? null };
}

function parseName(raw) {
  const cleaned = String(raw).replace(/\s+/g, " ").trim();
  const match = cleaned.match(/^(.*?)\s*\((.+)\)\s*$/);
  if (!match) return { businessName: cleaned, contactName: null };
  const outside = match[1].trim();
  const inside = match[2].trim();
  // "Nombre (Marca)" vs "Marca (contacto)"
  const insideLooksLikePeople =
    /trabaja con|socios|y\/o|,| y /i.test(inside) ||
    (!/(cocinas|herrer|proteccion|persian|muebles|espacio|dme|c[aá]maras|pergola)/i.test(inside) &&
      inside.split(/\s+/).length <= 4 &&
      /^[A-Za-zÁÉÍÓÚáéíóúÑñ. ]+$/.test(inside));

  if (insideLooksLikePeople && outside.length > 2) {
    return { businessName: outside, contactName: inside };
  }
  if (outside.length >= 3 && inside.length >= 2) {
    // Preferir marca como nombre comercial cuando el paréntesis parece empresa
    if (/(cocinas|herrer|proteccion|persian|muebles|calidad|excelencia)/i.test(inside)) {
      return { businessName: inside, contactName: outside };
    }
  }
  return { businessName: cleaned, contactName: null };
}

function slugsFromWork(work) {
  if (!work) return [];
  const found = new Set();
  for (const rule of WORK_MAP) {
    if (rule.test.test(work)) {
      for (const slug of rule.slugs) found.add(slug);
    }
  }
  return [...found];
}

const prisma = new PrismaClient();

async function main() {
  const categories = await prisma.serviceCategory.findMany({ select: { id: true, slug: true } });
  const bySlug = new Map(categories.map((c) => [c.slug, c.id]));
  if (bySlug.size === 0) {
    throw new Error("No hay oficios en la base. Corre primero: npm run db:seed");
  }

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const row of rows) {
    const { businessName, contactName } = parseName(row.name);
    if (!businessName) {
      skipped += 1;
      continue;
    }
    const { primary, secondary } = normalizePhone(row.phone);
    const slugs = slugsFromWork(row.work);
    const categoryIds = slugs.map((slug) => bySlug.get(slug)).filter(Boolean);

    const existing = await prisma.providerProfile.findFirst({
      where: {
        businessName: { equals: businessName, mode: "insensitive" },
        primaryCity: PRIMARY_CITY,
        primaryState: PRIMARY_STATE,
      },
    });

    const data = {
      businessName,
      contactName,
      phonePrimary: primary,
      phoneSecondary: secondary,
      primaryState: PRIMARY_STATE,
      primaryCity: PRIMARY_CITY,
      googleFormattedAddress: `${LOCALITY}, ${PRIMARY_CITY}, Estado de México`,
      categories: categoryIds.length ? { set: categoryIds.map((id) => ({ id })) } : { set: [] },
    };

    if (existing) {
      await prisma.providerProfile.update({
        where: { id: existing.id },
        data: {
          contactName: data.contactName ?? existing.contactName,
          phonePrimary: primary || existing.phonePrimary,
          phoneSecondary: secondary ?? existing.phoneSecondary,
          googleFormattedAddress: data.googleFormattedAddress,
          categories: data.categories,
          // Lista importada: 1 estrella por defecto si aún no hay opiniones reales
          ...(existing.totalReviews === 0 ? { averageScore: 1 } : {}),
        },
      });
      updated += 1;
      console.log(`↻ ${businessName}${slugs.length ? ` [${slugs.join(", ")}]` : ""}`);
    } else {
      await prisma.providerProfile.create({
        data: {
          businessName: data.businessName,
          contactName: data.contactName,
          phonePrimary: data.phonePrimary,
          phoneSecondary: data.phoneSecondary,
          primaryState: data.primaryState,
          primaryCity: data.primaryCity,
          googleFormattedAddress: data.googleFormattedAddress,
          averageScore: 1,
          categories: categoryIds.length ? { connect: categoryIds.map((id) => ({ id })) } : undefined,
        },
      });
      created += 1;
      console.log(`+ ${businessName}${slugs.length ? ` [${slugs.join(", ")}]` : ""}`);
    }
  }

  console.log(`\nListo. Creados: ${created}. Actualizados: ${updated}. Omitidos: ${skipped}.`);
  console.log(`Ubicación: ${LOCALITY}, ${PRIMARY_CITY}, ${PRIMARY_STATE}.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
