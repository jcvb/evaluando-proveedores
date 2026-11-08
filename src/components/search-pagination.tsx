import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SearchPagination({
  pathname = "/",
  filters,
  nextCursor,
  pageSize,
  itemCount,
}: {
  pathname?: string;
  filters: Record<string, string | undefined>;
  nextCursor: string | null;
  pageSize: number;
  itemCount: number;
}) {
  if (itemCount === 0 && !filters.cursor) return null;

  const base = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (key === "cursor") continue;
    const text = String(value ?? "").trim();
    if (text) base.set(key, text);
  }

  const firstHref = base.size ? `${pathname}?${base}` : pathname;
  const nextParams = new URLSearchParams(base);
  if (nextCursor) nextParams.set("cursor", nextCursor);
  const nextHref = nextCursor ? `${pathname}?${nextParams}` : null;
  const hasCursor = Boolean(filters.cursor?.trim());

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
      <p className="text-sm text-muted-foreground">
        Mostrando {itemCount}
        {itemCount >= pageSize || nextCursor ? ` de esta página (${pageSize} máx.)` : ""}
        {nextCursor ? ". Hay más resultados." : hasCursor ? "." : ""}
      </p>
      <div className="flex flex-wrap gap-2">
        {hasCursor ? (
          <Link href={firstHref} className={cn(buttonVariants({ variant: "outline" }))} rel="prev">
            <ChevronLeft aria-hidden />
            Volver al inicio
          </Link>
        ) : null}
        {nextHref ? (
          <Link href={nextHref} className={cn(buttonVariants())} rel="next">
            Cargar más
            <ChevronRight aria-hidden />
          </Link>
        ) : null}
      </div>
    </div>
  );
}
