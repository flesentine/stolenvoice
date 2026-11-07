# Original branding changes — November 6, 2026

The active adventure is **Elara and the Stolen Voice**, set in **Alderwick**. Title screens, dialogue, ending lyrics, parser vocabulary, accessibility labels, metadata, documentation and active source/asset paths use the new names. The mountain anecdote is now an original description of winter paths and an old ranger. The former King's Quest prototype has been replaced at `index.html` with the current adventure; the builder maintains both entry points.

The copied font source, font binaries and bitmap table were removed from the active tree. **Alder Pixel** uses newly authored glyphs in `assets/fonts/alder-pixel-glyphs.json`, with a local bitmap/TrueType builder. Both formats are embedded in the offline game. Version 1.1 adds distinct lowercase letters, descenders, and heavier six-column letterforms within the eight-pixel cell. No downloaded replacement font is required.

Elara has auburn hair and a blue-and-white outfit, including swimming, dance, kick and barrel cels. Existing room art, puzzles, music and controls are retained. A new geometric pixel-art share card replaces the prior branded card. The Pages workflow publishes only the current HTML and new share image; it does not publish backups or authoring references. No deployment was performed in this pass.

Historical art references and development records are authoring material, not release assets. This pass removes identified franchise references and the copied font; it is not a comprehensive provenance or commercial-rights clearance of every asset. The new title has not been checked for trademark availability.

## Backup

`backups/pre-original-branding-2026-11-06.tar.gz` preserves the working tree before these edits, including pre-existing uncommitted changes. It excludes `.git` and the already-existing `backups/` directory, which remains in place. The archive is ignored by Git and is not included in deployments.

SHA-256: `b8e0f9844907f97d8db28d3846c34178d9ddfc784d77c4d386c94488426b9d2f`

Restore into a separate directory to inspect the old edition without overwriting current work:

```sh
mkdir /tmp/stolen-voice-before-rebrand
tar -xzf backups/pre-original-branding-2026-11-06.tar.gz -C /tmp/stolen-voice-before-rebrand
```

## Checks

`node tools/check-original-branding.cjs` checks both release entry points, runtime source text, embedded font bytes, printable glyph coverage, metadata, share image and deployment inputs. `node tools/check-current-game.cjs` runs the maintained gameplay suites. `node tools/preview-branding.cjs` renders the actual title painter for visual review. `python3 tools/build-share-card.py` regenerates the new share artwork. Browser preview was blocked by the browser tool's local-file URL policy; source rendering and headless game checks were used for this pass.

An additional older, non-maintained `check-gameplay-copy.cjs` check fails with `Exit shed did not connect` in both this working copy and the pre-change archived game. The same failure was reproduced from separately extracted baseline files; it predates this branding pass.

Final maintained regression run: **63/63 suites passed**. Additional short-edition acceptance checks (12), fixed-face/contact-shadow checks, opening-theme/cloud/prologue checks, branding audit and whitespace checks passed. The title painter and new social card were rendered and visually reviewed.

Font refinement: the prior Alder Pixel version and short-edition template are preserved in `backups/alder-font-before-lowercase-2026-11-06.tar.gz`.

Alder Pixel 1.1 validation: original-branding checks now verify all 26 lowercase glyphs differ from uppercase and g/j/p/q/y have descenders. Parser/inventory, mobile-controls, inventory-selection and opening-prologue checks passed. Mixed-case text and the actual title painter were rendered and visually reviewed. The separate mobile-keyboard and popup-backdrop browser scripts could not run because Playwright is not installed in this environment. The 63-suite run above records the preceding branding pass, not a fresh full run after the font refinement.

Appearance preference: restored the original blue-and-white outfit while retaining auburn hair, the new names, and the original mixed-case font.

Visual corrections: Merrin’s opening forearm now uses his blue sleeve with a short linen cuff. Elara’s auburn recolor now includes the lower hair through the shoulder rows in every direction; the fixed-face check guards against leftover yellow hair pixels.

Follow-up art polish: broadened Merrin’s opening forearm sleeve below the cuff into a fuller elbow. The wax close-up now uses the blue dress palette for both its hand cel’s sleeve rows and the continuation to the bottom edge, retaining the white linen cuff. Rendered sleeve colors and all thirteen connected reach poses were checked.
