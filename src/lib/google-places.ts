import { addressSimilarity, nameSimilarity } from "@/lib/name-similarity";

export type GooglePlaceMatch = {
  placeId: string;
  name: string;
  formattedAddress: string;
  mapsUrl: string;
  phone: string | null;
  nameScore: number;
  addressScore: number;
  lat: number | null;
  lng: number | null;
  state: string | null;
  city: string | null;
};

export type GoogleAddressMatch = {
  formattedAddress: string;
  lat: number;
  lng: number;
  placeId: string | null;
  addressScore: number;
  state: string | null;
  city: string | null;
};

type PlacesSearchResponse = {
  places?: Array<{
    id?: string;
    displayName?: { text?: string };
    formattedAddress?: string;
    googleMapsUri?: string;
    nationalPhoneNumber?: string;
    internationalPhoneNumber?: string;
    location?: { latitude?: number; longitude?: number };
    addressComponents?: Array<{
      longText?: string;
      shortText?: string;
      types?: string[];
    }>;
  }>;
  error?: { message?: string };
};

type GeocodeResponse = {
  status: string;
  error_message?: string;
  results?: Array<{
    place_id?: string;
    formatted_address?: string;
    geometry?: { location?: { lat: number; lng: number } };
    address_components?: Array<{
      long_name: string;
      short_name: string;
      types: string[];
    }>;
  }>;
};

export function googleMapsConfigured() {
  return Boolean(process.env.GOOGLE_MAPS_API_KEY?.trim());
}

function apiKey() {
  const key = process.env.GOOGLE_MAPS_API_KEY?.trim();
  if (!key) throw new Error("Falta GOOGLE_MAPS_API_KEY");
  return key;
}

function componentValue(
  components: Array<{ longText?: string; shortText?: string; types?: string[] }> | undefined,
  type: string,
) {
  const hit = components?.find((item) => item.types?.includes(type));
  return hit?.longText ?? hit?.shortText ?? null;
}

function legacyComponentValue(
  components: Array<{ long_name: string; short_name: string; types: string[] }> | undefined,
  type: string,
) {
  const hit = components?.find((item) => item.types.includes(type));
  return hit?.long_name ?? hit?.short_name ?? null;
}

function buildWrittenAddress(parts: {
  calle?: string;
  colonia?: string;
  fraccionamiento?: string;
  municipio?: string;
  estado?: string;
  postalCode?: string;
}) {
  return [
    parts.calle,
    parts.colonia,
    parts.fraccionamiento,
    parts.municipio,
    parts.estado,
    parts.postalCode ? `CP ${parts.postalCode}` : "",
    "México",
  ]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(", ");
}

/** Confirma la dirección escrita contra Geocoding de Google. */
export async function geocodeWrittenAddress(parts: {
  calle?: string;
  colonia?: string;
  fraccionamiento?: string;
  municipio?: string;
  estado?: string;
  postalCode?: string;
}): Promise<GoogleAddressMatch | null> {
  const written = buildWrittenAddress(parts);
  if (written.replace(/México/i, "").trim().length < 8) return null;

  const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
  url.searchParams.set("address", written);
  url.searchParams.set("language", "es");
  url.searchParams.set("region", "mx");
  url.searchParams.set("key", apiKey());

  const response = await fetch(url.toString(), { next: { revalidate: 0 } });
  if (!response.ok) throw new Error("No se pudo consultar Geocoding");
  const data = (await response.json()) as GeocodeResponse;
  if (data.status === "ZERO_RESULTS") return null;
  if (data.status !== "OK" || !data.results?.[0]) {
    throw new Error(data.error_message || `Geocoding: ${data.status}`);
  }

  const top = data.results[0];
  const formatted = top.formatted_address ?? written;
  const lat = top.geometry?.location?.lat;
  const lng = top.geometry?.location?.lng;
  if (lat == null || lng == null) return null;

  return {
    formattedAddress: formatted,
    lat,
    lng,
    placeId: top.place_id ?? null,
    addressScore: addressSimilarity(written, formatted),
    state: legacyComponentValue(top.address_components, "administrative_area_level_1"),
    city:
      legacyComponentValue(top.address_components, "locality") ||
      legacyComponentValue(top.address_components, "administrative_area_level_2"),
  };
}

/** Busca negocios en Google Places por nombre + zona. */
export async function searchGooglePlaces(input: {
  name: string;
  calle?: string;
  colonia?: string;
  fraccionamiento?: string;
  municipio?: string;
  estado?: string;
  postalCode?: string;
  lat?: number | null;
  lng?: number | null;
}): Promise<GooglePlaceMatch[]> {
  const name = input.name.trim();
  if (name.length < 2) return [];

  const locationBits = [input.colonia, input.municipio, input.estado, "México"].filter(Boolean).join(", ");
  const textQuery = `${name} ${locationBits}`.trim();

  const body: Record<string, unknown> = {
    textQuery,
    languageCode: "es",
    regionCode: "MX",
    pageSize: 8,
  };

  if (input.lat != null && input.lng != null) {
    body.locationBias = {
      circle: {
        center: { latitude: input.lat, longitude: input.lng },
        radius: 12000,
      },
    };
  }

  const response = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey(),
      "X-Goog-FieldMask":
        "places.id,places.displayName,places.formattedAddress,places.googleMapsUri,places.nationalPhoneNumber,places.internationalPhoneNumber,places.location,places.addressComponents",
    },
    body: JSON.stringify(body),
    next: { revalidate: 0 },
  });

  const data = (await response.json()) as PlacesSearchResponse;
  if (!response.ok) {
    throw new Error(data.error?.message || "No se pudo consultar Google Places");
  }

  const writtenAddress = buildWrittenAddress(input);

  return (data.places ?? [])
    .map((place) => {
      const placeName = place.displayName?.text?.trim() || "";
      const formattedAddress = place.formattedAddress?.trim() || "";
      const placeId = place.id?.replace(/^places\//, "") || "";
      if (!placeId || !placeName) return null;

      const phoneRaw = place.nationalPhoneNumber || place.internationalPhoneNumber || null;
      const phone = phoneRaw ? phoneRaw.replace(/\D/g, "").slice(-10) : null;

      return {
        placeId,
        name: placeName,
        formattedAddress,
        mapsUrl: place.googleMapsUri || `https://www.google.com/maps/place/?q=place_id:${placeId}`,
        phone: phone && phone.length === 10 ? phone : null,
        nameScore: nameSimilarity(name, placeName),
        addressScore: writtenAddress ? addressSimilarity(writtenAddress, formattedAddress) : 0,
        lat: place.location?.latitude ?? null,
        lng: place.location?.longitude ?? null,
        state: componentValue(place.addressComponents, "administrative_area_level_1"),
        city:
          componentValue(place.addressComponents, "locality") ||
          componentValue(place.addressComponents, "administrative_area_level_2"),
      } satisfies GooglePlaceMatch;
    })
    .filter((item): item is GooglePlaceMatch => Boolean(item))
    .filter((item) => item.nameScore >= 0.28 || item.addressScore >= 0.35)
    .sort((a, b) => b.nameScore * 0.7 + b.addressScore * 0.3 - (a.nameScore * 0.7 + a.addressScore * 0.3));
}
