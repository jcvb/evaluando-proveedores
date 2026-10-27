import { Meh, ThumbsDown, ThumbsUp } from "lucide-react";
import { VERDICT_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const tones = {
  BUENO: "bg-emerald-100 text-emerald-950",
  REGULAR: "bg-amber-100 text-amber-950",
  MALO: "bg-rose-100 text-rose-950",
} as const;

const icons = {
  BUENO: ThumbsUp,
  REGULAR: Meh,
  MALO: ThumbsDown,
} as const;

export function VerdictPill({ verdict }: { verdict: keyof typeof VERDICT_LABELS }) {
  const Icon = icons[verdict];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-sm font-semibold", tones[verdict])}>
      <Icon className="size-3.5" aria-hidden />
      {VERDICT_LABELS[verdict]}
    </span>
  );
}

export function Stars({ rating }: { rating: number }) {
  return (
    <span className="text-lg leading-none tracking-tight text-amber-700" aria-label={`${rating} de 5 estrellas`}>
      {"★★★★★".slice(0, rating)}
      <span className="text-stone-300">{"★★★★★".slice(rating)}</span>
    </span>
  );
}
