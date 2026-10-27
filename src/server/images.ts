import { mkdir, rm, writeFile } from "fs/promises";
import path from "path";
import sharp from "sharp";
import { EVIDENCE_BUCKET } from "@/lib/constants";
import { createAdminSupabase } from "@/lib/supabase/admin";

export async function toPublicJpeg(input: Buffer) {
  return sharp(input, { failOn: "none" })
    .rotate()
    .resize({ width: 2000, height: 2000, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer();
}

export async function storeEvidence(objectPath: string, jpeg: Buffer) {
  const admin = createAdminSupabase();
  if (admin) {
    const { data: bucket } = await admin.storage.getBucket(EVIDENCE_BUCKET);
    if (!bucket) {
      const { error } = await admin.storage.createBucket(EVIDENCE_BUCKET, { public: true });
      if (error && !/already exists/i.test(error.message)) {
        throw new Error(error.message);
      }
    }
    const { error } = await admin.storage.from(EVIDENCE_BUCKET).upload(objectPath, jpeg, {
      contentType: "image/jpeg",
      upsert: false,
    });
    if (error) throw new Error(error.message);
    return admin.storage.from(EVIDENCE_BUCKET).getPublicUrl(objectPath).data.publicUrl;
  }

  const relative = path.posix.join("evidencias", objectPath);
  const absolute = path.join(process.cwd(), "public", relative);
  await mkdir(path.dirname(absolute), { recursive: true });
  await writeFile(absolute, jpeg);
  return `/${relative}`;
}

export async function removeStored(url: string) {
  if (!url.startsWith("/evidencias/")) return;
  await rm(path.join(process.cwd(), "public", url), { force: true });
}
