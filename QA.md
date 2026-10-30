# Verification report

## GitHub publication preparation

Verified October 31, 2026 (Asia/Manila), before publishing the branches.

- Strict TypeScript validation: passed.
- Complete unit suite: 158 passed.
- Production build: passed.
- Complete production browser suite: 64 passed in 4.4 minutes with one worker, including real Report Studio PDF/Word downloads, worksheets, theme/focus/responsive checks and rendered motion.
- All preserved history and tracked source were scanned for credential patterns and accidentally tracked generated files: no findings. Fifteen local-environment/cache/credential ignore cases were verified.
- Application source, tests, entry point and dependency manifests are unchanged from approved Report Studio commit `2c7ff92` during repository preparation. Changes are limited to repository documentation, curated screenshots and ignore rules.
- README screenshot/document links were checked. The three screenshots show actual application UI with the fixed public example, without personal files or credentials.
- The official remote was verified empty before setup. Local baseline `b2cd578` remains on `main`; the Report Studio history remains on `feature/report-studio`. No history rewrite, force push, automatic merge, release tag or deployment is part of this setup.
- No application license was selected or added; existing bundled font licenses are preserved. The v1.0.0 review/merge and release gates are documented in `RELEASE_CHECKLIST.md`.

The sections below preserve prior implementation and document-verification history.

## Report Studio — latest revision

Verified October 31, 2026 (Asia/Manila).

| Executed check                             | Result                                                                                               |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| Production build and strict TypeScript     | PASS                                                                                                 |
| Complete unit suite                        | PASS — 158 tests (138 existing + 20 report tests)                                                    |
| Complete production Playwright suite       | PASS — 64 tests in 3.7 minutes, one worker                                                           |
| Post-review mobile Close-button refinement | PASS — rebuilt, then all 10 affected report/responsive tests passed                                  |
| Production dependency audit                | PASS — zero production vulnerabilities                                                               |
| Actual PDF / Word sample pagination        | PASS — 4/4, 7/7, 3/3, 1/1, 1/1 pages                                                                 |
| Actual Word editability                    | PASS — native Word opened all five samples with 25 editable tables and 25 inline diagrams in total   |
| Rendered Word table contents               | PASS — all 80 rows from the three main samples exactly matched editable source cells                 |
| Document visual review                     | PASS — all 32 exported/Word-rendered page images reviewed after correcting Word inline-image spacing |

The complete browser run retains every existing visualizer, motion, theme, readability, initial-state, selection, validation and responsive test. Eight new Report Studio checks (four scenarios on desktop/mobile) inspect actual downloaded PDF/DOCX bytes, settings, reset-playback independence, custom filtering, Study, maximum input, both themes, focus/close behavior, worksheet emptiness and answer keys. The final post-review CSS refinement reserves space for the mobile Close button and adds a text-overflow assertion; its 10 affected tests passed against the rebuilt final bundle.

A preceding two-worker run concurrent with document rendering had 63 passes and one existing seek-pulse sampling failure (only one rendered stroke value observed). The motion implementation and assertions were not changed. With document rendering finished, the complete serial run passed all 64. Its earlier trace is preserved at `evidence/reports/concurrent-render-motion-trace.zip`.

Model tests verify complete 1/12/32/65/128-bit coverage, no duplicate/omitted bits, whole-bit segmentation, both initial levels, exact inherited levels/labels, previous bipolar pulses across inactive gaps, orthogonal diagram geometry, selected schemes, page-height constraints and contextual reasoning. Export tests parse actual PDFs and OOXML ZIPs, verify A4 landscape page dimensions/counts, editable tables, original positions, SVG/PNG media, optional content and worksheet answer suppression.

Five actual browser-generated sample pairs were opened and rendered using hidden Microsoft Word 16 and bundled Poppler. The bundled LibreOffice renderer was unavailable on Windows; this is actual Word verification, not a claimed LibreOffice render. All Word page counts match the shared plan. Fixed image line spacing was removed after visual review caught clipped top digits; corrected files were regenerated, rendered and reviewed. Text-bound checks passed, as did exact extraction comparisons for the 80 main-example table rows. Worksheet/key each open as a one-page file with an editable table and a diagram; the worksheet has no plotted signal or filled output cells.

No encoder, existing waveform renderer, geometry function, educational explanation function, motion hook or original theme/style file was modified. The new module is separate, export libraries load on request, and the UI uses the last generated score/current independent initial levels. New report copy contains no assignment-related language. Prior source history and internal fixtures remain intact.

Local baseline commit: `b2cd578`; feature branch: `feature/report-studio`; no remote configured or push performed. Full architecture, library sources, print constraints, evidence locations and limitations are in `REPORT_STUDIO.md`. Existing development-tool advisories in the inherited Vitest/tinypool versions remain separate from the zero-vulnerability production audit.

The preview is explicitly representative. Word editing/version/font changes can reflow documents. Browser coverage is Chrome with mobile emulation; no physical Safari claim is made. Print PDF text is selectable, but no PDF/UA certification claim is made.

The sections below record preceding revisions.

## Product language refinement — latest revision

