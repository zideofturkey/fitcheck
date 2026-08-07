// Shared display rounding for nutrition/macro numbers - guards against
// floating-point artifacts (e.g. 13.000020202023) surfacing anywhere a
// per100g value gets scaled by a gram amount or summed into a total,
// regardless of whether the underlying record was already rounded
// server-side (older records, AI-estimated values, etc. might not be).
export function formatMacro(value: number | null | undefined): number {
  if (value == null || Number.isNaN(value)) return 0;
  return Math.round(value * 100) / 100;
}
