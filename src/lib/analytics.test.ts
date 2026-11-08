import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { gaMeasurementId, pagePath, shouldTrackPath } from "@/lib/analytics";

describe("analytics", () => {
  afterEach(() => {
    delete process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  });

  it("acepta un Measurement ID GA4 válido", () => {
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = "G-W06410VWBF";
    assert.equal(gaMeasurementId(), "G-W06410VWBF");
  });

  it("rechaza IDs inválidos o vacíos", () => {
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = "GTM-NG7CW388";
    assert.equal(gaMeasurementId(), null);
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = "";
    assert.equal(gaMeasurementId(), null);
  });

  it("omite rutas admin y auth", () => {
    assert.equal(shouldTrackPath("/"), true);
    assert.equal(shouldTrackPath("/proveedores/1"), true);
    assert.equal(shouldTrackPath("/admin"), false);
    assert.equal(shouldTrackPath("/admin/reclamos"), false);
    assert.equal(shouldTrackPath("/auth/callback"), false);
  });

  it("arma page_path con query", () => {
    assert.equal(pagePath("/", ""), "/");
    assert.equal(pagePath("/", "?q=plomero"), "/?q=plomero");
  });
});
