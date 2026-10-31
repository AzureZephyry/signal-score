import { jsPDF } from "jspdf";
import {
  graphHeight,
  PAPER,
  PRINT_WIDTH,
  plain,
  tableRows,
  wrap,
  type ReportModel,
  type SignalBlock,
} from "./model";
import { diagram, palette } from "./graphics";
export async function generatePdf(model: ReportModel): Promise<Uint8Array> {
  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "pt",
    format: "a4",
    compress: true,
  });
  pdf.setProperties({
    title: model.title,
    subject: "Digital line coding waveforms and per-bit labels",
    author: "Signal / Score",
    creator: "Signal / Score Report Studio",
  });
  const p = palette(model.settings.grayscale);
  const text = (
    value: string | string[],
    x: number,
    y: number,
    size = 10,
    color = p.ink,
    font = "helvetica",
    bold = false,
  ) => {
    pdf.setFont(font, bold ? "bold" : "normal");
    pdf.setFontSize(size);
    pdf.setTextColor(color);
    pdf.text(Array.isArray(value) ? value.map(plain) : plain(value), x, y, {
      lineHeightFactor: 1.25,
    });
  };
  const line = (
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    color = p.grid,
    width = 0.5,
  ) => {
    pdf.setDrawColor(color);
    pdf.setLineWidth(width);
    pdf.line(x1, y1, x2, y2);
  };
  const drawSignal = (block: SignalBlock, top: number) => {
    let y = top;
    text(block.scheme.name, PAPER.margin, y + 12, 13, p.ink, "helvetica", true);
    y += 18;
    text(block.rules, PAPER.margin, y + 9, 9, p.olive, "courier");
    y += block.rules.length * 12;
    if (block.description.length) {
      text(block.description, PAPER.margin, y + 9, 9.5);
      y += block.description.length * 12;
    }
    const state = wrap(block.state, PRINT_WIDTH, 8.5);
    text(state, PAPER.margin, y + 8, 8.5, p.muted);
    y += state.length * 11;
    const height = graphHeight(model.settings);
    const d = diagram(block, PRINT_WIDTH, height);
    pdf.setFillColor(p.paper);
    pdf.rect(PAPER.margin, y, PRINT_WIDTH, height, "F");
    for (const level of [1, 0, -1] as const) {
      line(
        PAPER.margin + PAPER.axis,
        y + d.y(level),
        PAPER.width - PAPER.margin - PAPER.trailing,
        y + d.y(level),
      );
      text(
        level === 1 ? "+V" : level === 0 ? "0V" : "-V",
        PAPER.margin + 2,
        y + d.y(level) + 3,
        9,
        p.muted,
        "courier",
      );
    }
    pdf.setLineDashPattern([2, 3], 0);
    for (let i = 0; i <= block.bits.length; i++)
      line(
        PAPER.margin + PAPER.axis + i * d.bitWidth,
        y + height * 0.17,
        PAPER.margin + PAPER.axis + i * d.bitWidth,
        y + height * 0.86,
      );
    pdf.setLineDashPattern([1, 4], 0);
    for (const b of block.bits)
      if (b.segments.length > 1)
        line(
          PAPER.margin + d.x(b.index + 0.5),
          y + height * 0.17,
          PAPER.margin + d.x(b.index + 0.5),
          y + height * 0.86,
        );
    pdf.setLineDashPattern([], 0);
    for (const b of block.bits) {
      pdf.setFont("courier", "normal");
      pdf.setFontSize(9);
      pdf.setTextColor(p.ink);
      pdf.text(b.input, PAPER.margin + d.x(b.index + 0.5), y + 9, {
        align: "center",
      });
    }
    if (model.settings.content !== "worksheet")
      for (let i = 1; i < d.points.length; i++)
        line(
          PAPER.margin + d.points[i - 1][0],
          y + d.points[i - 1][1],
          PAPER.margin + d.points[i][0],
          y + d.points[i][1],
          p.accent,
          1.8,
        );
    y += height;
    if (model.settings.tables)
      for (const row of tableRows(block, model.settings)) {
        line(PAPER.margin, y, PAPER.width - PAPER.margin, y);
        text(row.label, PAPER.margin + 2, y + 10, 8.5, p.muted, "courier");
        row.values.forEach((value, i) => {
          pdf.setFont("courier", "normal");
          pdf.setFontSize(9);
          pdf.setTextColor(p.ink);
          pdf.text(
            value,
            PAPER.margin + PAPER.axis + (i + 0.5) * d.bitWidth,
            y + 10,
            { align: "center" },
          );
        });
        y += 14;
      }
  };
  model.pages.forEach((page, index) => {
    if (index) pdf.addPage("a4", "landscape");
    text("SIGNAL / SCORE", PAPER.margin, 23, 9, p.accent, "helvetica", true);
    text(
      "REPORT STUDIO",
      PAPER.width - PAPER.margin - 90,
      23,
      8,
      p.muted,
      "courier",
    );
    text(model.title, PAPER.margin, 52, 22, p.ink, "helvetica", true);
    text(
      `${model.sequence.length} bits / ${model.schemes.length} schemes / ${model.settings.layout} / ${model.settings.organization === "range" ? "compare by bit range" : "study by encoding scheme"}`,
      PAPER.margin,
      70,
      9,
      p.muted,
    );
    const sequence = model.sequence.match(/.{1,64}/g)!;
    text(
      sequence.map((s, i) => `${i === 0 ? "Source:" : "       "} ${s}`),
      PAPER.margin,
      84,
      8.5,
      p.ink,
      "courier",
    );
    text(
      `Bits ${page.range.start + 1}-${page.range.end} / ${model.sequence.slice(page.range.start, page.range.end)}`,
      PAPER.margin,
      116,
      11,
      p.olive,
      "courier",
      true,
    );
    let y = PAPER.top;
    for (const block of page.blocks) {
      if (block.kind === "signal") drawSignal(block, y);
      else {
        text(
          `${block.scheme.name} / bit reasoning`,
          PAPER.margin,
          y + 12,
          13,
          p.ink,
          "helvetica",
          true,
        );
        let top = y + 24;
        for (const entry of block.entries) {
          text(entry.lines, PAPER.margin, top + 10, 10);
          top += entry.lines.length * 14 + 10;
        }
      }
      y += block.height;
    }
    line(PAPER.margin, 562, PAPER.width - PAPER.margin, 562);
    text(
      "Normalized voltage levels / complete-stream encoding / A4 landscape",
      PAPER.margin,
      577,
      8,
      p.muted,
    );
    text(
      `${index + 1} / ${model.pages.length}`,
      PAPER.width - PAPER.margin - 45,
      577,
      9,
      p.muted,
      "courier",
    );
  });
  return new Uint8Array(pdf.output("arraybuffer"));
}
