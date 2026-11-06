# Release candidate dependency security

Assessed November 6, 2026, from baseline `eca36e5`. npm reports **three affected package entries**, not three independent vulnerabilities: Vitest inherits child severity. Four unique advisories are involved. Full audit before: 2 critical / 1 moderate entries; production-only audit before: zero.

## Findings and remediation

| Package before | Dependency scope | Advisory / CVE | Affected range | Fixed upstream | Resolution |
| --- | --- | --- | --- | --- | --- |
| tinypool 1.1.1 | Transitive dev: root → vitest → tinypool; worker creation | [GHSA-5gmw-xhrv-c9v3](https://github.com/advisories/GHSA-5gmw-xhrv-c9v3), CVE-2026-104848, critical | <=2.1.0 | 2.1.1 | Removed by Vitest 4's own worker implementation |
| tinypool 1.1.1 | Same chain; run options | [GHSA-85c8-ppgw-ccpr](https://github.com/advisories/GHSA-85c8-ppgw-ccpr), CVE-2026-104849, critical | <2.1.2 | 2.1.2 | Removed; no override of Vitest 3's incompatible ^1.1.1 constraint |
| @vitest/mocker 3.2.7 | Transitive dev: root → vitest → @vitest/mocker | [GHSA-82fw-gwwq-j7x9](https://github.com/advisories/GHSA-82fw-gwwq-j7x9), CVE-2026-84373, moderate | >=2.1.0 <4.1.11; also affected v5 prereleases | 4.1.11 | 4.1.12 via Vitest upgrade |
| @vitest/mocker 3.2.7 | Same chain; manual mock source generation | [GHSA-qxg6-89mg-rqv8](https://github.com/advisories/GHSA-qxg6-89mg-rqv8), CVE-2026-112949, moderate | >=2.1.0-beta.7 <4.1.12; also affected v5 before 5.0.3 | 4.1.12 / 5.0.3 | 4.1.12 via Vitest upgrade |
| vitest 3.2.7 | Direct dev dependency; npm aggregate critical entry | Inherits Tinypool/mocker findings above; also named in redirect advisory | npm aggregate 0.0.95–4.1.10; manual-mocker fix requires 4.1.12 | 4.1.12 for this complete set | Pinned direct dev dependency to 4.1.12 |

## Actual exposure

Unit tests run with `vitest run`, the default Node environment and project-owned fixtures. Vite config registers only React. It does not register standalone `mockerPlugin` / `interceptorPlugin`, Vitest browser mode, or a public Vitest API/UI server. The standalone mock registration routes required by the mocker advisories are not configured. Playwright runs separate Chrome tests, not Vitest browser mode. Dev/preview commands bind to 127.0.0.1.

Tinypool worker code was exercised during Node tests. Exploitation requires an upstream prototype-pollution primitive and attacker-controlled worker/options/module data. Review found no prototype pollution or user-supplied worker options in project tests/configuration. This is a scoped reachability assessment, not proof that an untrusted dependency or test could never supply those prerequisites. Developer/CI compromise is serious even when a library is absent from the static website.

These packages are not imported by application source or used as application runtime services. Static production has no Node test server. The findings affect the test/development toolchain, not served waveform calculations, export runtime, or the Vite preview handler under this configuration. Compromised tooling could still contaminate artifacts.

## Upgrade decision and compatibility

The registry's latest v3 is 3.2.7; no compatible v3 patch resolves this set. npm audit proposes v5, but [Vitest 4.1.12](https://github.com/vitest-dev/vitest/releases/tag/v4.1.12) is a smaller patched major supporting existing Vite 7.3.7 and installed Node 24. It removes Tinypool instead of overriding a v1 API constraint with v2. No production package version changed.

The [v4 migration guide](https://vitest.dev/guide/migration/) describes worker-pool and mocking changes. This project has six pure Node test files, standard assertions, no custom pool, snapshots, Vitest browser mode, coverage provider or mocking API usage. All 206 tests pass without edits. Compatibility risks were scheduling, assertion-library changes and Node support; full type/build/browser checks verify the candidate.

`npm install --save-dev --save-exact vitest@4.1.12` updated only the test dependency subtree. Subsequent `npm ci` reproduced the lockfile. No force fix, audit suppression, overrides or global npm configuration changes were used. Node support is ^22.12.0 or >=24.0.0; Node 23 is not claimed.

## Audit result and limits

After remediation, full and production-only npm audits report zero findings. `npm ls` confirms Vitest/mocker 4.1.12, Vite 7.3.7 and no Tinypool. This means no advisories known to the consulted npm database at assessment time, not a guarantee of vulnerability-free software. Reaudit the final merge/tag and future dependency changes.

This host's existing npm install-script policy blocked core-js's optional postinstall notice and esbuild's postinstall script. No bypass was added. The platform binary is checked by the production build. This host warning is separate from audit findings.

Before/after audits, installed trees and logs remain under ignored `evidence/release-hardening/`. QA.md records final checks. No original advisory is accepted as a release exception.
