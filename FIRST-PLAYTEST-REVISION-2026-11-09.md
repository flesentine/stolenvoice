# First playtest revision — November 9, 2026

Implemented the agreed gameplay fixes and small QOL changes in the expanded game. Both standalone entry points are rebuilt from source. Bookmark/share URL saves remain deferred; nothing was deployed.

- Garden LOOK describes the rose before picking, in the satchel, and on Merrin's coat. The current source already mentioned the unpicked rose before this revision.
- Expanded the garden bush and fence collision footprints and orchard root footprints. Corrected the bush's foreground baseline. Movement and exits remain reachable around the visible obstacles.
- Picking an apple carries one optional inventory item without eating. Repeated collection is refused. Explicit eating consumes a carried apple anywhere, or picks and eats one near an orchard tree. A carried apple has an authored native icon and description, awards no points, and survives save/restore. Old saves default to no apple.
- Hive instructions use the requested wording. The resting hand is visible below the hive before a reach; idle rendering does not participate in reach collision. Ordinary orchard stings remain active after wax collection and preserve wax. The minigame's three-sting retreat still drops gathered flakes.
- Intro function keys suppress their browser defaults. F5/F7 are inactive until gameplay. The prologue follows elapsed time while unfocused and keeps its score running; focus return attempts to resume a browser-suspended audio context without adding another source.
- Alt+Up/Down controls master volume in 10% increments, including currently playing title and synthesized audio. F2 remains a separate mute toggle.
- Alt+Left/Right selects short (75%), normal (100%), or long (150%) intro caption duration. Music keeps its authored tempo and loops until the prologue ends. Gameplay dialogue remains instant and manually advanced.
- Volume and caption duration persist independently of quest saves. Adjustment notices are brief and nonblocking. F1 instructions include F3 and the new shortcuts. Desktop prompts omit optional click instructions while mouse behavior and touch guidance remain available.

## Verification

`node tools/check-current-game.cjs`: **66/66 suites passed**. Both generated entry points match, and `git diff --check` reports no whitespace errors.

`tools/check-first-playtest.cjs` exercises the generated game with deterministic time and an audio graph stand-in, including function-key capture, gain routing, mute/volume limits, background progression, source ownership, suspended-context recovery, caption rates, preference persistence, old-save migration, inventory descriptions, and cardinal/diagonal collision attempts.

The existing apple, bee-sting, hive, prologue, room-flow, and maintained full-game suites were updated for the intended behavior. The complete walkthrough verifies 105/105 points, all nine rooms, real puzzle inputs, and browser/portable save round trips. Room-flow coverage includes 50 entrance-to-exit routes.

Native software raster inspection is recorded in `assets/reviews/first-playtest-native-review.png`: garden bush, fence, orchard roots, hive help, idle hand, and carried-apple icon. This is a native-art render, not a browser screenshot.

Live browser interaction and listening remain unverified: the browser tool rejected local `file:` access, and this workspace has no installed Playwright package. Browsers may suspend background audio despite the game's recovery logic. Automated audio checks validate generated PCM and source/gain behavior, not perceived playback quality.