- Production build and strict TypeScript: passed.
- Unit suite: 138 passed.
- Relevant production browser suite: 14 passed.
- Additional Day/Night copy audit: eight viewport journeys (1440, 768, 390 and 320px), including accessible labels, metadata, example loading, eight expanded scheme explanations and guides. No academic-assignment references, clipping, page overflow or console errors in tested journeys.
- Captures of opening, example-help and conventions content were visually reviewed on desktop and narrow mobile.
- Source comparison: all styles, encoding, geometry, waveform rendering, motion hooks and computed educational explanations remain unchanged. React component edits are text only.
- Historical source notes and fixtures intentionally remain internal. See `PRODUCT_LANGUAGE.md` and `INTERNAL_REFERENCES.md` for exact scope and preserved provenance.

The checks below describe preceding revisions; this content pass reran the relevant 14 browser checks and unit suite, not the complete motion suite.

## Targeted length-field refinement

Verified October 30, 2026 (Asia/Manila), after the motion restoration below.

- Production build and strict TypeScript: PASS.
- Existing Vitest unit tests: 138 passed.
- Relevant production Playwright regression checks: 12 passed (length-first validation, editing/regeneration, keyboard focus, both-theme readability and responsive geometry).
- Focused browser audit: six journeys covering Day/Night at 1440px, 390px and 320px. Verified the bordered/contrasting field, persistent unit, hover, focus ring, invalid state, disabled confirmed state, rejection of 129, acceptance of 128 and 1, editing and generation. No page overflow or console errors.
- Day/Night desktop and narrow-mobile field captures were visually reviewed. Evidence: `evidence/length-control/`; audit script: `evidence/check-length-field.mjs`.
- Only the configuration markup and scoped length-control styles changed in application source. All other source files were compared with the preserved release and remain byte-for-byte unchanged, including encoders, waveform rendering, animations and application state management. Existing browser selectors were updated for the new visible label, “Number of bits”.
- The previous source/static ZIPs and changed-file originals remain in `submission/checkpoints/length-control-20261030-231250/`. Updated release archives were created after successful verification.

The 56-test full motion regression below records the preceding revision. This focused follow-up reran the 12 relevant browser tests and existing unit suite rather than claiming another complete motion run.

## Kinetic motion restoration — preceding full regression

Verified October 30, 2026 (Asia/Manila).

| Executed check                 | Result                                                                        |
| ------------------------------ | ----------------------------------------------------------------------------- |
| Strict TypeScript validation   | PASS — `tsc --noEmit` through production build                                |
| Vitest                         | PASS — 138 tests: 115 original and 23 contextual explanation tests            |
| Vite production build          | PASS                                                                          |
| Complete production Playwright | PASS — 56 tests in 2.6 minutes                                                |
| Actual motion tests            | PASS — 10 of the 56 checks, desktop and mobile emulation                      |
| Encoding source integrity      | PASS — five core files byte-for-byte unchanged from the pre-motion checkpoint |
| Production recording           | Captured — 901 rendered-frame samples, zero captured browser errors           |

The complete production suite serves the actual built `dist/` through `vite preview`. It retains all 46 previous functionality, educational UX, readability, theme and responsive checks, plus 10 new per-frame motion checks. Functional tests explicitly choose Show all when they need a stable complete result; motion tests verify automatic drawing independently without completing it first.

The suite covers the length-first workflow, eight schemes and aligned output tables, both initial conditions, selection, playback/seek, long sequences, theme persistence/first paint, blocked storage, keyboard focus, reduced motion/live preference changes, laptop layouts, mobile/tablet widths and zoom-equivalent reflow. Unit fixtures retain the instructor sample and encoding edge cases.

Motion instrumentation measured changing hero transforms, SVG dash offsets, source-glyph transforms, shared reveal-mask widths and synchronized active labels, selected-interval opacity, scheme transforms, seek stroke widths and disclosure heights. It also checks rapid regeneration, repeated explanation toggles, pause stability and complete static reduced-motion alternatives. All eight reference paths match their computed colored path geometry exactly.

Real production-browser video: `evidence/SIGNAL_SCORE_MOTION.webm`. Twelve frames are under `evidence/motion-frames/`. Entrance, generation, selected-bit, expanding/open explanation and Night playback captures were visually reviewed. The recording measured 61 distinct hero transforms, 97 illustration offsets, 150 generation reveal positions, 52 selection opacity values and 30 panel heights in their respective scenes. See `MOTION_RESTORATION.md` for the before/after investigation and measurement scope.

Existing Day/Night contrast, 16px body typography, 14px table text, plotting surfaces and touch/focus affordances remain intact. Tested important text meets 4.5:1 and signal strokes 3:1. No unexpected horizontal page overflow or console errors occurred in tested journeys. Layout tests include 320/390/768/1024/1440 widths, requested laptop sizes and 125%/200% zoom-equivalent reflow using viewport/DPR emulation, not browser-UI zoom shortcuts.

Safe source checkpoint: `submission/checkpoints/motion-20261030-221705/BARCELON_LINECODING_CHECKPOINT.zip`; prior release ZIPs remain alongside it. Updated source/static archives are prepared only after successful production verification. Evidence, dependencies, caches and checkpoints are excluded from the source ZIP. The separate C++ fallback is untouched.

Environment: Windows, Node 24.18.0, TypeScript 5.9.3, Vite 7.3.7, Vitest 3.2.7, Playwright 1.64.1, installed headless Chrome. Mobile coverage uses Chromium emulation. No physical-device/Safari, fixed-FPS performance or full accessibility-certification claim is made.
