import type {
  EncodedBit,
  EncodedSignal,
  Scheme,
  SchemeId,
  Voltage,
} from "../lib/types";
import { SCHEMES } from "../lib/schemes";
import { explainBit } from "../lib/explanations";
import { validateBits } from "../lib/validation";
export type ReportLayout = "compact" | "detailed" | "study";
export interface ReportSettings {
  format: "pdf" | "docx";
  content: "report" | "worksheet" | "answer-key";
  layout: ReportLayout;
  organization: "range" | "scheme";
  schemes: SchemeId[];
  explanations: boolean;
  tables: boolean;
  positions: boolean;
  reasoning: boolean;
  grayscale: boolean;
}
export const DEFAULT_SETTINGS: ReportSettings = {
  format: "pdf",
  content: "report",
  layout: "detailed",
  organization: "range",
  schemes: SCHEMES.map((s) => s.id),
  explanations: true,
  tables: true,
  positions: true,
  reasoning: true,
  grayscale: false,
};
export const PAPER = {
  width: 841.89,
  height: 595.28,
  margin: 36,
  top: 128,
  bottom: 550,
  axis: 44,
  trailing: 12,
};
export const graphHeight = (settings: ReportSettings) =>
  settings.content === "worksheet"
    ? 112
    : settings.layout === "compact"
      ? 64
      : 80;
export const PRINT_WIDTH = PAPER.width - PAPER.margin * 2;
export interface BitRange {
  start: number;
  end: number;
}
export interface SignalBlock {
  kind: "signal";
  scheme: Scheme;
  signal: EncodedSignal;
  bits: EncodedBit[];
  range: BitRange;
  entry?: Voltage;
  previousPulse?: Voltage;
  state: string;
  description: string[];
  rules: string[];
  height: number;
}
export interface ReasoningBlock {
  kind: "reasoning";
  scheme: Scheme;
  range: BitRange;
  entries: { index: number; lines: string[] }[];
  height: number;
}
export type ReportBlock = SignalBlock | ReasoningBlock;
export interface ReportPage {
  range: BitRange;
  blocks: ReportBlock[];
  used: number;
}
export interface ReportModel {
  title: string;
  sequence: string;
  settings: ReportSettings;
  ranges: BitRange[];
  columns: number;
  pages: ReportPage[];
  schemes: Scheme[];
}
export const plain = (text: string) =>
  text
    .replaceAll("−", "-")
    .replaceAll("→", "to")
    .replaceAll("·", "/")
    .replace(/[’‘]/g, "'")
    .replace(/[–—]/g, "-");
export const levelName = (level: Voltage) =>
  level === 1 ? "+V" : level === -1 ? "-V" : "0V";
// Conservative wrapping is shared by the preview and both document formats.
export function wrap(text: string, width = PRINT_WIDTH, size = 10): string[] {
  const limit = Math.floor(width / (size * 0.64));
  const lines: string[] = [];
  let line = "";
  for (const word of plain(text).split(/\s+/)) {
    if (line && line.length + word.length + 1 > limit) {
      lines.push(line);
      line = word;
    } else line += (line ? " " : "") + word;
  }
  if (line) lines.push(line);
  return lines;
}
export function columnCapacity(
  layout: ReportLayout,
  width = PRINT_WIDTH,
  labels: string[] = ["no inv"],
  tables = true,
): number {
  // Courier at 9pt is 5.4pt per character; reserve 4pt breathing room per cell.
  const labelWidth = tables
    ? Math.max(0, ...labels.map((label) => label.length)) * 9 * 0.6 + 4
    : 0;
  const minimum = Math.max(
    { compact: 36, detailed: 44, study: 48 }[layout],
    labelWidth,
  );
  return Math.max(
    1,
    Math.floor((width - PAPER.axis - PAPER.trailing) / minimum),
  );
}

