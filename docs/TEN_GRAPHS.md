# Ten waveform graphs

Signal / Score displays ten graphs across eight encoding families, in this order:

1. Unipolar NRZ (`unipolar`)
2. Polar NRZ-L (`nrz-l`)
3. Polar NRZ-I — Initially High (`nrz-i`)
4. Polar NRZ-I — Initially Low (`nrz-i-low`)
5. Polar RZ (`rz`)
6. Manchester (`manchester`)
7. Differential Manchester — Initially High (`differential`)
8. Differential Manchester — Initially Low (`differential-low`)
9. Bipolar AMI (`ami`)
10. Pseudoternary (`pseudoternary`)

## Initial state and markers

Initial polarity is the voltage immediately before bit 1. It is not necessarily the output of bit 1. Both variants are visible together, so the old initial-state selectors have become fixed condition labels. Original High-variant section IDs remain valid; there was no saved initial-state or report-settings storage to migrate. Theme preferences remain unchanged.

A solid SVG circle means invert at the beginning of the bit. A hollow SVG circle means no invert. NRZ-I inverts on 1; Differential Manchester inverts at the beginning on 0 and always at its midpoint. Markers identify the beginning decision only. Their centers are at the absolute bit start and the resulting first voltage level. The incoming initial stub and condition label explain the first decision without introducing a data bit.

`lib/graphs.ts` defines the ten addressable results and delegates to the existing eight pure algorithms. `lib/inversion.ts` reads decisions from computed actions and intervals. UI and print geometry share those decisions. GSAP updates marker visibility from the same fractional bit position as the waveform reveal, including reset, replay, step and seek. The encoding engine remains independent of motion.

Report Studio selects graphs independently. It encodes the complete stream before slicing printable ranges. Segment entry state comes from the preceding complete-stream interval; absolute bit indexes, output labels and markers are retained. PDF uses vector circles; Word embeds SVG circles with a high-resolution PNG fallback and editable text/tables. Grayscale retains filled versus outlined circles. Worksheets omit both signal traces and answer circles; answer keys include them.

## Reference verification

Graphical source inspected locally: `10-1_G4-LineCoding.pdf`, pages 4–5, 8–9, 15–16 and 19–20. The source PDF is not redistributed in this repository.

For `10100110`:

| Variant | First level per bit | Second half (Differential only) |
| --- | --- | --- |
| NRZ-I High | - - + + + - + + | — |
| NRZ-I Low | + + - - - + - - | — |
| Differential High | + + - - - + - - | - - + + + - + + |
| Differential Low | - - + + + - + + | + + - - - + - - |

NRZ-I solid circles: 1, 3, 6, 7; hollow: 2, 4, 5, 8. Differential solid: 2, 4, 5, 8; hollow: 1, 3, 6, 7.

For `00110011`:

| Variant | First level per bit | Second half (Differential only) |
| --- | --- | --- |
| NRZ-I High | + + - + + + - + | — |
| NRZ-I Low | - - + - - - + - | — |
| Differential High | - - + - - - + - | + + - + + + - + |
| Differential Low | + + - + + + - + | - - + - - - + - |

NRZ-I solid circles: 3, 4, 7, 8; hollow: 1, 2, 5, 6. Differential solid: 1, 2, 5, 6; hollow: 3, 4, 7, 8.

The hand-drawn reference sometimes places a circle on the incoming side of an inversion (notably Differential Manchester page 8) and omits the first decision circle. This implementation consistently marks the resulting level at each exact beginning boundary, including bit 1, according to the explicit product convention. No mathematical encoding rule was changed to imitate annotation placement. The second sample's High Differential first halves are `- - + - - - + -`; both leading zero bits invert from the preceding END level.

## Verification scope

Tests cover stable graph IDs/order; reference, constant, alternating and single-bit fixtures; first-bit inversion/hold; both initial polarities; marker coordinates and decisions; playback visibility; ten-result navigation and synchronized inspection; ten report options; editable Word tables; actual vector PDF circle operators; worksheet answer exclusion; and complete 128-bit coverage/continuity across Compact, Detailed and Study report boundaries.

The approved phone toolbar rules in `mobile-controls.css` remain unchanged. Automated Chromium checks support desktop/mobile review; they do not replace physical-device acceptance. Report preview is representative; Word can reflow with fonts, versions or edits. No lint task is configured; strict TypeScript and formatting checks are used.

## Executed checks

- Strict TypeScript validation and production build passed.
- 206 unit tests passed across six test files.
- 96 browser tests passed against the production build, across desktop, mobile and Android-control projects.
- Formatting check passed for all changed code. No lint task is configured.
- Both 8-bit reference samples produced five-page PDFs. All pages were rendered and visually reviewed.
- Both DOCX samples opened in Microsoft Word: five pages, ten editable tables and ten graphics each. All Word-rendered pages were visually reviewed.
- At 390 × 844 in both themes, the toolbar remained static at 249px, with zero page-wide horizontal overflow. Physical-phone acceptance of this new feature remains a separate review.

## Release hardening

The v1 candidate changes no graph definitions, algorithms or marker rendering. Vitest is upgraded to 4.1.12 to resolve test-tool advisories; third-party notices and current documentation are added. The executed checks above describe the approved ten-graph baseline; QA.md records candidate verification. No application license is granted under the owner's explicit decision.
