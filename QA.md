# Verification report

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

| Executed check | Result |
| --- | --- |
| Strict TypeScript validation | PASS — `tsc --noEmit` through production build |
| Vitest | PASS — 138 tests: 115 original and 23 contextual explanation tests |
| Vite production build | PASS |
| Complete production Playwright | PASS — 56 tests in 2.6 minutes |
| Actual motion tests | PASS — 10 of the 56 checks, desktop and mobile emulation |
| Encoding source integrity | PASS — five core files byte-for-byte unchanged from the pre-motion checkpoint |
| Production recording | Captured — 901 rendered-frame samples, zero captured browser errors |

The complete production suite serves the actual built `dist/` through `vite preview`. It retains all 46 previous functionality, educational UX, readability, theme and responsive checks, plus 10 new per-frame motion checks. Functional tests explicitly choose Show all when they need a stable complete result; motion tests verify automatic drawing independently without completing it first.

The suite covers the length-first workflow, eight schemes and aligned output tables, both initial conditions, selection, playback/seek, long sequences, theme persistence/first paint, blocked storage, keyboard focus, reduced motion/live preference changes, laptop layouts, mobile/tablet widths and zoom-equivalent reflow. Unit fixtures retain the instructor sample and encoding edge cases.

Motion instrumentation measured changing hero transforms, SVG dash offsets, source-glyph transforms, shared reveal-mask widths and synchronized active labels, selected-interval opacity, scheme transforms, seek stroke widths and disclosure heights. It also checks rapid regeneration, repeated explanation toggles, pause stability and complete static reduced-motion alternatives. All eight reference paths match their computed colored path geometry exactly.

Real production-browser video: `evidence/SIGNAL_SCORE_MOTION.webm`. Twelve frames are under `evidence/motion-frames/`. Entrance, generation, selected-bit, expanding/open explanation and Night playback captures were visually reviewed. The recording measured 61 distinct hero transforms, 97 illustration offsets, 150 generation reveal positions, 52 selection opacity values and 30 panel heights in their respective scenes. See `MOTION_RESTORATION.md` for the before/after investigation and measurement scope.

Existing Day/Night contrast, 16px body typography, 14px table text, plotting surfaces and touch/focus affordances remain intact. Tested important text meets 4.5:1 and signal strokes 3:1. No unexpected horizontal page overflow or console errors occurred in tested journeys. Layout tests include 320/390/768/1024/1440 widths, requested laptop sizes and 125%/200% zoom-equivalent reflow using viewport/DPR emulation, not browser-UI zoom shortcuts.

Safe source checkpoint: `submission/checkpoints/motion-20261030-221705/BARCELON_LINECODING_CHECKPOINT.zip`; prior release ZIPs remain alongside it. Updated source/static archives are prepared only after successful production verification. Evidence, dependencies, caches and checkpoints are excluded from the source ZIP. The separate C++ fallback is untouched.

Environment: Windows, Node 24.18.0, TypeScript 5.9.3, Vite 7.3.7, Vitest 3.2.7, Playwright 1.64.1, installed headless Chrome. Mobile coverage uses Chromium emulation. No physical-device/Safari, fixed-FPS performance or full accessibility-certification claim is made.
