import { expect, it } from "vitest";
import { PDFDocument, PDFRawStream, decodePDFRawStream } from "pdf-lib";
import { unzipSync, strFromU8 } from "fflate";
import { encodeGraphs, GRAPHS } from "../lib/graphs";
import { inversionDecisions } from "../lib/inversion";
import {
  buildReport,
  DEFAULT_SETTINGS,
  tableRows,
  PAPER,
  type SignalBlock,
} from "./model";
import { waveformSvg, diagram } from "./graphics";
import { generatePdf } from "./pdf";
import { generateDocx } from "./docx";
const png = Uint8Array.from(
  Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLbtAAAAABJRU5ErkJggg==",
    "base64",
  ),
);
const cards = (model: ReturnType<typeof buildReport>) =>
  model.pages
    .flatMap((p) => p.blocks)
    .filter((b): b is SignalBlock => b.kind === "signal");
it.each(["compact", "detailed", "study"] as const)(
  "%s preserves 128 absolute decisions and polarity across every graph's pages",
  (layout) => {
    const sequence = "1010011000110011".repeat(8),
      signals = encodeGraphs(sequence);
    const model = buildReport(sequence, signals, {
      ...DEFAULT_SETTINGS,
      layout,
    });
    expect(model.schemes).toHaveLength(10);
    expect(model.pages.every((p) => p.used <= PAPER.bottom - PAPER.top)).toBe(
      true,
    );
    for (const graph of GRAPHS) {
      const blocks = cards(model).filter((b) => b.scheme.id === graph.id);
      const signal = signals.find((s) => s.graphId === graph.id)!;
      expect(blocks.flatMap((b) => b.bits.map((bit) => bit.index))).toEqual(
        Array.from({ length: 128 }, (_, i) => i),
      );
      expect(blocks.flatMap((b) => b.bits)).toEqual(signal.bits);
      expect(
        blocks.flatMap((b) => inversionDecisions(b.signal, b.bits)),
      ).toEqual(inversionDecisions(signal));
      for (const block of blocks) {
        const d = diagram(block);
        if (block.range.start)
          expect(block.entry).toBe(
            signal.bits[block.range.start - 1].segments.at(-1)!.level,
          );
        for (const marker of d.markers) {
          expect(marker.x).toBeCloseTo(
            PAPER.axis + (marker.index - block.range.start) * d.bitWidth,
          );
          expect(marker.y).toBe(
            d.y(signal.bits[marker.index].segments[0].level),
          );
        }
        expect(
          tableRows(block, model.settings).find((r) => r.label === "out")!
            .values,
        ).toEqual(block.bits.map((b) => b.output));
      }
    }
  },
);
it("filters High and Low independently and rejects a mislabeled polarity snapshot", () => {
  const signals = encodeGraphs("10100110");
  const model = buildReport("10100110", signals, {
    ...DEFAULT_SETTINGS,
    schemes: ["nrz-i-low", "differential"],
  });
  expect(model.schemes.map((s) => s.id)).toEqual(["nrz-i-low", "differential"]);
  expect(() =>
    buildReport(
      "10100110",
      signals.map((s) =>
        s.graphId === "nrz-i-low" ? { ...s, initial: 1 } : s,
      ),
      DEFAULT_SETTINGS,
    ),
  ).toThrow(/does not match/);
});
it.each(["report", "worksheet", "answer-key"] as const)(
  "%s exports all ten editable tables with correct per-bit SVG marker presence",
  async (content) => {
    const model = buildReport("10100110", encodeGraphs("10100110"), {
      ...DEFAULT_SETTINGS,
      content,
      grayscale: true,
    });
    const files = unzipSync(await generateDocx(model, async () => png));
    const xml = strFromU8(files["word/document.xml"]);
    expect(xml.match(/<w:tbl>/g) || []).toHaveLength(10);
    for (const graph of GRAPHS)
      expect(xml).toContain(graph.name.replaceAll("&", "&amp;"));
    const svgs = Object.entries(files)
      .filter(([name]) => name.endsWith(".svg"))
      .map(([, data]) => strFromU8(data));
    expect(svgs).toHaveLength(10);
    expect(svgs.join("").match(/data-decision=/g) || []).toHaveLength(
      content === "worksheet" ? 0 : 32,
    );
    expect(svgs.join("").includes("polyline")).toBe(content !== "worksheet");
    if (content !== "worksheet")
      expect(svgs.join("")).toContain("No invert / bit start");
    const pdf = await PDFDocument.load(await generatePdf(model));
    expect(pdf.getPageCount()).toBe(model.pages.length);
    const streams = pdf.context
      .enumerateIndirectObjects()
      .flatMap(([, obj]) =>
        obj instanceof PDFRawStream
          ? [Buffer.from(decodePDFRawStream(obj).decode()).toString("latin1")]
          : [],
      )
      .join("\n");
    // jsPDF circles are four cubic Bézier arcs; fixtures contain no other curves.
    expect((streams.match(/ c\n/g) || []).length).toBe(
      content === "worksheet" ? 0 : (32 + 8) * 4,
    );
    for (const block of cards(model)) {
      const svg = waveformSvg(
        block,
        true,
        undefined,
        80,
        content !== "worksheet",
      );
      expect((svg.match(/data-decision=/g) || []).length).toBe(
        content === "worksheet" ? 0 : inversionDecisions(block.signal).length,
      );
    }
  },
);
it("maximum-length ten-graph documents retain 128 absolute decisions in real PDF and DOCX containers", async () => {
  const sequence = "1010011000110011".repeat(8);
  const model = buildReport(sequence, encodeGraphs(sequence), {
    ...DEFAULT_SETTINGS,
    layout: "compact",
  });
  const pdf = await PDFDocument.load(await generatePdf(model));
  expect(pdf.getPageCount()).toBe(model.pages.length);
  const files = unzipSync(await generateDocx(model, async () => png));
  const xml = strFromU8(files["word/document.xml"]);
  expect((xml.match(/<w:tbl>/g) || []).length).toBe(10 * model.ranges.length);
  const svg = Object.entries(files)
    .filter(([name]) => name.endsWith(".svg"))
    .map(([, data]) => strFromU8(data))
    .join("");
  expect((svg.match(/data-decision=/g) || []).length).toBe(4 * 128);
  expect((svg.match(/data-bit="128"/g) || []).length).toBe(4);
});
