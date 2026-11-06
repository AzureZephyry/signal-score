# Signal / Score v1.0.0 — Initial Public Release

**Draft for approval. No tag or GitHub release has been published.**

## Overview

Signal / Score is an interactive digital signal laboratory for exploring how binary information becomes electrical waveforms. [Live website](https://signal-score-seven.vercel.app/).

## Key features and supported graphs

Ten synchronized graphs reuse eight pure encoding algorithms, in this order:

1. Unipolar NRZ
2. Polar NRZ-L
3. Polar NRZ-I — Initially High
4. Polar NRZ-I — Initially Low
5. Polar RZ
6. Manchester
7. Differential Manchester — Initially High
8. Differential Manchester — Initially Low
9. Bipolar AMI
10. Pseudoternary

Initial High/Low is the state immediately before bit 1; both variants appear together. Filled circles mean invert at the bit start; hollow circles mean no invert. Differential Manchester also changes voltage at every midpoint.

## Interactive visualization

Length-first validation accepts exactly 1–128 binary digits. SVG steps, axes, boundaries and aligned input/output tables share one calculation. Playback supports replay, pause, reset, step, seek and immediate completion. Shared bit inspection and contextual explanations connect digits, signals and labels. GSAP motion supports interruption and reduced motion. Day/Night themes remember a selection or initially follow the system.

## Report Studio

Browser-local vector PDF and editable Word exports support Compact, Detailed and Study layouts; graph/range organization; independent selection of ten variants; explanations; tables; original positions; contextual reasoning; and grayscale printing. The complete stream is encoded before adaptive whole-bit segmentation, preserving polarity, labels and inversion decisions across pages. Worksheets omit answers; separate answer keys restore them. Preview is representative with calculated page boundaries.

## Mobile support

Phone controls scroll naturally instead of pinning a large panel over waveforms. Scheme navigation, playback, Edit/Export and contextual inspection retain comfortable targets. Shared horizontal scrolling preserves bit/table alignment. The owner approved the mobile refinement on a physical Android device; release automation covers Chromium desktop/mobile and Android-oriented layouts.

## Testing and dependency security

The release candidate passes 206 unit tests, 96 browser tests, strict TypeScript and the production build. [QA.md](../QA.md) records the executed results and limits. Reference sequences `10100110` and `00110011`, single/constant/alternating sequences and 128-bit reports are covered. Tests inspect actual PDF/DOCX contents; representative documents are visually reviewed.

Hardening upgrades Vitest 3.2.7 to 4.1.12, updates mocker to 4.1.12 and removes Tinypool. Full and production-only audits reported zero known findings on November 6, 2026. This dated database result is not a guarantee of vulnerability-free software. The [security assessment](DEPENDENCY_SECURITY.md) includes advisory IDs, exposure and remediation.

## Installation and development

Use Node 22.12+ within Node 22, or Node 24+, with npm and installed Google Chrome for browser tests.

```sh
npm ci
npm run dev
npm run typecheck
npm test
npm run test:production -- --workers=2
npm audit
npm audit --omit=dev
npm run licenses:check
```

`npm run build` creates static `dist/`; `npm run preview` serves it locally. Serve over HTTP, not file://. Runtime needs no account, backend or AI service. See [README](../README.md) for architecture and screenshots.

## License status and known limitations

No application license is granted. The owner retains reuse control and root LICENSE remains absent. Public GitHub access is not a general reuse grant. Dependencies/fonts retain separate terms, including GSAP's standard license and font OFL notices. Include third-party notices and public/licenses with authorized redistributed builds.

Voltages are educational representations, not measured hardware signals. Preview is representative; Word may reflow with fonts, versions or edits. Automated Chromium does not certify physical Safari, every Android browser or complete accessibility compliance. PDF/UA certification is not claimed. The bit limit is 128.

## Publication gate

The owner must approve the hardening PR, merge, final merged verification and explicit v1.0.0 tag/release publication. The existing package version field does not mean a release exists. No release assets are attached by this preparation task.
