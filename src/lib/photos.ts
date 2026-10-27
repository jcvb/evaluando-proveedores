"use client";

import imageCompression from "browser-image-compression";

export async function preparePhoto(file: File) {
  return imageCompression(file, {
    maxSizeMB: 1.2,
    maxWidthOrHeight: 2000,
    useWebWorker: true,
    fileType: "image/jpeg",
    initialQuality: 0.82,
    preserveExif: false,
  });
}
