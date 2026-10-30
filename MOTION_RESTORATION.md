# Motion restoration — SIGNAL / SCORE

Implemented October 30, 2026 (Asia/Manila). This revision preserves the current Kinetic Signal Score layout, typography, palette, themes, education and encoding conventions.

## Exact regression cause

The original pre-UX archive (`submission/backups/BARCELON_LINECODING-before-ux-20261030-170152.zip`) was compared with the current source before edits. The original had a longer staggered hero entrance, a GSAP signal-illustration tween, kinetic source digits and automatically playing waveform reveals. The UX revision deliberately changed the playback hook to `tl.progress(1).pause()` for every generation. It also removed the illustration tween and reduced source motion to a short 5px entrance. The readability revision inherited this behavior.

Before changes, an actual browser with reduced motion OFF measured only `0px` illustration offsets and a constant fully revealed generation fraction of 1. Explicit Replay still moved through 26 measured positions. GSAP itself and reduced-motion detection were working; the normal journey bypassed or omitted the choreography. React lifecycle failure was not the primary cause.

A full source checkpoint and copies of the prior source/static archives were preserved before modifications:
`submission/checkpoints/motion-20261030-221705/BARCELON_LINECODING_CHECKPOINT.zip`.

## Restored and improved motion

- Masked “Bits into rhythm.” tokens rise and rotate in a coordinated stagger; illustration digits settle in 3D, SVG signal paths draw, then captions and workflow annotations arrive. Inputs remain enabled throughout.
- New generations automatically draw all eight real orthogonal waveform paths on one linear bit clock. Source glyphs enter within stationary interactive buttons. Source digits, SVG bit labels, output labels and action cells follow the same current bit and fractional underline progress.
- Complete dashed reference paths and full-contrast labels remain available from the first result. Pause, seeking, pinning, Reset, Step and Show all remain interruptible. No encoding data is interpolated or morphed.
- Pinned inspection pulses the selected interval and aligned output. Scheme navigation and returning to input use short spatial transitions. Initial-state updates remain complete and paused, with a brief stroke emphasis on the affected scheme.
- Explanation panels expand and collapse with replaceable height tweens. Closing content is inert/hidden to assistive technology, rapid toggles cancel obsolete work, and open panels return to automatic height.
- Live reduced-motion changes stop choreography and immediately complete the score, preserving focus. Initial reduced motion produces an immediate, static alternative.

The restoration also corrected two implementation details found by frame tests: normalized SVG dash animation now uses fractional SVG attributes (avoiding CSS rounding), and entrance/reveal/disclosure clocks start after the first painted frame. GSAP contexts, timelines, cursor tweens and pending animation frames are cancelled or replaced on cleanup/interruption.

## Actual motion evidence

Recording: `evidence/SIGNAL_SCORE_MOTION.webm` (real headless Chrome production-browser video, approximately 3.5 MB).

Frame sequence: `evidence/motion-frames/` (12 PNG captures). Instrumentation: `evidence/motion-before.json` and `evidence/motion-after.json`. The repeatable capture script is `evidence/record-motion.mjs` (run against the built preview server; Playwright FFmpeg required for video).

The production recording measured 901 requestAnimationFrame samples and zero captured browser errors. Distinct measured states by scene:

| Scene | Frames | Hero transforms | Illustration offsets | Source transforms | Reveal widths | Selection opacity | Panel heights |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| entrance | 122 | 61 | 97 | 0 | 0 | 0 | 0 |
| input | 47 | 1 | 1 | 0 | 0 | 0 | 0 |
| generation | 161 | 1 | 1 | 26 | 150 | 0 | 0 |
| inspection | 62 | 1 | 1 | 1 | 1 | 52 | 0 |
| navigation | 72 | 1 | 1 | 1 | 1 | 1 | 0 |
| explanation | 120 | 1 | 1 | 1 | 1 | 1 | 30 |
| playback | 138 | 1 | 1 | 1 | 69 | 1 | 0 |
| night | 138 | 1 | 1 | 1 | 69 | 1 | 0 |
| reduced | 41 | 2 | 1 | 2 | 2 | 1 | 0 |

Distinct values are evidence of changing rendered properties, not a claim of fixed frame rate. The reduced scene includes discrete Reset/complete states, not a continuous animation. Dedicated tests sample static reduced-motion frames separately.

The captured entrance, generation, inspection, expanding/open explanation, and Night playback frames were visually reviewed. The headline/illustration enter coherently, drawing advances along the exact step geometry, highlighted cells follow the playhead, selected intervals align with their columns, and Night plots retain readable contrast. No broad redesign or reading-size reduction was introduced.

## Verification and scope

See the current `QA.md` for executed unit, strict TypeScript, build and complete production-browser results. The new `tests/motion.spec.ts` measures actual per-frame transforms, SVG offsets, clip widths, selection opacity, scheme movement, seek emphasis and disclosure heights. It checks shared reveal positions/labels, reference path identity, rapid regeneration/toggles, theme changes, reduced motion and live preference changes on desktop and mobile-emulated Chrome.

Five core files (encoding, geometry, validation, scheme metadata and the original encoding test file) were SHA-256 compared with the pre-motion checkpoint and are byte-for-byte unchanged. Existing Dev-C++ work is untouched.

Limits: browser coverage uses installed Chrome with mobile emulation, not physical-device Safari. The recording illustrates the 12-bit instructor sample; automated regression coverage also includes maximum-length input. Playback is a pedagogical bit clock, not physical propagation timing. The demonstration is not a fixed-FPS performance benchmark. Evidence media/scripts are kept outside the source submission ZIP; the installable project includes its motion tests and this report.
