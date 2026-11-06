# Application licensing assessment and decision

Reviewed November 6, 2026. The owner explicitly selected **no application license for now**, retaining control over reuse while keeping GitHub public. Keep root LICENSE absent. This document and the package version are not license grants or publication approval.

## Options considered

| Option | Reuse, modification, redistribution and commercial use | Attribution and patent terms | Portfolio implications |
| --- | --- | --- | --- |
| MIT | Broad permission, including proprietary/commercial derivatives | Retain copyright and permission notice; warranty disclaimer; no express patent grant in the text | Simple for educational tools if broad reuse is desired |
| Apache 2.0 | Broad permission, including commercial derivatives | Preserve license/notices, mark changes, carry applicable NOTICE; express contributor patent grant with patent-litigation termination | Useful for explicit patent handling; more compliance detail |
| No application license — selected | No general permission granted; statutory exceptions and platform terms may still apply | No new copyright/patent grant; third-party grants remain independent | Publicly reviewable portfolio, but not generally reusable open-source software; ask the owner for permission |

The initial recommendation was MIT for straightforward educational portfolio reuse. The owner's preference to reserve reuse rights controls the outcome. A later license choice must apply only to rights the owner can grant, with third-party exclusions. The portfolio can link the live site and describe the work without offering broad source reuse; publicity does not certify exclusive ownership of every asset.

Sources: [MIT text](https://spdx.org/licenses/MIT.html), [Apache 2.0 text](https://www.apache.org/licenses/LICENSE-2.0), [no-license implications and GitHub viewing/forking](https://choosealicense.com/no-permission/). These are practical summaries, not a jurisdiction-specific legal opinion.

## Third-party and asset review

- React, React DOM, scheduler, docx, jsPDF and most export helpers have MIT-style terms. Preserve actual installed texts and copyright holders, including bundled portions.
- DOMPurify declares MPL-2.0 OR Apache-2.0. Both supplied texts and its Cure53 attribution accompany the distribution. No source modifications were made.
- Pako declares MIT AND Zlib; both its top-level notice and embedded Zlib notice are preserved.
- Unchanged Manrope and DM Mono fonts retain SIL OFL 1.1. Preserve notices, respect Reserved Font Names for modified fonts, and do not relicense fonts or sell them separately.
- GSAP 3.15.0 uses its [standard no-charge license](https://gsap.com/community/standard-license/), not MIT. Its installed copyright/header and terms link are retained. Terms permit ordinary website/application integration but restrict competing visual animation builders and removal of proprietary notices. This encoding laboratory appears within ordinary permitted integration; that assessment does not grant rights to relicense GSAP or certify future uses.
- Sun/Moon icons, favicon and signal artwork are inline SVG/CSS in tracked source. No external icon pack, stock photo or purchased artwork is referenced. Screenshots depict this interface and fixed binary examples; rendered third-party typefaces do not create blanket asset reuse rights.
- Reference PDF/DOCX files and development archives are not redistributed in this candidate. Technical references/provenance remain documented; permission to relicense those external documents is not implied.
- Development dependencies retain upstream licenses in their npm packages. node_modules is not distributed with the repository/build. Reassess if vendoring tools or distributing a dependency cache later.

[Third-party inventory](../THIRD_PARTY_NOTICES.md) and [bundled texts](../public/licenses/THIRD-PARTY-NOTICES.txt) accompany static builds; original font texts remain in public/licenses. Adding those notices does not select an application license. A future application-license change, tag, release or release assets still needs explicit approval.
