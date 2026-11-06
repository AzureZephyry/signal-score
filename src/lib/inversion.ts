import type { EncodedSignal, EncodedBit, Voltage } from "./types";
export interface InversionDecision {
  index: number;
  invert: boolean;
  previous: Voltage;
  level: Voltage;
}
// Read decisions from the full encoded signal, including at printable segment boundaries.
export function inversionDecisions(
  signal: EncodedSignal,
  bits: EncodedBit[] = signal.bits,
): InversionDecision[] {
  if (signal.id !== "nrz-i" && signal.id !== "differential") return [];
  return bits.map((bit) => ({
    index: bit.index,
    invert: bit.action === "inv",
    previous:
      bit.index === 0
        ? signal.initial!
        : signal.bits[bit.index - 1].segments.at(-1)!.level,
    level: bit.segments[0].level,
  }));
}
