# Mobile result controls

The comparison controls use normal document flow on screens up to 760px wide, and on coarse-pointer screens up to 1100px wide. Desktop positioning remains unchanged. This change is awaiting physical Android review.

## Cause and supporting evidence

`src/ux.css:281` made `.score-toolbar` sticky at `top: 0`, with an opaque background and `z-index: 20`. The toolbar sits outside the horizontal `.score-scroll` region; it sticks within the comparison section as the document scrolls. No fixed positioning or viewport-height sizing was responsible for this toolbar.

The previous non-print escape in `src/readability.css:1001` only removed stickiness below a **650px viewport height**. At 390 × 844, computed positioning was `sticky`; at 390 × 620, it was `static`. This height-dependent difference can explain why a shorter emulated viewport behaves differently. The exact layout/visual viewport values on the reported physical phone have not been measured; browser address-bar behavior is not reproduced by resizing a headless viewport.

The narrow-screen rules at `src/readability.css:788` stacked the selector, arrows/actions, transport and inspection. At 360px and below, playback used two rows. `src/report/report.css:394` placed Export Report on another full row. Disabled inspection controls also remained visible before selection. These combined into a 381–411px panel that could remain pinned over the results.

## Implemented behavior

- `src/mobile-controls.css` removes persistent toolbar positioning independently of viewport height. Phone landscape uses a two-column composition on coarse-pointer screens at least 600px wide.
- `ScoreToolbar.tsx` groups Previous / selector / Next, pairs Edit input with Export Report, and keeps four playback actions on one row with a separate seek row. Button text stays at 15px; visible controls retain at least 44 × 44 CSS pixel targets.
- An explicit Inspect bit action starts inspection. Number/previous/next/clear controls appear when a bit is inspected. The inspection row keeps a stable height, avoiding layout jumps when selection changes.
- `App.tsx` focuses the normal-flow controls after mobile generation, bringing the first waveform into the initial results viewport. Desktop still focuses the comparison heading. Mobile scheme navigation uses no toolbar offset and moves focus to the selected scheme heading without another scroll. Returning above the schemes preserves the most recently viewed scheme, so Previous/Next retain their context.
- `SchemeRow.tsx` provides a normal-flow Score controls return link after each mobile table. Return jumps are immediate and cancel native smooth scrolling, so a quick subsequent scheme choice cannot be pulled back toward the old anchor. Horizontal plot/table scrolling retains its existing shared container and bit geometry.
- Encoding, playback timelines, waveform geometry, initial-state logic and document generators are unchanged.

## Measured comparison

Measurements use installed Chrome with an Android-style touch context, reduced motion, `111001011000`, and both themes. Heights are CSS pixels, rounded to the nearest pixel. The first plot position is its top relative to the viewport immediately after generation and font readiness. Obstruction is the pinned control height while scrolling toward the first scheme. Normal-flow content is not counted as a pinned obstruction.

| Viewport                   | Toolbar before → after | Pinned obstruction before → after | First plot top before → after |
| -------------------------- | ---------------------: | --------------------------------: | ----------------------------: |
| 320 × 844                  |              411 → 249 |                           411 → 0 |                    1216 → 518 |
| 360 × 844                  |              411 → 249 |                           411 → 0 |                    1216 → 518 |
| 375 × 844                  |              381 → 249 |                           381 → 0 |                    1186 → 518 |
| 390 × 844                  |              381 → 249 |                           381 → 0 |                    1145 → 518 |
| 412 × 844                  |              381 → 249 |                           381 → 0 |                    1096 → 518 |
| 430 × 844                  |              381 → 249 |                           381 → 0 |                    1071 → 493 |
| 390 × 620                  |              381 → 249 |                             0 → 0 |                    1145 → 518 |
| 844 × 390, touch landscape |              190 → 158 |                             0 → 0 |                     677 → 344 |
| 960 × 430, touch landscape |              190 → 158 |                             0 → 0 |                     679 → 344 |
| 1440 × 1000                |              190 → 190 |                         190 → 190 |                     711 → 711 |

At 390 × 844 the panel drops from 45.2% to 29.5% of the viewport; at 320 × 844, from 48.7% to 29.5%. It scrolls away rather than continuing to occupy that space. Whole-page horizontal overflow was 0px in every measured configuration; long waveforms continue to scroll within the score region. Both themes produced matching geometry.

## Screenshots

Day: [before](screenshots/mobile-controls-before-day.png) · [after](screenshots/mobile-controls-after-day.png)

Night: [before](screenshots/mobile-controls-before-night.png) · [after](screenshots/mobile-controls-after-night.png)

These captures use the same 390 × 844 viewport with the toolbar aligned to its top. They illustrate composition, not physical-phone acceptance.

## Regression coverage and acceptance

`tests/mobile-controls.spec.ts` adds an Android-oriented Chrome project covering six portrait widths in both themes, 128-bit playback/inspection/alignment, initial conditions, editing, Report Studio, viewport-height changes, landscape and navigation through all eight schemes. Existing desktop, mobile, motion and document-export suites remain enabled. The short landscape test checks that any remaining normal-flow toolbar edge stays above the scheme and moves with scrolling; it does not mistake that edge for a sticky overlay.

Physical Android acceptance is still required through the feature preview: verify address-bar expansion/collapse, portrait/landscape scrolling, visible controls and plot space, selection, seeking and Report Studio in both themes. Emulation and resized viewport measurements cannot certify those behaviors on a physical device.

## Executed verification — 2026-11-01

- Strict TypeScript validation and production build passed.
- All 158 unit tests passed, including encoding, explanations, segmentation and document containers.
- All 82 production browser tests passed: 64 existing desktop/mobile regressions and 18 added Android-oriented cases. The complete run used one worker and no retries.
- Actual PDF/Word downloads, worksheet/answer-key exports, both themes, measured GSAP motion, alignment, keyboard interaction and the 128-bit workflow passed.
- Screenshots were reviewed at 320px and 390px, both themes, and desktop. All measured visible toolbar targets were at least 44 × 44 CSS pixels. Desktop toolbar height and initial plot position match the baseline.
- This is automated Chrome coverage, not certification on a physical Android device. Physical review remains the acceptance gate.
