"use client";

import { useState, useTransition } from "react";
import { ExternalLink, LoaderCircle, MapPinned, Search, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  matchPlaceAction,
  type LocalPlaceMatch,
  type PlaceMatchResult,
  type RemotePlaceMatch,
} from "@/server/actions/place-match";

function scoreLabel(score: number) {
  if (score >= 0.85) return "Muy parecido";
  if (score >= 0.55) return "Parecido";
  if (score >= 0.3) return "Posible";
  return "Lejano";
}

function ScoreBadge({ score }: { score: number }) {
  return (
    <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
      {scoreLabel(score)} · {Math.round(score * 100)}%
    </span>
  );
}

export type PlaceMatchSelection =
  | { kind: "local"; match: LocalPlaceMatch }
  | { kind: "google"; match: RemotePlaceMatch };

export function PlaceMatchPanel({
  name,
  address,
  onSelect,
}: {
  name: string;
  address: {
    calle?: string;
    colonia?: string;
    fraccionamiento?: string;
    municipio?: string;
    estado?: string;
    postalCode?: string;
  };
  onSelect: (selection: PlaceMatchSelection) => void;
}) {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<PlaceMatchResult | null>(null);

  const canSearch = name.trim().length >= 2;

  return (
    <div className="grid gap-3 rounded-xl border border-border bg-muted/40 p-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="flex items-center gap-1.5 font-semibold">
            <MapPinned className="size-4 text-primary" aria-hidden />
            Coincidencias con Google Maps y el Buró
          </p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Cruza el nombre escrito con negocios similares y la dirección con la de Google.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          disabled={!canSearch || pending}
          onClick={() =>
            startTransition(async () => {
              const next = await matchPlaceAction({ name, ...address });
              setResult(next);
            })
          }
        >
          {pending ? <LoaderCircle className="animate-spin" aria-hidden /> : <Search aria-hidden />}
          {pending ? "Buscando…" : "Buscar coincidencias"}
        </Button>
      </div>

      {!canSearch ? (
        <p className="text-sm text-muted-foreground">Escribe el nombre del negocio para poder buscar.</p>
      ) : null}

      {result?.notice ? <p className="text-sm text-amber-900">{result.notice}</p> : null}

      {result?.address?.googleFormatted ? (
        <div className="rounded-lg border border-border bg-card px-3 py-2">
          <p className="text-sm font-medium">Dirección en Google Maps</p>
          <p className="text-[0.95rem]">{result.address.googleFormatted}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Tú escribiste: {result.address.written}
          </p>
          <div className="mt-1">
            <ScoreBadge score={result.address.addressScore} />
          </div>
        </div>
      ) : null}

      {result && result.local.length > 0 ? (
        <div className="grid gap-2">
          <p className="text-sm font-semibold">Ya están en el Buró</p>
          <ul className="divide-y rounded-lg border border-border bg-card">
            {result.local.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className="flex w-full items-start gap-2.5 px-3 py-2.5 text-left hover:bg-accent"
                  onClick={() => onSelect({ kind: "local", match: item })}
                >
                  <Store className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{item.name}</span>
                      <ScoreBadge score={item.nameScore} />
                    </span>
                    <span className="block text-sm text-muted-foreground">
                      {item.phone} · {item.city}, {item.state}
                    </span>
                    {item.googleFormattedAddress ? (
                      <span className="block text-sm text-muted-foreground">{item.googleFormattedAddress}</span>
                    ) : null}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {result && result.google.length > 0 ? (
        <div className="grid gap-2">
          <p className="text-sm font-semibold">En Google Maps</p>
          <ul className="divide-y rounded-lg border border-border bg-card">
            {result.google.map((item) => (
              <li key={item.placeId} className="grid gap-1 px-3 py-2.5 sm:grid-cols-[1fr_auto] sm:items-start">
                <button
                  type="button"
                  className="flex items-start gap-2.5 text-left hover:text-primary"
                  onClick={() => onSelect({ kind: "google", match: item })}
                >
                  <MapPinned className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                  <span className="min-w-0">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{item.name}</span>
                      <ScoreBadge score={item.nameScore} />
                    </span>
                    <span className="block text-sm text-muted-foreground">{item.formattedAddress}</span>
                    {item.phone ? <span className="block text-sm text-muted-foreground">Tel. {item.phone}</span> : null}
                    <span className="mt-1 inline-block text-sm font-medium text-primary">Usar estos datos</span>
                  </span>
                </button>
                <a
                  href={item.mapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-muted-foreground underline-offset-2 hover:underline"
                >
                  Ver mapa
                  <ExternalLink className="size-3.5" aria-hidden />
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {result && !result.notice && result.local.length === 0 && result.google.length === 0 && !result.address?.googleFormatted ? (
        <p className="text-sm text-muted-foreground">Sin resultados todavía. Prueba con el nombre completo o completa la dirección.</p>
      ) : null}
    </div>
  );
}
