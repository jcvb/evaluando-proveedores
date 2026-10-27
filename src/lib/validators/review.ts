import { z } from "zod";
import {
  COST_RANGES,
  MAX_REPLY_PHOTOS,
  MAX_REVIEW_PHOTOS,
  NEGATIVE_TAGS,
  POSITIVE_TAGS,
} from "@/lib/constants";
import { normalizeMxPhone } from "@/lib/phone";

const mediaTypes = z.enum([
  "DEFECT_EVIDENCE",
  "COMPLETED_WORK",
  "CONTRACT_RECEIPT",
  "PROVIDER_REPLY_PROOF",
]);

export const photoMetaSchema = z.object({
  mediaType: mediaTypes,
  caption: z.string().trim().max(140).optional(),
});

const phoneField = z
  .string()
  .trim()
  .min(1, "El teléfono es obligatorio")
  .transform((value, ctx) => {
    const phone = normalizeMxPhone(value);
    if (!phone) {
      ctx.addIssue({
        code: "custom",
        message: "Usa un celular mexicano de 10 dígitos",
      });
      return z.NEVER;
    }
    return phone;
  });

export const newProviderSchema = z.object({
  businessName: z.string().trim().min(2, "Indica el nombre con el que se anuncia").max(120),
  contactName: z.string().trim().max(120).optional(),
  phonePrimary: phoneField,
  phoneSecondary: z.string().trim().optional().or(z.literal("")),
  socialMediaUrl: z.union([z.literal(""), z.string().trim().url("El enlace no es válido")]).optional(),
  primaryState: z.string().trim().min(2),
  primaryCity: z.string().trim().min(2),
});

export const reviewSchema = z
  .object({
    categorySlug: z.string().min(1, "Elige un oficio"),
    providerId: z.union([z.literal(""), z.string().uuid()]).optional(),
    newProvider: newProviderSchema.optional(),
    verdict: z.enum(["BUENO", "MALO", "REGULAR"]),
    rating: z.number().int().min(1).max(5),
    title: z.string().trim().min(8, "Resume el caso en al menos 8 caracteres").max(140),
    description: z.string().trim().min(30, "Cuenta qué pasó, con al menos 30 caracteres").max(5000),
    tags: z.array(z.string()).max(8),
    serviceDate: z.string().min(1, "Indica la fecha aproximada del trabajo"),
    costRange: z.union([z.literal(""), z.enum(COST_RANGES)]).optional(),
    gaveAdvancePayment: z.boolean(),
    advancePercentage: z.number().int().min(1).max(100).optional().nullable(),
    hadWrittenContract: z.boolean(),
    postalCode: z.string().regex(/^\d{5}$/, "El código postal tiene 5 dígitos"),
    state: z.string().trim().min(2),
    cityOrMunicipality: z.string().trim().min(2),
    townOrLocality: z.string().trim().max(120).optional(),
    colonia: z.string().trim().min(2, "Elige la colonia"),
    fraccionamiento: z.string().trim().max(160).optional(),
    calle: z.string().trim().max(160).optional(),
    photos: z.array(photoMetaSchema).min(1, "Agrega al menos una fotografía").max(MAX_REVIEW_PHOTOS),
  })
  .superRefine((value, ctx) => {
    if (!value.providerId && !value.newProvider) {
      ctx.addIssue({
        code: "custom",
        path: ["providerId"],
        message: "Elige un proveedor o registra uno nuevo",
      });
    }

    if (value.verdict === "BUENO" && (value.rating < 4 || value.rating > 5)) {
      ctx.addIssue({
        code: "custom",
        path: ["rating"],
        message: "Una reseña recomendada va de 4 a 5 estrellas",
      });
    }
    if (value.verdict === "REGULAR" && value.rating !== 3) {
      ctx.addIssue({
        code: "custom",
        path: ["rating"],
        message: "Una reseña regular corresponde a 3 estrellas",
      });
    }
    if (value.verdict === "MALO" && (value.rating < 1 || value.rating > 2)) {
      ctx.addIssue({
        code: "custom",
        path: ["rating"],
        message: "Una alerta va de 1 a 2 estrellas",
      });
    }

    const allowed =
      value.verdict === "MALO"
        ? new Set<string>(NEGATIVE_TAGS)
        : value.verdict === "BUENO"
          ? new Set<string>(POSITIVE_TAGS)
          : new Set<string>([...NEGATIVE_TAGS, ...POSITIVE_TAGS]);
    value.tags.forEach((tag, index) => {
      if (!allowed.has(tag)) {
        ctx.addIssue({
          code: "custom",
          path: ["tags", index],
          message: "Esa etiqueta no corresponde al veredicto",
        });
      }
    });

    if (value.verdict === "MALO" && !value.photos.some((photo) => photo.mediaType === "DEFECT_EVIDENCE")) {
      ctx.addIssue({
        code: "custom",
        path: ["photos"],
        message: "Una alerta exige al menos una foto de evidencia del desperfecto",
      });
    }
    if (value.verdict === "BUENO" && !value.photos.some((photo) => photo.mediaType === "COMPLETED_WORK")) {
      ctx.addIssue({
        code: "custom",
        path: ["photos"],
        message: "Una recomendación exige al menos una foto del trabajo terminado",
      });
    }
    if (
      value.verdict === "REGULAR" &&
      !value.photos.some((photo) => photo.mediaType === "COMPLETED_WORK" || photo.mediaType === "CONTRACT_RECEIPT")
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["photos"],
        message: "Agrega una foto del trabajo terminado o del comprobante",
      });
    }

    if (value.newProvider?.phoneSecondary) {
      const secondary = normalizeMxPhone(value.newProvider.phoneSecondary);
      if (!secondary) {
        ctx.addIssue({
          code: "custom",
          path: ["newProvider", "phoneSecondary"],
          message: "El teléfono secundario debe tener 10 dígitos",
        });
      }
    }

    if (value.gaveAdvancePayment && (value.advancePercentage == null || value.advancePercentage < 1)) {
      ctx.addIssue({
        code: "custom",
        path: ["advancePercentage"],
        message: "Indica el porcentaje aproximado del anticipo",
      });
    }

    const date = new Date(`${value.serviceDate}T12:00:00Z`);
    const limit = new Date();
    limit.setUTCDate(limit.getUTCDate() + 1);
    if (Number.isNaN(date.getTime()) || date > limit) {
      ctx.addIssue({
        code: "custom",
        path: ["serviceDate"],
        message: "La fecha del trabajo no puede ser futura",
      });
    }
  });

export type ReviewInput = z.infer<typeof reviewSchema>;

export const replySchema = z.object({
  reviewId: z.string().uuid(),
  content: z.string().trim().min(20, "Explica tu versión con al menos 20 caracteres").max(4000),
  photos: z.array(photoMetaSchema).max(MAX_REPLY_PHOTOS),
});

export type ReplyInput = z.infer<typeof replySchema>;

export const claimSchema = z.object({
  providerId: z.string().uuid(),
  phone: phoneField,
  note: z.string().trim().max(500).optional(),
});

export const searchSchema = z.object({
  q: z.string().trim().max(120).optional(),
  oficio: z.string().trim().optional(),
  estado: z.string().trim().optional(),
  municipio: z.string().trim().optional(),
  colonia: z.string().trim().optional(),
  fraccionamiento: z.string().trim().optional(),
  veredicto: z.enum(["BUENO", "MALO", "REGULAR", ""]).optional(),
});
