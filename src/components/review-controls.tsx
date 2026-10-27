"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CircleCheck, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { markResolved, toggleHelpful } from "@/server/actions/engagement";

export function ReviewControls({
  reviewId,
  helpfulCount,
  voted,
  canResolve,
  resolved,
}: {
  reviewId: string;
  helpfulCount: number;
  voted: boolean;
  canResolve: boolean;
  resolved: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [helpful, setHelpful] = useState(voted);
  const [count, setCount] = useState(helpfulCount);

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        type="button"
        variant={helpful ? "secondary" : "outline"}
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const result = await toggleHelpful(reviewId);
            if (!result.ok) {
              toast.error(result.error);
              return;
            }
            setHelpful(result.helpful);
            setCount((current) => current + (result.helpful ? 1 : -1));
            router.refresh();
          })
        }
      >
        <ThumbsUp className={helpful ? "fill-current" : undefined} aria-hidden />
        {helpful ? `Te sirvió · ${count}` : `Me sirve esta opinión · ${count}`}
      </Button>
      {canResolve && !resolved ? (
        <Button
          type="button"
          variant="outline"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              const result = await markResolved(reviewId);
              if (!result.ok) {
                toast.error(result.error);
                return;
              }
              toast.success("Quedó marcado como resuelto. La opinión sigue visible.");
              router.refresh();
            })
          }
        >
          <CircleCheck aria-hidden />
          Ya me resolvieron el problema
        </Button>
      ) : null}
    </div>
  );
}
