/** Normaliza texto para comparar nombres de negocios en México. */
export function normalizeName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\b(sa|s\s*a|de|cv|sc|rl|el|la|los|las|y|del|al)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenSet(value: string) {
  return new Set(normalizeName(value).split(" ").filter((token) => token.length > 1));
}

/** Puntaje 0–1: igual, contenido o solapamiento de palabras. */
export function nameSimilarity(a: string, b: string) {
  const left = normalizeName(a);
  const right = normalizeName(b);
  if (!left || !right) return 0;
  if (left === right) return 1;
  if (left.includes(right) || right.includes(left)) {
    const shorter = Math.min(left.length, right.length);
    const longer = Math.max(left.length, right.length);
    return 0.72 + (shorter / longer) * 0.2;
  }

  const aTokens = tokenSet(a);
  const bTokens = tokenSet(b);
  if (aTokens.size === 0 || bTokens.size === 0) return 0;

  let intersection = 0;
  for (const token of aTokens) {
    if (bTokens.has(token)) intersection += 1;
  }
  const union = aTokens.size + bTokens.size - intersection;
  const jaccard = union === 0 ? 0 : intersection / union;

  // Dice coefficient refuerza coincidencias parciales (p. ej. "Herrería López" vs "Herreria Lopez Centro").
  const dice = (2 * intersection) / (aTokens.size + bTokens.size);
  return Math.max(jaccard, dice);
}

export function addressSimilarity(written: string, googleFormatted: string) {
  const left = normalizeName(written);
  const right = normalizeName(googleFormatted);
  if (!left || !right) return 0;
  if (left === right) return 1;

  const aTokens = tokenSet(written);
  const bTokens = tokenSet(googleFormatted);
  if (aTokens.size === 0 || bTokens.size === 0) return 0;

  let hits = 0;
  for (const token of aTokens) {
    if (token.length < 3) continue;
    if (bTokens.has(token) || right.includes(token)) hits += 1;
  }
  const meaningful = [...aTokens].filter((token) => token.length >= 3).length || 1;
  return Math.min(1, hits / meaningful);
}
