# SIGNAL / SCORE

An interactive digital signal laboratory for exploring how binary information becomes electrical waveforms. Compare eight line coding schemes on a shared timeline, inspect individual bits, and connect each waveform with its input/output labels. Built with React, strict TypeScript, Vite, SVG and GSAP.

## Run locally

Prerequisite: Node.js 22.12 or newer (Node 24 recommended), with npm.

Open a terminal in the extracted **BARCELON_LINECODING** project folder:

```sh
npm ci
npm run dev
```

Open the Local URL printed by Vite, normally **http://127.0.0.1:5173**. Keep that terminal running. On Windows PowerShell, use `npm.cmd` in place of `npm` if script execution policy blocks npm.ps1.

## Build and preview

```sh
npm run build
npm run preview
```

Open the printed preview URL, normally **http://127.0.0.1:4173**. `dist/` is the complete static website: HTML, JavaScript, CSS, locally bundled fonts and licenses. Upload its contents to any static web host. Relative asset paths support deployment under a subdirectory. No server API, account, database, secrets, or network connection is needed at runtime. Serve the build over HTTP; double-clicking index.html through file:// is not supported by browser module security.

A separate deployment-ready archive accompanies the source ZIP. The source ZIP contains an actual installable project, not a shortcut or just the generated build.

## Use the visualizer

1. Follow the visible **Set length → Enter bits → Read score** progression. Confirm a whole-number length from **1 to 128** before binary entry becomes available.
2. Enter exactly that many 0/1 digits. The count and inline validation explain missing, extra, or invalid characters. Press **Enter** in the binary field or choose **Generate waveforms**. Errors return keyboard focus to the relevant field.
3. The app moves directly to the score and focuses its heading. All eight complete reference waveforms and all table labels are available immediately. In normal motion, colored signals draw automatically on a shared, bit-synchronized GSAP timeline while source digits enter. Pause, seek, select a bit, or choose **Show all** at any time; no animation blocks interaction. **Replay / Play** repeats the drawing.
4. At confirmed length 12, **Load example** loads `111001011000`. Samples and randomization never bypass the length-first workflow.
5. The sticky **Score controls** toolbar stays available throughout the comparison. On short/zoomed viewports it scrolls normally so it cannot cover the graph. Use **Jump to scheme**, **Previous scheme**, and **Next scheme** to move between all eight encodings. **Edit input** returns focus to your draft.
6. Hover a waveform interval to preview it. Click/tap a source digit, graph interval, or table output to **pin** the selected bit across all eight schemes. The shared score scrolls to bring the selected interval into view. A pinned bit is not replaced by incidental hover.
7. Use **Previous bit / Next bit**, the bit-number field, or **Arrow keys / Home / End** within source digits, waveform intervals, and table headers to move. These groups use roving focus rather than putting every bit in the Tab order. **Escape** or **Clear** releases the pin.
8. Every scheme has a visible one-sentence explanation. **Explain encoding** expands a scheme's explanation and actual per-bit voltage readout. **Initial voltage** independently changes NRZ-I or Differential Manchester. Waveforms and tables update immediately, retain selection, and stay fully revealed without restarting playback.
9. **Play / Pause / Reset / Step / Show all** and the timeline slider are synchronized. Reset rewinds to zero; Step reveals one bit; seeking pauses at the chosen bit. At completion, Play is labeled **Replay**. Selecting a bit pauses playback and shows the complete score so its signal is available to inspect. Reduced-motion users always receive immediate results.
10. Long sequences use **one shared horizontal scroller**. Table columns stay aligned with graphs. Voltage labels, table row labels, and scheme headings stay visible horizontally.
11. Editing the binary draft keeps the current score until **Update waveforms**, with an explicit edited-state message. **Edit length** relocks binary entry while preserving both draft and score. Confirm the new length or use **Cancel length change**. No bits are silently truncated.
12. The header's Sun/Moon button switches **Day / Night Mode**. The choice is saved in localStorage; without a saved choice, the app follows the system preference. Startup theme resolution happens before the application JavaScript renders, preventing a wrong-theme flash. If storage is blocked, switching still works for the current page.

## Learning and readable controls

The opening introduces line coding in one sentence. **How to use this visualizer** expands four steps. **How to read the waveforms and tables** explains time, voltage, bit boundaries, midpoint transitions and aligned input/output labels. The glossary defines +V, 0V, -V, hi, lo, pos, neg, zero, nTp, pTn, inv, no inv and RZ.

Select a bit and open **Explain encoding**. Its explanation reads the actual computed intervals. NRZ-I and Differential Manchester describe the preceding level and the resulting start/midpoint transitions. AMI and Pseudoternary identify the preceding nonzero pulse, including across inactive bits. Changing the selected bit or initial voltage updates the explanation, graph and table together.

Body text is 16px; instructions and controls use 15–16px; waveform labels use 14–16px; per-bit table values use 14px. Secondary and decorative labels have a 12px floor. Graphs retain exact geometry and 64px minimum bit spacing, with a subtle contrasting plotting surface and stronger signal strokes.

