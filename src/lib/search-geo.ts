import type { Prisma } from "@prisma/client";

export type LocationSearchFilters = {
  estado?: string;
  municipio?: string;
  colonia?: string;
  fraccionamiento?: string;
};

export type ProviderLocationFields = {
  primaryState: string;
  primaryCity: string;
  googleFormattedAddress: string | null;
  reviewLocations?: Array<{
    state: string;
    cityOrMunicipality: string;
    colonia: string;
    fraccionamiento: string | null;
  }>;
};

function norm(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

/** Coincide texto de filtro contra un valor guardado (contiene en cualquier sentido). */
export function locationTokenMatch(stored: string | null | undefined, filter: string) {
  const left = norm(stored ?? "");
  const right = norm(filter);
  if (!left || !right) return false;
  return left.includes(right) || right.includes(left);
}

/**
 * Regla de negocio para filtros de zona:
 * - Debe encontrar proveedores por su ficha (primaryCity / googleFormattedAddress)
 *   aunque no tengan reseñas todavía.
 * - También considera ubicaciones de reseñas cuando existan.
 */
export function providerMatchesLocationFilters(provider: ProviderLocationFields, filters: LocationSearchFilters) {
  const estado = filters.estado?.trim() ?? "";
  const municipio = filters.municipio?.trim() ?? "";
  const colonia = filters.colonia?.trim() ?? "";
  const fraccionamiento = filters.fraccionamiento?.trim() ?? "";

  if (estado) {
    const stateOk =
      locationTokenMatch(provider.primaryState, estado) ||
      (provider.reviewLocations ?? []).some((review) => locationTokenMatch(review.state, estado)) ||
      locationTokenMatch(provider.googleFormattedAddress, estado);
    if (!stateOk) return false;
  }

  if (municipio) {
    const cityOk =
      locationTokenMatch(provider.primaryCity, municipio) ||
      locationTokenMatch(provider.googleFormattedAddress, municipio) ||
      (provider.reviewLocations ?? []).some((review) => locationTokenMatch(review.cityOrMunicipality, municipio));
    if (!cityOk) return false;
  }

  if (colonia) {
    const coloniaOk =
      locationTokenMatch(provider.googleFormattedAddress, colonia) ||
      (provider.reviewLocations ?? []).some((review) => locationTokenMatch(review.colonia, colonia));
    if (!coloniaOk) return false;
  }

  if (fraccionamiento) {
    const fraccOk =
      locationTokenMatch(provider.googleFormattedAddress, fraccionamiento) ||
      (provider.reviewLocations ?? []).some((review) => locationTokenMatch(review.fraccionamiento, fraccionamiento));
    if (!fraccOk) return false;
  }

  return true;
}

/** Condiciones Prisma equivalentes a la regla de negocio anterior. */
export function buildLocationWhere(filters: LocationSearchFilters): Prisma.ProviderProfileWhereInput[] {
  const clauses: Prisma.ProviderProfileWhereInput[] = [];
  const estado = filters.estado?.trim() ?? "";
  const municipio = filters.municipio?.trim() ?? "";
  const colonia = filters.colonia?.trim() ?? "";
  const fraccionamiento = filters.fraccionamiento?.trim() ?? "";

  if (estado) {
    clauses.push({
      OR: [
        { primaryState: { equals: estado, mode: "insensitive" } },
        { primaryState: { contains: estado, mode: "insensitive" } },
        { googleFormattedAddress: { contains: estado, mode: "insensitive" } },
        { reviews: { some: { state: { equals: estado, mode: "insensitive" } } } },
        { reviews: { some: { state: { contains: estado, mode: "insensitive" } } } },
      ],
    });
  }

  if (municipio) {
    clauses.push({
      OR: [
        { primaryCity: { equals: municipio, mode: "insensitive" } },
        { primaryCity: { contains: municipio, mode: "insensitive" } },
        { googleFormattedAddress: { contains: municipio, mode: "insensitive" } },
        { reviews: { some: { cityOrMunicipality: { equals: municipio, mode: "insensitive" } } } },
        { reviews: { some: { cityOrMunicipality: { contains: municipio, mode: "insensitive" } } } },
      ],
    });
  }

  if (colonia) {
    clauses.push({
      OR: [
        { googleFormattedAddress: { contains: colonia, mode: "insensitive" } },
        { reviews: { some: { colonia: { contains: colonia, mode: "insensitive" } } } },
        { reviews: { some: { colonia: { equals: colonia, mode: "insensitive" } } } },
      ],
    });
  }

  if (fraccionamiento) {
    clauses.push({
      OR: [
        { googleFormattedAddress: { contains: fraccionamiento, mode: "insensitive" } },
        { reviews: { some: { fraccionamiento: { contains: fraccionamiento, mode: "insensitive" } } } },
      ],
    });
  }

  return clauses;
}
