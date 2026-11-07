import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  BadgeCheck,
  CalendarDays,
  ChevronRight,
  FileSignature,
  Globe,
  Inbox,
  MapPin,
  MessageSquareText,
  PenLine,
  Phone,
  Reply,
  Star,
  Store,
  TriangleAlert,
  Wallet,
  Wrench,
} from "lucide-react";
import { JsonLd } from "@/components/json-ld";
import { ReplyForm } from "@/components/reply-form";
import { ReviewControls } from "@/components/review-controls";
import { Stars, VerdictPill } from "@/components/verdict-pill";
import { Badge } from "@/components/ui/badge";
import { MEDIA_LABELS, STATUS_LABELS } from "@/lib/constants";
import { formatMxPhone } from "@/lib/phone";
import { absoluteUrl, buildPageMetadata, SITE, truncateMeta } from "@/lib/seo";
import { getCurrentUser } from "@/server/auth";
import { getProvider, helpfulVoteSet } from "@/server/queries";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

function when(date: Date) {
  return new Intl.DateTimeFormat("es-MX", { dateStyle: "medium" }).format(date);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  let provider: Awaited<ReturnType<typeof getProvider>> = null;
  try {
    provider = await getProvider(id);
  } catch {
    /* ignore */
  }
  if (!provider) {
    return { title: "Proveedor no encontrado", robots: { index: false } };
  }

  const oficios = provider.categories.map((c) => c.name).join(", ") || "oficios";
  const title = `${provider.businessName}: opiniones y calificación`;
  const description = truncateMeta(
    `${provider.businessName} en ${provider.primaryCity}, ${provider.primaryState}. ${oficios}. ${provider.totalReviews} opiniones, promedio ${provider.averageScore.toFixed(1)}/5. Lee fotos y respuestas antes de contratar.`,
  );

  return buildPageMetadata({
    title,
    description,
    path: `/proveedores/${provider.id}`,
    type: "profile",
    keywords: [
      provider.businessName,
      oficios,
      provider.primaryCity,
      provider.primaryState,
      `opiniones ${provider.businessName}`,
      ...SITE.keywords,
    ],
  });
}

