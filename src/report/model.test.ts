import { describe, it, expect } from "vitest";
import { encode } from "../lib/encoding";
import { SCHEMES } from "../lib/schemes";
import {
  buildReport,
  columnCapacity,
  DEFAULT_SETTINGS,
  PAPER,
  type ReportSettings,
  type SignalBlock,
} from "./model";
import { diagram } from "./graphics";
import { generatePdf } from "./pdf";
import { PDFDocument } from "pdf-lib";
const make = (
  sequence: string,
  settings: Partial<ReportSettings> = {},
  initial: 1 | -1 = 1,
) =>
  buildReport(
    sequence,
    SCHEMES.map((s) => encode(s.id, sequence, initial)),
    { ...DEFAULT_SETTINGS, ...settings },
  );
const cards = (model: ReturnType<typeof make>) =>
  model.pages
    .flatMap((p) => p.blocks)
    .filter((b): b is SignalBlock => b.kind === "signal");
describe("Report Studio complete-stream model", () => {
  it.each([1, 12, 32, 65, 128])(
    "covers every bit once per selected scheme at length %i",
    (length) => {
      const model = make("11100101100010110".repeat(8).slice(0, length));
      for (const scheme of SCHEMES) {
        const bits = cards(model)
          .filter((c) => c.scheme.id === scheme.id)
          .flatMap((c) => c.bits);
        expect(bits.map((b) => b.index)).toEqual(
          Array.from({ length }, (_, i) => i),
        );
        expect(bits.map((b) => b.input).join("")).toBe(model.sequence);
      }
      expect(model.pages.every((p) => p.used <= PAPER.bottom - PAPER.top)).toBe(
        true,
      );
    },
  );
  it.each(["compact", "detailed", "study"] as const)(
    "calculates readable columns and bounded pages for %s",
    (layout) => {
      const model = make("1011001010100110".repeat(8), { layout });
      expect(model.columns).toBe(columnCapacity(layout));
      expect(model.columns).toBeLessThan(24);
      expect(model.ranges.length).toBeGreaterThan(1);
      expect(model.pages.every((p) => p.used <= PAPER.bottom - PAPER.top)).toBe(
        true,
      );
    },
  );
  it.each([1, -1] as const)(
    "retains full-stream states and labels across every boundary, initial %i",
    (initial) => {
      const sequence = "11100101100010110001000111010101".repeat(4);
      const model = make(sequence, {}, initial);
      for (const card of cards(model)) {
        const full = encode(card.scheme.id, sequence, initial);
        expect(card.bits).toEqual(
          full.bits.slice(card.range.start, card.range.end),
        );
        if (card.range.start) {
          expect(card.entry).toBe(
            full.bits[card.range.start - 1].segments.at(-1)!.level,
          );
          expect(card.bits[0].index).toBe(card.range.start);
        }
        const points = diagram(card).points;
        expect(
          points
            .slice(1)
            .every((p, i) => p[0] === points[i][0] || p[1] === points[i][1]),
        ).toBe(true);
        expect(card.bits.at(-1)!.segments.at(-1)!.end).toBe(card.range.end);
      }
    },
  );
  it("preserves previous bipolar pulses across zero-voltage gaps", () => {
    for (const [id, sequence] of [
      ["ami", "1" + "0".repeat(30) + "1"],
      ["pseudoternary", "0" + "1".repeat(30) + "0"],
    ] as const) {
      const model = make(sequence, { schemes: [id] });
      const last = cards(model).at(-1)!;
      expect(last.previousPulse).toBe(1);
      expect(last.bits.at(-1)!.output).toBe("neg");
    }
  });
  it("filters schemes, respects organization and retains correct example labels", () => {
    const model = make("111001011000", {
      schemes: ["ami", "nrz-i"],
      organization: "scheme",
    });
    expect(cards(model).map((c) => c.scheme.id)).toEqual(["nrz-i", "ami"]);
    expect(
      cards(model)[1]
        .bits.map((b) => b.output)
        .join(" "),
    ).toBe("pos neg pos zero zero neg zero pos neg zero zero zero");
  });
  it("grounds study reasoning in previous complete-stream states", () => {
    const model = make("11100101100010110".repeat(2), {
      layout: "study",
      schemes: ["nrz-i"],
    });
    const reasons = model.pages
      .flatMap((p) => p.blocks)
      .filter((b) => b.kind === "reasoning")
      .flatMap((b) => b.entries);
    expect(reasons.map((r) => r.index)).toEqual(
      Array.from({ length: 34 }, (_, i) => i),
    );
    expect(reasons.at(-1)!.lines.join(" ")).toContain("previous bit ended");
  });
  it("rejects invalid inputs, empty selections and mismatched calculation snapshots", () => {
    expect(() => make("")).toThrow();
    expect(() => make("12")).toThrow();
    expect(() => make("1", { schemes: [] })).toThrow();
    expect(() =>
      buildReport("11", [encode("ami", "1")], {
        ...DEFAULT_SETTINGS,
        schemes: ["ami"],
      }),
    ).toThrow();
  });
  it("generates a real vector PDF with expected A4 page count", async () => {
    const model = make("111001011000");
    const data = await generatePdf(model);
    const pdf = await PDFDocument.load(data);
    expect(pdf.getPageCount()).toBe(model.pages.length);
    expect(pdf.getPage(0).getWidth()).toBeCloseTo(PAPER.width, 1);
    expect(pdf.getTitle()).toBe(model.title);
  });
});
