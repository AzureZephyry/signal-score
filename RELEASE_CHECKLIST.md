# Release preparation

Target: a future v1.0.0 after the Report Studio pull request is reviewed and merged.

## This repository setup

- Preserve the stable baseline at `b2cd578` on `main`.
- Preserve Report Studio implementation `2c7ff92` on `feature/report-studio` and add repository documentation in a separate commit.
- Verify the official remote is empty or compatible before publishing. Never force-push.
- Re-run unit tests, TypeScript, production build and production browser checks.
- Check tracked files/history for generated content and credential patterns.
- Publish both branches and create an open feature-to-main pull request.
- Do not merge, tag, release or deploy automatically.

## Gates before v1.0.0

- [ ] User reviews and approves the Report Studio pull request.
- [ ] Merge the reviewed feature into main through GitHub, retaining history.
- [ ] Verify the merged main commit and rerun the release checks.
- [ ] Decide on an application license; none is selected by this setup.
- [ ] Review inherited development-tool advisories and choose a tested upgrade path. Production dependencies were clean in the previous audit; recheck before release.
- [ ] Confirm supported browsers and document-export limitations in release notes.
- [ ] Explicitly authorize creation/push of the v1.0.0 tag and release assets.
- [ ] Configure public hosting separately after approval.

## Verification commands

```sh
npm ci
npm run typecheck
npm test
npm run build
npm run test:production -- --workers=1
npm audit --omit=dev
```

Use installed Chrome for the configured browser projects. Avoid concurrent Word rendering during frame-sensitive motion checks. Existing evidence and limits are in `QA.md` and `REPORT_STUDIO.md`.