export default async function ProviderPage({ params }: Props) {
  const { id } = await params;
  let provider: Awaited<ReturnType<typeof getProvider>> = null;
  try {
    provider = await getProvider(id);
  } catch (error) {
    console.error(error);
  }
  if (!provider) notFound();

  const user = await getCurrentUser();
  const votes = user ? await helpfulVoteSet(user.id, provider.reviews.map((review) => review.id)) : new Set<string>();
  const ownsProfile = user?.id === provider.claimedByUserId;
  const pageUrl = absoluteUrl(`/proveedores/${provider.id}`);
  const oficios = provider.categories.map((c) => c.name);
  const primaryOficio = oficios[0];

  const localBusinessLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "HomeAndConstructionBusiness",
    "@id": `${pageUrl}#business`,
    name: provider.businessName,
    url: pageUrl,
    telephone: formatMxPhone(provider.phonePrimary),
    address: {
      "@type": "PostalAddress",
      addressLocality: provider.primaryCity,
      addressRegion: provider.primaryState,
      addressCountry: "MX",
      ...(provider.googleFormattedAddress ? { streetAddress: provider.googleFormattedAddress } : {}),
    },
    areaServed: {
      "@type": "AdministrativeArea",
      name: `${provider.primaryCity}, ${provider.primaryState}`,
    },
    ...(primaryOficio ? { knowsAbout: oficios } : {}),
    ...(provider.socialMediaUrl ? { sameAs: [provider.socialMediaUrl] } : {}),
    ...(provider.googleMapsUrl ? { hasMap: provider.googleMapsUrl } : {}),
  };

  if (provider.totalReviews > 0) {
    localBusinessLd.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: Number(provider.averageScore.toFixed(1)),
      bestRating: 5,
      worstRating: 1,
      ratingCount: provider.totalReviews,
      reviewCount: provider.totalReviews,
    };
    localBusinessLd.review = provider.reviews.slice(0, 10).map((review) => ({
      "@type": "Review",
      name: review.title,
      reviewBody: truncateMeta(review.description, 300),
      datePublished: review.createdAt.toISOString(),
      reviewRating: {
        "@type": "Rating",
        ratingValue: review.rating,
        bestRating: 5,
        worstRating: 1,
      },
      author: { "@type": "Person", name: "Cliente verificado" },
      publisher: { "@type": "Organization", name: SITE.name },
      ...(review.providerReply
        ? {
            comment: {
              "@type": "Comment",
              text: truncateMeta(review.providerReply.content, 280),
              author: { "@type": "Organization", name: provider.businessName },
            },
          }
        : {}),
    }));
  }

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: absoluteUrl("/") },
      ...(primaryOficio
        ? [
            {
              "@type": "ListItem",
              position: 2,
              name: primaryOficio,
              item: absoluteUrl(`/oficios/${provider.categories[0].slug}`),
            },
            { "@type": "ListItem", position: 3, name: provider.businessName, item: pageUrl },
          ]
        : [{ "@type": "ListItem", position: 2, name: provider.businessName, item: pageUrl }]),
    ],
  };

  return (
    <div className="mx-auto grid max-w-3xl gap-8 px-4 py-8">
      <JsonLd data={[localBusinessLd, breadcrumbLd]} />
      <nav aria-label="Migas de pan" className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
        <Link href="/" className="hover:underline">
          Inicio
        </Link>
        {primaryOficio ? (
          <>
            <ChevronRight className="size-3.5" aria-hidden />
            <Link href={`/oficios/${provider.categories[0].slug}`} className="hover:underline">
              {primaryOficio}
            </Link>
          </>
        ) : null}
        <ChevronRight className="size-3.5" aria-hidden />
        <span className="text-foreground">{provider.businessName}</span>
      </nav>
      <header className="grid gap-3">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl">{provider.businessName}</h1>
          <ul className="mt-2 grid gap-1.5 [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-muted-foreground">
            <li className="flex items-center gap-2">
              <Wrench aria-hidden />
              {provider.categories.map((category) => category.name).join(" · ")}
            </li>
            <li className="flex items-center gap-2 text-muted-foreground">
              <MapPin aria-hidden />
              {provider.primaryCity}, {provider.primaryState}
            </li>
            <li className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <Phone aria-hidden />
              {provider.contactName ? `${provider.contactName} · ` : ""}
              {formatMxPhone(provider.phonePrimary)}
              {provider.phoneSecondary ? ` · ${formatMxPhone(provider.phoneSecondary)}` : ""}
            </li>
            {provider.socialMediaUrl ? (
              <li className="flex items-center gap-2">
                <Globe aria-hidden />
                <a href={provider.socialMediaUrl} className="underline" target="_blank" rel="noreferrer">
                  Página o redes
                </a>
              </li>
            ) : null}
            {provider.googleMapsUrl ? (
              <li className="flex items-start gap-2">
                <MapPin aria-hidden />
                <span>
                  <a href={provider.googleMapsUrl} className="underline" target="_blank" rel="noreferrer">
                    Ver en Google Maps
                  </a>
                  {provider.googleFormattedAddress ? (
                    <span className="block text-sm text-muted-foreground">{provider.googleFormattedAddress}</span>
                  ) : null}
                </span>
              </li>
            ) : null}
            {provider.isClaimed ? (
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <BadgeCheck className="text-primary!" aria-hidden />
                El dueño está registrado y puede responder.
              </li>
            ) : null}
          </ul>
        </div>
        <dl className="grid grid-cols-3 gap-2 rounded-xl bg-card p-3 text-center ring-1 ring-foreground/10">
          <div>
            <dt className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
              <Star className="size-4" aria-hidden />
              Calificación
            </dt>
            <dd className="text-xl font-bold">{provider.averageScore.toFixed(1)}</dd>
            <dd>
              <Stars rating={Math.round(provider.averageScore)} />
            </dd>
          </div>
          <div>
            <dt className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
              <MessageSquareText className="size-4" aria-hidden />
              Opiniones
            </dt>
            <dd className="text-xl font-bold">{provider.totalReviews}</dd>
            <dd className="text-sm">{provider.goodReviewsCount} lo recomiendan</dd>
          </div>
          <div>
            <dt className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
              <TriangleAlert className="size-4" aria-hidden />
              Quejas abiertas
            </dt>
            <dd className={cn("text-xl font-bold", provider.badReviewsCount > 0 && "text-destructive")}>{provider.badReviewsCount}</dd>
            <dd className="text-sm">{provider.badReviewsCount === 0 ? "Ninguna pendiente" : "Sin resolver"}</dd>
          </div>
        </dl>
        <div className="flex flex-wrap gap-2">
          {ownsProfile ? null : (
            <Link href={`/resenas/nueva?proveedor=${provider.id}`} className={buttonVariants()}>
              <PenLine aria-hidden />
              Contar cómo me fue
            </Link>
          )}
          {!provider.isClaimed ? (
            <Link href={`/proveedor/reclamar?perfil=${provider.id}`} className={buttonVariants({ variant: "outline" })}>
              <Store aria-hidden />
              Este es mi negocio
            </Link>
          ) : null}
        </div>
        <p className="text-sm text-muted-foreground">
          <Link href={`/proveedores/${provider.id}/md`} className="underline">
            Versión Markdown para agentes de IA
          </Link>
        </p>
      </header>

      <section className="grid gap-4">
        <h2 className="flex items-center gap-2 font-heading text-xl">
          <MessageSquareText className="size-5 text-primary" aria-hidden />
          Lo que contaron
        </h2>
        {provider.reviews.length === 0 ? (
          <p className="flex items-center gap-2 text-muted-foreground">
            <Inbox className="size-5" aria-hidden />
            Todavía nadie ha contado su experiencia.
          </p>
        ) : null}
        {provider.reviews.map((review) => (
          <article key={review.id} className="grid gap-3 rounded-xl bg-card p-4 ring-1 ring-foreground/10">
            <div className="flex flex-wrap items-center gap-2">
              <VerdictPill verdict={review.verdict} />
              <Stars rating={review.rating} />
              <span className="text-sm text-muted-foreground">{STATUS_LABELS[review.status]}</span>
            </div>
            <h3 className="font-heading text-lg">{review.title}</h3>
            <ul className="grid gap-1 text-sm text-muted-foreground [&_svg]:mt-0.5 [&_svg]:size-4 [&_svg]:shrink-0">
              <li className="flex items-start gap-2">
                <Wrench aria-hidden />
                {review.category.name}
              </li>
              <li className="flex items-start gap-2">
                <MapPin aria-hidden />
                <span>
                  {review.calle ? `${review.calle} · ` : ""}
                  {review.colonia}
                  {review.fraccionamiento ? `, ${review.fraccionamiento}` : ""}, {review.cityOrMunicipality}, {review.state}. CP{" "}
                  {review.postalCode}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CalendarDays aria-hidden />
                Trabajo de {when(review.serviceDate)}
              </li>
            </ul>
            <p className="whitespace-pre-wrap">{review.description}</p>
            <div className="flex flex-wrap gap-1.5">
              {review.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-sm">
                  {tag}
                </Badge>
              ))}
            </div>
            <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground [&_li]:flex [&_li]:items-center [&_li]:gap-1.5 [&_svg]:size-4 [&_svg]:shrink-0">
              {review.costRange ? (
                <li>
                  <Wallet aria-hidden />
                  Costo aproximado: {review.costRange}
                </li>
              ) : null}
              <li>
                <Wallet aria-hidden />
                {review.gaveAdvancePayment ? `Dio un anticipo de ${review.advancePercentage ?? ""}%` : "No dio anticipo"}
              </li>
              <li>
                <FileSignature aria-hidden />
                {review.hadWrittenContract ? "Hubo un papel firmado" : "No hubo contrato"}
              </li>
            </ul>
            <div className="grid gap-3 sm:grid-cols-2">
              {review.media.map((media) => (
                <figure key={media.id} className="grid gap-1">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={media.url} alt={media.caption ?? MEDIA_LABELS[media.mediaType]} className="max-h-64 w-full rounded-lg object-cover" />
                  <figcaption className="text-sm text-muted-foreground">
                    {MEDIA_LABELS[media.mediaType]}
                    {media.caption ? ` · ${media.caption}` : ""}
                  </figcaption>
                </figure>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <ReviewControls
                reviewId={review.id}
                helpfulCount={review.helpfulCount}
                voted={votes.has(review.id)}
                canResolve={user?.id === review.authorId}
                resolved={review.status === "RESOLVED_AFTER_ISSUE"}
              />
              {user?.role === "ADMIN" ? (
                <Link href={`/admin/resenas/${review.id}/editar`} className={buttonVariants({ variant: "outline" })}>
                  <PenLine aria-hidden />
                  Editar (admin)
                </Link>
              ) : null}
            </div>
            {review.providerReply ? (
              <blockquote className="rounded-xl border-l-4 border-primary bg-muted px-4 py-3">
                <p className="flex items-center gap-1.5 font-semibold">
                  <Reply className="size-4 text-primary" aria-hidden />
                  Respuesta de {review.providerReply.providerUser.name}
                </p>
                <p className="mt-1 whitespace-pre-wrap">{review.providerReply.content}</p>
                {review.providerReply.mediaUrls.length > 0 ? (
                  <div className="mt-2 grid gap-2 sm:grid-cols-3">
                    {review.providerReply.mediaUrls.map((url) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={url} src={url} alt="Contra-evidencia del proveedor" className="h-32 w-full rounded-lg object-cover" />
                    ))}
                  </div>
                ) : null}
              </blockquote>
            ) : ownsProfile ? (
              <ReplyForm reviewId={review.id} />
            ) : null}
          </article>
        ))}
      </section>
    </div>
  );
}
