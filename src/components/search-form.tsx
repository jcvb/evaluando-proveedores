"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, Search, SlidersHorizontal, X } from "lucide-react";
import { AddressFields, emptyAddress, type AddressValue } from "@/components/address-fields";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type Defaults = {
  q?: string;
  oficio?: string;
  estado?: string;
  municipio?: string;
  colonia?: string;
  fraccionamiento?: string;
  veredicto?: string;
};

const VERDICT_FILTER_LABELS: Record<string, string> = {
  BUENO: "Lo recomiendan",
  REGULAR: "Regular",
  MALO: "No lo recomiendan",
};

const QUICK_TRADES = ["plomeria", "electricidad", "herreria", "carpinteria", "pintura", "albanileria"];

export function SearchForm({
  categories,
  defaults,
  tone = "default",
}: {
  categories: { slug: string; name: string }[];
  defaults: Defaults;
  /** `onDark`: contraste sobre el semi-hero verde. */
  tone?: "default" | "onDark";
}) {
  const onDark = tone === "onDark";
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [q, setQ] = useState(defaults.q ?? "");
  const [oficio, setOficio] = useState(defaults.oficio ?? "");
  const [veredicto, setVeredicto] = useState(defaults.veredicto ?? "");
  const [address, setAddress] = useState<AddressValue>(
    emptyAddress({
      state: defaults.estado ?? "",
      municipio: defaults.municipio ?? "",
      colonia: defaults.colonia ?? "",
      fraccionamiento: defaults.fraccionamiento ?? "",
    }),
  );
  const [open, setOpen] = useState(false);

  const categoryName = (slug: string) => categories.find((category) => category.slug === slug)?.name ?? slug;

  const active: { key: keyof Defaults; label: string }[] = [
    ...(defaults.oficio ? [{ key: "oficio" as const, label: categoryName(defaults.oficio) }] : []),
    ...(defaults.estado ? [{ key: "estado" as const, label: defaults.estado }] : []),
    ...(defaults.municipio ? [{ key: "municipio" as const, label: defaults.municipio }] : []),
    ...(defaults.colonia ? [{ key: "colonia" as const, label: `Col. ${defaults.colonia}` }] : []),
    ...(defaults.fraccionamiento ? [{ key: "fraccionamiento" as const, label: defaults.fraccionamiento }] : []),
    ...(defaults.veredicto
      ? [{ key: "veredicto" as const, label: VERDICT_FILTER_LABELS[defaults.veredicto] ?? defaults.veredicto }]
      : []),
  ];

  function go(values: Defaults) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(values)) {
      const text = String(value ?? "").trim();
      if (text) params.set(key, text);
    }
    startTransition(() => {
      router.push(params.size ? `/?${params}` : "/");
    });
  }

  function currentValues(): Defaults {
    return {
      q,
      oficio,
      veredicto,
      estado: address.state,
      municipio: address.municipio,
      colonia: address.colonia,
      fraccionamiento: address.fraccionamiento,
    };
  }

  function removeFilter(key: keyof Defaults) {
    const next = { ...defaults, q, [key]: "" };
    if (key === "oficio") setOficio("");
    if (key === "veredicto") setVeredicto("");
    if (key === "estado" || key === "municipio" || key === "colonia" || key === "fraccionamiento") {
      const field = key === "estado" ? "state" : key;
      setAddress((current) => ({ ...current, [field]: "" }));
    }
    go(next);
  }

  function clearFilters() {
    setOficio("");
    setVeredicto("");
    setAddress(emptyAddress());
    go({ q });
  }

  const quickTrades = categories.filter((category) => QUICK_TRADES.includes(category.slug));

  return (
    <form
      role="search"
      className="grid gap-3"
      aria-busy={pending}
      onSubmit={(event) => {
        event.preventDefault();
        if (pending) return;
        setOpen(false);
        go(currentValues());
      }}
    >
      <fieldset disabled={pending} className="contents">
      <div
        className={cn(
          "flex items-center gap-2 rounded-2xl bg-card p-1.5 shadow-sm ring-1 focus-within:ring-2 focus-within:ring-primary",
          onDark ? "ring-white/25 shadow-lg shadow-black/20" : "ring-foreground/15",
        )}
      >
        <Search className="ml-2 size-5 shrink-0 text-muted-foreground" aria-hidden />
        <label htmlFor="q" className="sr-only">
          Buscar
        </label>
        <input
          id="q"
          type="search"
          value={q}
          onChange={(event) => setQ(event.target.value)}
          placeholder="Busca por nombre, teléfono u oficio"
          className="h-10 min-w-0 flex-1 bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground disabled:opacity-60"
          autoComplete="off"
        />
        <Button type="submit" size="lg" className="shrink-0 px-5" disabled={pending}>
          {pending ? <LoaderCircle className="animate-spin" aria-hidden /> : null}
          {pending ? "Buscando…" : "Buscar"}
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant={open ? "secondary" : "outline"}
          aria-expanded={open}
          aria-controls="search-filters"
          disabled={pending}
          onClick={() => setOpen((current) => !current)}
          className={onDark && !open ? "border-white/35 bg-white/10 text-white hover:bg-white/18 hover:text-white" : undefined}
        >
          <SlidersHorizontal aria-hidden />
          Filtros
          {active.length > 0 ? (
            <span className="rounded-full bg-primary px-1.5 text-xs font-semibold text-primary-foreground">
              {active.length}
            </span>
          ) : null}
        </Button>

        {active.map((filter) => (
          <button
            key={filter.key}
            type="button"
            onClick={() => removeFilter(filter.key)}
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm",
              onDark
                ? "bg-white/15 text-white hover:bg-white/25"
                : "bg-primary/10 text-primary hover:bg-primary/20",
            )}
            aria-label={`Quitar filtro ${filter.label}`}
          >
            {filter.label}
            <X className="size-3.5" aria-hidden />
          </button>
        ))}

        {active.length > 1 ? (
          <button
            type="button"
            onClick={clearFilters}
            className={cn(
              "text-sm underline-offset-2 hover:underline",
              onDark ? "text-white/70" : "text-muted-foreground",
            )}
          >
            Quitar todos
          </button>
        ) : null}

        {active.length === 0 && quickTrades.length > 0 ? (
          <>
            <span className={cn("text-sm", onDark ? "text-white/65" : "text-muted-foreground")}>
              o elige un oficio:
            </span>
            {quickTrades.map((category) => (
              <button
                key={category.slug}
                type="button"
                onClick={() => go({ q, oficio: category.slug })}
                className={cn(
                  "rounded-full border px-3 py-1 text-sm",
                  onDark
                    ? "border-white/30 bg-white/10 text-white hover:bg-white/20"
                    : "border-border bg-card hover:bg-muted",
                )}
              >
                {category.name}
              </button>
            ))}
          </>
        ) : null}
      </div>

      <div
        id="search-filters"
        hidden={!open}
        className={cn("grid gap-4 rounded-2xl bg-card p-4 ring-1 ring-foreground/10 md:p-5")}
      >
        <p className="text-[0.95rem] text-muted-foreground">Todos son opcionales. Usa solo los que necesites.</p>
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <Label htmlFor="oficio">Oficio</Label>
            <select id="oficio" value={oficio} onChange={(event) => setOficio(event.target.value)} className="control mt-1.5">
              <option value="">Cualquier oficio</option>
              {categories.map((category) => (
                <option key={category.slug} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="veredicto">Opiniones</Label>
            <select
              id="veredicto"
              value={veredicto}
              onChange={(event) => setVeredicto(event.target.value)}
              className="control mt-1.5"
            >
              <option value="">Cualquier opinión</option>
              <option value="BUENO">Lo recomiendan</option>
              <option value="REGULAR">Regular</option>
              <option value="MALO">No lo recomiendan</option>
            </select>
          </div>
        </div>
        <div className="grid gap-2">
          <p className="text-[0.95rem] font-semibold">Zona</p>
          <AddressFields value={address} onChange={setAddress} requireColonia={false} showCalle={false} />
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <Button type="button" variant="ghost" onClick={clearFilters} disabled={pending}>
            Limpiar
          </Button>
          <Button type="submit" disabled={pending}>
            {pending ? <LoaderCircle className="animate-spin" aria-hidden /> : <Search aria-hidden />}
            {pending ? "Buscando…" : "Aplicar filtros"}
          </Button>
        </div>
      </div>
      </fieldset>
    </form>
  );
}
