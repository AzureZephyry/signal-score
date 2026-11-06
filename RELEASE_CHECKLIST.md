# v1.0.0 release checklist

Baseline verified from GitHub November 6, 2026: main `eca36e5a83338b8dc8ac53f0954e7858be3499d6`. Report Studio, mobile controls and ten graphs are merged. Production: https://signal-score-seven.vercel.app/.

## Candidate gates

- [x] Preserve history; branch chore/v1-release-hardening from synchronized main.
- [x] Identify three affected package entries and four advisories.
- [x] Upgrade Vitest to 4.1.12; remove Tinypool through normal resolution, without overrides/force fixes.
- [x] Clean-install full and production-only audits report zero known vulnerabilities.
- [x] Correct current documentation and label historical verification.
- [x] Record owner choice: no application license; keep root LICENSE absent.
- [x] Preserve/add third-party and font notices for static distribution.
- [x] Prepare draft notes without creating a release/tag.
- [x] Candidate checks complete: 206 unit / 96 browser tests, TypeScript, build, fresh exports, notice reproduction and unchanged runtime bundles; see QA.md.
- [ ] Owner reviews hardening PR and Vercel preview.
- [ ] Owner approves merge into main.
- [ ] After merge, repeat final audits, tests and production verification against the exact merge commit.
- [ ] Owner explicitly authorizes v1.0.0 tag, release notes and any release assets.

The selected policy allows a source-available release without an application reuse license. Do not describe the whole distribution as MIT/Apache licensed or wholly open source. Third-party grants remain separate.

## Reproducible verification

```sh
npm ci
npm run licenses:check
npm audit
npm audit --omit=dev
npm run typecheck
npm test
npm run test:production -- --workers=2
```

Use installed Google Chrome. Avoid concurrent Word rendering during motion sampling. Historical archives are not current release assets. If assets are later approved, package the exact approved commit with lockfile/notices; exclude caches, credentials, node_modules and unrelated files; publish SHA-256 checksums. Verify tag-to-commit identity and downloaded archive contents.

## Publication guardrails

No force push or history rewrite. No release/tag or production configuration changes on this branch. Preserve feature branches and the separate C++ project. PR review approval is not release publication authorization.
