export function normalizeText(value) {
  return typeof value === "string" ? value.normalize("NFKC").trim() : value;
}
