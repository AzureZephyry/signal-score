import type { EncodedSignal, SchemeId, Voltage } from "./types";
export const SCHEME_SUMMARIES: Record<SchemeId, string> = {
  unipolar: "A 1 holds a high signal; a 0 stays at zero voltage.",
  "nrz-l": "A 1 uses negative voltage; a 0 uses positive voltage.",
  "nrz-i": "A 1 changes the previous voltage level; a 0 keeps it.",
  rz: "Each bit starts positive or negative, then returns to zero halfway through.",
  manchester:
    "Every bit changes voltage halfway through. The direction identifies 1 or 0.",
  differential:
    "Every bit changes halfway through. A 0 also changes the level at the beginning; a 1 does not.",
  ami: "Successive 1s alternate positive and negative pulses. Zeros stay at zero voltage.",
  pseudoternary:
    "Successive 0s alternate positive and negative pulses. Ones stay at zero voltage.",
};
const voltage = (level: Voltage) =>
  level === 1 ? "+V" : level === -1 ? "−V" : "0V";

// Explanations read computed intervals and preceding state; they never encode or alter a signal.
export function explainBit(signal: EncodedSignal, index: number): string {
  const bit = signal.bits[index];
  if (!bit)
    return "Select a bit to see how its input becomes a voltage pattern.";
  const first = bit.segments[0].level;
  const last = bit.segments[bit.segments.length - 1].level;
  const previous =
    index === 0
      ? signal.initial
      : signal.bits[index - 1].segments.at(-1)!.level;
  const prefix =
    index === 0 ? "The initial level was" : "The previous bit ended at";
  switch (signal.id) {
    case "unipolar":
      return `Input ${bit.input} holds ${voltage(first)} for the entire bit. The table calls this ${bit.output}: ${first === 1 ? "high, positive voltage" : "low, zero voltage"}.`;
    case "nrz-l":
      return `Input ${bit.input} holds ${voltage(first)} for the entire bit: ${first === -1 ? "negative" : "positive"} voltage (${bit.output}). The level itself represents the input value.`;
    case "nrz-i":
      return `${prefix} ${voltage(previous!)}. Input ${bit.input} ${bit.action === "inv" ? `inverts that level to ${voltage(first)} at the beginning (inv)` : `keeps that level at ${voltage(first)}, with no beginning transition (no inv)`}. It then holds ${voltage(last)} for the rest of the bit.`;
    case "rz":
      return `Input ${bit.input} uses ${voltage(first)} during the first half, then returns to ${voltage(last)} halfway through. The table records ${bit.output} for the pulse and RZ for the return to zero.`;
    case "manchester":
      return `Input ${bit.input} starts at ${voltage(first)} and changes to ${voltage(last)} halfway through. This ${first === -1 ? "negative-to-positive rise" : "positive-to-negative fall"} is labeled ${bit.output}; its direction carries the bit value.`;
    case "differential":
      return `${prefix} ${voltage(previous!)}. Input ${bit.input} ${bit.action === "inv" ? `adds a beginning inversion to ${voltage(first)} (inv)` : `keeps ${voltage(first)} at the beginning (no inv)`}. Halfway through, ${voltage(first)} changes to ${voltage(last)} (${bit.output}), as every bit must.`;
    case "ami":
    case "pseudoternary": {
      const preceding = signal.bits
        .slice(0, index)
        .reverse()
        .find((candidate) => candidate.segments[0].level !== 0);
      if (first === 0)
        return `Input ${bit.input} stays at 0V (zero). ${preceding ? `The most recent nonzero pulse was ${voltage(preceding.segments[0].level)} at bit ${preceding.index + 1}; this zero-voltage bit does not change that pulse history.` : "No nonzero pulse has occurred yet, so the first later pulse will still start positive."}`;
      return `Input ${bit.input} produces a ${first === 1 ? "positive" : "negative"} pulse at ${voltage(first)} (${bit.output}). ${preceding ? `The previous nonzero pulse was ${voltage(preceding.segments[0].level)} at bit ${preceding.index + 1}, so this pulse uses the opposite polarity.` : "This is the first nonzero pulse, which starts positive."}`;
    }
  }
}
