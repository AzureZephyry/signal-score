# DESIGN — Kinetic Signal Score

## Identity

**SIGNAL / SCORE** treats a binary sequence as a score performed eight ways. The editorial heading, “Bits into rhythm.”, describes the transformation without standing between the user and the simulator. The introduction is compact; the length control follows immediately. Numeric folios, fine rules, and a shared time grid establish a printed scientific score rather than a dashboard.

The implemented composition uses flat surfaces, square controls, generous page gutters, and ruled sections. There are no floating cards, gradients, glows, glass effects or ornamental charts. The opening generative line drawing uses the same rectilinear language as the real signal geometry.

## Palette

| Token      | Hex     | Role                                                     |
| ---------- | ------- | -------------------------------------------------------- |
| Paper      | #EEECE3 | Warm neutral page surface                                |
| Ink        | #24271F | Main text, structural rules, transport controls          |
| Vermilion  | #BD3D27 | Primary action, selected output, alternating signal rows |
| Olive      | #575F37 | Secondary signal rows, information headings, status      |
| Muted      | #606356 | Secondary annotations and supporting text                |
| Line       | #C7C8B9 | Fine grid and separators                                 |
| Pale olive | #E2E4D4 | Shared selected interval and inspection surface          |

Red and olive alternate by scheme to separate adjacent signals without implying that one polarity is good or bad. Selection uses position, a shaded interval and a high-contrast output cell in addition to color. Positive and negative voltages are defined by the labeled vertical axis, never by color alone.

## Type

**Manrope Variable** carries the identity and interface. Tightly tracked, expressive display type shifts to readable 23–24px scheme headings. **DM Mono** carries source digits, bit indices, encoding outputs, rules and technical annotations. Both families are included locally, so typography does not depend on an external font service.

Desktop display: fluid 64–120px, weight 650, line-height .94. Section headings: 28–46px. Body and explanations: 16px. Instructions and interactive labels: 15–16px. Waveform digits: 16px; voltage labels: 14px; output tables: 14px. Secondary labels: 13–14px; decorative labels and time/initial annotations: 12px minimum. The dense comparison retains a minimum 64px bit width instead of shrinking labels to fit an arbitrarily long stream. Browser zoom remains available.

## Layout

- Fluid outer gutter: 4.2vw, bounded by 20px and 72px.
- Masthead: fine baseline rule and compact edition marker.
- Desktop hero: asymmetric two-column type/signal arrangement; mobile: a typographic composition with a quiet cropped signal motif.
- Input: one-third explanatory column, two-thirds length-first control surface. Mobile stacks the controls and makes Generate a full-width action.
- Comparison: one continuous ruled score, with a shared horizontal scroller and sticky scheme headings. Controls remain attached to their scheme when the plot scrolls.
- Every waveform uses a 56px axis margin and a 24px trailing margin. Tables use exactly the same margins and bit widths. All waveforms are vertically aligned at +V, 0V and -V.
- Expanded inspection remains inside the score with a single pale surface; it describes the currently selected interval.
- Legend: compact two-column definitions, with hierarchy preserved on small screens.

## Motion

GSAP drives coordinated, interruptible editorial choreography:

1. Masked title tokens rise and rotate into place with a deliberate stagger. Illustration digits settle in 3D while two SVG signal paths draw; captions and workflow labels join the same entrance.
2. Length confirmation reveals binary entry in a short upward movement.
3. Generated source glyphs rise and rotate within stationary, immediately usable buttons. Score headings and scheme folios enter in coordination.
4. All eight colored waveform clip masks advance automatically on the same linear bit clock. Complete contrasting dashed reference paths and all output labels remain visible. A moving playhead and active source, SVG digit, output and action cells connect each bit to its signal. The data and geometry never morph or interpolate.
5. Play, Pause, Reset, Step and Show all make drawing deterministic and interruptible. Pinning a bit completes and pauses the reveal, then pulses its interval and aligned output. Scheme navigation, input return and initial-state updates have short spatial/stroke emphasis. Explanation panels expand and collapse with interruptible height transitions; closed content is inert during exit.

Reduced motion suppresses entrance animation and reveals generated signals immediately. Hover and focus states remain direct; no decorative looping animation competes with the educational task.

## Accessibility and behavior

Visible labels, clear errors, live count feedback, semantic tables, independently labeled initial controls, keyboard-operable SVG bit intervals and visible focus rings support interaction. Invalid input stays visible with a useful correction message. The source sample is available only after confirming a 12-bit length. The score retains its prior source until the user explicitly updates it, with a visible stale-input notice.

Responsive layouts are verified at 320, 390, 768, 1024 and 1440 pixels. Overflow belongs to the single comparison region; the page itself should never require horizontal scrolling.

## Asset discipline

All signal artwork is native SVG. Fonts and the favicon ship locally. There are no stock photos, image-generation dependencies, tracking scripts, third-party runtime services, icon libraries or UI frameworks. Taste and Impeccable were not installed; this system was implemented directly from the chosen Kinetic Signal Score direction.

## Day / Night semantic system

