import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ClipboardList, Inbox, PenLine, ShieldCheck, Store, Wrench } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { ReviewControls } from "@/components/review-controls";
import { VerdictPill } from "@/components/verdict-pill";
import { STATUS_LABELS } from "@/lib/constants";
import { noIndexRobots } from "@/lib/seo";
import { getCurrentUser } from "@/server/auth";
import { reviewsByAuthor } from "@/server/queries";

export const metadata: Metadata = {
  title: "Mis opiniones",
  robots: noIndexRobots,
};

export const dynamic = "force-dynamic";

export default async function MyReviewsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/ingresar?next=/mis-resenas");

  let reviews: Awaited<ReturnType<typeof reviewsByAuthor>> = [];
  try {
    reviews = await reviewsByAuthor(user.id);
  } catch (error) {
    console.error(error);
  }

  return (
    <div className="mx-auto grid max-w-3xl gap-5 px-4 py-8">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="flex items-center gap-2 font-heading text-2xl">
          <ClipboardList className="size-6 text-primary" aria-hidden />
          Mis opiniones
        </h1>
        {user.role === "ADMIN" ? (
          <Badge className="gap-1">
            <ShieldCheck className="size-3.5" aria-hidden />
            Administrador
          </Badge>
        ) : null}
      </div>
      <p className="text-base">Desde aquí puedes marcar cuando el negocio ya resolvió el problema. La opinión no se borra.</p>
      {reviews.length === 0 ? (
        <div className="grid justify-items-start gap-3 rounded-xl bg-muted px-4 py-4">
          <p className="flex items-center gap-2 text-base">
            <Inbox className="size-5 text-muted-foreground" aria-hidden />
            Todavía no publicas ninguna.
          </p>
          <Link href="/resenas/nueva" className={buttonVariants()}>
            <PenLine aria-hidden />
            Contar mi experiencia
          </Link>
        </div>
      ) : null}
      {reviews.map((review) => (
        <article key={review.id} className="grid gap-3 rounded-xl bg-card p-4 ring-1 ring-foreground/10">
          <div className="flex flex-wrap items-center gap-3">
            <VerdictPill verdict={review.verdict} />
            <span>{STATUS_LABELS[review.status]}</span>
          </div>
          <h2 className="font-heading text-xl">
            <Link href={`/proveedores/${review.provider.id}`} className="underline-offset-4 hover:underline">
              {review.title}
            </Link>
          </h2>
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 [&_svg]:size-4 [&_svg]:text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Store aria-hidden />
              {review.provider.businessName}
            </span>
            <span className="flex items-center gap-1.5">
              <Wrench aria-hidden />
              {review.category.name}
            </span>
          </p>
          <ReviewControls
            reviewId={review.id}
            helpfulCount={review.helpfulCount}
            voted={false}
            canResolve
            resolved={review.status === "RESOLVED_AFTER_ISSUE"}
          />
        </article>
      ))}
    </div>
  );
}
