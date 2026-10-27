import { redirect } from "next/navigation";
import { FileText, Inbox, Phone, ShieldCheck, Store, UserRound } from "lucide-react";
import { ClaimModeration } from "@/components/claim-moderation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/auth";

export const dynamic = "force-dynamic";

export default async function ClaimsAdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/ingresar?next=/admin/reclamos");
  if (user.role !== "ADMIN") redirect("/");

  const claims = await prisma.providerClaim.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "asc" },
    include: {
      user: { select: { name: true, email: true, phone: true, isVerified: true } },
      provider: { select: { id: true, businessName: true, phonePrimary: true, primaryState: true } },
    },
  });

  return (
    <div className="mx-auto grid max-w-3xl gap-4 px-4 py-8">
      <h1 className="flex items-center gap-2 font-heading text-2xl">
        <ShieldCheck className="size-6 text-primary" aria-hidden />
        Solicitudes de negocios
      </h1>
      <p className="text-base">Aprueba solo si el teléfono coincide con el del anuncio.</p>
      {claims.length === 0 ? (
        <p className="flex items-center gap-2 rounded-xl bg-muted px-4 py-3 text-base">
          <Inbox className="size-5 text-muted-foreground" aria-hidden />
          No hay solicitudes en espera.
        </p>
      ) : null}
      {claims.map((claim) => (
        <article key={claim.id} className="grid gap-3 rounded-xl bg-card p-4 ring-1 ring-foreground/10">
          <h2 className="flex items-center gap-2 font-heading text-xl">
            <Store className="size-5 text-primary" aria-hidden />
            {claim.provider.businessName}
          </h2>
          <ul className="grid gap-1.5 [&_li]:flex [&_li]:items-start [&_li]:gap-2 [&_svg]:mt-0.5 [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-muted-foreground">
            <li>
              <UserRound aria-hidden />
              <span>
                {claim.user.name} · {claim.user.email}
                {claim.user.isVerified ? " · teléfono verificado" : ""}
              </span>
            </li>
            <li>
              <Phone aria-hidden />
              <span>
                Teléfono declarado {claim.phone} · perfil {claim.provider.phonePrimary} · {claim.provider.primaryState}
              </span>
            </li>
            {claim.note ? (
              <li>
                <FileText aria-hidden />
                <span>{claim.note}</span>
              </li>
            ) : null}
          </ul>
          <ClaimModeration claimId={claim.id} />
        </article>
      ))}
    </div>
  );
}
