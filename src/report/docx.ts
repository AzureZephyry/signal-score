import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  PageOrientation,
  Header,
  Footer,
  AlignmentType,
  PageNumber,
  ImageRun,
  TableLayoutType,
  HeightRule,
} from "docx";
import {
  graphHeight,
  PAPER,
  PRINT_WIDTH,
  tableRows,
  wrap,
  type ReportModel,
  type SignalBlock,
} from "./model";
import { palette, waveformSvg } from "./graphics";
export async function rasterizeSvg(svg: string): Promise<Uint8Array> {
  const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    const canvas = document.createElement("canvas");
    canvas.width = Math.ceil(PRINT_WIDTH * 4);
    canvas.height = Math.ceil(Number(image.height) * 4);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Waveform graphics could not be prepared.");
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(
        (b) =>
          b
            ? resolve(b)
            : reject(new Error("Waveform graphics could not be prepared.")),
        "image/png",
      ),
    );
    return new Uint8Array(await blob.arrayBuffer());
  } finally {
    URL.revokeObjectURL(url);
  }
}
export async function generateDocx(
  model: ReportModel,
  rasterize: (svg: string) => Promise<Uint8Array> = rasterizeSvg,
): Promise<Uint8Array> {
  const p = palette(model.settings.grayscale);
  const hex = (color: string) => color.slice(1);
  const paragraph = (
    text: string | string[],
    size = 10,
    options: {
      bold?: boolean;
      color?: string;
      mono?: boolean;
      after?: number;
      heading?: (typeof HeadingLevel)[keyof typeof HeadingLevel];
      pageBreakBefore?: boolean;
    } = {},
  ) =>
    new Paragraph({
      heading: options.heading,
      pageBreakBefore: options.pageBreakBefore,
      spacing: {
        before: 0,
        after: (options.after ?? 0) * 20,
        line: Math.round(size * 1.25 * 20),
        lineRule: "exact",
      },
      children: (Array.isArray(text) ? text : [text]).map(
        (line, i) =>
          new TextRun({
            text: line,
            break: i ? 1 : undefined,
            size: size * 2,
            bold: options.bold,
            color: hex(options.color ?? p.ink),
            font: options.mono ? "Courier New" : "Arial",
          }),
      ),
    });
  const children: (Paragraph | Table)[] = [];
  const signal = async (block: SignalBlock) => {
    children.push(
      paragraph(block.scheme.name, 13, {
        bold: true,
        heading: HeadingLevel.HEADING_2,
        after: 2,
      }),
    );
    children.push(paragraph(block.rules, 9, { mono: true, color: p.olive }));
    if (block.description.length)
      children.push(paragraph(block.description, 9.5));
    children.push(
      paragraph(wrap(block.state, PRINT_WIDTH, 8.5), 8.5, { color: p.muted }),
    );
    const height = graphHeight(model.settings);
    const svg = waveformSvg(
        block,
        model.settings.grayscale,
        PRINT_WIDTH,
        height,
        model.settings.content !== "worksheet",
      ),
      png = await rasterize(svg);
    children.push(
      new Paragraph({
        spacing: {
          before: 0,
          after: 0,
        },
        children: [
          new ImageRun({
            type: "svg",
            data: new TextEncoder().encode(svg),
            fallback: { type: "png", data: png },
            transformation: {
              width: (PRINT_WIDTH * 4) / 3,
              height: (height * 4) / 3,
            },
            altText: {
              title: `${block.scheme.name} waveform`,
              description:
                model.settings.content === "worksheet"
                  ? `Empty voltage grid for bits ${block.range.start + 1} to ${block.range.end}`
                  : `Bits ${block.range.start + 1} to ${block.range.end}, ${block.bits.map((b) => b.output).join(", ")}`,
              name: block.scheme.id,
            },
          }),
        ],
      }),
    );
    if (model.settings.tables) {
      const col =
        (PRINT_WIDTH - PAPER.axis - PAPER.trailing) / block.bits.length;
      const widths = [
        PAPER.axis,
        ...block.bits.map(() => col),
        PAPER.trailing,
      ].map((v) => Math.round(v * 20));
      const border = { style: BorderStyle.SINGLE, size: 2, color: hex(p.grid) };
      children.push(
        new Table({
          width: { size: Math.round(PRINT_WIDTH * 20), type: WidthType.DXA },
          layout: TableLayoutType.FIXED,
          columnWidths: widths,
          borders: {
            top: border,
            bottom: border,
            insideHorizontal: border,
            insideVertical: { style: BorderStyle.NONE },
            left: { style: BorderStyle.NONE },
            right: { style: BorderStyle.NONE },
          },
          rows: tableRows(block, model.settings).map(
            (row) =>
              new TableRow({
                cantSplit: true,
                height: { value: 14 * 20, rule: HeightRule.ATLEAST },
                children: [row.label, ...row.values, ""].map(
                  (value, i) =>
                    new TableCell({
                      width: { size: widths[i], type: WidthType.DXA },
                      margins: { top: 0, bottom: 0, left: 0, right: 0 },
                      children: [
                        new Paragraph({
                          alignment: i
                            ? AlignmentType.CENTER
                            : AlignmentType.LEFT,
                          spacing: {
                            before: 0,
                            after: 0,
                            line: 12 * 20,
                            lineRule: "exact",
                          },
                          children: [
                            new TextRun({
                              text: value,
                              font: "Courier New",
                              size: 18,
                              color: hex(i ? p.ink : p.muted),
                            }),
                          ],
                        }),
                      ],
                    }),
                ),
              }),
          ),
        }),
      );
    }
    children.push(paragraph("", 2, { after: 8 }));
  };
  for (let i = 0; i < model.pages.length; i++) {
    const page = model.pages[i];
    children.push(
      paragraph(model.title, 22, {
        bold: true,
        heading: i ? HeadingLevel.HEADING_1 : HeadingLevel.TITLE,
        pageBreakBefore: i > 0,
        after: 4,
      }),
    );
    children.push(
      paragraph(
        `${model.sequence.length} bits / ${model.schemes.length} schemes / ${model.settings.layout} / ${model.settings.organization === "range" ? "compare by bit range" : "study by encoding scheme"}`,
        9,
        { color: p.muted, after: 2 },
      ),
    );
    children.push(
      paragraph(
        model.sequence
          .match(/.{1,64}/g)!
          .map((s, j) => `${j ? "       " : "Source:"} ${s}`),
        8.5,
        { mono: true, after: 6 },
      ),
    );
    children.push(
      paragraph(
        `Bits ${page.range.start + 1}-${page.range.end} / ${model.sequence.slice(page.range.start, page.range.end)}`,
        11,
        { bold: true, mono: true, color: p.olive, after: 8 },
      ),
    );
    for (const block of page.blocks) {
      if (block.kind === "signal") await signal(block);
      else {
        children.push(
          paragraph(`${block.scheme.name} / bit reasoning`, 13, {
            bold: true,
            heading: HeadingLevel.HEADING_2,
            after: 8,
          }),
        );
        for (const entry of block.entries)
          children.push(paragraph(entry.lines, 10, { after: 10 }));
      }
    }
  }
  const doc = new Document({
    title: model.title,
    subject: "Digital line coding waveforms and editable per-bit tables",
    creator: "Signal / Score",
    description: "An interactive digital signal laboratory report",
    styles: {
      default: {
        document: {
          run: { font: "Arial", size: 20, color: hex(p.ink) },
          paragraph: { spacing: { before: 0, after: 0 } },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            size: {
              width: Math.round(PAPER.height * 20),
              height: Math.round(PAPER.width * 20),
              orientation: PageOrientation.LANDSCAPE,
            },
            margin: {
              top: 36 * 20,
              bottom: 36 * 20,
              left: 36 * 20,
              right: 36 * 20,
              header: 14 * 20,
              footer: 14 * 20,
            },
          },
        },
        headers: {
          default: new Header({
            children: [
              paragraph(
                "SIGNAL / SCORE                                              REPORT STUDIO",
                9,
                { color: p.accent, bold: true },
              ),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: "Normalized voltage levels / Page ",
                    size: 16,
                    color: hex(p.muted),
                  }),
                  new TextRun({ children: [PageNumber.CURRENT], size: 16 }),
                  new TextRun({ text: " / ", size: 16 }),
                  new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 16 }),
                ],
              }),
            ],
          }),
        },
        children,
      },
    ],
  });
  return new Uint8Array(await Packer.toArrayBuffer(doc));
}
