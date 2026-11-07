"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CircleCheck, CircleX, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { moderateClaim } from "@/server/actions/claims";

export function ClaimModeration({ claimId }: { claimId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function decide(decision: "APPROVED" | "REJECTED") {
    startTransition(async () => {
      const result = await moderateClaim(claimId, decision);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(decision === "APPROVED" ? "Solicitud aprobada" : "Solicitud rechazada");
      router.refresh();
    });
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2" aria-busy={pending}>
      <Button type="button" disabled={pending} onClick={() => decide("APPROVED")}>
        {pending ? <LoaderCircle className="animate-spin" aria-hidden /> : <CircleCheck aria-hidden />}
        {pending ? "Procesando…" : "Aprobar"}
      </Button>
      <Button type="button" variant="outline" disabled={pending} onClick={() => decide("REJECTED")}>
        {pending ? <LoaderCircle className="animate-spin" aria-hidden /> : <CircleX aria-hidden />}
        {pending ? "Procesando…" : "Rechazar"}
      </Button>
    </div>
  );
}
