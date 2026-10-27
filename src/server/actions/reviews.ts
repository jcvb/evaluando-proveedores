"use server";

import { revalidatePath } from "next/cache";
import type { MediaType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { reviewSchema } from "@/lib/validators/review";
import { getCurrentUser } from "@/server/auth";
import { removeStored, storeEvidence, toPublicJpeg } from "@/server/images";
import { recomputeProviderMetrics } from "@/server/metrics";
import { resolveProvider } from "@/server/providers";

const MAX_BYTES = 8 * 1024 * 1024;

export async function createReview(
  formData: FormData,
): Promise<{ ok: true; id: string; providerId: string } | { ok: false; error: string }> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Inicia sesión para publicar una reseña" };

  let payload: unknown;
  try {
    payload = JSON.parse(String(formData.get("payload") ?? ""));
  } catch {
    return { ok: false, error: "La solicitud está incompleta" };
  }

  const parsed = reviewSchema.safeParse(payload);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Revisa los datos" };
  }
  const input = parsed.data;
  const files = formData.getAll("photos").filter((item): item is File => item instanceof File);
  if (files.length !== input.photos.length) {
    return { ok: false, error: "Cada fotografía de la lista debe adjuntarse" };
  }
  if (files.some((file) => file.size > MAX_BYTES || file.size === 0)) {
    return { ok: false, error: "Cada foto debe pesar menos de 8 MB" };
  }

  const category = await prisma.serviceCategory.findUnique({ where: { slug: input.categorySlug } });
  if (!category) return { ok: false, error: "Ese oficio no está en el catálogo" };

  const stored: string[] = [];
  try {
    const processed: { url: string; mediaType: MediaType; caption: string | null }[] = [];
    for (let index = 0; index < files.length; index += 1) {
      const jpeg = await toPublicJpeg(Buffer.from(await files[index].arrayBuffer()));
      const url = await storeEvidence(`reviews/${crypto.randomUUID()}.jpg`, jpeg);
      stored.push(url);
      processed.push({
        url,
        mediaType: input.photos[index].mediaType,
        caption: input.photos[index].caption?.trim() || null,
      });
    }

    const created = await prisma.$transaction(async (tx) => {
      const provider = await resolveProvider(tx, input, category.id);
      if (provider.claimedByUserId === user.id) {
        throw new Error("No puedes reseñar un perfil que ya reclamaste");
      }
      const review = await tx.review.create({
        data: {
          authorId: user.id,
          providerId: provider.id,
          categoryId: category.id,
          verdict: input.verdict,
          rating: input.rating,
          title: input.title,
          description: input.description,
          tags: input.tags,
          serviceDate: new Date(`${input.serviceDate}T12:00:00Z`),
          costRange: input.costRange || null,
          gaveAdvancePayment: input.gaveAdvancePayment,
          advancePercentage: input.gaveAdvancePayment ? input.advancePercentage : null,
          hadWrittenContract: input.hadWrittenContract,
          postalCode: input.postalCode,
          state: input.state.trim(),
          cityOrMunicipality: input.cityOrMunicipality.trim(),
          townOrLocality: input.townOrLocality?.trim() || null,
          colonia: input.colonia.trim(),
          fraccionamiento: input.fraccionamiento?.trim() || null,
          calle: input.calle?.trim() || null,
          status: "PUBLISHED",
          media: { create: processed },
        },
      });
      await recomputeProviderMetrics(tx, provider.id);
      return { id: review.id, providerId: provider.id };
    });

    revalidatePath("/");
    revalidatePath("/mis-resenas");
    revalidatePath(`/proveedores/${created.providerId}`);
    return { ok: true, ...created };
  } catch (error) {
    await Promise.all(stored.map((url) => removeStored(url).catch(() => undefined)));
    const message = error instanceof Error ? error.message : "";
    if (
      message.startsWith("No puedes") ||
      message.startsWith("No encontramos") ||
      message.startsWith("Elige")
    ) {
      return { ok: false, error: message };
    }
    console.error(error);
    return { ok: false, error: "No se pudo publicar la reseña. Revisa la base de datos y vuelve a intentar." };
  }
}
