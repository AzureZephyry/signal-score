# Third-party notices

Signal / Score has **no application license grant**. Third-party components retain their own terms; this file and bundled texts apply to those components only.

The reproducible [inventory and full installed license texts](public/licenses/THIRD-PARTY-NOTICES.txt) are copied into static builds at `licenses/THIRD-PARTY-NOTICES.txt`. The inventory conservatively includes installed non-development dependencies, optional helpers and type packages, even when Vite does not emit every module.

| Component group | Terms / required handling |
| --- | --- |
| React 19.3.1, React DOM 19.3.1, scheduler 0.28.0 | MIT; preserve supplied copyright and permission notices |
| docx 9.15.0, jsPDF 4.2.1 and most export helpers | MIT; preserve supplied notices, including embedded components |
| DOMPurify 3.4.17 | MPL-2.0 OR Apache-2.0; both supplied texts and attribution retained |
| Pako 2.2.0 | MIT AND Zlib; embedded Zlib attribution/text retained |
| GSAP 3.15.0 | Separate standard no-charge license; preserve header and [terms](https://gsap.com/standard-license); no application relicense of GSAP |
| Manrope Variable 5.3.0 and DM Mono 5.3.0 distributions | OFL-1.1; original [Manrope](public/licenses/Manrope-OFL.txt) and [DM Mono](public/licenses/DM-Mono-OFL.txt) texts retained |

The lockfile, inventory and original package texts identify exact transitive versions and holders. Fontsource distribution files are covered by their supplied notices. Build minification does not replace this distribution copy.

```sh
npm ci
npm run licenses:generate
npm run licenses:check
```

Regenerate and review notices whenever production dependencies change. The generator fails for missing installed license text or an install/lock version mismatch. It does not assume all packages are MIT. Development-only tools are installed with their own upstream texts and are not vendored in the website.

See [license assessment](docs/LICENSE_ASSESSMENT.md) for the owner's decision, asset review and restrictions. No application LICENSE file is added.
