# Commercial readiness review — November 6, 2026

## Assessment

Ready for a release-candidate preparation pass, not yet cleared for sale. The current standalone game is small and self-contained, its main gameplay is well covered by headless checks, and the rebranding removed the identified franchise names and copied font from the active bundle. Remaining release gates are real-browser/device/audio QA, durable customer saves, an explicit release package and asset/title rights review.

This is a technical audit and U.S.-focused legal issue checklist, not an attorney's clearance opinion. Target countries, storefront, publisher identity and distribution format remain unspecified.

## Verified technical findings

- Current HTML: 3,451,154 bytes. SHA-256: `212d5bc952cbaf02de6e2f7097c862d53c6bebeaa924cca8704e6283bc0f81c8`.
- Rebuilding with `node tools/build-expanded-adventure.cjs` reproduced that HTML hash exactly. `index.html` and `stolen-voice.html` are byte-identical.
- All 66 `game/*.js` files and the single embedded game script parsed successfully.
- The release HTML has no external script, iframe, image or stylesheet dependency. Its external link is a canonical URL; share-preview URLs are metadata. A source scan found no runtime fetch/XHR/WebSocket/beacon call or analytics integration. This is a static source review, not a network capture.
- Save/restore validates game/schema versions, known boolean flags, progression prerequisites and puzzle state. Current saves use a single `localStorage` slot; no customer save export/import UI was found.
- The Pages workflow copies only the current game HTML and `share-card-v2.png`. It does not include backups, old font files, references or repository history. A customer download still needs its own allowlist-based package process.
- The maintained 63-suite run initially passed 62 suites; the remaining curtsy test searched for yellow hair pixels. It was corrected to track the uppermost opaque character row and passed. A clean rerun is recorded below when complete.
- The older non-maintained `check-gameplay-copy.cjs` walkthrough has a previously reproduced `Exit shed did not connect` failure in the unchanged pre-rebranding backup as well as this game. It should be migrated to the current workshop/puzzle flow or explicitly retired before becoming release evidence; maintained end-to-end room-flow/parser tests cover the current route.
- The older `check-inventory-art.cjs` fixture needed the current pool-riddle prerequisite, case-insensitive item-name matching and the current 280-pixel detail-panel width. It now passes all 13 item assets and four jar states. These were test maintenance changes, not relaxed gameplay validation.

## Release gates

| Priority | Gap | Concrete completion criterion |
| --- | --- | --- |
| High | Save durability for paid downloads | Add portable save export/import; test close/reopen, browser restart, update, file move, blocked storage, corrupted save and old-version migration in the selected distribution format. |
| High | Real browser and device QA | Complete an end-to-end playthrough in the supported desktop browsers; exercise phone portrait/landscape, touch keyboard, inventory scrolling/tapping, minigame input, audio gestures and focus/visibility transitions. Browser scripts currently cannot run here because Playwright is unavailable. The earlier local-file browser-tool restriction also remains a verification limit. |
| High | Asset and title clearance | Give the provenance records, current screenshots and proposed storefront copy to an IP attorney; resolve any identified concerns before selling. |
| Medium | Reproducible customer package | Choose browser download or desktop wrapper; define a release version, generate a minimal ZIP/installer with hashes, add player instructions/support information, and test that exact package on a clean machine. |
| Medium | Credits and customer terms | Identify the publisher/rightsholder, verify third-party obligations, and prepare appropriate credits, notices and customer-use terms. No LICENSE/COPYING/NOTICE file or commercial release manifest was found in this tree. Do not automatically apply an open-source license to the game. |
| Medium | Development/test reproducibility | Record supported Node/Python versions and pin optional preview/browser test dependencies in a development manifest. Current scripts use Playwright, sharp, Pillow or NumPy without a single installation manifest. None is a runtime requirement of the HTML game. |

MDN states that localStorage behavior for `file:` URLs is undefined and browser-dependent. A file rename/move or a switch to a different origin can therefore affect access to saves. This is a packaging risk, not evidence that current players' saves are already lost. [MDN localStorage documentation](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage).

## Fidelity improvements worth finishing

1. Freeze a consistent character model sheet for front/back/profile, title/prologue, swimming, wax reach, dance, curtsy, pickup, kick, barrel and ending interactions. Retain the chosen blue-and-white costume and auburn hair unless the user or legal review calls for a broader design change. Specifically review lower hair, sleeve/cuff colors, hand size and arm proportions; those were the recent visible inconsistencies.
2. Review all nine rooms at actual gameplay scale, with the actor and interactive overlays, including prop foreground/background priority and collision edges. `assets/reviews/commercial-art-overview.png` is a source-art overview of the opening and eight picture-backed rooms; it omits the live garden, actors and dynamic overlays, so it is not a completed gameplay visual review. The source overview looks broadly consistent in palette, line treatment and scene scale; remaining changes should target concrete defects rather than redraw accepted rooms wholesale.
3. Check every popup, inventory detail, title/ending caption and mobile control using the new mixed-case font. Verify lowercase descenders, punctuation, wrapping, pixel scaling and focus highlights at supported display sizes.
4. Listen through the full score and effects on speakers/headphones and phone audio. Check music transitions, mute/resume, sudden peaks, repeated notes and long-session fatigue; PCM/clipping checks alone do not establish a good listening experience.
5. Have a first-time player finish without developer hints. Observe puzzle clarity, accidental deaths, hive fairness, reach refusals and recovery after mistakes. Keep the original parser/EGA presentation; prioritize comprehension, input feedback and recovery.

