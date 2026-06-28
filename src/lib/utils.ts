/**
 * Merges class names, filtering out falsy values.
 */
export function cn(...inputs: (string | number | boolean | null | undefined)[]) {
  return inputs.filter(Boolean).join(" ");
}