The original warm paper, ink, vermilion and olive identity is retained. `src/ux.css` defines semantic surface, text, border, action, signal, selection, focus and error variables; the original editorial variable names alias these tokens so the existing layout and SVG rendering use the same theme.

| Role                         | Day     | Night   |
| ---------------------------- | ------- | ------- |
| Main surface                 | #EEECE3 | #242722 |
| Raised input/control surface | #F5F3EB | #2D322A |
| Primary text                 | #24271F | #F0EDE1 |
| Secondary text               | #606356 | #BEC2B2 |
| Primary signal / action      | #BD3D27 | #EE967E |
| Secondary signal             | #575F37 | #BECD93 |
| Rule / grid                  | #C7C8B9 | #505748 |
| Selection                    | #E2E4D4 | #394231 |
| Focus                        | #A53120 | #F5B49E |

Night Mode uses charcoal, warm ivory, muted coral and botanical olive. A short color transition applies only when toggling; reduced motion disables it. An early head script resolves saved/system preference before the React bundle loads. Minimal startup surface CSS prevents a white flash while that bundle is pending. Native inputs also receive the appropriate color-scheme.

## UX refinement

A persistent three-step progression makes the length-first contract visible. Validation returns focus to the field; Enter generates directly. Generation brings the score heading into view and the identity becomes a compact typographic line, reducing repeated scrolling while keeping the original opening composition.

The score's sticky toolbar combines scheme jumps, playback seeking, bit navigation and a return-to-input action. Pinned bit selection survives hover and initial-state changes, and selecting an offscreen bit scrolls the shared score to it. Voltage axes and table row labels remain visible horizontally. Primary touch controls use at least 44×44px targets.

Generated and recomputed signal information is readable immediately. Normal-motion generation automatically draws colored signals over complete reference paths; full-contrast table labels are available throughout. Replay repeats the choreography, and Show all completes it immediately. Pinning a bit completes and pauses the reveal so its voltage can be inspected. Reset, Step and seek use the same logical clock. Roving keyboard focus exposes every bit through arrows, Home and End without a long Tab sequence.

The detailed findings and before/after evidence are documented in `UX_AUDIT.md`. The encoding engine, conventions, discrete time geometry and mandatory tables remain unchanged.

## Readability and progressive education

`src/readability.css` refines the existing system rather than replacing it. The larger type hierarchy gives instructions, controls and scientific data appropriate reading sizes. Primary controls keep their ink/vermilion treatment; secondary actions have visible borders, surfaces, hover/pressed/disabled states and 3px focus outlines. Functional controls use Generate waveforms, Update waveforms and Explain encoding. Source bits are boxed; clickable output labels use dotted underlines.

Plot surfaces are #F8F6EE by day and #2D3329 by night. Three-pixel signal strokes sit above quieter grids; digits are 16px, voltage labels 14px and table values 14px. Axis positions, data intervals, table column widths and step geometry are unchanged. Time labels are shortened to avoid overlap on a single-bit graph.

The opening's short definition, optional how-to guide, optional graph-reading guide and visible scheme summaries provide progressive learning. Expanded explanations use the computed bit data and preceding state; they are a presentation layer independent of the encoding engine.

Laptop layouts were checked at 1366×768, 1440×900 and 1920×1080 in both themes. At short/zoomed viewports, the toolbar scrolls normally; navigation accounts for that state so it does not position a graph behind an oversized sticky region. Zoom-equivalent reflow was checked at 125% and 200%.

## Motion restoration

`src/hooks/useKineticMotion.ts` owns scoped entrance and interaction choreography; `usePlayback.ts` owns the shared bit clock, and `AnimatedExplanation.tsx` owns disclosure transitions. `src/motion.css` adds emphasis without reducing scientific label contrast or changing the readability scale. Entrance and reveal clocks begin after the first painted frame. SVG dash values use fractional attributes rather than rounded CSS values. Timelines, contexts and pending animation frames are cleaned up or replaced on interruption; live reduced-motion changes complete the result immediately. There are no continuous decorative loops. See `MOTION_RESTORATION.md` for the checkpoint comparison and real frame measurements.

## Explicit numerical length control

The “Number of bits” field uses a square, fully bordered raised surface, 12–18px padding and a prominent 32–36px value with a persistent “bits” unit. Semantic Day/Night tokens keep the container distinct from the page. Hover changes its border/surface; keyboard focus outlines the complete field; invalid input receives an error-colored border and inset edge. A confirmed length uses a dashed border and selection surface beside the explicit Edit length action. On narrow screens, the field and Set/Edit length button share a two-column row; the unit remains visible. Validation and the existing length-first state transitions are unchanged.

## Report Studio and print

The existing score gains an Export Report action and a native modal studio. The studio inherits semantic Day/Night surfaces, typography, controls and focus tokens. Its two-column settings/preview workspace becomes a vertically scrolling composition on mobile; the printed page scrolls independently to preserve diagram readability. Print is deliberately separate: A4 landscape, restrained warm plotting surfaces, ink/vermilion/olive, fine grids, standard editorial sans typography and monospace data. Layout and font metrics determine bit capacity; the data and complete-stream continuity remain unchanged. Representative previews state their limits. Worksheets reuse the same axes/ranges with empty grids and blank answer cells.