## Provenance and legal review packet

| Material | Evidence reviewed | Status / remaining action |
| --- | --- | --- |
| Elara sprite and animations | Current `stolen-voice-short.html`, stable-face builder, traces, reference notes; original `assets/rosella-turnaround-reference-v1.md` inside the unchanged pre-rebranding archive | The archived generation prompt explicitly names Princess Rosella and describes the blonde/blue-and-white model. Current art descends from those generated references, with a rename and recoloring. That history is a reason for a substantial-similarity/character review; it does not itself establish infringement. Hair color alone is not a clearance method. |
| Rooms and opening | Editable native-grid projects, `assets/rooms/AGI-STYLE-REFERENCES.md`, saved generation prompts, current runtime picture data | Project notes describe original room compositions and an independently implemented renderer informed by old adventure-game screenshots. Those notes are not an independent code/art comparison or legal conclusion. Preserve the original reference inputs for review. |
| Current font | `assets/fonts/alder-pixel-glyphs.json`, font builder, current embedded bitmap/TTF | Current glyphs are authored in this project; the active copied font source/files are absent. The bitmap and TTF match the current source. Keep the original font source archive out of customer packages. |
| Former font / earlier releases | Original font README in `backups/pre-original-branding-2026-11-06.tar.gz` records ScummVM source and GPL-2.0-or-later notice | Have counsel review any prior distribution obligations separately. Removing files from the new bundle does not by itself determine obligations concerning older copies. Do not assume either that every ScummVM reference makes the game GPL or that deletion settles every issue. |
| Music and effects | `game/tandy-sound.js`, `game/prologue-score.js`, `tools/render-opening-jingle.cjs` and associated score JSON | Inspected cues are programmatically synthesized note sequences, with comments describing original compositions. No external recorded sample dependency was identified in these paths. Listening and source records still need review; comments are not a musical-similarity clearance. |
| Social artwork | `tools/build-share-card.py`, `assets/social/share-card-v2.png` | Current card is geometric artwork rendered from project code and the current font. The old generated card is not in the current deployment allowlist. |
| AI-assisted references | Saved prompts and reference images under `assets/` plus unchanged backups | Keep a dated inventory of source inputs, service/model used where known, applicable service terms, edits, contributors and rights/permissions. Some Markdown authoring notes were rebranded during cleanup; use unchanged backups and original `.txt` prompts for historical provenance rather than treating renamed notes as verbatim original generation logs. |

### Questions for the attorney

- Does the final heroine, room art, audiovisual presentation or marketing retain protectable expression from King's Quest or other works? Review the actual images and origin records, not just names or a hair color. The Copyright Office distinguishes ideas/methods from their particular expression, and does not provide a permissible percentage or number of changes. [Copyright protection FAQ](https://www.copyright.gov/help/faq/faq-protect.html), [permission and derivative-work FAQ](https://www.copyright.gov/help/faq/faq-fairuse.html).
- Is **Elara and the Stolen Voice**, its logo, and the publisher branding available for the planned goods/services and countries? No formal federal/state/common-law trademark clearance was completed here. USPTO recommends searching similar marks and related goods/services across multiple sources. [USPTO comprehensive clearance guidance](https://www.uspto.gov/trademarks/search/comprehensive-clearance-search-similar-trademarks).
- Which human contributions can be claimed in any copyright registration, and how should AI-generated material be excluded or disclosed? The Copyright Office's 2025 report distinguishes sufficiently human-authored expression/creative modification from purely AI-generated material; prompts alone are insufficient. Commercial contractual permissions and copyrightability/exclusivity are separate questions. [U.S. Copyright Office AI copyrightability report](https://www.copyright.gov/ai/Copyright-and-Artificial-Intelligence-Part-2-Copyrightability-Report.pdf).
- What notices or source obligations, if any, apply to earlier distributions of the old font and to any other third-party code/material actually incorporated? GPL permits commercial distribution but attaches conditions to distributing covered works; whether those conditions apply to this material needs a source-specific review. [GNU GPL v2 text](https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html).
- Do the selected storefront and target countries require particular disclosures (including AI content), refund/customer terms, privacy disclosures or ratings? Review those rules once the distribution channel is selected; no store submission or jurisdiction-wide compliance review was performed.

## Suggested order

First settle character/title rights and distribution format. Then implement durable saves and release metadata, finish targeted visual/audio/device QA, and build/test a minimal versioned release candidate. Preserve the existing backup and original provenance evidence. No paid release, publication or legal clearance was performed by this audit.

## Final verification result

Clean maintained rerun after the test fixes: **63/63 suites passed**, exit status 0. Logs: `/var/folders/nx/bnlq7qw53mbccgd2fh6sjltr0000gr/T/kq1-review-5qAZcc`. The separate inventory-art and fixed-face/contact-shadow checks passed as well. Whitespace verification passed. No gameplay runtime changes, deployment, commercial packaging or legal clearance were made during this review.

## Follow-up: reliable saves implemented

Portable save export/import, validation, previous quick-save recovery and a desktop/touch Save Files panel are now implemented. The latest automated playthrough earned 105/105 with portable-file and browser-restart checkpoints. The maintained suite now contains 64 checks and passes. See [SAVE-FILES.md](SAVE-FILES.md) for controls, compatibility, test artifacts and the remaining real-browser/OS file-picker verification limit. The earlier save-durability finding above describes the pre-implementation audit; device QA remains outstanding.