export function buildReport(
  sequence: string,
  signals: EncodedSignal[],
  input: ReportSettings,
): ReportModel {
  if (validateBits(sequence, sequence.length))
    throw new Error("Generate a valid 1–128-bit sequence before exporting.");
  const settings = { ...input, schemes: [...input.schemes] };
  if (
    !["compact", "detailed", "study"].includes(settings.layout) ||
    !["range", "scheme"].includes(settings.organization)
  )
    throw new Error("Choose a valid report layout and organization.");
  const schemes = SCHEMES.filter((s) => settings.schemes.includes(s.id));
  if (!schemes.length) throw new Error("Select at least one encoding scheme.");
  if (
    new Set(settings.schemes).size !== settings.schemes.length ||
    schemes.length !== settings.schemes.length
  )
    throw new Error("The scheme selection is invalid.");
  const labels = signals
    .filter((signal) => settings.schemes.includes(signal.id))
    .flatMap((signal) =>
      signal.bits.flatMap((bit) => [bit.output, bit.action ?? ""]),
    );
  const columns = columnCapacity(
    settings.layout,
    PRINT_WIDTH,
    labels,
    settings.tables,
  );
  const ranges: BitRange[] = [];
  for (let start = 0; start < sequence.length; start += columns)
    ranges.push({ start, end: Math.min(sequence.length, start + columns) });
  const pairs =
    settings.organization === "range"
      ? ranges.flatMap((range) => schemes.map((scheme) => ({ range, scheme })))
      : schemes.flatMap((scheme) => ranges.map((range) => ({ range, scheme })));
  const pages: ReportPage[] = [];
  const append = (block: ReportBlock, separate = false) => {
    let page = pages.at(-1);
    const sameRange =
      page &&
      page.range.start === block.range.start &&
      page.range.end === block.range.end;
    const sameScheme =
      page && page.blocks.at(-1)?.scheme.id === block.scheme.id;
    if (
      !page ||
      !sameRange ||
      separate ||
      (settings.organization === "scheme" && !sameScheme) ||
      page.used + block.height > PAPER.bottom - PAPER.top
    ) {
      page = { range: block.range, blocks: [], used: 0 };
      pages.push(page);
    }
    if (block.height > PAPER.bottom - PAPER.top)
      throw new Error("This report block exceeds the printable page area.");
    page.blocks.push(block);
    page.used += block.height;
  };
  for (const { range, scheme } of pairs) {
    const signal = signals.find((s) => s.id === scheme.id);
    if (
      !signal ||
      signal.bits.length !== sequence.length ||
      signal.bits.some((b, i) => b.index !== i || b.input !== sequence[i])
    )
      throw new Error(
        "The generated score does not match the report sequence. Regenerate the score first.",
      );
    // Slice references to the COMPLETE calculation. Never encode a range independently.
    const bits = signal.bits.slice(range.start, range.end);
    const entry = range.start
      ? signal.bits[range.start - 1].segments.at(-1)!.level
      : signal.initial;
    let previousPulse: Voltage | undefined;
    if (scheme.id === "ami" || scheme.id === "pseudoternary") {
      for (let i = range.start - 1; i >= 0; i--) {
        const pulse = signal.bits[i].segments.find((s) => s.level !== 0)?.level;
        if (pulse !== undefined) {
          previousPulse = pulse;
          break;
        }
      }
    }
    let state = [
      signal.initial !== undefined
        ? `Initial level ${levelName(signal.initial)}.`
        : "",
      range.start
        ? `Continued at bit ${range.start + 1}; previous level ${levelName(entry!)}.`
        : "Begins at bit 1.",
      previousPulse !== undefined
        ? `Previous nonzero pulse ${levelName(previousPulse)}.`
        : scheme.id === "ami" || scheme.id === "pseudoternary"
          ? "First nonzero pulse is positive."
          : "",
    ]
      .filter(Boolean)
      .join(" ");
    if (settings.content === "worksheet")
      state = [
        signal.initial !== undefined
          ? `Initial level ${levelName(signal.initial)}.`
          : "",
        range.start
          ? `Continued at bit ${range.start + 1}; carry forward your previous signal state.`
          : "Draw the waveform on the empty grid.",
      ]
        .filter(Boolean)
        .join(" ");
    const description = settings.explanations
      ? wrap(scheme.detail, PRINT_WIDTH, 9.5)
      : [];
    const rules = wrap(scheme.rule, PRINT_WIDTH, 9);
    const rows = settings.tables
      ? 2 + Number(settings.positions) + Number(bits.some((b) => b.action))
      : 0;
    const height =
      18 +
      rules.length * 12 +
      description.length * 12 +
      wrap(state, PRINT_WIDTH, 8.5).length * 11 +
      graphHeight(settings) +
      rows * 14 +
      10;
    append({
      kind: "signal",
      scheme,
      signal,
      bits,
      range,
      entry,
      previousPulse,
      state,
      description,
      rules,
      height,
    });
    if (
      settings.layout === "study" &&
      settings.reasoning &&
      settings.content !== "worksheet"
    ) {
      const entries = bits.map((bit) => ({
        index: bit.index,
        lines: wrap(
          `Bit ${bit.index + 1} / ${explainBit(signal, bit.index)}`,
          PRINT_WIDTH,
          10,
        ),
      }));
      let chunk: typeof entries = [];
      let height = 24;
      for (const entry of entries) {
        const entryHeight = entry.lines.length * 14 + 10;
        if (height + entryHeight > PAPER.bottom - PAPER.top && chunk.length) {
          append(
            { kind: "reasoning", scheme, range, entries: chunk, height },
            true,
          );
          chunk = [];
          height = 24;
        }
        chunk.push(entry);
        height += entryHeight;
      }
      if (chunk.length)
        append(
          { kind: "reasoning", scheme, range, entries: chunk, height },
          true,
        );
    }
  }
  return {
    title:
      settings.content === "worksheet"
        ? "Line coding practice worksheet"
        : settings.content === "answer-key"
          ? "Line coding answer key"
          : "Digital line coding report",
    sequence,
    settings,
    ranges,
    columns,
    pages,
    schemes,
  };
}
export function tableRows(
  block: SignalBlock,
  settings: ReportSettings,
): { label: string; values: string[] }[] {
  return [
    ...(settings.positions
      ? [{ label: "bit", values: block.bits.map((b) => String(b.index + 1)) }]
      : []),
    { label: "in", values: block.bits.map((b) => b.input) },
    {
      label: "out",
      values: block.bits.map((b) =>
        settings.content === "worksheet" ? "" : b.output,
      ),
    },
    ...(block.bits.some((b) => b.action)
      ? [
          {
            label: block.scheme.id === "rz" ? "mid" : "start",
            values: block.bits.map((b) =>
              settings.content === "worksheet" ? "" : (b.action ?? ""),
            ),
          },
        ]
      : []),
  ];
}
