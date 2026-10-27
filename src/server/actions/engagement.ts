"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { replySchema } from "@/lib/validators/review";
import { getCurrentUser } from "@/server/auth";
import { removeStored, storeEvidence, toPublicJpeg } from "@/server/images";
import { recomputeProviderMetrics } from "@/server/metrics";

const MAX_BYTES = 8 * 1024 * 1024;

export async function toggleHelpful(reviewId: string): Promise<{ ok: boolean; error?: string; helpful: boolean }> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Inicia sesión para marcar una reseña como útil", helpful: false };

  const review = await prisma.review.findUnique({ where: { id: reviewId }, select: { id: true, authorId: true, providerId: true } });
  if (!review) return { ok: false, error: "Esa reseña ya no está", helpful: false };
  if (review.authorId === user.id) return { ok: false, error: "No puedes marcar tu propia reseña", helpful: false };

  const helpful = await prisma.$transaction(async (tx) => {
    const existing = await tx.helpfulVote.findUnique({
      where: { userId_reviewId: { userId: user.id, reviewId } },
    });
    if (existing) {
      await tx.helpfulVote.delete({ where: { id: existing.id } });
    } else {
      await tx.helpfulVote.create({ data: { userId: user.id, reviewId } });
    }
    const count = await tx.helpfulVote.count({ where: { reviewId } });
    await tx.review.update({ where: { id: reviewId }, data: { helpfulCount: count } });
    return !existing;
  });

  revalidatePath(`/proveedores/${review.providerId}`);
  return { ok: true, helpful };
}

export async function markResolved(reviewId: string): Promise<{ ok: boolean; error?: string }> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Inicia sesión para actualizar el caso" };

  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review) return { ok: false, error: "Esa reseña ya no está" };
  if (review.authorId !== user.id) return { ok: false, error: "Solo quien publicó la reseña puede marcarla como resuelta" };
  if (review.status === "RESOLVED_AFTER_ISSUE") return { ok: true };
  if (review.status === "UNDER_MODERATION") return { ok: false, error: "Esta reseña sigue en moderación" };

  await prisma.$transaction(async (tx) => {
    await tx.review.update({ where: { id: reviewId }, data: { status: "RESOLVED_AFTER_ISSUE" } });
    await recomputeProviderMetrics(tx, review.providerId);
  });
  revalidatePath(`/proveedores/${review.providerId}`);
  revalidatePath("/mis-resenas");
  return { ok: true };
}

export async function createReply(
  formData: FormData,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Inicia sesión para publicar la réplica" };

  let payload: unknown;
  try {
    payload = JSON.parse(String(formData.get("payload") ?? ""));
  } catch {
    return { ok: false, error: "La solicitud está incompleta" };
  }
  const parsed = replySchema.safeParse(payload);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Revisa la réplica" };
  const input = parsed.data;
  if (input.photos.some((photo) => photo.mediaType !== "PROVIDER_REPLY_PROOF")) {
    return { ok: false, error: "Las fotos de la réplica son contra-evidencia" };
  }

  const files = formData.getAll("photos").filter((item): item is File => item instanceof File);
  if (files.length !== input.photos.length) return { ok: false, error: "Adjunta las fotos que declaraste" };
  if (files.some((file) => file.size > MAX_BYTES || file.size === 0)) {
    return { ok: false, error: "Cada foto debe pesar menos de 8 MB" };
  }

  const review = await prisma.review.findUnique({
    where: { id: input.reviewId },
    include: { provider: true, providerReply: true },
  });
  if (!review) return { ok: false, error: "Esa reseña ya no está" };
  if (review.provider.claimedByUserId !== user.id) {
    return { ok: false, error: "Solo el proveedor que reclamó este perfil puede responder" };
  }
  if (review.providerReply) return { ok: false, error: "Esta reseña ya tiene una réplica oficial" };

  const stored: string[] = [];
  try {
    const mediaUrls: string[] = [];
    for (const file of files) {
      const jpeg = await toPublicJpeg(Buffer.from(await file.arrayBuffer()));
      const url = await storeEvidence(`replicas/${crypto.randomUUID()}.jpg`, jpeg);
      stored.push(url);
      mediaUrls.push(url);
    }

    await prisma.$transaction(async (tx) => {
      await tx.providerReply.create({
        data: {
          reviewId: review.id,
          providerUserId: user.id,
          content: input.content,
          mediaUrls,
        },
      });
      if (review.status === "PUBLISHED") {
        await tx.review.update({ where: { id: review.id }, data: { status: "PROVIDER_REPLIED" } });
      }
    });
    revalidatePath(`/proveedores/${review.providerId}`);
    return { ok: true };
  } catch (error) {
    await Promise.all(stored.map((url) => removeStored(url).catch(() => undefined)));
    console.error(error);
    return { ok: false, error: "No se pudo publicar la réplica" };
  }
}
