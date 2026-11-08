export const SEARCH_PAGE_SIZE = 24;
export const SEARCH_SIMILARITY_LIMIT = 200;

export type KeysetCursor = {
  v: 1;
  t: "k";
  b: number;
  r: number;
  id: string;
};

export type SimilarityCursor = {
  v: 1;
  t: "s";
  i: number;
};

export type SearchCursorPayload = KeysetCursor | SimilarityCursor;

export function encodeSearchCursor(payload: SearchCursorPayload): string {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}

export function decodeSearchCursor(raw: string | undefined | null): SearchCursorPayload | null {
  if (!raw?.trim()) return null;
  try {
    const parsed = JSON.parse(Buffer.from(raw.trim(), "base64url").toString("utf8")) as Partial<SearchCursorPayload>;
    if (parsed?.v !== 1) return null;
    if (parsed.t === "k") {
      if (typeof parsed.b !== "number" || typeof parsed.r !== "number" || typeof parsed.id !== "string" || !parsed.id) {
        return null;
      }
      return { v: 1, t: "k", b: parsed.b, r: parsed.r, id: parsed.id };
    }
    if (parsed.t === "s") {
      if (typeof parsed.i !== "number" || !Number.isFinite(parsed.i) || parsed.i < 0) return null;
      return { v: 1, t: "s", i: Math.floor(parsed.i) };
    }
    return null;
  } catch {
    return null;
  }
}

export function keysetCursorFromItem(item: { badReviewsCount: number; totalReviews: number; id: string }): string {
  return encodeSearchCursor({
    v: 1,
    t: "k",
    b: item.badReviewsCount,
    r: item.totalReviews,
    id: item.id,
  });
}

export function similarityCursorFromOffset(offset: number): string {
  return encodeSearchCursor({ v: 1, t: "s", i: offset });
}
