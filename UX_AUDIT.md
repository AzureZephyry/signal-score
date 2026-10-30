# UX audit and implementation

The existing application was inspected and interacted with using headless Playwright **before source changes** at desktop 1440×1000, tablet 768×1024 and mobile 390×844. No interactive Computer Use was used. The journey covered opening, length confirmation, invalid and valid binary entry, generation, all eight schemes, output tables, both stateful controls, playback, bit selection, and returning to edit/regenerate.

## Findings and fixes

| Observed friction                                                                                   | Implemented response                                                                                                                                                             |
| --------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Generation left focus on the button and the score below the viewport (about 919px down on desktop). | Generate moves directly to the score and focuses its heading. Results are immediately complete.                                                                                  |
| Invalid input left focus on Generate; Edit Length left focus on the page body.                      | Errors focus the relevant field. Confirming length focuses binary entry; changing length focuses length entry; returning to edit restores binary focus.                          |
| Step progression and incomplete-input feedback were too quiet.                                      | Persistent Set length / Enter bits / Read score steps, live bit count, actionable inline feedback, and announced success/draft states. Enter generates from binary entry.        |
| Changing length discarded the working score.                                                        | Draft and score are retained while length is edited. Binary entry remains locked until confirmation; Cancel restores the previous length. No truncation or bypass of validation. |
| The last scheme left playback and edit controls thousands of pixels above the viewport.             | Sticky score controls, a labeled eight-scheme selector, previous/next scheme controls, and Edit input remain available throughout comparison.                                    |
| Automatic reveals and initial-state changes restarted playback.                                     | All results are immediately visible and paused. Playback is explicit. Initial-state changes update tables and graphs without an automatic replay.                                |
| Selecting bit 12 did not bring it into view on tablet/mobile.                                       | Clicking a bit pins it across all eight rows and scrolls the shared score to the selected interval. The revised audit confirmed visibility at 1440, 768, 390 and 320px.          |
| Incidental mouse movement replaced the selected bit.                                                | Hover is a temporary preview until the user pins a bit. Pinned selection persists until Clear/Escape or another deliberate selection.                                            |
| The sample journey exposed 229 keyboard stops.                                                      | Roving focus within digits, waveform intervals and table headers; arrows/Home/End reach every bit. The revised sample audit measured 48 stops.                                   |
| Later voltage/table labels scrolled away and some controls were too small.                          | Sticky horizontal voltage axes and row labels, exact shared geometry, larger technical labels and 44px primary touch targets.                                                    |
| No night theme or saved preference.                                                                 | Accessible Sun/Moon header control, semantic Day/Night palettes, localStorage persistence, system fallback and pre-paint startup resolution.                                     |

## Theme and accessibility decisions

Day Mode retains the Kinetic Signal Score palette. Night Mode uses charcoal (#242722), warm ivory (#F0EDE1), muted coral (#EE967E), and botanical olive (#BECD93). All UI and SVG colors flow through semantic CSS tokens. Theme state is resolved before React executes and works even if storage throws. Saved preferences take precedence over subsequent system changes; without a saved preference, live system changes are followed.

Focus rings, native control color-scheme, semantic tables, explicit input labels, screen-reader announcements, a skip link, and keyboard-operated waveform/table groups are retained or improved. Important primary/secondary/output text contrast is checked in both themes; this is targeted testing, not a claim of a complete accessibility certification.

## Verification evidence

`evidence/ux-audit-before.json` and `evidence/ux-audit-after.json` hold measured browser observations in the permanent development folder. Day/Night desktop and mobile screenshots are captured from the real application by the browser tests. QA reports the final executed checks. Evidence images, audit scripts, caches, dependency directories and earlier archives are excluded from the submission source ZIP.

## Preserved behavior

The eight pure encoders, voltage conventions, half-bit boundaries, initial-state options, instructor sample, aligned per-bit labels, long-input scrolling, educational glossary and inspection panels remain. The encoding source is checked against the preserved original submission archive. The ZIP backup is retained under `submission/backups/`; the updated ZIP is created only after production verification succeeds.

## Subsequent motion restoration

This document records the earlier refinement. The later motion revision retains its readability, themes, educational content, focus behavior and aligned geometry, while restoring automatic normal-motion drawing and coordinated editorial entrances. Complete reference paths and all table labels remain available during animation. See `MOTION_RESTORATION.md` and the current `QA.md` for the final behavior and executed verification.
