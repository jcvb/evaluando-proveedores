import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { PenLine, ShieldCheck } from "lucide-react";
import { AdminReviewEditForm } from "@/components/admin-review-edit-form";
import { SERVICE_CATEGORIES } from "@/lib/constants";
import { getCurrentUser } from "@/server/auth";
import { getReviewForAdmin, listCategories } from "@/server/queries";

export const dynamic = "force-dynamic";

export default async function AdminEditReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/ingresar?next=/admin/resenas");
  if (user.role !== "ADMIN") redirect("/");

  const { id } = await params;
  const review = await getReviewForAdmin(id);
  if (!review) notFound();

  let categories: { slug: string; name: string }[] = SERVICE_CATEGORIES.map(({ slug, name }) => ({ slug, name }));
  try {
    const stored = await listCategories();
    if (stored.length > 0) categories = stored.map(({ slug, name }) => ({ slug, name }));
  } catch (error) {
    console.error(error);
  }

  const serviceDate = review.serviceDate.toISOString().slice(0, 10);

  return (
    <div className="mx-auto grid max-w-3xl gap-6 px-4 py-8">
      <div>
        <p className="flex items-center gap-1.5 text-sm font-semibold text-primary">
          <ShieldCheck className="size-4" aria-hidden />
          Moderación
        </p>
        <h1 className="mt-1 flex items-center gap-2 font-heading text-2xl">
          <PenLine className="size-6 text-primary" aria-hidden />
          Editar opinión
        </h1>
        <p className="mt-2 text-[0.95rem] text-muted-foreground">
          Solo administradores. Puedes corregir el texto y los datos; no se puede borrar la opinión.{" "}
          <Link href={`/proveedores/${review.providerId}`} className="underline">
            Volver a la ficha
          </Link>
        </p>
      </div>
      <AdminReviewEditForm
        categories={categories}
        review={{
          id: review.id,
          title: review.title,
          description: review.description,
          verdict: review.verdict,
          rating: review.rating,
          tags: review.tags,
          serviceDate,
          costRange: review.costRange,
          gaveAdvancePayment: review.gaveAdvancePayment,
          advancePercentage: review.advancePercentage,
          hadWrittenContract: review.hadWrittenContract,
          postalCode: review.postalCode,
          state: review.state,
          cityOrMunicipality: review.cityOrMunicipality,
          townOrLocality: review.townOrLocality,
          colonia: review.colonia,
          fraccionamiento: review.fraccionamiento,
          calle: review.calle,
          categorySlug: review.category.slug,
          providerName: review.provider.businessName,
          media: review.media.map((item) => ({
            id: item.id,
            url: item.url,
            mediaType: item.mediaType,
            caption: item.caption,
          })),
        }}
      />
    </div>
  );
}
