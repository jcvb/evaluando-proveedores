"use server";

import { lookupPostalCode, searchProviders, suggestFraccionamientos } from "@/server/queries";

export async function suggestProvidersAction(q: string) {
  try {
    const result = await searchProviders({ q });
    return result.items;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function lookupPostalCodeAction(cp: string) {
  try {
    return await lookupPostalCode(cp);
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function suggestFraccionamientosAction(input: {
  q: string;
  estado?: string;
  municipio?: string;
  colonia?: string;
}) {
  try {
    return await suggestFraccionamientos(input);
  } catch (error) {
    console.error(error);
    return [];
  }
}
