# Report Studio

Report Studio extends the existing Signal / Score application. All original encoding functions, geometry, motion hooks, themes and educational explanation functions remain unchanged. App integration adds a generated-score-only Export Report action and an accessible native dialog.

## Local checkpoint

The project had no Git repository. A local baseline was initialized on `main` and committed as `b2cd578` before feature changes. Work is on `feature/report-studio`. Existing unrelated files, prior archives and historical checkpoints were preserved; no remote was configured or contacted, and the separate C++ project was not touched.

## Features

- Browser-local PDF and editable Word export from the currently generated sequence and current independent initial levels.
- Compact, Detailed (default), Study; organization by bit range or by scheme; all eight or custom selection.
- Optional explanations, per-bit input/output/action tables, original position rows, Study reasoning and grayscale printing.
- Navigable representative preview and complete page outline. The UI explicitly distinguishes this from exact PDF/Word rendering.
- Empty practice worksheets with larger grids and separate answer-key export. Worksheet output/action cells are blank, no signal path or per-bit reasoning is included, diagram alt text has no answers, and continuation prompts omit computed preceding states.
- Native dialog keyboard containment, heading focus, Escape/Close, focus restoration, responsive layouts and shared Day/Night tokens.
- Completed-file downloads only, generation/error/success states, disabled settings while generating, and no delayed download after closing the studio.

## Shared architecture

| Module                        | Responsibility                                                                                                                                                                    |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/report/model.ts`         | Settings validation, complete-calculation snapshot validation, scheme filtering, integer bit segmentation, continuation metadata, page/block packing, shared labels and reasoning |
| `src/report/graphics.ts`      | Shared graph coordinates, orthogonal points, print palette and SVG figures                                                                                                        |
| `src/report/pdf.ts`           | Native vector PDF lines, selectable text/tables, page headers/footers and page numbers                                                                                            |
| `src/report/docx.ts`          | Editable OOXML paragraphs/headings/tables, SVG figures and high-resolution PNG fallback, explicit landscape page breaks and fields                                                |
| `src/report/ReportStudio.tsx` | Accessible settings, preview, page outline and local export state                                                                                                                 |
| `src/report/download.ts`      | Lazy format imports, complete-byte validation, Blob download and URL cleanup                                                                                                      |
| `src/report/report.css`       | Scoped themed studio UI and independent print-page preview                                                                                                                        |

The studio receives full `EncodedSignal[]` from the existing pure encoder. It never independently encodes a segment and does not read GSAP clip masks, playback counters, screen captures or DOM waveform paths. Whole-bit slices preserve the original global indices and half-bit intervals. Continuation graphics begin with the actual preceding level, including a genuine boundary transition only when the next level differs. No extra return to zero is added. Bipolar continuation metadata tracks the preceding nonzero pulse across inactive bits. Study reasoning calls the existing `explainBit` with the complete signal and global index.

## Pagination and print design

A4 landscape is 841.89 × 595.28 pt, with 36pt margins. The usable graph width excludes the 44pt voltage-axis column and 12pt trailing margin. Minimum bit width combines layout spacing (36 / 44 / 48pt) with the longest selected output/action label, Courier 9pt metrics and cell breathing room. This gives maximum capacities of 19 / 16 / 14 for the current label set. Tables can be omitted without compromising plot spacing. Schemes are packed into pages using the actual enabled description/label rows and graph height. Contextual reasoning has separate measured line/chunk budgets. Every page range begins/ends between complete bits.

Print uses ink, warm plotting surfaces, vermilion and botanical olive with subtle grids. Grayscale uses dark strokes and explicit voltage labels, never color alone. Standard Helvetica/Arial and Courier provide predictable print metrics. Table text is 9pt, explanations 9.5pt and Study reasoning 10pt. Word retains SVG where supported and includes approximately 288dpi raster fallbacks. PDF waveforms are native vector primitives, not page screenshots. The browser preview is a legible scaled representation, not an exact document renderer.

## Library verification

Verified official documentation and release pages before installation:

- [jsPDF 4.2.1 release](https://github.com/parallax/jsPDF/releases/tag/v4.2.1) and [API documentation](https://parallax.github.io/jsPDF/docs/index.html).
- [docx 9.15.0 release](https://github.com/dolanmiu/docx/releases/tag/9.15.0), [browser-capable Packer](https://docx.js.org/api/classes/index.Packer.html), and the official SVG-with-PNG-fallback example.

Both run in the existing Node 24 / TypeScript / Vite project and are dynamically loaded only for export. `pdf-lib` and `fflate` are development-only inspectors. The newly added fflate was updated to its patched version after checking advisories. Production dependency audit reports zero vulnerabilities. Existing development-tool advisories in the inherited Vitest/tinypool stack were not resolved by an unrelated major-version tool migration.

## Document evidence

Actual files under `evidence/reports/` were generated through the production browser, opened in Word invisibly, exported to PDF and rendered with bundled Poppler. The bundled `render_docx.py` was attempted but could not run because LibreOffice is not bundled on this Windows host; Microsoft Word 16 was used for real layout verification instead. All editable tables and inline graphics were counted in Word.

| Sample                                              | PDF pages | Actual Word pages | Editable tables | Inline graphics |
| --------------------------------------------------- | --------: | ----------------: | --------------: | --------------: |
| Detailed 12-bit, all eight                          |         4 |                 4 |               8 |               8 |
| Compact 128-bit, NRZ-I and AMI, grayscale           |         7 |                 7 |              14 |              14 |
| Study 12-bit, Differential Manchester initially low |         3 |                 3 |               1 |               1 |
| Practice worksheet, AMI                             |         1 |                 1 |               1 |               1 |
| Separate answer key, AMI                            |         1 |                 1 |               1 |               1 |

The three main examples yield 28 PDF/Word-rendered page images; worksheet/key add four. Fixed Word image line spacing initially clipped top digits; it was replaced with automatic image-paragraph spacing, and the documents were regenerated and re-rendered. All 80 main-example Word table rows were also extracted from the actual Word-rendered PDF and compared against their editable source cells with exact matches. No text lay outside checked page bounds. Evidence JSON, render scripts, screenshots and page images remain in `evidence/reports/`, excluded from the source archive.

## Test scope and limits

The automated model tests cover 1/12/32/65/128-bit input, all layouts, scheme filtering, original sample labels, both initial levels, every segment boundary, bipolar gaps, orthogonal geometry, complete coverage without duplicates/omissions, invalid/mismatched snapshots and grounded Study reasoning. Container tests parse actual PDF and DOCX bytes, inspect page dimensions/counts, editable tables, headings, SVG/PNG media, optional content and worksheet answer suppression. Browser tests inspect actual downloaded bytes, test initial conditions and a reset playback position, preview pages, selection, settings, both themes, keyboard handling, maximum input, worksheets and answer keys. Final verification: **158 unit tests passed; all 64 production browser tests passed**. A final mobile Close-button spacing refinement was rebuilt and its 10 affected report/responsive checks also passed. See `QA.md` for the full audit, including an earlier timing-sensitive sampling failure during concurrent document rendering.

The preview is representative. Edited Word files or different Word versions/fonts may reflow; explicit page breaks and conservative spacing reduce this. Physical-device Safari is not tested. Reports use normalized levels, not measured hardware timing or fixed real voltage magnitudes. PDF text is selectable but a PDF/UA tagging/certification claim is not made. Existing 128-bit limit remains.
