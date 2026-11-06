# Release candidate identity

Prepared November 6, 2026 on branch `chore/v1-release-hardening`, based on synchronized main `eca36e5a83338b8dc8ac53f0954e7858be3499d6`. The PR head identifies the candidate commit; no v1.0.0 tag or official release exists.

## Reproduction

- Node v24.18.0; Vite 7.3.7; TypeScript 5.9.3; Playwright 1.64.1; Vitest 4.1.12.
- Run npm ci, npm run licenses:check, both npm audits, npm run typecheck, npm test, and npm run test:production -- --workers=2.
- Application source and production package versions are unchanged from the baseline. All 16 emitted JS/CSS/font asset names, sizes and SHA-256 hashes match the approved production build. The added 75,681-byte third-party notice file is served separately; it is not loaded into the application bundle.

## SHA-256 review inputs

| File | SHA-256 |
| --- | --- |
| package-lock.json | `b118f121647c46d96a3bb060b4c2ff4c07fb36cfc2ec53ac931705d3e6225623` |
| public/licenses/THIRD-PARTY-NOTICES.txt | `6e86c944c9f834ac42bf31e0a0119a65ac604da5f6c0489fa6707c56977ab7b3` |

Checksums identify these review inputs; they are not a tag signature or a release asset. Recompute them after dependency changes. Full logs and baseline/after asset hashes remain in ignored evidence/release-hardening. Public source licensing is intentionally restricted; see LICENSE_ASSESSMENT.md.

## Remaining approval gates

The owner selected no application license, so LICENSE remains absent. Owner review of the hardening PR/preview, merge approval, verification of the final merged commit, and explicit authorization to create/publish the tag/release remain required. No release archive or production configuration change is authorized by this candidate.
