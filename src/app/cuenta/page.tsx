import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ClipboardList, ShieldCheck, UserRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { noIndexRobots } from "@/lib/seo";
import { getCurrentUser } from "@/server/auth";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Mi cuenta",
  robots: noIndexRobots,
};

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/ingresar?next=/cuenta");

  const isAdmin = user.role === "ADMIN";

  return (
    <div className="mx-auto grid max-w-xl gap-5 px-4 py-8">
      <h1 className="flex items-center gap-2 font-heading text-2xl">
        <UserRound className="size-6 text-primary" aria-hidden />
        Mi cuenta
      </h1>

      <section className="grid gap-3 rounded-2xl bg-card p-5 ring-1 ring-foreground/10">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-heading text-xl">{user.name}</p>
          {isAdmin ? (
            <Badge className="gap-1 bg-primary text-primary-foreground">
              <ShieldCheck className="size-3.5" aria-hidden />
              Administrador
            </Badge>
          ) : (
            <Badge variant="outline">Cuenta de usuario</Badge>
          )}
        </div>
        <p className="text-[0.95rem] text-muted-foreground">{user.email}</p>
        {isAdmin ? (
          <p className="rounded-lg bg-primary/10 px-3 py-2 text-[0.95rem] text-primary">
            Tienes permisos de moderación: puedes editar opiniones y revisar solicitudes de negocios. Las opiniones no se
            borran.
          </p>
        ) : null}
      </section>

      <div className="flex flex-wrap gap-2">
        <Link href="/mis-resenas" className={buttonVariants({ variant: "outline" })}>
          <ClipboardList aria-hidden />
          Mis opiniones
        </Link>
        {isAdmin ? (
          <Link href="/admin/reclamos" className={cn(buttonVariants())}>
            <ShieldCheck aria-hidden />
            Revisar solicitudes
          </Link>
        ) : null}
      </div>
    </div>
  );
}
