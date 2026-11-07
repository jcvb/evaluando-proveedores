"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, ClipboardList, Hammer, LogIn, LogOut, PenLine, ShieldCheck, Store, UserRound } from "lucide-react";
import { logoutAction } from "@/server/actions/auth";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const menuItem = "flex items-center gap-2.5 rounded-md px-3 py-2 text-[0.95rem] hover:bg-muted [&_svg]:size-4 [&_svg]:text-muted-foreground";

export function SiteHeader({
  user,
}: {
  user: { name: string; role: "CLIENT" | "PROVIDER" | "ADMIN" } | null;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: PointerEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="flex min-w-0 items-center gap-2.5">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Hammer className="size-5" aria-hidden />
          </span>
          <span>
            <span className="font-heading text-xl leading-none text-primary">Buró de oficios</span>
            <span className="block text-sm text-muted-foreground">Opiniones con fotos, antes de contratar</span>
          </span>
        </Link>
        <nav className="flex items-center gap-2">
          <Link href="/oficios" className={buttonVariants({ variant: "outline" })}>
            <Hammer aria-hidden />
            Oficios
          </Link>
          <Link href="/resenas/nueva" className={buttonVariants()}>
            <PenLine aria-hidden />
            Contar mi experiencia
          </Link>
          {user ? (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                aria-expanded={open}
                aria-haspopup="menu"
                className={buttonVariants({ variant: "outline" })}
                onClick={() => setOpen((current) => !current)}
              >
                <UserRound aria-hidden />
                {user.role === "ADMIN" ? "Admin" : "Mi cuenta"}
                <ChevronDown className={cn("transition-transform", open && "rotate-180")} aria-hidden />
              </button>
              {open ? (
                <div
                  role="menu"
                  className="absolute right-0 z-50 mt-2 grid w-56 gap-0.5 rounded-xl border border-border bg-card p-1.5 shadow-lg"
                >
                  <div className="px-3 py-1.5">
                    <p className="truncate text-sm font-medium">{user.name}</p>
                    {user.role === "ADMIN" ? (
                      <p className="mt-0.5 flex items-center gap-1 text-xs font-semibold text-primary">
                        <ShieldCheck className="size-3.5" aria-hidden />
                        Administrador
                      </p>
                    ) : (
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">Cuenta de usuario</p>
                    )}
                  </div>
                  <Link href="/cuenta" className={menuItem} role="menuitem" onClick={() => setOpen(false)}>
                    <UserRound aria-hidden />
                    Ver mi perfil
                  </Link>
                  <Link href="/mis-resenas" className={menuItem} role="menuitem" onClick={() => setOpen(false)}>
                    <ClipboardList aria-hidden />
                    Mis opiniones
                  </Link>
                  <Link href="/proveedor/reclamar" className={menuItem} role="menuitem" onClick={() => setOpen(false)}>
                    <Store aria-hidden />
                    Este es mi negocio
                  </Link>
                  {user.role === "ADMIN" ? (
                    <Link href="/admin/reclamos" className={menuItem} role="menuitem" onClick={() => setOpen(false)}>
                      <ShieldCheck aria-hidden />
                      Revisar solicitudes
                    </Link>
                  ) : null}
                  <form action={logoutAction}>
                    <button type="submit" className={cn(menuItem, "w-full text-left")} role="menuitem">
                      <LogOut aria-hidden />
                      Salir
                    </button>
                  </form>
                </div>
              ) : null}
            </div>
          ) : (
            <Link href="/ingresar" className={buttonVariants({ variant: "outline" })}>
              <LogIn aria-hidden />
              Entrar
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
