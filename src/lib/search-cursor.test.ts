import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  decodeSearchCursor,
  encodeSearchCursor,
  keysetCursorFromItem,
  similarityCursorFromOffset,
} from "@/lib/search-cursor";

describe("search cursor", () => {
  it("round-trip keyset", () => {
    const encoded = keysetCursorFromItem({ badReviewsCount: 3, totalReviews: 10, id: "abc-123" });
    assert.deepEqual(decodeSearchCursor(encoded), { v: 1, t: "k", b: 3, r: 10, id: "abc-123" });
  });

  it("round-trip similarity offset", () => {
    const encoded = similarityCursorFromOffset(24);
    assert.deepEqual(decodeSearchCursor(encoded), { v: 1, t: "s", i: 24 });
  });

  it("rechaza cursor inválido o basura", () => {
    assert.equal(decodeSearchCursor(null), null);
    assert.equal(decodeSearchCursor(""), null);
    assert.equal(decodeSearchCursor("%%%"), null);
    assert.equal(decodeSearchCursor(encodeSearchCursor({ v: 2, t: "k", b: 1, r: 1, id: "x" } as never)), null);
    assert.equal(decodeSearchCursor(Buffer.from(JSON.stringify({ v: 1, t: "k" }), "utf8").toString("base64url")), null);
  });
});
