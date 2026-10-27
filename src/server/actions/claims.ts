"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { normalizeMxPhone } from "@/lib/phone";
import { claimSchema } from "@/lib/validators/review";
import { getCurrentUser } from "@/server/auth";
import { createServerSupabase } from "@/lib/supabase/server";

async function approveClaim(claimId: string, reviewerNote?: string) {
  return prisma.$transaction(async (tx) => {
    const claim = await tx.providerClaim.findUnique({
      where: { id: claimId },
      include: { provider: true, user: true },
    });
    if (!claim || claim.status !== "PENDING") throw new Error("Ese reclamo ya fue atendido");
    if (claim.provider.isClaimed && claim.provider.claimedByUserId !== claim.userId) {
      throw new Error("Otro usuario ya reclamó este perfil");
    }
    const owned = await tx.providerProfile.findUnique({ where: { claimedByUserId: claim.userId } });
    if (owned && owned.id !== claim.providerId) {
      throw new Error("Esa cuenta ya reclamó otro perfil");
    }
    await tx.providerClaim.update({
      where: { id: claim.id },
      data: { status: "APPROVED", note: reviewerNote ?? claim.note },
    });
    await tx.providerClaim.updateMany({
      where: { providerId: claim.providerId, status: "PENDING", NOT: { id: claim.id } },
      data: { status: "REJECTED", note: "Se aprobó otro reclamo de este perfil" },
    });
    await tx.providerProfile.update({
      where: { id: claim.providerId },
      data: { claimedByUserId: claim.userId, isClaimed: true },
    });
    if (claim.user.role !== "ADMIN") {
      await tx.user.update({
        where: { id: claim.userId },
        data: { role: "PROVIDER", phone: claim.user.phone ?? claim.phone, isVerified: true },
      });
    } else if (!claim.user.phone) {
      await tx.user.update({ where: { id: claim.userId }, data: { phone: claim.phone, isVerified: true } });
    }
    return claim.providerId;
  });
}

export async function requestClaim(input: {
  providerId: string;
  phone: string;
  note?: string;
}): Promise<{ ok: true; status: "PENDING" | "APPROVED" } | { ok: false; error: string }> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Inicia sesión para reclamar un perfil" };
  const parsed = claimSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Revisa el teléfono" };

  const provider = await prisma.providerProfile.findUnique({ where: { id: parsed.data.providerId } });
  if (!provider) return { ok: false, error: "No encontramos ese perfil" };
  if (provider.isClaimed) return { ok: false, error: "Este perfil ya tiene dueño" };
  if (parsed.data.phone !== provider.phonePrimary) {
    return { ok: false, error: "El teléfono no coincide con el del perfil" };
  }

  const owned = await prisma.providerProfile.findUnique({ where: { claimedByUserId: user.id } });
  if (owned) return { ok: false, error: "Tu cuenta ya reclamó otro perfil" };

  const pending = await prisma.providerClaim.findFirst({
    where: { userId: user.id, providerId: provider.id, status: "PENDING" },
  });
  if (pending) return { ok: true, status: "PENDING" };

  const phoneVerified = user.isVerified && user.phone === provider.phonePrimary;
  const claim = await prisma.providerClaim.create({
    data: {
      userId: user.id,
      providerId: provider.id,
      phone: parsed.data.phone,
      note: parsed.data.note?.trim() || null,
      status: phoneVerified ? "PENDING" : "PENDING",
    },
  });

  if (phoneVerified) {
    try {
      await approveClaim(claim.id, "Teléfono verificado por OTP");
      revalidatePath(`/proveedores/${provider.id}`);
      revalidatePath("/admin/reclamos");
      return { ok: true, status: "APPROVED" };
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo aprobar el reclamo";
      return { ok: false, error: message };
    }
  }

  revalidatePath("/admin/reclamos");
  return { ok: true, status: "PENDING" };
}

export async function confirmVerifiedPhone(phoneInput: string): Promise<{ ok: boolean; error?: string }> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Inicia sesión" };
  const phone = normalizeMxPhone(phoneInput);
  if (!phone) return { ok: false, error: "El teléfono no es válido" };
  const supabase = await createServerSupabase();
  if (!supabase) return { ok: false, error: "La verificación por SMS requiere Supabase" };
  const { data } = await supabase.auth.getUser();
  const authPhone = data.user?.phone ? normalizeMxPhone(data.user.phone) : null;
  if (!data.user?.phone_confirmed_at || authPhone !== phone) {
    return { ok: false, error: "Todavía no confirmamos ese número por SMS" };
  }
  const taken = await prisma.user.findFirst({ where: { phone, NOT: { id: user.id } } });
  if (taken) return { ok: false, error: "Ese teléfono ya está en otra cuenta" };
  await prisma.user.update({ where: { id: user.id }, data: { phone, isVerified: true } });
  return { ok: true };
}

export async function moderateClaim(
  claimId: string,
  decision: "APPROVED" | "REJECTED",
): Promise<{ ok: boolean; error?: string }> {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") return { ok: false, error: "Solo un administrador puede moderar reclamos" };
  try {
    if (decision === "APPROVED") {
      const providerId = await approveClaim(claimId);
      revalidatePath(`/proveedores/${providerId}`);
    } else {
      await prisma.providerClaim.update({
        where: { id: claimId, status: "PENDING" },
        data: { status: "REJECTED" },
      });
    }
    revalidatePath("/admin/reclamos");
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "No se pudo actualizar el reclamo" };
  }
}
