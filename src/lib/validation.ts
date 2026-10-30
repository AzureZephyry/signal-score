export const MIN_LENGTH = 1;
export const MAX_LENGTH = 128;
export const SAMPLE = "111001011000";
export function validateLength(value: string): string | null {
  if (!/^\d+$/.test(value.trim())) return "Enter a whole number from 1 to 128.";
  const length = Number(value);
  return Number.isSafeInteger(length) &&
    length >= MIN_LENGTH &&
    length <= MAX_LENGTH
    ? null
    : "Choose a length from 1 to 128 bits.";
}
export function validateBits(value: string, length: number): string | null {
  if (validateLength(String(length))) return "Confirm a valid length first.";
  if (/[^01]/.test(value))
    return "Only binary digits 0 and 1 are allowed. Remove spaces and other characters.";
  if (value.length !== length)
    return `Enter exactly ${length} bits. You have ${value.length}; ${value.length < length ? `${length - value.length} more needed` : `remove ${value.length - length}`}.`;
  return null;
}
