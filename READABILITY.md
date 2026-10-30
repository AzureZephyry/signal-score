# Readability, discoverability and educational UX refinement

This revision preserves Kinetic Signal Score, both themes, GSAP playback, the eight encoders, the length-first contract, initial controls, synchronized graph/table inspection and the earlier UX improvements.

## Problems corrected

- The actual laptop audit found 10–12px instructions and controls, 8–10px graph annotations, and 12px output values. The new hierarchy uses 16px body text; 15–16px instructions/actions; 14–16px graph labels; 14px tables; 13–14px secondary labels; and a 12px decorative/annotation floor. A final browser audit found no inspected opening-screen text below 12px in either theme.
- Text-only actions and tiny arrows did not make clickability obvious. Buttons now have distinct surfaces/borders and hover, pressed, disabled and focus states. Expandable explanations have a clear plus/minus treatment. Output cells have dotted underlines. Functional labels now say Generate waveforms, Update waveforms and Explain encoding.
- Graphs visually merged into the page. They now use a subtly distinct plotting surface, stronger 3px signal strokes, quieter gridlines and clearer selection. Bit spacing, voltage coordinates and orthogonal transitions are unchanged.
- Novice users had to infer what the diagrams meant. A short opening definition introduces line coding. Optional How to use and How to read guides explain the complete workflow, axes, voltage levels, bits, transitions and tables. Each encoding has a visible plain-English summary; the glossary remains available.
- Per-bit inspection previously listed voltage halves without explaining why. Expanded explanations now describe the actual selected bit. Stateful schemes name the preceding level and resulting transitions; bipolar schemes identify the preceding nonzero pulse and explain alternation across inactive bits.
- Larger type could cause a sticky toolbar to dominate a zoomed viewport. Below 650px viewport height it scrolls normally, and scheme navigation uses the appropriate offset. This leaves room to read the plot instead of obscuring it.

## Verification

- Strict TypeScript: passed.
- Unit tests: 138 passed, including all 115 original encoding/validation tests and 23 explanation tests.
- Production build: passed.
- Production Playwright: 46 passed across desktop and mobile emulation.
- Day and Night screenshots captured and visually inspected at 1366×768, 1440×900 and 1920×1080; opening and explanation-panel captures reviewed as well.
- Important text contrast checked at 4.5:1 or greater; signal/plot contrast at 3:1 or greater. Selected output text is also checked against its filled cell surface. This is targeted verification, not a claim of full accessibility certification.
- Theme persistence, startup theme, keyboard/focus behavior, reduced motion, input validation, initial conditions, synchronized selection, table alignment and 128-bit input checks remain passing.
- No horizontal page overflow or console errors in the tested journeys.
- 125% and 200% zoom-equivalent layouts checked through reduced CSS viewport dimensions and increased device pixel ratio, including input editing, regeneration and alignment. This emulates browser-zoom reflow; browser UI zoom shortcuts were not automated.

## Checkpoint and integrity

Before application changes, a full local source checkpoint was created at:

`submission/checkpoints/readability-20261030-213908/BARCELON_LINECODING_CHECKPOINT.zip`

The previous verified source/static release archives are also stored in that directory. The encoder, geometry, validation, scheme metadata and original algorithm-test files are byte-for-byte unchanged from the checkpoint. No C++ project was modified.

The updated submission ZIP is generated only after production tests pass. Evidence images, audit scripts, dependencies, caches and checkpoints are excluded from its source contents. Screenshots remain under `evidence/` in the development folder.

## Limits

Browser testing uses installed Chrome with mobile emulation, not physical-device Safari. Input remains limited to 128 bits. Long signals scroll inside the shared comparison region, preserving scientific geometry and readable bit spacing.

## Subsequent motion restoration

This document records the earlier refinement. The later motion revision retains its readability, themes, educational content, focus behavior and aligned geometry, while restoring automatic normal-motion drawing and coordinated editorial entrances. Complete reference paths and all table labels remain available during animation. See `MOTION_RESTORATION.md` and the current `QA.md` for the final behavior and executed verification.
