import type { Prisma } from "@prisma/client";
import { normalizeMxPhone } from "@/lib/phone";
import type { ReviewInput } from "@/lib/validators/review";

type Tx = Prisma.TransactionClient;

export async function resolveProvider(tx: Tx, input: ReviewInput, categoryId: string) {
  if (input.providerId) {
    const existing = await tx.providerProfile.findUnique({
      where: { id: input.providerId },
      include: { categories: { select: { id: true } } },
    });
    if (!existing) throw new Error("No encontramos ese proveedor");
    if (!existing.categories.some((category) => category.id === categoryId)) {
      await tx.providerProfile.update({
        where: { id: existing.id },
        data: { categories: { connect: { id: categoryId } } },
      });
    }
    return existing;
  }

  const draft = input.newProvider;
  if (!draft) throw new Error("Elige un proveedor o registra uno nuevo");

  const state = draft.primaryState.trim();
  const sameKey = await tx.providerProfile.findFirst({
    where: {
      phonePrimary: draft.phonePrimary,
      primaryState: { equals: state, mode: "insensitive" },
      categories: { some: { id: categoryId } },
    },
  });
  if (sameKey) return sameKey;

  const samePhone = await tx.providerProfile.findFirst({
    where: {
      phonePrimary: draft.phonePrimary,
      primaryState: { equals: state, mode: "insensitive" },
    },
  });
  if (samePhone) {
    await tx.providerProfile.update({
      where: { id: samePhone.id },
      data: { categories: { connect: { id: categoryId } } },
    });
    return samePhone;
  }

  return tx.providerProfile.create({
    data: {
      businessName: draft.businessName.trim(),
      contactName: draft.contactName?.trim() || null,
      phonePrimary: draft.phonePrimary,
      phoneSecondary: draft.phoneSecondary ? normalizeMxPhone(draft.phoneSecondary) : null,
      socialMediaUrl: draft.socialMediaUrl || null,
      primaryState: state,
      primaryCity: draft.primaryCity.trim(),
      categories: { connect: { id: categoryId } },
    },
  });
}
