"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  COST_RANGES,
  MAX_REVIEW_PHOTOS,
  MEDIA_LABELS,
  MEXICAN_STATES,
  NEGATIVE_TAGS,
  POSITIVE_TAGS,
} from "@/lib/constants";
import { preparePhoto } from "@/lib/photos";
import { reviewSchema } from "@/lib/validators/review";
import {
  Camera,
  Check,
  CircleCheck,
  ClipboardList,
  FileSignature,
  Hammer,
  ImagePlus,
  LoaderCircle,
  MapPin,
  Meh,
  MessageSquareText,
  Search,
  Send,
  Star,
  Store,
  Tag,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  UserPlus,
  Wallet,
} from "lucide-react";
import { AddressFields, emptyAddress, type AddressValue } from "@/components/address-fields";
import { SectionHeading } from "@/components/section-heading";
import { suggestProvidersAction } from "@/server/actions/discovery";
import { createReview } from "@/server/actions/reviews";

type Verdict = "BUENO" | "REGULAR" | "MALO";
type MediaType = "DEFECT_EVIDENCE" | "COMPLETED_WORK" | "CONTRACT_RECEIPT";

type LocalPhoto = {
  file: File;
  preview: string;
  mediaType: MediaType;
  caption: string;
};

const fieldClass = "mt-1.5";
const selectClass = "control mt-1.5";

function issueMap(issues: { path: PropertyKey[]; message: string }[]) {
  const map: Record<string, string> = {};
  for (const issue of issues) {
    const key = issue.path.map(String).join(".");
    if (!map[key]) map[key] = issue.message;
  }
  return map;
}

function defaultMedia(verdict: Verdict | ""): MediaType {
  if (verdict === "MALO") return "DEFECT_EVIDENCE";
  return "COMPLETED_WORK";
}

