import Link from "next/link";
import { notFound } from "next/navigation";
import {
  BadgeCheck,
  CalendarDays,
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
  UserRound,
  Wallet,
  Wrench,
} from "lucide-react";
import { ReplyForm } from "@/components/reply-form";
import { ReviewControls } from "@/components/review-controls";
import { Stars, VerdictPill } from "@/components/verdict-pill";
import { Badge } from "@/components/ui/badge";
import { MEDIA_LABELS, STATUS_LABELS } from "@/lib/constants";
import { formatMxPhone } from "@/lib/phone";
import { getCurrentUser } from "@/server/auth";
import { getProvider, helpfulVoteSet } from "@/server/queries";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

function when(date: Date) {
  return new Intl.DateTimeFormat("es-MX", { dateStyle: "medium" }).format(date);
}

export default async function ProviderPage({ params }: { params: Promise<{ id: string }> }) {
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

  return (
    <div className="mx-auto grid max-w-3xl gap-8 px-4 py-8">
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
              <li>
                <UserRound aria-hidden />
                Escrito por {review.author.name}
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
            <ReviewControls
              reviewId={review.id}
              helpfulCount={review.helpfulCount}
              voted={votes.has(review.id)}
              canResolve={user?.id === review.authorId}
              resolved={review.status === "RESOLVED_AFTER_ISSUE"}
            />
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
