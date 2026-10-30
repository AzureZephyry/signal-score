import { it, expect } from "vitest";
import { unzipSync, strFromU8 } from "fflate";
import { PDFDocument } from "pdf-lib";
import { generateDocx } from "./docx";
import { generatePdf } from "./pdf";
import { buildReport, DEFAULT_SETTINGS, type ReportLayout } from "./model";
import { encode } from "../lib/encoding";
import { SCHEMES } from "../lib/schemes";
const png = Uint8Array.from(
  Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLbtAAAAABJRU5ErkJggg==",
    "base64",
  ),
);
it.each([
  ["1", "detailed"],
  ["111001011000", "study"],
  ["1110010110001010".repeat(8), "compact"],
] as const)(
  "generates inspectable PDF and editable Word containers for %s / %s",
  async (sequence, layout) => {
    const model = buildReport(
      sequence,
      SCHEMES.map((s) => encode(s.id, sequence, -1)),
      {
        ...DEFAULT_SETTINGS,
        layout: layout as ReportLayout,
        schemes: ["nrz-i", "ami"],
      },
    );
    const pdf = await PDFDocument.load(await generatePdf(model));
    expect(pdf.getPageCount()).toBe(model.pages.length);
    const files = unzipSync(await generateDocx(model, async () => png));
    const xml = strFromU8(files["word/document.xml"]);
    const signalCards = model.pages
      .flatMap((p) => p.blocks)
      .filter((b) => b.kind === "signal");
    expect((xml.match(/<w:tbl>/g) || []).length).toBe(signalCards.length);
    expect(
      (xml.match(/w:type="page"/g) || []).length +
        (xml.match(/<w:pageBreakBefore\/>/g) || []).length,
    ).toBe(model.pages.length - 1);
    expect(xml).toContain('w:orient="landscape"');
    expect(xml).toContain('w:w="16838"');
    expect(xml).toContain("Digital line coding report");
    for (const card of signalCards)
      for (const bit of card.bits) expect(xml).toContain(`>${bit.output}<`);
    expect(
      Object.keys(files).filter((name) => name.endsWith(".svg")).length,
    ).toBe(signalCards.length);
    expect(Object.keys(files).some((name) => name.endsWith(".png"))).toBe(true);
    const mediaSvg = Object.keys(files).find((name) => name.endsWith(".svg"))!;
    expect(strFromU8(files[mediaSvg])).toContain("<polyline");
    expect(xml).not.toMatch(/instructor|assignment|submission/i);
  },
);
import { tableRows, graphHeight } from "./model";
import { waveformSvg } from "./graphics";
it("worksheets expose empty grids and answer cells without leaking continuation answers", async () => {
  const sequence = "1" + "0".repeat(30) + "1";
  const model = buildReport(
    sequence,
    SCHEMES.map((s) => encode(s.id, sequence, -1)),
    {
      ...DEFAULT_SETTINGS,
      content: "worksheet",
      layout: "study",
      schemes: ["ami", "nrz-i"],
    },
  );
  expect(model.title).toBe("Line coding practice worksheet");
  expect(
    model.pages.flatMap((p) => p.blocks).every((b) => b.kind === "signal"),
  ).toBe(true);
  const files = unzipSync(await generateDocx(model, async () => png));
  for (const block of model.pages.flatMap((p) => p.blocks))
    if (block.kind === "signal") {
      expect(
        tableRows(block, model.settings)
          .filter((r) => r.label !== "in" && r.label !== "bit")
          .every((r) => r.values.every((v) => v === "")),
      ).toBe(true);
      expect(block.state).not.toContain("previous level");
      expect(block.state).not.toContain("Previous nonzero pulse");
      expect(
        waveformSvg(
          block,
          false,
          undefined,
          graphHeight(model.settings),
          false,
        ),
      ).not.toContain("polyline");
    }
  expect(
    Object.entries(files)
      .filter(([name]) => name.endsWith(".svg"))
      .every(([, data]) => !strFromU8(data).includes("polyline")),
  ).toBe(true);
  expect(strFromU8(files["word/document.xml"])).toContain("Empty voltage grid");
  const key = buildReport(
    sequence,
    SCHEMES.map((s) => encode(s.id, sequence, -1)),
    { ...model.settings, content: "answer-key" },
  );
  expect(key.ranges).toEqual(model.ranges);
  expect(key.title).toBe("Line coding answer key");
  const card = key.pages
    .flatMap((p) => p.blocks)
    .find((b) => b.kind === "signal")!;
  if (card.kind === "signal") expect(waveformSvg(card)).toContain("polyline");
});
it("honors optional tables, positions and explanations in editable exports", async () => {
  const model = buildReport(
    "101",
    SCHEMES.map((s) => encode(s.id, "101")),
    {
      ...DEFAULT_SETTINGS,
      schemes: ["ami"],
      tables: false,
      positions: false,
      explanations: false,
    },
  );
  const files = unzipSync(await generateDocx(model, async () => png));
  const xml = strFromU8(files["word/document.xml"]);
  expect(xml).not.toContain("<w:tbl>");
  expect(xml).not.toContain("Zeros stay at zero voltage");
});