export function ReviewForm({
  categories,
  presetProvider,
}: {
  categories: { slug: string; name: string }[];
  presetProvider?: { id: string; businessName: string; phonePrimary: string } | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [categorySlug, setCategorySlug] = useState(categories[0]?.slug ?? "");
  const [mode, setMode] = useState<"existing" | "new">(presetProvider ? "existing" : "existing");
  const [query, setQuery] = useState(presetProvider ? presetProvider.businessName : "");
  const [suggestions, setSuggestions] = useState<
    { id: string; businessName: string; phonePrimary: string; primaryCity: string; primaryState: string }[]
  >([]);
  const [providerId, setProviderId] = useState(presetProvider?.id ?? "");
  const [providerLabel, setProviderLabel] = useState(
    presetProvider ? `${presetProvider.businessName} · ${presetProvider.phonePrimary}` : "",
  );
  const [verdict, setVerdict] = useState<Verdict | "">("");
  const [rating, setRating] = useState(0);
  const [tags, setTags] = useState<string[]>([]);
  const [gaveAdvance, setGaveAdvance] = useState(false);
  const [address, setAddress] = useState<AddressValue>(emptyAddress());
  const [photos, setPhotos] = useState<LocalPhoto[]>([]);

  const tagOptions = useMemo(
    () =>
      verdict === "MALO" ? NEGATIVE_TAGS : verdict === "BUENO" ? POSITIVE_TAGS : verdict === "REGULAR" ? [...NEGATIVE_TAGS, ...POSITIVE_TAGS] : [],
    [verdict],
  );

  useEffect(() => {
    if (mode !== "existing" || query.trim().length < 2 || providerLabel.startsWith(query)) return;
    const handle = setTimeout(() => {
      void suggestProvidersAction(query).then((rows) =>
        setSuggestions(
          rows.map((row) => ({
            id: row.id,
            businessName: row.businessName,
            phonePrimary: row.phonePrimary,
            primaryCity: row.primaryCity,
            primaryState: row.primaryState,
          })),
        ),
      );
    }, 250);
    return () => clearTimeout(handle);
  }, [query, mode, providerLabel]);

  function changeVerdict(next: Verdict) {
    setVerdict(next);
    setRating(next === "BUENO" ? 5 : next === "REGULAR" ? 3 : 1);
    setTags([]);
    setPhotos((current) => current.map((photo) => ({ ...photo, mediaType: defaultMedia(next) })));
  }

  async function onFiles(list: FileList | null) {
    if (!list) return;
    const room = MAX_REVIEW_PHOTOS - photos.length;
    const incoming = Array.from(list).slice(0, room);
    const prepared: LocalPhoto[] = [];
    for (const file of incoming) {
      const compressed = await preparePhoto(file);
      prepared.push({
        file: compressed,
        preview: URL.createObjectURL(compressed),
        mediaType: defaultMedia(verdict),
        caption: "",
      });
    }
    setPhotos((current) => [...current, ...prepared]);
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const newProvider =
      mode === "new"
        ? {
            businessName: String(form.get("businessName") ?? ""),
            contactName: String(form.get("contactName") ?? ""),
            phonePrimary: String(form.get("phonePrimary") ?? ""),
            phoneSecondary: String(form.get("phoneSecondary") ?? ""),
            socialMediaUrl: String(form.get("socialMediaUrl") ?? ""),
            primaryState: String(form.get("primaryState") ?? "") || address.state,
            primaryCity: String(form.get("primaryCity") ?? "") || address.municipio,
          }
        : undefined;

    const payload = {
      categorySlug,
      providerId: mode === "existing" ? providerId : "",
      newProvider,
      verdict,
      rating,
      title: String(form.get("title") ?? ""),
      description: String(form.get("description") ?? ""),
      tags,
      serviceDate: String(form.get("serviceDate") ?? ""),
      costRange: String(form.get("costRange") ?? ""),
      gaveAdvancePayment: gaveAdvance,
      advancePercentage: gaveAdvance ? Number(form.get("advancePercentage") ?? 0) : null,
      hadWrittenContract: form.get("hadWrittenContract") === "on",
      postalCode: address.postalCode,
      state: address.state,
      cityOrMunicipality: address.municipio,
      townOrLocality: address.ciudad,
      colonia: address.colonia,
      fraccionamiento: address.fraccionamiento,
      calle: address.calle,
      photos: photos.map((photo) => ({ mediaType: photo.mediaType, caption: photo.caption })),
    };

    const parsed = reviewSchema.safeParse(payload);
    if (!parsed.success) {
      const map = issueMap(parsed.error.issues);
      setErrors(map);
      toast.error(parsed.error.issues[0]?.message ?? "Revisa el formulario");
      return;
    }
    setErrors({});
    const body = new FormData();
    body.set("payload", JSON.stringify(parsed.data));
    photos.forEach((photo) => body.append("photos", photo.file));

    startTransition(async () => {
      const result = await createReview(body);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Tu opinión ya está publicada");
      router.push(`/proveedores/${result.providerId}`);
      router.refresh();
    });
  }

  const mediaChoices: MediaType[] =
    verdict === "MALO"
      ? ["DEFECT_EVIDENCE", "CONTRACT_RECEIPT", "COMPLETED_WORK"]
      : ["COMPLETED_WORK", "CONTRACT_RECEIPT", "DEFECT_EVIDENCE"];

  return (
    <form onSubmit={submit} className="grid gap-8">
      <section className="grid gap-4">
        <SectionHeading
          icon={Hammer}
          step="Paso 1 de 4"
          title="¿Quién hizo el trabajo?"
          description="Primero el oficio. Después busca el negocio. Si no aparece, puedes darlo de alta."
        />
        <div>
          <Label htmlFor="categorySlug">Oficio</Label>
          <select
            id="categorySlug"
            value={categorySlug}
            onChange={(event) => setCategorySlug(event.target.value)}
            className={selectClass}
          >
            {categories.map((category) => (
              <option key={category.slug} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
          {errors.categorySlug ? <p className="mt-1 text-sm text-destructive">{errors.categorySlug}</p> : null}
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Button type="button" variant={mode === "existing" ? "default" : "outline"} onClick={() => setMode("existing")}>
            <Search aria-hidden />
            Ya está en la lista
          </Button>
          <Button type="button" variant={mode === "new" ? "default" : "outline"} onClick={() => setMode("new")}>
            <UserPlus aria-hidden />
            No lo encuentro
          </Button>
        </div>
        {mode === "existing" ? (
          <div>
            <Label htmlFor="provider-query">Buscar por nombre o teléfono</Label>
            <Input
              id="provider-query"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setProviderId("");
                setProviderLabel("");
              }}
              className={fieldClass}
              placeholder="Nombre o teléfono de 10 dígitos"
            />
            {providerId ? (
              <p className="mt-2 flex items-center gap-1.5 text-sm text-primary">
                <CircleCheck className="size-4" aria-hidden />
                Seleccionado: {providerLabel}
              </p>
            ) : null}
            {errors.providerId ? <p className="mt-1 text-sm text-destructive">{errors.providerId}</p> : null}
            {suggestions.length > 0 ? (
            <ul className="mt-2 divide-y rounded-lg border border-border">
              {suggestions.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    className="flex w-full items-start gap-2.5 px-3 py-2.5 text-left hover:bg-accent"
                    onClick={() => {
                      setProviderId(item.id);
                      setProviderLabel(`${item.businessName} · ${item.phonePrimary}`);
                      setQuery(item.businessName);
                      setSuggestions([]);
                    }}
                  >
                    <Store className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                    <span>
                      <span className="font-medium">{item.businessName}</span>
                      <span className="block text-muted-foreground">
                        {item.phonePrimary} · {item.primaryCity}, {item.primaryState}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            ) : null}
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <Label htmlFor="businessName">Nombre con el que se anuncia</Label>
              <Input id="businessName" name="businessName" className={fieldClass} />
              {errors["newProvider.businessName"] ? (
                <p className="mt-1 text-sm text-destructive">{errors["newProvider.businessName"]}</p>
              ) : null}
            </div>
            <div>
              <Label htmlFor="contactName">Nombre de la persona</Label>
              <Input id="contactName" name="contactName" className={fieldClass} />
            </div>
            <div>
              <Label htmlFor="phonePrimary">Celular de 10 dígitos</Label>
              <Input id="phonePrimary" name="phonePrimary" inputMode="tel" className={fieldClass} placeholder="10 dígitos" />
              {errors["newProvider.phonePrimary"] ? (
                <p className="mt-1 text-sm text-destructive">{errors["newProvider.phonePrimary"]}</p>
              ) : null}
            </div>
            <div>
              <Label htmlFor="phoneSecondary">Otro teléfono</Label>
              <Input id="phoneSecondary" name="phoneSecondary" inputMode="tel" className={fieldClass} />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="socialMediaUrl">Facebook, Instagram o Marketplace</Label>
              <Input id="socialMediaUrl" name="socialMediaUrl" className={fieldClass} placeholder="https://" />
            </div>
            <div>
              <Label htmlFor="primaryState">Estado donde opera</Label>
              <select id="primaryState" name="primaryState" defaultValue={address.state} key={address.state} className={selectClass}>
                <option value="">Elige</option>
                {MEXICAN_STATES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="primaryCity">Ciudad o municipio</Label>
              <Input id="primaryCity" name="primaryCity" defaultValue={address.municipio} key={address.municipio} className={fieldClass} />
            </div>
          </div>
        )}
      </section>

      <section className="grid gap-4">
        <SectionHeading
          icon={MapPin}
          step="Paso 2 de 4"
          title="¿Dónde se hizo el trabajo?"
          description="Escribe el código postal: se llenan estado, municipio y ciudad. Luego elige colonia, calle y, si aplica, el fraccionamiento."
        />
        <AddressFields
          value={address}
          onChange={setAddress}
          errors={{
            postalCode: errors.postalCode,
            state: errors.state,
            municipio: errors.cityOrMunicipality,
            colonia: errors.colonia,
            calle: errors.calle,
          }}
        />
      </section>

      <section className="grid gap-4">
        <SectionHeading
          icon={MessageSquareText}
          step="Paso 3 de 4"
          title="¿Cómo te fue?"
          description="Elige una opción. Después puedes marcar lo que más se parezca a tu caso."
        />
        <div className="grid gap-3 md:grid-cols-3">
          {(
            [
              ["MALO", "No lo recomiendo", "El trabajo salió mal o no lo terminaron.", ThumbsDown, "text-rose-700 bg-rose-100"],
              ["REGULAR", "Quedó regular", "Sirvió, pero hubo detalles o retrasos.", Meh, "text-amber-800 bg-amber-100"],
              ["BUENO", "Lo recomiendo", "El trabajo quedó bien.", ThumbsUp, "text-emerald-800 bg-emerald-100"],
            ] as const
          ).map(([value, label, help, Icon, tone]) => (
            <button
              key={value}
              type="button"
              aria-pressed={verdict === value}
              onClick={() => changeVerdict(value)}
              className={`flex items-start gap-3 rounded-lg border px-3 py-2.5 text-left ${verdict === value ? "border-primary bg-primary/10 ring-1 ring-primary" : "border-border bg-card hover:bg-muted"}`}
            >
              <span className={`flex size-9 shrink-0 items-center justify-center rounded-full ${tone}`}>
                <Icon className="size-5" aria-hidden />
              </span>
              <span>
                <span className="block text-base font-semibold">{label}</span>
                <span className="block text-sm text-muted-foreground">{help}</span>
              </span>
            </button>
          ))}
        </div>
        {verdict ? (
          <div>
            <Label>Estrellas</Label>
            <p className="mt-0.5 text-[0.95rem] text-muted-foreground">{verdict === "REGULAR" ? "Una experiencia regular queda en 3 estrellas." : "Elige las estrellas que correspondan."}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {(verdict === "BUENO" ? [4, 5] : verdict === "MALO" ? [1, 2] : [3]).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  className={`inline-flex h-9 items-center gap-1 rounded-lg border px-3 font-semibold ${rating === value ? "border-amber-800 bg-amber-100 text-amber-950" : "border-border hover:bg-muted"}`}
                  aria-label={`${value} estrellas`}
                  aria-pressed={rating === value}
                >
                  {value}
                  <Star className="size-4 fill-amber-500 text-amber-600" aria-hidden />
                </button>
              ))}
            </div>
            {errors.rating ? <p className="mt-1 text-sm text-destructive">{errors.rating}</p> : null}
          </div>
        ) : null}
        {tagOptions.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {tagOptions.map((tag) => {
              const active = tags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setTags((current) => (active ? current.filter((item) => item !== tag) : [...current, tag]))}
                  aria-pressed={active}
                  className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm ${active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:bg-muted"}`}
                >
                  {active ? <Check className="size-3.5" aria-hidden /> : <Tag className="size-3.5 text-muted-foreground" aria-hidden />}
                  {tag}
                </button>
              );
            })}
          </div>
        ) : null}
        <div>
          <Label htmlFor="title">Un título corto</Label>
          <Input id="title" name="title" className={fieldClass} placeholder="Por ejemplo: Dejó la cocina a medias" />
          {errors.title ? <p className="mt-1 text-sm text-destructive">{errors.title}</p> : null}
        </div>
        <div>
          <Label htmlFor="description">Cuenta qué pasó</Label>
          <Textarea id="description" name="description" rows={6} className="mt-1.5" placeholder="Qué contrataste, qué te entregaron y si volviste a hablar con la persona." />
          {errors.description ? <p className="mt-1 text-sm text-destructive">{errors.description}</p> : null}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <SectionHeading
            icon={ClipboardList}
            title="Datos del trabajo"
            description="La fecha ayuda a ubicar el caso. El costo y el anticipo son opcionales."
          />
        </div>
        <div>
          <Label htmlFor="serviceDate">Fecha aproximada</Label>
          <Input id="serviceDate" name="serviceDate" type="date" className={fieldClass} />
          {errors.serviceDate ? <p className="mt-1 text-sm text-destructive">{errors.serviceDate}</p> : null}
        </div>
        <div>
          <Label htmlFor="costRange">Rango de costo</Label>
          <select id="costRange" name="costRange" className={selectClass}>
            <option value="">Prefiero no decir</option>
            {COST_RANGES.map((range) => (
              <option key={range} value={range}>
                {range} MXN
              </option>
            ))}
          </select>
        </div>
        <label className="flex items-center gap-2.5 rounded-lg border border-border bg-card px-3 py-2">
          <input type="checkbox" className="size-4" checked={gaveAdvance} onChange={(event) => setGaveAdvance(event.target.checked)} />
          <Wallet className="size-4 text-muted-foreground" aria-hidden />
          Di un anticipo
        </label>
        <label className="flex items-center gap-2.5 rounded-lg border border-border bg-card px-3 py-2">
          <input type="checkbox" name="hadWrittenContract" className="size-4" />
          <FileSignature className="size-4 text-muted-foreground" aria-hidden />
          Firmamos un papel o una nota
        </label>
        {gaveAdvance ? (
          <div>
            <Label htmlFor="advancePercentage">Porcentaje aproximado del anticipo</Label>
            <Input id="advancePercentage" name="advancePercentage" type="number" min={1} max={100} className={fieldClass} />
            {errors.advancePercentage ? <p className="mt-1 text-sm text-destructive">{errors.advancePercentage}</p> : null}
          </div>
        ) : null}
      </section>

      <section className="grid gap-4">
        <SectionHeading
          icon={Camera}
          step="Paso 4 de 4"
          title="Sube las fotos"
          description="Hace falta al menos una foto y puedes subir hasta cinco. Si no lo recomiendas, muestra el problema. Si lo recomiendas, muestra el trabajo terminado. La ubicación de la foto se borra antes de publicarla."
        />
        <label
          className={`flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed px-4 py-6 text-center hover:bg-muted ${photos.length >= MAX_REVIEW_PHOTOS ? "pointer-events-none opacity-50" : "border-input bg-card"}`}
        >
          <ImagePlus className="size-7 text-primary" aria-hidden />
          <span className="font-semibold">Elegir fotos</span>
          <span className="text-sm text-muted-foreground">
            {photos.length} de {MAX_REVIEW_PHOTOS} fotos
          </span>
          <input
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            disabled={photos.length >= MAX_REVIEW_PHOTOS}
            onChange={(event) => {
              void onFiles(event.target.files);
              event.target.value = "";
            }}
          />
        </label>
        {errors.photos ? <p className="text-sm text-destructive">{errors.photos}</p> : null}
        <ul className="grid gap-3">
          {photos.map((photo, index) => (
            <li key={photo.preview} className="grid gap-2 rounded-xl border border-border p-3 md:grid-cols-[120px_1fr]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo.preview} alt="" className="h-24 w-full rounded-lg object-cover" />
              <div className="grid gap-2">
                <select
                  value={photo.mediaType}
                  onChange={(event) =>
                    setPhotos((current) =>
                      current.map((item, itemIndex) =>
                        itemIndex === index ? { ...item, mediaType: event.target.value as MediaType } : item,
                      ),
                    )
                  }
                  className="control"
                >
                  {mediaChoices.map((type) => (
                    <option key={type} value={type}>
                      {MEDIA_LABELS[type]}
                    </option>
                  ))}
                </select>
                <Input
                  value={photo.caption}
                  placeholder="Qué se ve en la foto"
                  onChange={(event) =>
                    setPhotos((current) =>
                      current.map((item, itemIndex) => (itemIndex === index ? { ...item, caption: event.target.value } : item)),
                    )
                  }
                />
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setPhotos((current) => current.filter((_, itemIndex) => itemIndex !== index))}
                >
                  <Trash2 aria-hidden />
                  Quitar foto
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <Button type="submit" size="lg" disabled={pending} className="w-full sm:w-fit sm:px-8">
        {pending ? <LoaderCircle className="animate-spin" aria-hidden /> : <Send aria-hidden />}
        {pending ? "Publicando…" : "Publicar mi opinión"}
      </Button>
    </form>
  );
}
