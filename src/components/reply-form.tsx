"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ImagePlus, LoaderCircle, Reply, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MAX_REPLY_PHOTOS } from "@/lib/constants";
import { preparePhoto } from "@/lib/photos";
import { createReply } from "@/server/actions/engagement";

export function ReplyForm({ reviewId }: { reviewId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [content, setContent] = useState("");
  const [files, setFiles] = useState<File[]>([]);

  return (
    <form
      className="mt-3 grid gap-3 rounded-xl bg-muted/60 p-3"
      aria-busy={pending}
      onSubmit={(event) => {
        event.preventDefault();
        if (pending) return;
        const body = new FormData();
        body.set(
          "payload",
          JSON.stringify({
            reviewId,
            content,
            photos: files.map(() => ({ mediaType: "PROVIDER_REPLY_PROOF" as const })),
          }),
        );
        files.forEach((file) => body.append("photos", file));
        startTransition(async () => {
          const result = await createReply(body);
          if (!result.ok) {
            toast.error(result.error);
            return;
          }
          toast.success("Tu respuesta ya está publicada");
          setContent("");
          setFiles([]);
          router.refresh();
        });
      }}
    >
      <fieldset disabled={pending} className="contents">
      <Label htmlFor={`reply-${reviewId}`} className="flex items-center gap-1.5">
        <Reply className="size-4 text-primary" aria-hidden />
        Tu respuesta
      </Label>
      <p>Puedes responder una sola vez. La opinión original se queda.</p>
      <Textarea
        id={`reply-${reviewId}`}
        value={content}
        onChange={(event) => setContent(event.target.value)}
        rows={4}
        placeholder="Explica cómo entregaste el trabajo o el acuerdo al que llegaron"
      />
      <label className="flex w-fit cursor-pointer items-center gap-2 rounded-lg border border-dashed border-input bg-card px-3 py-2 text-[0.95rem] hover:bg-muted">
        <ImagePlus className="size-4 text-primary" aria-hidden />
        Agregar fotos ({files.length} de {MAX_REPLY_PHOTOS})
        <input
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          disabled={pending}
          onChange={(event) => {
            const list = Array.from(event.target.files ?? []).slice(0, MAX_REPLY_PHOTOS);
            void Promise.all(list.map((file) => preparePhoto(file))).then(setFiles);
          }}
        />
      </label>
      <Button type="submit" disabled={pending} className="w-full sm:w-fit">
        {pending ? <LoaderCircle className="animate-spin" aria-hidden /> : <Send aria-hidden />}
        {pending ? "Publicando…" : "Publicar mi respuesta"}
      </Button>
      </fieldset>
    </form>
  );
}
