"use client";

import { Suspense, useEffect } from "react";
import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { pagePath, shouldTrackPath, trackPageView } from "@/lib/analytics";

type Props = {
  measurementId: string;
};

function GoogleAnalyticsPageViews({ measurementId }: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!shouldTrackPath(pathname)) return;
    const search = searchParams.toString();
    trackPageView(measurementId, pagePath(pathname, search ? `?${search}` : ""));
  }, [measurementId, pathname, searchParams]);

  return null;
}

/**
 * Google Analytics 4 vía gtag.js + pageviews en navegación del App Router.
 * Solo se monta cuando hay NEXT_PUBLIC_GA_MEASUREMENT_ID válido (G-…).
 */
export function GoogleAnalytics({ measurementId }: Props) {
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('config', '${measurementId}', { send_page_view: false });
        `}
      </Script>
      <Suspense fallback={null}>
        <GoogleAnalyticsPageViews measurementId={measurementId} />
      </Suspense>
    </>
  );
}
