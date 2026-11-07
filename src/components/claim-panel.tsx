"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Clock, LoaderCircle, MessageSquareText, Send, ShieldCheck, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createBrowserSupabase } from "@/lib/supabase/client";
import { normalizeMxPhone } from "@/lib/phone";
import { confirmVerifiedPhone, requestClaim } from "@/server/actions/claims";
import { suggestProvidersAction } from "@/server/actions/discovery";

export function ClaimPanel({
  preset,
  smsAvailable,
}: {
  preset?: { id: string; businessName: string; phonePrimary: string } | null;
  smsAvailable: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [query, setQuery] = useState(preset?.businessName ?? "");
  const [providerId, setProviderId] = useState(preset?.id ?? "");
  const [phone, setPhone] = useState(preset?.phonePrimary ?? "");
  const [note, setNote] = useState("");
  const [token, setToken] = useState("");
  const [suggestions, setSuggestions] = useState<{ id: string; businessName: string; phonePrimary: string }[]>([]);

  const configured = smsAvailable;

  return (
    <div className="grid gap-4">
      {!preset ? (
        <div>
          <Label htmlFor="buscar-perfil">Busca tu perfil</Label>
          <Input
            id="buscar-perfil"
            value={query}
            onChange={(event) => {
              const value = event.target.value;
              setQuery(value);
              setProviderId("");
              if (value.trim().length >= 2) {
                void suggestProvidersAction(value).then((rows) =>
                  setSuggestions(rows.map((row) => ({ id: row.id, businessName: row.businessName, phonePrimary: row.phonePrimary }))),
                );
              }
            }}
            className="mt-1.5"
            placeholder="Nombre del negocio o teléfono"
          />
          <ul className="mt-2 divide-y rounded-lg border border-border">
            {suggestions.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left hover:bg-accent"
                  onClick={() => {
                    setProviderId(item.id);
                    setQuery(item.businessName);
                    setPhone(item.phonePrimary);
                    setSuggestions([]);
                  }}
                >
                  <Store className="size-4 shrink-0 text-primary" aria-hidden />
                  {item.businessName} · {item.phonePrimary}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="flex items-start gap-2 text-base">
          <Store className="mt-1 size-4 shrink-0 text-primary" aria-hidden />
          <span>
          Vas a indicar que <strong>{preset.businessName}</strong> es tu negocio. El teléfono del anuncio es {preset.phonePrimary}.
          </span>
        </p>
      )}
      <div>
        <Label htmlFor="phone-claim">Teléfono del negocio</Label>
        <Input id="phone-claim" value={phone} onChange={(event) => setPhone(event.target.value)} className="mt-1.5" />
      </div>
      <div>
        <Label htmlFor="note">Nota para la revisión</Label>
        <Textarea id="note" value={note} onChange={(event) => setNote(event.target.value)} rows={3} className="mt-1.5" placeholder="Por ejemplo: soy el dueño y el teléfono del anuncio es el mío." />
      </div>
      {configured ? (
        <div className="grid gap-2 rounded-xl border border-border p-3">
          <p className="text-sm">Si Supabase tiene SMS activo, confirma el número y el reclamo se aprueba solo.</p>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                const normalized = normalizeMxPhone(phone);
                const supabase = createBrowserSupabase();
                if (!normalized || !supabase) {
                  toast.error("Revisa el teléfono");
                  return;
                }
                void supabase.auth.updateUser({ phone: `+52${normalized}` }).then(({ error }) => {
                  if (error) toast.error(error.message);
                  else toast.success("Te enviamos un código por SMS");
                });
              }}
            >
              <MessageSquareText aria-hidden />
              Enviar código
            </Button>
            <Input value={token} onChange={(event) => setToken(event.target.value)} placeholder="Código" className="h-9 max-w-32" />
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                const normalized = normalizeMxPhone(phone);
                const supabase = createBrowserSupabase();
                if (!normalized || !supabase) return;
                startTransition(async () => {
                  const { error } = await supabase.auth.verifyOtp({
                    phone: `+52${normalized}`,
                    token,
                    type: "phone_change",
                  });
                  if (error) {
                    toast.error(error.message);
                    return;
                  }
                  const confirmed = await confirmVerifiedPhone(normalized);
                  if (!confirmed.ok) toast.error(confirmed.error);
                  else toast.success("Teléfono verificado");
                });
              }}
            >
              <ShieldCheck aria-hidden />
              Confirmar SMS
            </Button>
          </div>
        </div>
      ) : (
        <p className="flex items-start gap-2 rounded-lg bg-muted px-3 py-2">
          <Clock className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
          Tu solicitud queda en espera para que alguien del sitio la revise. No se puede borrar una opinión: solo responderla.
        </p>
      )}
      <Button
        type="button"
       
        className="w-full sm:w-fit"
        disabled={pending || !providerId}
        onClick={() => {
          if (pending || !providerId) return;
          startTransition(async () => {
            const result = await requestClaim({ providerId, phone, note });
            if (!result.ok) {
              toast.error(result.error);
              return;
            }
            toast.success(result.status === "APPROVED" ? "Este negocio ya quedó a tu nombre" : "Enviamos tu solicitud a revisión");
            router.refresh();
          });
        }}
      >
        {pending ? <LoaderCircle className="animate-spin" aria-hidden /> : <Send aria-hidden />}
        {pending ? "Enviando…" : "Enviar solicitud"}
      </Button>
    </div>
  );
}
