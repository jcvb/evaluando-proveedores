import type { VerdictType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { normalizeMxPhone } from "@/lib/phone";

export type SearchFilters = {
  q?: string;
  oficio?: string;
  estado?: string;
  municipio?: string;
  colonia?: string;
  fraccionamiento?: string;
  veredicto?: VerdictType | "";
};

const providerCardSelect = {
  id: true,
  businessName: true,
  contactName: true,
  phonePrimary: true,
  primaryState: true,
  primaryCity: true,
  isClaimed: true,
  totalReviews: true,
  goodReviewsCount: true,
  badReviewsCount: true,
  averageScore: true,
  categories: { select: { name: true, slug: true } },
} as const;

export async function listCategories() {
  return prisma.serviceCategory.findMany({ orderBy: { name: "asc" } });
}

export async function searchProviders(filters: SearchFilters) {
  const q = filters.q?.trim() ?? "";
  const phone = q ? normalizeMxPhone(q) : null;
  let similarIds: string[] | null = null;

  if (q && !phone) {
    try {
      const rows = await prisma.$queryRaw<{ id: string }[]>`
        SELECT id FROM "ProviderProfile"
        WHERE similarity("businessName", ${q}) > 0.18
           OR similarity(COALESCE("contactName", ''), ${q}) > 0.28
           OR "businessName" ILIKE ${"%" + q + "%"}
        ORDER BY GREATEST(
          similarity("businessName", ${q}),
          similarity(COALESCE("contactName", ''), ${q})
        ) DESC
        LIMIT 40
      `;
      similarIds = rows.map((row) => row.id);
    } catch {
      similarIds = null;
    }
  }

  const verdict = filters.veredicto || undefined;
  const geoOnReviews = Boolean(filters.municipio || filters.colonia || filters.fraccionamiento || verdict);

  const providers = await prisma.providerProfile.findMany({
    where: {
      AND: [
        q
          ? {
              OR: [
                ...(phone ? [{ phonePrimary: phone }] : []),
                ...(similarIds ? [{ id: { in: similarIds.length ? similarIds : ["__none__"] } }] : []),
                { businessName: { contains: q, mode: "insensitive" as const } },
                { contactName: { contains: q, mode: "insensitive" as const } },
                ...(!phone && q.length >= 3
                  ? [{ categories: { some: { name: { contains: q.slice(0, Math.max(3, q.length - 2)), mode: "insensitive" as const } } } }]
                  : []),
              ],
            }
          : {},
        filters.oficio
          ? {
              OR: [
                { categories: { some: { slug: filters.oficio } } },
                { reviews: { some: { category: { slug: filters.oficio } } } },
              ],
            }
          : {},
        filters.estado
          ? {
              OR: [
                { primaryState: { equals: filters.estado, mode: "insensitive" as const } },
                { reviews: { some: { state: { equals: filters.estado, mode: "insensitive" as const } } } },
              ],
            }
          : {},
        geoOnReviews
          ? {
              reviews: {
                some: {
                  ...(filters.municipio
                    ? { cityOrMunicipality: { equals: filters.municipio, mode: "insensitive" as const } }
                    : {}),
                  ...(filters.colonia ? { colonia: { contains: filters.colonia, mode: "insensitive" as const } } : {}),
                  ...(filters.fraccionamiento
                    ? { fraccionamiento: { contains: filters.fraccionamiento, mode: "insensitive" as const } }
                    : {}),
                  ...(verdict ? { verdict } : {}),
                  ...(filters.estado ? { state: { equals: filters.estado, mode: "insensitive" as const } } : {}),
                  ...(filters.oficio ? { category: { slug: filters.oficio } } : {}),
                },
              },
            }
          : {},
      ],
    },
    select: providerCardSelect,
    orderBy: [{ badReviewsCount: "desc" }, { totalReviews: "desc" }],
    take: 24,
  });

  if (similarIds) {
    const order = new Map(similarIds.map((id, index) => [id, index]));
    providers.sort((a, b) => (order.get(a.id) ?? 99) - (order.get(b.id) ?? 99));
  }
  return providers;
}

export async function lookupPostalCode(cp: string) {
  if (!/^\d{5}$/.test(cp)) return null;
  const rows = await prisma.sepomexCatalog.findMany({
    where: { codigoPostal: cp },
    orderBy: { asentamiento: "asc" },
    take: 300,
  });
  if (rows.length === 0) return null;
  return {
    codigoPostal: cp,
    estado: rows[0].estado,
    municipio: rows[0].municipio,
    ciudad: rows[0].ciudad,
    asentamientos: rows.map((row) => ({ nombre: row.asentamiento, tipo: row.tipoAsentamiento })),
  };
}

export async function suggestFraccionamientos(input: {
  q: string;
  estado?: string;
  municipio?: string;
  colonia?: string;
}) {
  const q = input.q.trim();
  if (q.length < 2) return [];
  const estado = input.estado?.trim() ?? "";
  const municipio = input.municipio?.trim() ?? "";
  const colonia = input.colonia?.trim() ?? "";
  try {
    const rows = await prisma.$queryRaw<{ nombre: string }[]>`
      SELECT nombre FROM (
        SELECT DISTINCT fraccionamiento AS nombre
        FROM "Review"
        WHERE fraccionamiento IS NOT NULL
          AND similarity(fraccionamiento, ${q}) > 0.2
          AND (${estado} = '' OR state ILIKE ${estado})
          AND (${municipio} = '' OR "cityOrMunicipality" ILIKE ${municipio})
          AND (${colonia} = '' OR colonia ILIKE ${colonia})
        UNION
        SELECT DISTINCT asentamiento AS nombre
        FROM "SepomexCatalog"
        WHERE similarity(asentamiento, ${q}) > 0.25
          AND (
            "tipoAsentamiento" ILIKE '%fracc%'
            OR "tipoAsentamiento" ILIKE '%privada%'
            OR "tipoAsentamiento" ILIKE '%residencial%'
          )
          AND (${estado} = '' OR estado ILIKE ${estado})
          AND (${municipio} = '' OR municipio ILIKE ${municipio})
      ) sugerencias
      ORDER BY similarity(nombre, ${q}) DESC
      LIMIT 8
    `;
    return rows.map((row) => row.nombre).filter(Boolean);
  } catch {
    const rows = await prisma.review.findMany({
      where: {
        fraccionamiento: { contains: q, mode: "insensitive" },
        ...(estado ? { state: { equals: estado, mode: "insensitive" } } : {}),
      },
      distinct: ["fraccionamiento"],
      take: 8,
      select: { fraccionamiento: true },
    });
    return rows.map((row) => row.fraccionamiento).filter((name): name is string => Boolean(name));
  }
}

export async function getProvider(id: string) {
  return prisma.providerProfile.findUnique({
    where: { id },
    include: {
      categories: { orderBy: { name: "asc" } },
      reviews: {
        orderBy: { createdAt: "desc" },
        include: {
          author: { select: { id: true, name: true } },
          category: { select: { name: true, slug: true } },
          media: { orderBy: { createdAt: "asc" } },
          providerReply: { include: { providerUser: { select: { id: true, name: true } } } },
        },
      },
    },
  });
}

export async function getReviewForAdmin(id: string) {
  return prisma.review.findUnique({
    where: { id },
    include: {
      provider: { select: { id: true, businessName: true } },
      category: { select: { name: true, slug: true } },
      media: { orderBy: { createdAt: "asc" } },
      author: { select: { id: true, name: true, email: true } },
    },
  });
}

export async function reviewsByAuthor(authorId: string) {
  return prisma.review.findMany({
    where: { authorId },
    orderBy: { createdAt: "desc" },
    include: {
      provider: { select: { id: true, businessName: true } },
      category: { select: { name: true } },
      media: true,
      providerReply: true,
    },
  });
}

export async function helpfulVoteSet(userId: string, reviewIds: string[]) {
  if (reviewIds.length === 0) return new Set<string>();
  const votes = await prisma.helpfulVote.findMany({
    where: { userId, reviewId: { in: reviewIds } },
    select: { reviewId: true },
  });
  return new Set(votes.map((vote) => vote.reviewId));
}

export async function listProvidersForSitemap(limit = 5000) {
  return prisma.providerProfile.findMany({
    select: { id: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
    take: limit,
  });
}

export async function listProvidersForLlms(limit = 40) {
  return prisma.providerProfile.findMany({
    where: { totalReviews: { gt: 0 } },
    select: {
      id: true,
      businessName: true,
      primaryCity: true,
      primaryState: true,
      averageScore: true,
      totalReviews: true,
      categories: { select: { name: true, slug: true } },
    },
    orderBy: [{ totalReviews: "desc" }, { averageScore: "desc" }],
    take: limit,
  });
}

export async function listRecentReviewsForFeed(limit = 30) {
  return prisma.review.findMany({
    where: { status: { not: "UNDER_MODERATION" } },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      title: true,
      description: true,
      verdict: true,
      rating: true,
      createdAt: true,
      updatedAt: true,
      cityOrMunicipality: true,
      state: true,
      category: { select: { name: true, slug: true } },
      provider: {
        select: {
          id: true,
          businessName: true,
          primaryCity: true,
          primaryState: true,
        },
      },
    },
  });
}

export async function getCategoryBySlug(slug: string) {
  return prisma.serviceCategory.findUnique({ where: { slug } });
}