See `READABILITY.md` for the audit, screenshot review and zoom-verification scope.

## Report Studio

Generate a score, then choose **Export Report** in Score controls. Report Studio uses the last generated sequence and the current NRZ-I / Differential Manchester initial conditions, including when the draft has since been edited. It does not use animated webpage frames or require you to enter the sequence again.

Choose PDF or editable Word (.docx), Compact / Detailed / Study layout, organization by bit range or encoding scheme, and all eight or a custom selection of schemes. Toggle explanations, per-bit tables, original bit-position rows and grayscale printing. Study adds per-bit reasoning from the actual calculation. **Report content** also offers a practice worksheet with empty grids and output cells, plus a separate calculated answer key. Worksheet continuation prompts omit computed answers.

The preview is explicitly **representative**, with the actual calculated page plan and navigable page boundaries. PDF text metrics and Word reflow can differ from the preview. On small screens the print page scrolls inside its own region. The report settings and preview support both app themes; exports use a high-contrast print palette independent of Day/Night.

PDFs use native vector lines and selectable text on A4 landscape pages. Word reports contain real editable headings, paragraphs and tables, SVG diagrams with high-resolution PNG fallbacks, explicit page breaks, headers and page-number fields. No Microsoft Office installation is required to generate a Word file. All generation happens locally in the browser; no sequence data is uploaded. Closing the studio during generation cancels delivery, and failed generation does not produce a partial download.

Readable bit capacity is calculated from available page width, layout spacing and the selected output-label widths at the print font size. Defaults are at most 19 / 16 / 14 bits per Compact / Detailed / Study segment. The complete stream is encoded first, then sliced on whole-bit boundaries, preserving state and absolute positions. See `REPORT_STUDIO.md` for architecture, verification, sample outputs and limitations.

## Encoding conventions

Voltages are normalized to +1, 0 and -1; they are not measured physical voltage values. Initial high / low means +V / -V for the stateful polar schemes. The small lead-in at the left of each stateful waveform is the state immediately before bit 1.

| Scheme                  | Rule                                                       | Output labels           |
| ----------------------- | ---------------------------------------------------------- | ----------------------- |
| Unipolar NRZ            | 1 = +V, 0 = 0V                                             | hi / lo                 |
| Polar NRZ-L             | 1 = -V, 0 = +V                                             | neg / pos               |
| Polar NRZ-I             | 1 inverts at bit start, 0 holds                            | pos / neg; inv / no inv |
| Polar RZ                | First half: 1 = +V, 0 = -V; second half: 0V                | pos / neg; RZ           |
| Manchester              | 1 = -V to +V, 0 = +V to -V at midpoint                     | nTp / pTn               |
| Differential Manchester | 0 inverts at start, 1 holds; every bit inverts at midpoint | nTp / pTn; inv / no inv |
| Bipolar AMI             | 0 = 0V; ones alternate +V, -V; first one positive          | pos / neg / zero        |
| Bipolar Pseudoternary   | 1 = 0V; zeros alternate +V, -V; first zero positive        | pos / neg / zero        |

## Verified example sequence

Length: **12**. Input: **111001011000**. Columns below correspond to bit positions 1 through 12. Initial level is high unless otherwise stated.

| Scheme / row                  | Per-bit output                                                    |
| ----------------------------- | ----------------------------------------------------------------- |
| Unipolar NRZ                  | hi hi hi lo lo hi lo hi hi lo lo lo                               |
| Polar NRZ-L                   | neg neg neg pos pos neg pos neg neg pos pos pos                   |
| NRZ-I high                    | neg pos neg neg neg pos pos neg pos pos pos pos                   |
| NRZ-I low                     | pos neg pos pos pos neg neg pos neg neg neg neg                   |
| NRZ-I start                   | inv inv inv no-inv no-inv inv no-inv inv inv no-inv no-inv no-inv |
| Polar RZ                      | pos pos pos neg neg pos neg pos pos neg neg neg                   |
| Polar RZ midpoint             | RZ RZ RZ RZ RZ RZ RZ RZ RZ RZ RZ RZ                               |
| Manchester                    | nTp nTp nTp pTn pTn nTp pTn nTp nTp pTn pTn pTn                   |
| Differential Manchester high  | pTn nTp pTn pTn pTn nTp nTp pTn nTp nTp nTp nTp                   |
| Differential Manchester low   | nTp pTn nTp nTp nTp pTn pTn nTp pTn pTn pTn pTn                   |
| Differential Manchester start | no-inv no-inv no-inv inv inv no-inv inv no-inv no-inv inv inv inv |
| Bipolar AMI                   | pos neg pos zero zero neg zero pos neg zero zero zero             |
| Bipolar Pseudoternary         | zero zero zero pos neg zero pos zero zero neg pos neg             |

`no-inv` above abbreviates the UI label **no inv** to make the sequence readable. The UI uses **no inv** consistently for a bit with no beginning-of-bit inversion.

Historical reference-document notes and discrepancy analysis are preserved separately in `INTERNAL_REFERENCES.md`.

## Architecture

