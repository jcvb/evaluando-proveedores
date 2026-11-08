import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "Buró de oficios — opiniones con fotos antes de contratar";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const favicon = await readFile(join(process.cwd(), "public/brand/favicon.png"));
  const faviconSrc = `data:image/png;base64,${favicon.toString("base64")}`;

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
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={faviconSrc} width={96} height={96} alt="" style={{ borderRadius: 22 }} />
          <div style={{ fontSize: 40, fontWeight: 700, color: "#1f5c45" }}>Buró de oficios</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 900 }}>
          <div style={{ fontSize: 54, fontWeight: 700, lineHeight: 1.1 }}>
            Opiniones con fotos de maestros y talleres en México
          </div>
          <div style={{ fontSize: 28, color: "#3a5a4c", lineHeight: 1.35 }}>
            Antes de contratar: lee cómo les fue a otras personas. El negocio puede responder; nadie borra lo escrito.
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
