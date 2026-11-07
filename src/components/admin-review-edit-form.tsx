"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, Save } from "lucide-react";
import { toast } from "sonner";
import { AddressFields, emptyAddress, type AddressValue } from "@/components/address-fields";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { COST_RANGES, MEDIA_LABELS, NEGATIVE_TAGS, POSITIVE_TAGS } from "@/lib/constants";
import { updateReviewSchema } from "@/lib/validators/review";
import { updateReviewAction } from "@/server/actions/reviews";

type Verdict = "BUENO" | "REGULAR" | "MALO";

export function AdminReviewEditForm({
  categories,
  review,
}: {
  categories: { slug: string; name: string }[];
  review: {
    id: string;
    title: string;
    description: string;
    verdict: Verdict;
    rating: number;
    tags: string[];
    serviceDate: string;
    costRange: string | null;
    gaveAdvancePayment: boolean;
    advancePercentage: number | null;
    hadWrittenContract: boolean;
    postalCode: string;
    state: string;
    cityOrMunicipality: string;
    townOrLocality: string | null;
    colonia: string;
    fraccionamiento: string | null;
    calle: string | null;
    categorySlug: string;
    providerName: string;
    media: { id: string; url: string; mediaType: keyof typeof MEDIA_LABELS; caption: string | null }[];
  };
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [categorySlug, setCategorySlug] = useState(review.categorySlug);
  const [verdict, setVerdict] = useState<Verdict>(review.verdict);
  const [rating, setRating] = useState(review.rating);
  const [tags, setTags] = useState(review.tags);
  const [title, setTitle] = useState(review.title);
  const [description, setDescription] = useState(review.description);
  const [serviceDate, setServiceDate] = useState(review.serviceDate);
  const [costRange, setCostRange] = useState(review.costRange ?? "");
  const [gaveAdvance, setGaveAdvance] = useState(review.gaveAdvancePayment);
  const [advancePercentage, setAdvancePercentage] = useState(String(review.advancePercentage ?? ""));
  const [hadWrittenContract, setHadWrittenContract] = useState(review.hadWrittenContract);
  const [address, setAddress] = useState<AddressValue>(
    emptyAddress({
      postalCode: review.postalCode,
      state: review.state,
      municipio: review.cityOrMunicipality,
      ciudad: review.townOrLocality ?? "",
      colonia: review.colonia,
      fraccionamiento: review.fraccionamiento ?? "",
      calle: review.calle ?? "",
    }),
  );

  const tagOptions = useMemo(
    () =>
      verdict === "MALO" ? NEGATIVE_TAGS : verdict === "BUENO" ? POSITIVE_TAGS : [...NEGATIVE_TAGS, ...POSITIVE_TAGS],
    [verdict],
  );

  function changeVerdict(next: Verdict) {
    setVerdict(next);
    setRating(next === "BUENO" ? 5 : next === "REGULAR" ? 3 : 1);
    setTags([]);
  }

  function save() {
    if (pending) return;
    const payload = {
      reviewId: review.id,
      categorySlug,
      verdict,
      rating,
      title,
      description,
      tags,
      serviceDate,
      costRange,
      gaveAdvancePayment: gaveAdvance,
      advancePercentage: gaveAdvance ? Number(advancePercentage || 0) : null,
      hadWrittenContract,
      postalCode: address.postalCode,
      state: address.state,
      cityOrMunicipality: address.municipio,
      townOrLocality: address.ciudad,
      colonia: address.colonia,
      fraccionamiento: address.fraccionamiento,
      calle: address.calle,
    };
    const parsed = updateReviewSchema.safeParse(payload);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Revisa el formulario");
      return;
    }
    startTransition(async () => {
      const result = await updateReviewAction(parsed.data);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Opinión actualizada");
      router.push(`/proveedores/${result.providerId}`);
      router.refresh();
    });
  }

  return (
    <div className="grid gap-6" aria-busy={pending}>
      <fieldset disabled={pending} className="contents">
      <p className="rounded-xl bg-muted px-4 py-3 text-[0.95rem]">
        Editando opinión de <strong>{review.providerName}</strong>. Las fotos se conservan; las opiniones no se pueden
        borrar.
      </p>

      <div>
        <Label htmlFor="categorySlug">Oficio</Label>
        <select id="categorySlug" value={categorySlug} onChange={(event) => setCategorySlug(event.target.value)} className="control mt-1.5">
          {categories.map((category) => (
            <option key={category.slug} value={category.slug}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <AddressFields value={address} onChange={setAddress} />

      <div className="grid gap-3">
        <Label>Resultado</Label>
        <div className="grid gap-2 md:grid-cols-3">
          {(
            [
              ["MALO", "No lo recomiendo"],
              ["REGULAR", "Quedó regular"],
              ["BUENO", "Lo recomiendo"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => changeVerdict(value)}
              className={`rounded-lg border px-3 py-2 text-left font-semibold ${verdict === value ? "border-primary bg-primary/10" : "border-border"}`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {(verdict === "BUENO" ? [4, 5] : verdict === "MALO" ? [1, 2] : [3]).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              className={`h-9 min-w-9 rounded-lg border px-3 font-semibold ${rating === value ? "border-amber-800 bg-amber-100" : "border-border"}`}
            >
              {value}★
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {tagOptions.map((tag) => {
            const active = tags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => setTags((current) => (active ? current.filter((item) => item !== tag) : [...current, tag]))}
                className={`rounded-full border px-3 py-1 text-sm ${active ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}
              >
                {tag}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <Label htmlFor="title">Título</Label>
        <Input id="title" value={title} onChange={(event) => setTitle(event.target.value)} className="mt-1.5" />
      </div>
      <div>
        <Label htmlFor="description">Descripción</Label>
        <Textarea id="description" rows={8} value={description} onChange={(event) => setDescription(event.target.value)} className="mt-1.5" />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <Label htmlFor="serviceDate">Fecha del trabajo</Label>
          <Input id="serviceDate" type="date" value={serviceDate} onChange={(event) => setServiceDate(event.target.value)} className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="costRange">Costo</Label>
          <select id="costRange" value={costRange} onChange={(event) => setCostRange(event.target.value)} className="control mt-1.5">
            <option value="">Prefiero no decir</option>
            {COST_RANGES.map((range) => (
              <option key={range} value={range}>
                {range} MXN
              </option>
            ))}
          </select>
        </div>
        <label className="flex items-center gap-2.5 rounded-lg border border-border px-3 py-2">
          <input type="checkbox" className="size-4" checked={gaveAdvance} onChange={(event) => setGaveAdvance(event.target.checked)} />
          Dio un anticipo
        </label>
        <label className="flex items-center gap-2.5 rounded-lg border border-border px-3 py-2">
          <input
            type="checkbox"
            className="size-4"
            checked={hadWrittenContract}
            onChange={(event) => setHadWrittenContract(event.target.checked)}
          />
          Hubo un papel firmado
        </label>
        {gaveAdvance ? (
          <div>
            <Label htmlFor="advance">Porcentaje del anticipo</Label>
            <Input
              id="advance"
              type="number"
              min={1}
              max={100}
              value={advancePercentage}
              onChange={(event) => setAdvancePercentage(event.target.value)}
              className="mt-1.5"
            />
          </div>
        ) : null}
      </div>

      {review.media.length > 0 ? (
        <div className="grid gap-2">
          <p className="font-semibold">Fotos (no se borran)</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {review.media.map((media) => (
              <figure key={media.id} className="grid gap-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={media.url} alt="" className="h-40 w-full rounded-lg object-cover" />
                <figcaption className="text-sm text-muted-foreground">
                  {MEDIA_LABELS[media.mediaType]}
                  {media.caption ? ` · ${media.caption}` : ""}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      ) : null}

      <Button type="button" size="lg" disabled={pending} onClick={save} className="w-full sm:w-fit">
        {pending ? <LoaderCircle className="animate-spin" aria-hidden /> : <Save aria-hidden />}
        {pending ? "Guardando…" : "Guardar cambios"}
      </Button>
      </fieldset>
    </div>
  );
}
