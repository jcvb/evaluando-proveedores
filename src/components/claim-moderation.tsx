"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CircleCheck, CircleX } from "lucide-react";
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
    <div className="grid gap-3 sm:grid-cols-2">
      <Button type="button" disabled={pending} onClick={() => decide("APPROVED")}>
        <CircleCheck aria-hidden />
        Aprobar
      </Button>
      <Button type="button" variant="outline" disabled={pending} onClick={() => decide("REJECTED")}>
        <CircleX aria-hidden />
        Rechazar
      </Button>
    </div>
  );
}
