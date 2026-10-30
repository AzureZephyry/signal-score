# Product language refinement

Signal / Score is positioned as an interactive digital signal laboratory for exploring how binary information becomes electrical waveforms.

## User-facing changes

| Surface | Previous language | Current language |
| --- | --- | --- |
| Hero eyebrow | A study in digital transmission | An interactive signal laboratory |
| Example button | Instructor sample | Load example |
| Disabled-example help | The instructor sample uses 12 bits | The example uses 12 bits. Set the length to 12 to load it. |
| Conventions disclosure | About the assignment conventions, with instructor/document discrepancy discussion | Encoding conventions, with self-contained polarity, initial-state and transition explanations |
| Footer | Course-oriented byline | A digital signal laboratory / Binary → Voltage |
| Browser title | Line Coding Visualizer | Signal / Score — Digital Signal Laboratory |
| Description metadata and README opening | Previous project/assignment framing | Interactive digital signal laboratory positioning |
| README example and quality-check descriptions | Instructor sample | Verified example sequence / Load example |

All scheme descriptions, per-bit explanations, help guides, navigation/accessibility labels, validation messages and empty states were reviewed. Existing suitable educational language remains. “Bits into rhythm.” and the Kinetic Signal Score composition are preserved. No Report Studio or export templates exist in this version.

## Internal references intentionally preserved

The original reference-document discrepancy analysis has been moved from the public README narrative to `INTERNAL_REFERENCES.md`, with a link retained in the README. Existing validated test fixtures, the fixed 12-bit example, prior audits, source references and checkpoints remain intact. The internal `assignment-note` CSS class remains unchanged to preserve styles; it is not visible or accessible product text. Existing source/archive folder names are retained for compatibility.

A safe checkpoint and previous source/static archives are under `submission/checkpoints/product-language-20261030-233009/`.

## Executed verification

- Production build, including strict TypeScript: passed.
- Unit tests: 138 passed.
- Relevant production browser tests: 14 passed, covering example loading, length-first validation/editing, keyboard interaction, educational explanations and responsive text in both themes.
- Additional production-browser copy audit: eight journeys, Day/Night at 1440px, 768px, 390px and 320px. Rendered and accessible text, browser title and metadata were scanned. All eight explanations and guides were opened. No academic-assignment references, text clipping, page overflow or console errors were found in the checked journeys.
- Opening screens, example help and conventions were captured and visually reviewed at desktop and narrow-mobile sizes. Evidence: `evidence/product-language/`; reproducible audit: `evidence/check-product-language.mjs`.
- Twenty-five other source files are byte-for-byte unchanged from the checkpoint, including all styles, encoders, geometry, SVG rendering, motion hooks and explanation functions. The two changed React components contain text-only diffs; application state and handlers are unchanged.

These are targeted checks for a content-only revision, not another complete motion test run. Browser coverage uses installed Chrome and responsive/mobile emulation, not physical Safari devices. Updated source/static archives are created after checks pass; evidence and checkpoints are excluded from the source archive.