```text
src/
  lib/
    types.ts           Discrete voltage, interval, bit and scheme contracts
    validation.ts      Length-first and exact binary validation
    schemes.ts         Scheme metadata and educational explanations
    encoding.ts        Pure encoders and labels derived from computed levels
    geometry.ts        Voltage coordinates and orthogonal SVG step paths
    encoding.test.ts   Algorithm, validation and interval tests
    explanations.ts    Plain-English summaries and computed per-bit explanations
    explanations.test.ts
  hooks/
    usePlayback.ts     Shared bit-clock, SVG reveal and synchronized labels
    useKineticMotion.ts Scoped editorial entrance and interaction choreography
    useReducedMotion.ts
    useTheme.ts        System-aware theme, persistence and cross-tab updates
  components/
    Configuration.tsx  Two-stage validated input
    Waveform.tsx       SVG axes, grids, clip reveal and interactive intervals
    OutputTable.tsx    Semantic aligned per-bit input/output/action tables
    SchemeRow.tsx      Scheme controls and expanded inspection
    AnimatedExplanation.tsx Interruptible disclosure height choreography
    Legend.tsx         Compact educational glossary
    LearningGuide.tsx  Progressive how-to and graph-reading explanations
    ScoreToolbar.tsx   Sticky scheme, playback and inspection navigation
    ThemeToggle.tsx    Accessible Sun/Moon theme control
  report/              Shared model, pagination, graphics, PDF, DOCX and studio UI
  App.tsx              Application state and composition
  styles.css           Original Kinetic Signal Score design
  ux.css               Semantic themes, interaction and responsive refinements
  readability.css      Reading hierarchy, plotting surfaces and affordances
  motion.css           Kinetic emphasis and complete reference paths
  main.tsx             Entry point
public/                Favicon and font licenses
tests/app.spec.ts      Original interaction and waveform regression tests
tests/ux.spec.ts       Theme, persistence, focus, navigation and contrast tests
tests/readability.spec.ts  Educational context, laptop sizes and zoom reflow
tests/motion.spec.ts   Actual frame-by-frame movement and interruption checks
```

Intervals use bit units: `[i, i+1]` for a full bit and two exact half intervals where applicable. Polarity and transition labels derive from the same computed intervals used for drawing. SVG paths contain only M, H and V commands. They never interpolate diagonally and never force an extra terminal return to zero.

All rows share one horizontal scroller, the same SVG left axis, bit width, and table column widths. ResizeObserver adapts bit width down to a legible 64 pixels, after which the shared score scrolls. GSAP advances clip masks and playheads on one logical bit clock. The active source digit, SVG bit label, output label and action cell share that clock; React updates the completed-bit counter at bit boundaries. Encoding data and path coordinates never morph. A new generation or initial-state change interrupts and replaces the old timeline. Unmounting reverts the GSAP context. New generations automatically draw the colored signal in normal motion; complete dashed reference geometry and readable tables remain available throughout. Initial-state updates stay complete and paused. Reduced motion skips all choreography and shows complete signals immediately. Timeline seeking pauses at an exact bit. Resizing repaints pixel coordinates without changing logical time or selection.

## Quality checks

```sh
npm run typecheck
npm test
npm run build
npm run test:browser -- --workers=2
npm run test:production -- --workers=2
```

Browser tests are configured for **headless installed Google Chrome**, with desktop and mobile-emulated Chromium projects. Install Chrome if missing, or run `npx playwright install chrome`. The mobile project tests a touch viewport; it does not claim testing on a physical iPhone or in Safari.

Tests include the verified example sequence; all zeros; all ones; alternating bits; single bits; both initial conditions; invalid lengths/characters/counts; normalized geometry; maximum-length input; length-first interaction; all output tables; independent initial controls; synchronized inspection; playback; reduced motion; responsive widths 320/390/768/1024/1440; shared scrolling/alignment; browser errors; Day/Night persistence and first paint; blocked storage; keyboard focus; pinned inspection; sticky navigation; and important text contrast. See `QA.md` for executed results and scope, and `MOTION_RESTORATION.md` for the regression investigation, measured motion evidence and recording location.

## Scope and limits

- Maximum 128 bits, minimum one bit. Very long scores scroll inside the comparison region.
- The inspection panel expands a scheme within the aligned score. It is not a separate fullscreen chart.
- Theme preference persists when browser storage is available. Refreshing resets the composition, not the saved theme. Report export uses the last generated score; online hosting is outside this local application.
- The entire generated waveform is mathematically available before animation. Playback illustrates encoding, rather than simulating voltage propagation or real hardware timing.
- Node/npm are needed to install and develop the source. The built site needs only a static HTTP server.

## Typography and dependencies

Manrope Variable and DM Mono are bundled locally via Fontsource. Their SIL Open Font License texts are included under `public/licenses/`. Application dependencies are React, React DOM, GSAP, jsPDF and docx; developer tooling is Vite, TypeScript, Vitest, Playwright, PDF/ZIP test inspectors and formatting tooling. Export libraries load only when their format is requested. No component framework is used.
