import type { EncodedSignal, Voltage } from "./types";
export const AXIS_WIDTH = 56;
export const RIGHT_PAD = 24;
export const GRAPH_HEIGHT = 156;
export const voltageY = (level: Voltage) => 84 - level * 36;
export const bitX = (time: number, bitWidth: number) =>
  AXIS_WIDTH + time * bitWidth;
// Orthogonal commands only: no interpolated/diagonal edges and no forced terminal return.
export function stepPath(signal: EncodedSignal, bitWidth: number): string {
  const first = signal.segments[0];
  if (!first) return "";
  let path =
    signal.initial !== undefined
      ? `M${AXIS_WIDTH - 12},${voltageY(signal.initial)}H${AXIS_WIDTH}V${voltageY(first.level)}`
      : `M${AXIS_WIDTH},${voltageY(first.level)}`;
  let previous = first.level;
  for (const segment of signal.segments) {
    if (segment.level !== previous) path += `V${voltageY(segment.level)}`;
    path += `H${bitX(segment.end, bitWidth)}`;
    previous = segment.level;
  }
  return path;
}
