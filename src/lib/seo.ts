import type { Metadata } from "next";
import { siteOrigin } from "@/lib/env";

export const SITE = {
  name: "Buró de oficios",
  shortName: "Buró",
  tagline: "Opiniones con fotos de maestros y talleres en México, antes de contratar.",
  description:
    "Consulta y publica opiniones con fotos de plomeros, electricistas, carpinteros, albañiles y más oficios en México. El negocio puede responder; nadie borra lo escrito.",
  locale: "es_MX",
  language: "es-MX",
  country: "MX",
  keywords: [
    "opiniones oficios México",
    "reseñas plomeros",
    "reseñas electricistas",
    "reseñas carpinteros",
    "maestros de oficio",
    "antes de contratar",
    "buró de oficios",
    "quejas talleres",
    "recomendaciones albañiles",
  ],
} as const;

export function absoluteUrl(path = "/") {
  const base = siteOrigin().replace(/\/$/, "");
  if (!path || path === "/") return base;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function truncateMeta(text: string, max = 155) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).trimEnd()}…`;
}

export const noIndexRobots: NonNullable<Metadata["robots"]> = {
  index: false,
  follow: false,
  nocache: true,
  googleBot: { index: false, follow: false, noimageindex: true },
};

export function buildPageMetadata({
  title,
  description,
  path,
  image,
  type = "website",
  robots,
  keywords,
}: {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: "website" | "article" | "profile";
  robots?: Metadata["robots"];
  keywords?: string[];
}): Metadata {
  const url = absoluteUrl(path);
  const desc = truncateMeta(description);
  const ogImage = image ?? absoluteUrl("/opengraph-image");

  return {
    title,
    description: desc,
    keywords: keywords ?? [...SITE.keywords],
    alternates: {
      canonical: url,
      types: {
        "application/rss+xml": absoluteUrl("/feed.xml"),
        "text/plain": absoluteUrl("/llms.txt"),
      },
    },
    robots,
    openGraph: {
      type,
      locale: SITE.locale,
      url,
      siteName: SITE.name,
      title: title.includes(SITE.name) ? title : `${title} | ${SITE.name}`,
      description: desc,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title: title.includes(SITE.name) ? title : `${title} | ${SITE.name}`,
      description: desc,
      images: [ogImage],
    },
  };
}

export function verdictLabel(verdict: string) {
  if (verdict === "BUENO") return "recomendado";
  if (verdict === "MALO") return "no recomendado";
  return "regular";
}
