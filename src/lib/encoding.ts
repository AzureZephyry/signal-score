import type {
  EncodedBit,
  EncodedSignal,
  InitialLevel,
  SchemeId,
  Segment,
  Voltage,
} from "./types";
import { validateBits } from "./validation";
const invert = (level: InitialLevel): InitialLevel => (level === 1 ? -1 : 1);
const polarity = (level: Voltage) =>
  level === 1 ? "pos" : level === -1 ? "neg" : "zero";
const direction = (level: Voltage) => (level === -1 ? "nTp" : "pTn");

// Labels derive from the actual computed interval levels. Actions refer to bit beginnings.
export function outputLabels(
  id: SchemeId,
  input: "0" | "1",
  levels: Voltage[],
): { output: string; action?: string } {
  switch (id) {
    case "unipolar":
      return { output: levels[0] === 1 ? "hi" : "lo" };
    case "nrz-i":
      return {
        output: polarity(levels[0]),
        action: input === "1" ? "inv" : "no inv",
      };
    case "rz":
      return { output: polarity(levels[0]), action: "RZ" };
    case "manchester":
      return { output: direction(levels[0]) };
    case "differential":
      return {
        output: direction(levels[0]),
        action: input === "0" ? "inv" : "no inv",
      };
    default:
      return { output: polarity(levels[0]) };
  }
}

export function encode(
  id: SchemeId,
  input: string,
  initial: InitialLevel = 1,
): EncodedSignal {
  const error = validateBits(input, input.length);
  if (error) throw new Error(error);
  let current: InitialLevel = initial;
  let nextPulse: InitialLevel = 1;
  const bits: EncodedBit[] = [...input].map((digit, index) => {
    const bit = digit as "0" | "1";
    const one = bit === "1";
    let levels: Voltage[];
    switch (id) {
      case "unipolar":
        levels = [one ? 1 : 0];
        break;
      case "nrz-l":
        levels = [one ? -1 : 1];
        break;
      case "nrz-i":
        if (one) current = invert(current);
        levels = [current];
        break;
      case "rz":
        levels = [one ? 1 : -1, 0];
        break;
      case "manchester":
        levels = one ? [-1, 1] : [1, -1];
        break;
      case "differential":
        if (!one) current = invert(current);
        levels = [current, invert(current)];
        current = invert(current);
        break;
      case "ami":
      case "pseudoternary":
        if (one === (id === "ami")) {
          levels = [nextPulse];
          nextPulse = invert(nextPulse);
        } else levels = [0];
        break;
    }
    const segments: Segment[] = levels.map((level, part) => ({
      start: index + part / levels.length,
      end: index + (part + 1) / levels.length,
      level,
    }));
    return { index, input: bit, segments, ...outputLabels(id, bit, levels) };
  });
  return {
    id,
    bits,
    segments: bits.flatMap((bit) => bit.segments),
    initial: id === "nrz-i" || id === "differential" ? initial : undefined,
  };
}
