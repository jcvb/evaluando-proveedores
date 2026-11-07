import { ImageResponse } from "next/og";
import { getProvider } from "@/server/queries";

export const alt = "Ficha del proveedor en Buró de oficios";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function ProviderOpenGraphImage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let name = "Proveedor";
  let place = "México";
  let score = "—";
  let reviews = "0 opiniones";
  let oficio = "Oficios";

  try {
    const provider = await getProvider(id);
    if (provider) {
      name = provider.businessName;
      place = `${provider.primaryCity}, ${provider.primaryState}`;
      score = provider.averageScore.toFixed(1);
      reviews = provider.totalReviews === 1 ? "1 opinión" : `${provider.totalReviews} opiniones`;
      oficio = provider.categories.map((c) => c.name).join(" · ") || "Oficios";
    }
  } catch {
    /* fallback visual */
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 64,
          background: "linear-gradient(145deg, #f7f4eb 0%, #e8efe9 55%, #d5e6dc 100%)",
          color: "#163a2d",
        }}
      >
        <div style={{ fontSize: 28, fontWeight: 700, color: "#1f5c45" }}>Buró de oficios</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 980 }}>
          <div style={{ fontSize: 54, fontWeight: 700, lineHeight: 1.1 }}>{name}</div>
          <div style={{ fontSize: 28, color: "#3a5a4c" }}>
            {oficio} · {place}
          </div>
          <div style={{ display: "flex", gap: 28, fontSize: 30, fontWeight: 700 }}>
            <span>{score}/5</span>
            <span>{reviews}</span>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
