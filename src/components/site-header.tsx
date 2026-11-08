"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, ClipboardList, Hammer, LogIn, LogOut, PenLine, ShieldCheck, Store, UserRound } from "lucide-react";
import { logoutAction } from "@/server/actions/auth";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const menuItem =
  "flex items-center gap-2.5 rounded-md px-3 py-2 text-[0.95rem] hover:bg-muted [&_svg]:size-4 [&_svg]:text-muted-foreground";

const navBtn = (variant: "default" | "outline" = "outline") =>
  cn(
    buttonVariants({ variant, size: "sm" }),
    "sm:h-9 sm:gap-2 sm:px-3.5 sm:text-[0.95rem] sm:[&_svg:not([class*='size-'])]:size-5",
  );

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
    <header className="overflow-x-clip border-b border-border bg-background">
      <div className="mx-auto flex w-full min-w-0 max-w-5xl items-center justify-between gap-2 px-4 py-2.5 sm:gap-3 sm:py-3">
        <Link href="/" className="flex min-w-0 shrink items-center gap-2.5" aria-label="Buró de oficios — inicio">
          <Image
            src="/brand/logo-header.png"
            alt="Buró de oficios"
            width={220}
            height={63}
            className="h-9 w-auto max-w-[min(100%,8.75rem)] sm:h-11 sm:max-w-none"
            priority
          />
          <span className="hidden text-sm text-muted-foreground md:block">
            Opiniones con fotos, antes de contratar
          </span>
        </Link>

        <nav className="flex shrink-0 items-center gap-1 sm:gap-2" aria-label="Principal">
          <Link href="/oficios" className={navBtn("outline")} aria-label="Oficios">
            <Hammer aria-hidden />
            <span className="hidden sm:inline">Oficios</span>
          </Link>
          <Link href="/resenas/nueva" className={navBtn("default")} aria-label="Contar mi experiencia">
            <PenLine aria-hidden />
            <span className="sm:hidden">Opinar</span>
            <span className="hidden sm:inline">Contar mi experiencia</span>
          </Link>
          {user ? (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                aria-expanded={open}
                aria-haspopup="menu"
                aria-label={user.role === "ADMIN" ? "Menú de administrador" : "Menú de mi cuenta"}
                className={navBtn("outline")}
                onClick={() => setOpen((current) => !current)}
              >
                <UserRound aria-hidden />
                <span className="hidden sm:inline">{user.role === "ADMIN" ? "Admin" : "Mi cuenta"}</span>
                <ChevronDown
                  className={cn("hidden transition-transform sm:inline", open && "rotate-180")}
                  aria-hidden
                />
              </button>
              {open ? (
                <div
                  role="menu"
                  className="absolute right-0 z-50 mt-2 grid w-[min(14rem,calc(100vw-2rem))] gap-0.5 rounded-xl border border-border bg-card p-1.5 shadow-lg"
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
            <Link href="/ingresar" className={navBtn("outline")} aria-label="Entrar">
              <LogIn aria-hidden />
              <span className="hidden sm:inline">Entrar</span>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
