import { LoaderCircle } from "lucide-react";

export default function Loading() {
  return (
    <div className="mx-auto flex min-h-[40vh] max-w-5xl flex-col items-center justify-center gap-3 px-4 py-16" role="status" aria-live="polite">
      <LoaderCircle className="size-8 animate-spin text-primary" aria-hidden />
      <p className="font-semibold text-muted-foreground">Cargando…</p>
    </div>
  );
}
