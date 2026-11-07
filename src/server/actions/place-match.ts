"use server";

import { googleMapsConfigured, geocodeWrittenAddress, searchGooglePlaces } from "@/lib/google-places";
import { nameSimilarity } from "@/lib/name-similarity";
import { prisma } from "@/lib/prisma";

export type LocalPlaceMatch = {
  source: "local";
  id: string;
  name: string;
  phone: string;
  city: string;
  state: string;
  nameScore: number;
  addressScore: number;
  googleMapsUrl: string | null;
  googleFormattedAddress: string | null;
};

export type RemotePlaceMatch = {
  source: "google";
  placeId: string;
  name: string;
  phone: string | null;
  formattedAddress: string;
  mapsUrl: string;
  nameScore: number;
  addressScore: number;
  state: string | null;
  city: string | null;
};

export type PlaceMatchResult = {
  googleEnabled: boolean;
  address: {
    written: string;
    googleFormatted: string | null;
    addressScore: number;
    lat: number | null;
    lng: number | null;
  } | null;
  local: LocalPlaceMatch[];
  google: RemotePlaceMatch[];
  notice: string | null;
};

function writtenLine(parts: {
  calle?: string;
  colonia?: string;
  fraccionamiento?: string;
  municipio?: string;
  estado?: string;
  postalCode?: string;
}) {
  return [parts.calle, parts.colonia, parts.fraccionamiento, parts.municipio, parts.estado, parts.postalCode]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(", ");
}

export async function matchPlaceAction(input: {
  name: string;
  calle?: string;
  colonia?: string;
  fraccionamiento?: string;
  municipio?: string;
  estado?: string;
  postalCode?: string;
}): Promise<PlaceMatchResult> {
  const name = input.name.trim();
  const written = writtenLine(input);
  const googleEnabled = googleMapsConfigured();

  if (name.length < 2) {
    return {
      googleEnabled,
      address: null,
      local: [],
      google: [],
      notice: "Escribe al menos 2 letras del nombre del negocio.",
    };
  }

  let local: LocalPlaceMatch[] = [];
  try {
    const rows = await prisma.$queryRaw<
      {
        id: string;
        businessName: string;
        phonePrimary: string;
        primaryCity: string;
        primaryState: string;
        googleMapsUrl: string | null;
        googleFormattedAddress: string | null;
        nameScore: number;
      }[]
    >`
      SELECT
        id,
        "businessName",
        "phonePrimary",
        "primaryCity",
        "primaryState",
        "googleMapsUrl",
        "googleFormattedAddress",
        GREATEST(
          similarity("businessName", ${name}),
          similarity(COALESCE("contactName", ''), ${name})
        ) AS "nameScore"
      FROM "ProviderProfile"
      WHERE
        similarity("businessName", ${name}) > 0.2
        OR similarity(COALESCE("contactName", ''), ${name}) > 0.28
        OR "businessName" ILIKE ${"%" + name + "%"}
      ORDER BY "nameScore" DESC
      LIMIT 12
    `;

    local = rows
      .map((row) => {
        const score = Math.max(Number(row.nameScore) || 0, nameSimilarity(name, row.businessName));
        const addressScore =
          input.municipio && row.primaryCity
            ? nameSimilarity(input.municipio, row.primaryCity) * 0.6 +
              (input.estado ? nameSimilarity(input.estado, row.primaryState) * 0.4 : 0)
            : input.estado
              ? nameSimilarity(input.estado, row.primaryState)
              : 0;
        return {
          source: "local" as const,
          id: row.id,
          name: row.businessName,
          phone: row.phonePrimary,
          city: row.primaryCity,
          state: row.primaryState,
          nameScore: score,
          addressScore,
          googleMapsUrl: row.googleMapsUrl,
          googleFormattedAddress: row.googleFormattedAddress,
        };
      })
      .filter((row) => row.nameScore >= 0.25 || (row.nameScore >= 0.18 && row.addressScore >= 0.4))
      .sort((a, b) => b.nameScore * 0.75 + b.addressScore * 0.25 - (a.nameScore * 0.75 + a.addressScore * 0.25))
      .slice(0, 6);
  } catch (error) {
    console.error(error);
  }

  if (!googleEnabled) {
    return {
      googleEnabled: false,
      address: written
        ? { written, googleFormatted: null, addressScore: 0, lat: null, lng: null }
        : null,
      local,
      google: [],
      notice:
        "Para cruzar con Google Maps agrega GOOGLE_MAPS_API_KEY en .env.development (Places API y Geocoding). Mientras tanto solo se buscan coincidencias en el Buró.",
    };
  }

  let address: PlaceMatchResult["address"] = written
    ? { written, googleFormatted: null, addressScore: 0, lat: null, lng: null }
    : null;
  let google: RemotePlaceMatch[] = [];
  let notice: string | null = null;

  try {
    const geo = written.length >= 8 ? await geocodeWrittenAddress(input) : null;
    if (geo) {
      address = {
        written: written || geo.formattedAddress,
        googleFormatted: geo.formattedAddress,
        addressScore: geo.addressScore,
        lat: geo.lat,
        lng: geo.lng,
      };
    }

    const places = await searchGooglePlaces({
      ...input,
      name,
      lat: geo?.lat,
      lng: geo?.lng,
    });

    google = places.slice(0, 6).map((place) => ({
      source: "google" as const,
      placeId: place.placeId,
      name: place.name,
      phone: place.phone,
      formattedAddress: place.formattedAddress,
      mapsUrl: place.mapsUrl,
      nameScore: place.nameScore,
      addressScore: place.addressScore,
      state: place.state,
      city: place.city,
    }));

    if (local.length === 0 && google.length === 0) {
      notice = "No encontramos un negocio con ese nombre cerca de esa dirección.";
    }
  } catch (error) {
    console.error(error);
    notice =
      error instanceof Error
        ? `Google Maps no respondió: ${error.message}`
        : "Google Maps no respondió. Revisa la API key y que Places y Geocoding estén activas.";
  }

  return { googleEnabled: true, address, local, google, notice };
}
