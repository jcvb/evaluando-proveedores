import Link from "next/link";
import { BadgeCheck, CircleCheck, MapPin, Phone, TriangleAlert, Wrench } from "lucide-react";
import { formatMxPhone } from "@/lib/phone";
import { Stars } from "@/components/verdict-pill";

export function ProviderCard({
  provider,
}: {
  provider: {
    id: string;
    businessName: string;
    contactName: string | null;
    phonePrimary: string;
    primaryState: string;
    primaryCity: string;
    isClaimed: boolean;
    totalReviews: number;
    badReviewsCount: number;
    averageScore: number;
    categories: { name: string; slug: string }[];
  };
}) {
  const opinions = provider.totalReviews === 1 ? "1 opinión" : `${provider.totalReviews} opiniones`;

  return (
    <Link href={`/proveedores/${provider.id}`} className="group block h-full rounded-2xl">
      <article className="flex h-full flex-col gap-3 rounded-2xl bg-card p-4 ring-1 ring-foreground/10 transition-shadow group-hover:shadow-md">
        <div>
          <h2 className="flex items-center gap-1.5 font-heading text-lg group-hover:underline">
            {provider.businessName}
            {provider.isClaimed ? <BadgeCheck className="size-4 shrink-0 text-primary" aria-label="Dueño registrado" /> : null}
          </h2>
          <ul className="mt-1 grid gap-1 text-[0.95rem] [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-muted-foreground">
            <li className="flex items-center gap-2">
              <Wrench aria-hidden />
              {provider.categories.length > 0
                ? provider.categories.map((category) => category.name).join(" · ")
                : "Oficio sin detallar"}
            </li>
            <li className="flex items-center gap-2 text-muted-foreground">
              <MapPin aria-hidden />
              {provider.primaryCity}, {provider.primaryState}
            </li>
            {provider.contactName || provider.phonePrimary ? (
              <li className="flex items-center gap-2">
                <Phone aria-hidden />
                {provider.contactName ? `${provider.contactName}${provider.phonePrimary ? " · " : ""}` : ""}
                {provider.phonePrimary ? formatMxPhone(provider.phonePrimary) : ""}
              </li>
            ) : null}
          </ul>
        </div>
        <div className="mt-auto flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.95rem]">
          <Stars rating={Math.round(provider.averageScore)} />
          <span>
            {provider.averageScore.toFixed(1)} · {opinions}
          </span>
        </div>
        <p
          className={`flex items-center gap-1.5 ${provider.badReviewsCount > 0 ? "text-sm font-semibold text-destructive" : "text-sm text-muted-foreground"}`}
        >
          {provider.badReviewsCount > 0 ? (
            <TriangleAlert className="size-4 shrink-0" aria-hidden />
          ) : (
            <CircleCheck className="size-4 shrink-0" aria-hidden />
          )}
          {provider.badReviewsCount === 0
            ? "Sin quejas abiertas"
            : provider.badReviewsCount === 1
              ? "1 queja sigue abierta"
              : `${provider.badReviewsCount} quejas siguen abiertas`}
          {provider.isClaimed ? " · Dueño registrado" : ""}
        </p>
      </article>
    </Link>
  );
}
