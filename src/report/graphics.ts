import { PAPER, PRINT_WIDTH, type SignalBlock } from "./model";
import type { Voltage } from "../lib/types";
export const palette = (gray: boolean) => ({
  paper: gray ? "#FFFFFF" : "#FAF8F1",
  ink: "#24271F",
  muted: "#53594A",
  grid: "#D6D8CC",
  accent: gray ? "#24271F" : "#A93220",
  olive: gray ? "#454A40" : "#4E5931",
});
export function diagram(block: SignalBlock, width = PRINT_WIDTH, height = 80) {
  const bitWidth = (width - PAPER.axis - PAPER.trailing) / block.bits.length;
  const x = (time: number) =>
    PAPER.axis + (time - block.range.start) * bitWidth;
  const y = (level: Voltage) =>
    height * (level === 1 ? 0.29 : level === 0 ? 0.52 : 0.75);
  const points: [number, number][] = [];
  const first = block.bits[0].segments[0];
  if (block.entry !== undefined)
    points.push(
      [PAPER.axis - 8, y(block.entry)],
      [PAPER.axis, y(block.entry)],
      [PAPER.axis, y(first.level)],
    );
  else points.push([PAPER.axis, y(first.level)]);
  let previous = first.level;
  for (const bit of block.bits)
    for (const s of bit.segments) {
      if (s.level !== previous) points.push([x(s.start), y(s.level)]);
      points.push([x(s.end), y(s.level)]);
      previous = s.level;
    }
  return { x, y, points, bitWidth, height, width };
}
const escape = (text: string) =>
  text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
export function waveformSvg(
  block: SignalBlock,
  gray = false,
  width = PRINT_WIDTH,
  height = 80,
  showSignal = true,
): string {
  const p = palette(gray),
    d = diagram(block, width, height);
  const horizontal = ([1, 0, -1] as Voltage[])
    .map(
      (level) =>
        `<line x1="${PAPER.axis}" y1="${d.y(level)}" x2="${width - PAPER.trailing}" y2="${d.y(level)}" stroke="${p.grid}"/><text x="0" y="${d.y(level) + 3}" fill="${p.muted}">${level === 1 ? "+V" : level === 0 ? "0V" : "-V"}</text>`,
    )
    .join("");
  const boundaries = Array.from(
    { length: block.bits.length + 1 },
    (_, i) =>
      `<line x1="${PAPER.axis + i * d.bitWidth}" x2="${PAPER.axis + i * d.bitWidth}" y1="${height * 0.17}" y2="${height * 0.86}" stroke="${p.grid}" stroke-dasharray="2 3"/>`,
  ).join("");
  const midpoints = block.bits
    .filter((b) => b.segments.length > 1)
    .map(
      (b) =>
        `<line x1="${d.x(b.index + 0.5)}" x2="${d.x(b.index + 0.5)}" y1="${height * 0.17}" y2="${height * 0.86}" stroke="${p.grid}" stroke-dasharray="1 4"/>`,
    )
    .join("");
  const digits = block.bits
    .map(
      (b) =>
        `<text x="${d.x(b.index + 0.5)}" y="9" text-anchor="middle" fill="${p.ink}">${b.input}</text>`,
    )
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escape(block.scheme.name)} waveform, bits ${block.range.start + 1} to ${block.range.end}"><rect width="100%" height="100%" fill="${p.paper}"/><g font-family="Courier New,monospace" font-size="9">${horizontal}${boundaries}${midpoints}${digits}</g>${showSignal ? `<polyline fill="none" stroke="${p.accent}" stroke-width="1.8" stroke-linejoin="miter" points="${d.points.map((point) => point.join(",")).join(" ")}"/>` : ""}</svg>`;
}
