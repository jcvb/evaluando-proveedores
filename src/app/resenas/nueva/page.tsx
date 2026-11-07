import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Camera, Hammer, MapPin, MessageSquareText, PenLine, TriangleAlert } from "lucide-react";
import { ReviewForm } from "@/components/review-form";
import { SERVICE_CATEGORIES } from "@/lib/constants";
import { databaseConfigured } from "@/lib/prisma";
import { noIndexRobots } from "@/lib/seo";
import { getCurrentUser } from "@/server/auth";
import { getProvider, listCategories } from "@/server/queries";

export const metadata: Metadata = {
  title: "Publicar opinión",
  description: "Cuenta cómo te fue con un maestro o taller. Se pide al menos una foto.",
  robots: noIndexRobots,
};

export const dynamic = "force-dynamic";

export default async function NewReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ proveedor?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/ingresar?next=/resenas/nueva");

  const params = await searchParams;
  let categories: { slug: string; name: string }[] = SERVICE_CATEGORIES.map(({ slug, name }) => ({ slug, name }));
  let preset: { id: string; businessName: string; phonePrimary: string } | null = null;
  let notice: string | null = null;

  if (!databaseConfigured()) {
    notice = "Falta DATABASE_URL. La reseña no se puede guardar todavía.";
  } else {
    try {
      const stored = await listCategories();
      if (stored.length > 0) categories = stored.map(({ slug, name }) => ({ slug, name }));
      else notice = "Todavía no hay oficios en la base. Corre el seed antes de publicar.";
      if (params.proveedor) {
        const provider = await getProvider(params.proveedor);
        if (provider) {
          preset = { id: provider.id, businessName: provider.businessName, phonePrimary: provider.phonePrimary };
        }
      }
    } catch (error) {
      console.error(error);
      notice = "No se pudo leer el catálogo.";
    }
  }

  return (
    <div className="mx-auto grid max-w-3xl gap-6 px-4 py-8">
      <div>
        <h1 className="flex items-center gap-2 font-heading text-2xl">
          <PenLine className="size-6 text-primary" aria-hidden />
          Contar mi experiencia
        </h1>
        <p className="mt-2 text-base">
          Son cuatro pasos. La foto es obligatoria: si el trabajo salió mal, muestra el problema; si salió bien, muestra cómo quedó.
        </p>
        <ol className="mt-4 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4 [&_svg]:size-4 [&_svg]:text-primary">
          {(
            [
              [Hammer, "Quién"],
              [MapPin, "Dónde"],
              [MessageSquareText, "Cómo te fue"],
              [Camera, "Fotos"],
            ] as const
          ).map(([Icon, label], index) => (
            <li key={label} className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2">
              <Icon aria-hidden />
              <span>
                {index + 1}. {label}
              </span>
            </li>
          ))}
        </ol>
      </div>
      {notice ? (
        <p className="flex items-start gap-2 rounded-xl bg-amber-100 px-4 py-3 text-amber-950">
          <TriangleAlert className="mt-0.5 size-5 shrink-0" aria-hidden />
          {notice}
        </p>
      ) : null}
      <ReviewForm categories={categories} presetProvider={preset} />
    </div>
  );
}
