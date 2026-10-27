"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Search, SlidersHorizontal } from "lucide-react";
import { AddressFields, emptyAddress, type AddressValue } from "@/components/address-fields";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SearchForm({
  categories,
  defaults,
}: {
  categories: { slug: string; name: string }[];
  defaults: {
    q?: string;
    oficio?: string;
    estado?: string;
    municipio?: string;
    colonia?: string;
    fraccionamiento?: string;
    veredicto?: string;
  };
}) {
  const router = useRouter();
  const [address, setAddress] = useState<AddressValue>(
    emptyAddress({
      state: defaults.estado ?? "",
      municipio: defaults.municipio ?? "",
      colonia: defaults.colonia ?? "",
      fraccionamiento: defaults.fraccionamiento ?? "",
    }),
  );
  const extraOpen = Boolean(
    defaults.municipio || defaults.colonia || defaults.fraccionamiento || defaults.veredicto || defaults.estado,
  );

  return (
    <form
      className="grid gap-4 rounded-2xl bg-card p-4 ring-1 ring-foreground/10 md:p-5"
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const params = new URLSearchParams();
        for (const [key, value] of data.entries()) {
          const text = String(value).trim();
          if (text) params.set(key, text);
        }
        if (address.state) params.set("estado", address.state);
        if (address.municipio) params.set("municipio", address.municipio);
        if (address.colonia) params.set("colonia", address.colonia);
        if (address.fraccionamiento) params.set("fraccionamiento", address.fraccionamiento);
        router.push(params.size ? `/?${params}` : "/");
      }}
    >
      <div className="grid gap-3 md:grid-cols-[2fr_1fr]">
        <div>
          <Label htmlFor="q">Nombre o teléfono</Label>
          <Input id="q" name="q" defaultValue={defaults.q} placeholder="Ej. Herrería López o 10 dígitos" className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="oficio">Oficio</Label>
          <select id="oficio" name="oficio" defaultValue={defaults.oficio ?? ""} className="control mt-1.5">
            <option value="">Cualquier oficio</option>
            {categories.map((category) => (
              <option key={category.slug} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <details open={extraOpen || Boolean(address.postalCode)} className="group">
        <summary className="flex w-fit cursor-pointer list-none items-center gap-1.5 text-[0.95rem] font-semibold text-primary [&::-webkit-details-marker]:hidden">
          <SlidersHorizontal className="size-4" aria-hidden />
          Ubicación y más filtros
          <ChevronDown className="size-4 transition-transform group-open:rotate-180" aria-hidden />
        </summary>
        <div className="mt-3 grid gap-4">
          <AddressFields value={address} onChange={setAddress} requireColonia={false} showCalle={false} />
          <div>
            <Label htmlFor="veredicto">Resultado</Label>
            <select id="veredicto" name="veredicto" defaultValue={defaults.veredicto ?? ""} className="control mt-1.5">
              <option value="">Cualquier resultado</option>
              <option value="BUENO">Lo recomiendan</option>
              <option value="REGULAR">Regular</option>
              <option value="MALO">No lo recomiendan</option>
            </select>
          </div>
        </div>
      </details>
      <Button type="submit" className="w-full md:w-fit md:justify-self-end md:px-8">
        <Search aria-hidden />
        Buscar
      </Button>
    </form>
  );
}
