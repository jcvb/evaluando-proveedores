"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { LoaderCircle } from "lucide-react";

/**
 * Barra superior + bloqueo de clics al navegar o enviar formularios.
 * Evita doble acción mientras carga la siguiente vista.
 */
export function NavigationLoading() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [bar, setBar] = useState(false);
  const [block, setBlock] = useState(false);
  const overlayTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function clearTimers() {
    if (overlayTimer.current) clearTimeout(overlayTimer.current);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    overlayTimer.current = null;
    hideTimer.current = null;
  }

  function startLoading() {
    clearTimers();
    setBar(true);
    overlayTimer.current = setTimeout(() => setBlock(true), 220);
  }

  function stopLoading() {
    clearTimers();
    hideTimer.current = setTimeout(() => {
      setBar(false);
      setBlock(false);
    }, 160);
  }

  useEffect(() => {
    stopLoading();
    return clearTimers;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- solo al cambiar de ruta
  }, [pathname, searchParams]);

  useEffect(() => {
    function shouldIgnore(anchor: HTMLAnchorElement) {
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return true;
      if (anchor.target === "_blank" || anchor.hasAttribute("download")) return true;
      if (href.startsWith("http") && typeof window !== "undefined" && !href.startsWith(window.location.origin)) {
        return true;
      }
      try {
        const url = new URL(href, window.location.href);
        if (url.pathname === pathname && url.search === window.location.search && !url.hash) return true;
      } catch {
        return true;
      }
      return false;
    }

    function onClick(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = (event.target as HTMLElement | null)?.closest?.("a");
      if (!anchor || !(anchor instanceof HTMLAnchorElement)) return;
      if (shouldIgnore(anchor)) return;
      startLoading();
    }

    function onSubmit(event: SubmitEvent) {
      const form = event.target;
      if (!(form instanceof HTMLFormElement)) return;
      if (form.dataset.noLoading === "true") return;
      startLoading();
    }

    document.addEventListener("click", onClick, true);
    document.addEventListener("submit", onSubmit, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("submit", onSubmit, true);
      clearTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  if (!bar && !block) return null;

  return (
    <>
      {bar ? (
        <div
          className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-1 overflow-hidden bg-primary/15"
          role="progressbar"
          aria-label="Cargando"
          aria-busy="true"
        >
          <div className="nav-progress h-full w-1/3 rounded-full bg-primary" />
        </div>
      ) : null}
      {block ? (
        <div
          className="fixed inset-0 z-[90] flex cursor-wait items-start justify-center bg-background/40 pt-24 backdrop-blur-[1px]"
          aria-live="polite"
          aria-busy="true"
        >
          <div className="flex items-center gap-2 rounded-full bg-card px-4 py-2.5 text-sm font-semibold shadow-lg ring-1 ring-foreground/10">
            <LoaderCircle className="size-4 animate-spin text-primary" aria-hidden />
            Cargando…
          </div>
        </div>
      ) : null}
    </>
  );
}
