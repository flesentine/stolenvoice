# Rosella and the Stolen Voice

Open [stolen-voice.html](stolen-voice.html) directly in a browser. No installation or server is required.

Current bell interaction: TAKE BELL in the garden, then RING BELL beside the pool or gallery mirror. Rosella carries the whole little silver bell; the belfry bell is rung separately with its rope. Earlier clapper instructions below describe superseded versions.

A nine-screen Sierra-style mystery: the enchanted castle mirror has stolen Merrin's voice. Recover its echo, give it a true silver note, and persuade the mirror to return it. Designed for a **15–25 minute first playthrough**, with exploration and linked inventory puzzles. That duration is a design target; a human playthrough has not yet been timed. The bridge stream is now a hazard: after a fall, Rosella has five seconds of active play to return to the bank she fell from. The current prevents swimming to the opposite bank, so repairing the bridge is necessary to cross. Drowning offers a bank retry, restore, or restart. Essential items are retained on retry.

The original adventure remains in `index.html`. The earlier two-room version is preserved in `stolen-voice-short.html`.

## Screen plan

| Screen | Connections | Main purpose |
| --- | --- | --- |
| Royal Garden | North through gate: courtyard; east: orchard | Merrin, rose, garden bell; return here for the ending |
| Castle Courtyard | South gate: garden; left timber door: shed; right stone arch: gallery | Exterior hub with visible, separate building entrances |
| Mirror Gallery | South doorway: courtyard; right stairs: belfry | Read the enchantment book; wake and confront the mirror |
| Potting Shed | South doorway: courtyard | Collect oil, twine, rusty shears and a sound plank |
| Old Orchard | West: garden; east through thorns: bridge | Gather beeswax and cut open the path |
| Broken Bridge | West: orchard; northwest: mill; northeast across stream: grotto | Fit and lash a plank to make the crossing safe |
| Old Watermill | Upper-left arch: bridge, beside mill door | Free the wheel, release the cabinet catch and obtain a jar |
| Echo Grotto | Left passage: bridge | Wake the pool, name Merrin's echo and capture it |
| Castle Belfry | Left stair: gallery | Mend the bell rope and give the captured echo its true note |

The route now separates outdoor travel from entering buildings: garden → courtyard → shed or gallery; garden → orchard → stream, with the mill door on the near bank and grotto across the repaired bridge. Returning from an interior places Rosella beside the same exterior doorway, facing away from it. The belfry remains upstairs from the gallery.

Walkable ground, solid props, exit triggers and landing positions are authored in `assets/stolen-voice-map.json`. Rosella must walk close enough to interact with scenery. Typed GO commands also require proximity to an exit. Water, walls and the unrepaired bridge block movement. Essential supplies remain usable wherever another puzzle needs them.

## Controls and presentation

- Arrow keys: start walking; press the same direction again to stop. Home, Page Up, End and Page Down give diagonal movement. The numeric keypad also moves Rosella; keypad 5 stops her.
- Start typing immediately; Enter submits the command.
- Enter, Space, Escape, or a tap: dismiss a message.
- Tab: inventory popup.
- Escape: keyboard menus. Left/right switches menus; up/down selects an entry; Enter chooses it.
- F1: instructions. F2: toggle sound. F3: recall the previous command.
- F5 / SAVE: save. F7 / RESTORE: restore.
- HELP: a clue for the current puzzle stage.

The interface is one 320×200 bitmap screen displayed at 4:3, with a double-width 160×168 picture, a top status strip and a command prompt below. All eight traced room backgrounds use detailed contour traces at 160×168, using only the standard 16-color EGA palette. Text uses the original Sierra 8×8 bitmap font. Messages use DOS/EGA AGI text-grid placement, 30-column wrapping and white windows with a red frame (two display pixels vertically, one horizontally); long messages advance through separate windows. the opening is four short pages without scrolling. The existing Rosella walking cels retain their current frame when movement stops.

The new 7.28-second original Tandy-style three-voice fanfare plays once when Enter or a tap begins the opening. F2 toggles sound, including during messages. The tune stops when the window loses focus.

## Saves

The expanded game uses `stolen-voice-agi-save-v2`, independently of the original adventure and the short edition. Inventory and score are rebuilt from saved story flags. If browser storage is unavailable, saves last for the current visit.

RESTORE can import useful early progress from the short edition's `stolen-voice-agi-save-v1` slot when no expanded save exists. The old slot is preserved. The rose, clapper and awakened mirror can carry over; the expanded ritual must still be completed, and the gallery book should be read again.

<details>
<summary>Complete walkthrough — spoilers</summary>

Walk close to the relevant object before entering each scenery command.

1. In the garden, LOOK MAN and TALK GARDENER. TAKE FLOWER, then USE ROSE ON BELL to retrieve the silver clapper.
2. Cross the garden drawbridge into the courtyard. Enter the stone gallery arch on the right. READ BOOK and USE CLAPPER ON MIRROR. Speaking Merrin's name now explains what is still missing.
3. Leave the gallery south into the courtyard, then enter the timber shed door on the left. In the shed, TAKE OIL, TAKE TWINE, TAKE SHEARS and TAKE PLANK. OIL SHEARS.
4. Leave the shed, cross the courtyard south to the garden, then follow the east path to the orchard. TAKE WAX from the abandoned hive. USE SHEARS ON THORNS to open the eastern path.
5. At the broken bridge, USE PLANK ON BRIDGE, then optionally USE TWINE ON BRIDGE to reinforce it and earn the remaining repair points. The plank alone makes the crossing safe.
6. Enter the watermill through its visible doorway northwest of the bridge. OIL WHEEL, TURN WHEEL, then TAKE JAR from the opened cabinet.
7. Cross to the grotto. USE CLAPPER ON POOL, then SAY MERRIN beside the water. USE JAR ON POOL to catch the named echo.
8. USE WAX ON JAR to seal it.
9. Return through the gallery and climb to the belfry. USE TWINE ON ROPE. With the sealed echo in your inventory, USE CLAPPER ON BELL.
10. Return to the gallery. USE JAR ON MIRROR, then SAY MERRIN to restore the voice.
11. Leave the gallery through the courtyard and garden gate, then TALK MAN for the ending and **100/100**.

Ordinary aliases such as man/gardener, flower/rose, and silver clapper/clapper are supported. Actions award points once. HELP gives a clue based on current progress.

</details>

## Artwork and build

The original garden, characters, font and animation are preserved. All eight other room pictures now have complete authored line-and-fill drawings at 160×168. Generated images are retained as composition references; the picture builder no longer reads or samples their pixels. Walls, terrain, foliage, architecture and scenery are drawn explicitly, with selected details instead of transferred texture. The gallery's mirror effects and furniture depth remain live game layers.

These are AGI-style browser pictures, not compiled Sierra PIC resources. Each of the eight room pictures has an editable workshop project in `assets/rooms/*-workshop-v1.json` and a drawing-command export in `assets/rooms/traces/`. All render through the same locked-grid engine used by the editor. See `assets/rooms/AGI-STYLE-REFERENCES.md` for the original-screen and renderer references that guided the drawing style.

- `assets/rooms/IMAGEGEN-PROMPTS.md`: actual generation prompts and provenance.
- `assets/rooms/*-reference-v2.png`: current AGI-constrained generated source artwork.
- `assets/rooms/active-reference-map.json`: selected source image for each room.
- `assets/rooms/agi-redraw-generation-v2.json`: exact prompts and generation provenance.
- `assets/rooms/GALLERY-PROMPT.md`: mirror gallery reference and prompt.
- `game/gallery-room.js`: live mirror effects and furniture depth overlays for the improved gallery.
- `assets/rooms/*-reference-v1.png`: preserved earlier generated artwork.
- `assets/rooms/before-agi-redraw-v2/`: preserved native backgrounds from before this generation pass.
- `assets/rooms/*-agi-v1.png`: current traced 160×168 EGA pictures.
- `assets/rooms/traces/*.json`: editable outlines, filled polygons and palette for each room.
- `assets/rooms/agi-room-preview.png`: contact sheet of the native pictures.
- `tools/draw-room-workshops.cjs`: creates the seven upgraded editable room projects, preserving existing projects by default; `--room courtyard --force` regenerates only the courtyard.
- `tools/draw-belfry-scene.cjs`: belfry masonry, recessed windows, red roof, bell mounting, lantern and guild plaque.
- `tools/draw-potting-scene.cjs`: shed drawing built around Rosella's 40-pixel height, with a waist-high bench and ordinary-sized tools.
- `tools/draw-courtyard-scene.cjs`: the courtyard's colorful lawn, ivy, red-tile buildings and warm paving, with original entry positions.
- `tools/agi-room-scenes.cjs`: underlying hand-authored compositions for those seven rooms.
- `assets/rooms/gallery-workshop-v1.json`: canonical editable gallery drawing.
- `editor/agi-picture.js`: shared locked-grid renderer for the gallery editor and game assets.
- `tools/agi-gallery-scene.cjs`: preserved earlier gallery drawing, superseded by the workshop project.
- `tools/agi-room-overdraw.cjs`: dispatches those native-grid drawings.
- `tools/trace-room-art.cjs`: renders authored lines and filled polygons, writing PNGs, drawing commands and embedded room data. Requires sharp.
- `tools/convert-room-art.cjs`: compatibility entry point for the tracing tool.
- `game/expanded-story.js`, `game/expanded-world.js`, `game/expanded-parser.js`: story, movement and command sources.
- `tools/build-expanded-adventure.cjs`: assembles the standalone HTML from the preserved short edition and expansion sources.

## AGI picture editor

Open `editor/index.html` for the locked 160×168, 16-color drawing workspace. Its Room selector opens all eight workshop projects, each with independent autosave. It has line, connected-outline, filled-shape, flood-fill and small-brush tools; a toggleable reference; undo/redo; editable command order; drawing playback; and native PNG / JSON export.

The gallery is now drawn from `assets/rooms/gallery-workshop-v1.json`, a new 190-command redraw of the refined gallery reference. Its canonical pixels come from `editor/agi-picture.js`, shared by the editor and game build. Mirror effects, furniture depth, collision areas and interaction positions are fitted to the new composition. See `editor/README.md` for the editing and import workflow.

## Acceptance checks

Run `node tools/check-expanded-adventure.cjs`. The original ten headless checks exercise the actual embedded script with a DOM/canvas stand-in: the complete physical puzzle route to 100/100, backtracking, aliases and reach, blocked ground, independent saves and intermediate checkpoints, short-save migration, modal input, picture dimensions/palette indices, and valid room landing positions.

Run `node tools/check-stolen-voice.cjs` for the preserved short edition's twelve checks. The existing expanded acceptance script predates the ninth-room courtyard route and has not been rerun for this navigation revision. These checks do not constitute a live browser visual review or a timed human playthrough.

Scenery can be examined with LOOK AT, EXAMINE, INSPECT or X. Try LOOK OUT OF THE WINDOW in the shed or belfry, LOOK UP for the roof, LOOK DOWN for the floor, and LOOK AT BANNERS, POTS, APPLES, IVY or STALAGMITES where visible. Views and scenery descriptions are room-specific; looking never consumes items or awards points.

Narrative style: ordinary LOOK, dialogue, failure messages and success messages describe observable conditions and consequences. They do not identify the next tool, give item locations, or prescribe the next puzzle action. Missing-item responses may name an item the player explicitly tried to use. Physical clues include stiff pivots, slipping boards and leaking whispers. The spellbook presents the necessary magical rules as an in-world verse. HELP/HINT remains the deliberate route to explicit puzzle guidance; F1 explains controls. A complete current-route parser/movement walkthrough is checked by tools/check-gameplay-copy.cjs.

Swimming: arrow keys paddle in the same way they control walking; SWIM LEFT, SWIM RIGHT and SWIM TO SHORE also work. Popups, menus and a hidden/unfocused window pause the five-second timer. Saving while in the current is blocked; restoring clears the swimming state. ENTER retries a drowning from the last dry position without resetting quest progress, F7 restores, and R restarts. The placed plank is safe to cross; twine adds reinforcement and points. The sixteen editable cels in assets/swimming reuse the exact existing walking head pixels, with animated ripples. Use the editor Project list to inspect them.

Object priority pass: 41 visible props across the gallery, shed, orchard, bridge, grotto and courtyard now use authored foreground masks and ground footprints. Covered or invisible objects do not introduce hidden blockers. Bridge rocks block walking and swimming at their bases, with matching foreground occlusion when Rosella is behind them. Existing hive priority remains in place. Tools on the bench remain live pickups within the bench depth group. Check with tools/check-object-priorities.cjs and the full gameplay walkthrough.

Inventory selection: Tab opens a monochrome text list with a black-on-white highlight. Arrow keys select an item; Enter shows its picture. Enter or Escape returns to the list, keeping the selection. Escape returns to the game. Item pictures are no longer displayed together when inventory opens.


## Resumed opening and mill pass - 2026-10-24

- The opening uses a new hand-authored 160x168 EGA picture based on the selected grid reference, Sierra bitmap title, moving pennants and moat glints. The AGI editor includes the opening project.
- Original three-voice PCM effects accompany the wheel catch, bells, mirror, pool, bridge plank, rope repair and returning voice. F2 mutes music and effects; losing focus stops playback.
- The outside wheel has a rounder six-spoke drawing; both wheels remain still until the inside mechanism is turned. The cabinet has grounded feet, a framed door and a short hinged opening animation. The mill exit reaches the floor, the small slatted blue panel is gone, and structural braces connect posts to beams.
- The far-bank cave sits in a rock hillside; light grass separates the darker trees. Bridge posts have exact foreground masks and solid bases. Placing the plank permits crossing immediately; lashing still earns its five points.
- The gallery table blocks its solid base and has a walkable rear strip. Trying to leave the castle grounds south gives an in-world explanation.
- Verification: the physical headless parser walkthrough reaches 100/100; swimming, wheel, priority, inventory, candle and resumed-feature checks pass. The new cue synthesis was exercised with an AudioContext stand-in and checked for audible PCM/nonclipping amplitudes. Source-art proof sheets were inspected. Live browser playback and speaker listening were not performed.

Gallery book: OPEN BOOK animates the cover through six native EGA cels; READ BOOK requires the cover to be fully open. CLOSE BOOK reverses the animation. LOOK BOOK reports its current state. The book shares the table's priority layer using transparent cels, so the wall behind it does not erase Rosella. The open state is saved; older saves without this flag still restore. Opening/closing awards no points. Check with tools/check-book-animation.cjs.

## Parser acceptance and story consistency pass — 2026-10-24

Ordinary expressions now route through the existing guarded puzzle actions: retrieve the clapper with a rose/stem, cut/prune blackthorn, lubricate shears, tie a plank to the bridge, catch/capture/bottle an echo, fill or hold a jar above the pool, and GIVE/OFFER/HAND/SHOW an item to someone or the mirror. These preserve inventory, location, reach, ritual prerequisites and one-time scoring.

HELLO/ASK MERRIN, SEARCH HIVE, SMELL ROSE, EAT APPLE, OPEN SHEARS/DRAWER/CABINET, PULL LATCH, SHAKE/REACH INTO BELL, TOUCH MIRROR, JUMP GAP and TAKE ALL have deliberate responses. GET OUT and HEAD FOR SHORE work during swimming. The shallow drawer is empty; opening it does not introduce another collectible or puzzle.

The exterior waterwheel is recognized in the bridge scene. Potting soil, roots, absent bees and the old honey smell are acknowledged. The unlocked cabinet's visible bottle resolves to its jar for LOOK/TAKE, rather than the already carried oil flask. Plank-placement text agrees with its immediate ability to bear Rosella's weight.

LOOK/LISTEN and inventory distinguish an empty jar, named echo, sealed echo, true voice and the empty jar left after release. Old saves recompute the correct jar contents from existing progress flags. Pool ambience responds to its current magic state. Ringing the high bell again after release leaves the empty jar silent. The book's verse and marginal note occupy separate complete popups.

Validation: `tools/check-parser-acceptance.cjs` exercises successful aliases, physical refusals, missing-item and premature-ritual cases, one-time points, restored state and popup paging. `tools/replay-novice-audit.cjs` replays the original 178-action diagnostic transcript, reaches 100/100, and verifies that its 30 former generic parser rejections are now recognized. Baseline and after-change transcripts remain separate under `assets/reviews/`. This is headless verification, not a live-browser usability or speaker test.

## Visible story payoffs — 2026-10-24

The successful pool capture now shows Rosella holding the existing jar artwork while a blue echo travels from the pool into the glass. The high-bell action places the sealed jar beside her on the floor; it changes to the gold voice state and gives a small answering musical note when the bell sounds. Offering the jar shows its reflection shimmering inside the mirror; saying the rightful name empties the jar and sends a golden voice out through the gallery. On returning to the garden, the whisper reaches Merrin and he touches his throat and laughs. Arrival is shown once and stored with saves; older saves without this presentation flag still load.

These short effects use the original character cels and inventory objects, integer native pixels and EGA colors. Result text appears after the animation. Enter advances to that text; another command or movement settles the effect before acting. Menus, messages, hidden windows and focus loss pause the effects. Reduced-motion mode presents the result without the animated motion. Progress and points commit once before playback, so skipping, saving or restoring cannot lose/duplicate an earned result.

Validate with `tools/check-story-effects.cjs`, `tools/check-parser-acceptance.cjs` and `tools/replay-novice-audit.cjs`. `assets/reviews/story-effect-cels-proof.png` is an isolated source-art sheet for character/prop inspection, not a gameplay screenshot. Browser visual timing and speaker listening remain unverified in this pass.

### Prop clue follow-up — 2026-10-24

Loose beeswax now appears as pale chipped pieces on the grass beneath the hive, rather than a bright rectangle drawn on its body. Its interaction target follows the ground position; a separate depth baseline lets Rosella pass behind or in front of the chips, which disappear after collection.

The mill gear now connects to the cabinet catch with a thin iron crank, guided pull rod and latch. Turning the repaired wheel lifts the catch through three native cels before the six-cel door opening. Restoring cancels transient cabinet motion and draws the saved locked/open state. This adds a visible cause for the unlock without adding puzzle instructions.

Verified with the physical 100/100 headless walkthrough, 123 parser/state checks, original 178-action novice replay, wheel gating, 41 object masks, hive depth/removal checks and focused cabinet release/restore checks. Inspected isolated native prop art in `assets/reviews/prop-clues-proof.png`; no live-browser or speaker-listening verification in this pass.

### Scenery discovery follow-up — 2026-10-24

Added local observations for the hive stump and wax chips, rocky cliff/ledge, bridge posts/rails, mirror frame, mill bearing/axle/linkage and pale grotto seams. Ordinary LOOK makes the wax discoverable until gathered and keeps the grotto landmark visible in every bridge repair state. Mechanism observations follow the wheel state; fixed scenery has specific take refusals. LOOK UNDER/BENEATH/BEHIND and plural pennants work without changing puzzle requirements. `tools/check-scenery-discovery.cjs` exercises 60 cases against the built adventure, alongside the existing parser and full-quest headless checks.

### Room-flow follow-up — 2026-10-24

Audited all nine default spawn positions and every incoming doorway against every physically reachable outgoing exit with the repaired bridge state: 50 routes pass through the actual movement function. Landings are walkable and outside return triggers. Added blackthorn contact feedback at the actual collision boundary, rather than only at the distant exit; Rosella can retreat and the response disappears once the path is cleared.

Typed navigation recognizes visible door/arch/passage names locally and GO/WALK THROUGH, INTO and ACROSS phrasings. Ambiguous courtyard ENTER DOOR asks which entrance; distant entry still requires approaching, and the grotto retains its bridge prerequisite. Twenty-two doorway aliases pass alongside the existing early-transition, bench blocking/diagonal sliding, swimming, 123 parser/state, 60 scenery and full 100/100 headless quest checks. This is headless movement verification, not a live visual or independent human steering test.

### Animation lifecycle follow-up — 2026-10-24

Book-cover and cabinet catch/door animations now pause for messages, inventory/menu, hidden documents and window blur. Focus resumes from the held cel. Leaving the room cancels their transient timers while retaining logical open/unlocked progress; restore and the ending also clear transient animation. Reduced-motion mode completes the cabinet immediately, matching the existing book behavior. Opening the book stops walking. A moving cabinet door prevents taking its shelf jar until it settles, with a physical response instead of premature collection.

`tools/check-animation-lifecycle.cjs` verifies modal/background/focus pauses and resume, departure cancellation, a mid-animation cabinet save/restore, jar timing and reduced motion against the embedded built game. Existing book, catch/linkage, bell, story effects, 123 parser checks, 60 scenery checks, 50 walking routes and 22 doorway aliases pass. Both full headless playthroughs reach 100/100. Walkthrough helpers now dismiss text before advancing active-play animation time and include the cabinet in their busy-animation wait. No live-browser timing claim is made.

### Opening theme — A Voice Beyond the Glass

Replaced the short major-key fanfare with an original 16-bar, 29.44-second pastoral lament in 6/8 at dotted-quarter = 66. Three SN76489-style square-wave channels carry an A-minor melody, quiet answering harmony and slow broken bass; Dorian sixths and raised-leading-note cadences color the tune. Pitch is quantized to legal ten-bit PSG divisors, volume to 2 dB attenuation steps. No reverb, extra oscillators or noise channel. The editable score is `assets/stolen-voice-opening-score.json`, generated by `tools/render-opening-jingle.cjs`; the standalone game embeds `assets/stolen-voice-opening-tandy.wav`.

First Enter/click starts the music while keeping the title artwork visible; the next Enter/click begins the story. F2 sound behavior is retained. Score/channel/range checks, unclipped mono WAV decoding, silent ending, exact embedded asset and title gesture logic pass in `tools/check-opening-theme.cjs`. FFmpeg reports peak -12.0 dBFS and mean -16.3 dBFS; no speaker-listening or live browser audio verification is claimed. Both full headless playthroughs still reach 100/100.

### Native river animation — 2026-10-25

The bridge stream and mill race now use six transparent native-grid cels. Short EGA blue/cyan highlights drift downstream; the water flows even before the wheel is repaired. A 2,744-pixel visible-water mask excludes banks, stones, bridge boards and the union of all moving wheel positions. Runtime painting precedes props and Rosella; repaired decking remains in front. The shared ambient clock pauses for popups/menus, hidden tabs and blur, and retains the existing reduced-motion behavior. Pool water in the echo grotto remains still.

`tools/build-water-animation.cjs` generates `game/water-pictures.js`; `game/river-water.js` displays the patches. `tools/check-river-water.cjs` verifies all six cels, clipping, wheel-independent flow, unchanged progress and background/modal pauses. Source-art detail reviewed in `assets/reviews/river-cels-proof.png`. Wheel gating, swimming, object masks and both full headless walkthroughs pass. Live browser timing remains unverified.

### Bridge swimming collision and priority — 2026-10-25

Swimming now treats the visible bridge decks, support beams, posts and installed repair plank as solid timber, separately from their walkable top surfaces. A swept move and a head-width contact margin prevent passing through an edge with a larger or diagonal input. Submerged Rosella and her ripples are painted behind bridge timber on both halves; dry walking retains its normal priority rules. The repair remains walkable from above.

SWIM TO SHORE / GET OUT now finds a short water route around the timber to an actual bank rather than treating the deck as a swimming exit. Manual directional movement cancels that route. Route motion uses the existing active-play swimming clock and pauses behind modals or while hidden/unfocused. The five-second hazard, retry and save rules remain intact.

`tools/check-swim-timbers.cjs` covers 13 contacts across left/right decks and supports, larger swept inputs, the repaired plank from upstream/downstream, and escapes from both inner edges within five seconds. Object-priority checks also place the submerged sprite behind all six bridge timber/post masks. Swimming, water-animation clipping, 123 parser/state checks, 50 room routes and both 100/100 headless walkthroughs pass. Live rendered overlap verification remains separate.

## 25 October — physical actions and listening puzzle

The author-led playwright rewrite replaces the rose/clapper recipe with lifting and tipping the loose garden bell; makes the rose an optional gift to Merrin; replaces the wheel/cupboard catch with an animated grain hoist plus manual cupboard operation; and adds an echo riddle before the pool can remember a name. New saves track those states; earlier expanded saves migrate without losing progress. Ready shears are now called pruning shears because oil frees a pivot rather than sharpening steel.

See [the detailed rewrite report](PLAYWRIGHT-REWRITE-2026-10-25.md), including the backup checksum, manual walkthrough, native art proof and verification limits. The new 89-action run and adapted 178-action older audit reach 100/100. This supersedes the older rose retrieval and automatic cupboard-unlock instructions above.

### Rose gift scoring and shorthand — 25 October

Giving Merrin the rose now awards five points once, bringing the maximum score to 105. Picking it still earns its existing five points. GIVE ROSE MAN, GIVE ROSE GARDENER and GIVE ROSE MERRIN work alongside the TO forms; OFFER/HAND shorthand works too. Reach and ownership checks still apply. Restoring an earlier save in which Merrin already received the rose automatically includes the five gift points, because score is rebuilt from saved story flags.

### Courtyard foreground stone and planting — 25 October

Redrew both gate piers with symmetric shaped finials, coping slabs, light bevels, narrow shaded returns and staggered masonry joints. Separate ivy leaves follow a climbing stem instead of an opaque green silhouette. Replaced broad bright-green lawn patches with sparse broken grass blades. Foreground masks stop at the end of each pier's authored shapes, and narrowed solid footprints match the new bases. Native EGA source-art detail inspected; courtyard art, 41 object masks and 50 physical room routes pass. Prior art is in `backups/courtyard-piers-2026-10-25/`.

### Front-facing gallery chair — 25 October

Replaced the angled chair with a pixel-symmetric front view: centered carved crest, paired upholstery piping, level cushion, short matching arm pads, equal legs and a centered lower rail. The chair's solid base and foreground depth now match the narrower feet. Backed up the prior source/project under `backups/chair-front-2026-10-25/`. Native art proof inspected; exact symmetry, object-priority masks, room traversal and mirror-reflection checks pass.

### Pool action feedback — 25 October

PUT WATER IN JAR, FILL JAR WITH WATER, SCOOP WATER INTO JAR and dipping/lowering the jar into the pool now describe the enchanted water slipping away like a reflection, leaving dry glass and an unrippled surface. They preserve quest progress and cannot overwrite a captured sound or break a wax seal. Holding a jar above an unresponsive pool explains that no sound gathers, rather than reporting nothing happening. USE CLAPPER beside the pool now works without specifying a target, alongside USE CLAPPER NEXT TO POOL, SOUND/TAP/FLICK forms and the existing RING CLAPPER. Awakening describes a fingernail striking the silver tongue and the clear note that raises the question. Ownership/reach checks and repeat scoring remain guarded. Verified by `tools/check-pool-intentions.cjs` and the full 105-point route.


### Whole silver handbell — 25 October

Replaced the detached-clapper collectible with the complete little silver bell. TAKE BELL lifts it by its wooden handle and leaves an empty garden peg. New inventory art shows the handle, silver body, rim and attached clapper; the pickup animation carries the whole bell toward Rosella. RING BELL / USE BELL / SHAKE BELL work contextually beside the pool and mirror. The full-sized belfry bell remains a separate rope action; explicitly ringing SILVER BELL there gives a small tinkle without advancing the high-bell ritual. Existing saved clapper progress becomes possession of the handbell automatically using the same story flag, score and save slot. Legacy clapper command aliases remain compatible. Verified whole-bell pickup aliases, reach, one-time points, saved inventory, mounted ringing, pool/mirror effects, belfry distinction, inventory assets and full 105/105 route. Prior source files are in `backups/whole-bell-2026-10-25/`.

### Merrin declines unwanted gifts — 25 October

GIVE/OFFER/HAND now make Merrin explicitly decline carried items he does not want, with small object-specific gestures while mute and a spoken "No, thank you" after recovery. Every refusal says Rosella keeps the item. The rose remains the accepted gift. Reach, ownership, inventory and points remain unchanged on refusal. Verified seven item categories, shorthand verbs, recovered dialogue and the rose exception in `tools/check-merrin-refusals.cjs`.

### Courtyard turret refinement — 25 October

Centered the turret roof with exact symmetric native spans, thin brown tile edges and a few restrained tile marks. Added an eave shadow, light stone edge, narrow shaded return, sparse masonry joints and a recessed pointed window with a sill. A base course grounds the turret into the parapet. The existing waving pennant remains anchored to its pole. Prior artwork is backed up in `backups/courtyard-turret-2026-10-25/`. Native art detail inspected; courtyard palette/banner, pennant animation and object-priority checks pass.

### Visible shed door — 25 October

Broadened the shed's open door leaf so it reads as an actual oak plank door, with board seams, connected cross rails/diagonal brace, two iron hinges and a ring handle. It remains swung to the right, leaving the existing threshold and approach clear. LOOK SHED describes the door. Prior source and art preserved in `backups/shed-door-2026-10-25/`; native art detail inspected and courtyard/physical-route checks pass.

### Point-award chime — 25 October

Every newly scored story action now starts with a brief 0.20-second rising Tandy three-voice reward chime. Existing event-specific sounds follow sequentially on the same three voices, so the reward does not add extra simultaneous channels or replace the bell/mechanical effects. F2 mute applies. Repeated actions and restoring previously earned score do not play reward chimes; zero-point state changes retain only their existing effects. `tools/check-point-chime.cjs` verifies synthesis, PCM bounds, mute, actual pickup/gift awards, repeats and silent restore. Existing sound/resumed-feature checks pass.

### Belfry bell swing — 25 October

The high bell now sways gently around its fixed axle during Rosella's existing jump-and-pull sequence. Seven integer-pixel EGA cels use the original authored polygons, with a lagging clapper and rope bending toward Rosella's fixed grip. The motion settles to the exact idle drawing before the result popup. Real wall/window underpainting prevents trails. Both successful and ordinary rings use the settling sequence; reduced-motion mode keeps the bell still. Existing message/menu/background pauses, scoring, sound timing and restore cancellation remain. Native three-position art proof inspected; cel/background, bell-action and full quest checks pass. Prior runtime/build sources preserved in `backups/bell-swing-2026-10-25/`.

### Connected belfry knee braces — 25 October

Replaced the diagonal timbers ending in open wall/window space with shorter knee braces. Each now joins the underside of the head beam to its own upright below the corner, with small fastening marks. The left brace/post remains an exact native-pixel reflection of the right. Regenerated bell-swing cels against the new underpainting, rebuilt the game/editor, and checked symmetry, native art detail, swing restoration and bell-pull behavior. Previous source/project retained in `backups/belfry-knee-braces-2026-10-25/`.

### Rosella pickup poses — 25 October

Successful pickups now use Rosella's existing side-view artwork for a short native-pixel reach-and-stoop sequence. Roses, loose beeswax and planks use a deeper crouch; oil, twine, shears and the cupboard jar use a smaller bench/shelf reach. The whole-bell pickup also uses her reaching pose. She briefly holds the collected object's existing inventory artwork and brings it toward her waist before returning to the exact idle cel, with her feet kept planted. No replacement character artwork was generated.

Pickup messages wait until the short motion finishes. Enter skips to the result; a new action settles it safely. Existing hidden/unfocused pauses and reduced-motion behavior apply. Ownership and points commit once, so interruption and save/restore cannot lose or duplicate an item. All seven new pickup categories, whole-bell behavior, pause/skip/restore/repeat states, other story effects, point chimes, parser acceptance and the 105/105 route are checked. Inspected the isolated sprite proof `assets/reviews/pickup-pose-proof.png`; live browser timing remains unverified. Prior story/build sources are under `backups/pickup-animation-2026-10-25/`.

### Separate orchard crowns — 25 October

Made apple-tree crowns read as overlapping individual trees: slightly tighter side lobes, a shifted middle crown that opens small sky gaps, visible branch forks, and broken single-pixel shadow contours only on nearer overlapping foliage. Small underside pockets and sparse upper leaf edges add depth without thick black silhouette bands. Apple clusters follow the shifted middle crown. Trunks and ground footprints retain their positions. Regenerated native room data, object masks, editor assets and game; inspected before/after native art details. Fir containment, hive/prop priority, physical room routes and the full quest pass. Prior source/art retained under `backups/orchard-crowns-2026-10-25/`.

### Rounded straw beehive — 25 October

Redrew the hive as a traditional domed straw skep: rounded crown, closely stacked curved coils, a narrow shaded side, a few straw stitches and a small arched entrance near the base. Removed the old pointed bell-like silhouette and projecting lower lip. It still rests directly on the existing stump; the hive remains abandoned, and loose beeswax stays on the grass below. Updated LOOK HIVE to match. Shared authored drawing lives in `tools/draw-straw-hive.cjs`; native proof inspected, hive/prop priority, wax removal, stump collision and fir containment checks pass. Previous art/source retained in `backups/straw-skep-2026-10-25/`.

### Blackthorn cutting animation — 25 October

CUT BLACKTHORN now guides Rosella to a clear footing beside the thicket and uses her existing right-facing cel for a small working lean. Her hands hold red-gripped steel shears whose blades open and close through three timed snips. Native clearing cels remove sections of the thicket in turn, with small severed twigs falling onto the path; each snip has a short Tandy cue. The point chime remains at the initial award. Result text waits until she straightens up.

Existing rusty/missing-shears and reach requirements remain. Progress commits once before playback, while the approach still respects the original thorn boundary. Enter skips; new actions settle the sequence; hidden/unfocused pauses and reduced-motion behavior reuse the story-effect lifecycle. Mid-animation save/restore retains a clear path without duplicate points. Inspected the isolated native art/sprite proof `assets/reviews/thorn-cutting-proof.png`. Three approach positions, timed snips, skip/save/repeat guards, four EGA clearing stages and the full 105/105 route pass. Previous story/build sources retained under `backups/thorn-cutting-2026-10-25/`.


### Prevent river shortcut — 25 October

Swimming now remembers the bank from which Rosella fell. She can escape only onto that same bank; an attempt to reach the opposite bank produces a strong-current response and sweeps her back to her water-entry position. This does not replenish the five-second timer, award points or change bridge progress. The warning appears once per fall, avoiding repeated modal interruptions. SWIM TO SHORE / GET OUT routes to the original bank, and explicit SWIM ACROSS / OTHER SIDE / FAR BANK attempts receive the same response. Once the plank is placed, ordinary walking across the bridge still works. Retry remains on the original dry position, and save/restore rules are unchanged.

`tools/check-river-bank-rule.cjs` finds paths that would have reached the opposite shore under the previous rules, then exercises the actual movement against those routes from both banks and verifies they are blocked. Same-bank escapes, current pushback, timer preservation, typed attempts and repaired bridge crossing pass, alongside existing swimming/timber, room-route and full-quest checks. Prior swimming source preserved in `backups/river-bank-rule-2026-10-25/`.

### Pool/jar continuation — October 25, 2026

See `POOL-AND-JAR-CHANGES-2026-10-25.md` for the resumed popup, name clues, capture aliases, leakage, bridge-post opacity and longer bell/mirror animations. Rebuilt standalone verified through the complete 105/105 headless walkthrough; ImageGen reference and native jar proof saved locally. Pre-change archive: `backups/pool-clarity-2026-10-25/before.tar.gz`.

### Merrin sings — October 25, 2026

Completing Merrin's final conversation now shows a hand-drawn native 160x168 close-up of the gardener, with moving singing vowels, blinks, gentle head movement and musical notes. His original brown hat, silver sideburns and blue coat carry into the portrait. An original 11.52-second D-major Tandy three-voice refrain accompanies two rhyming lines. At the cadence, large gold native-pixel THE END lettering appears and holds with the score. ENTER/click advances to that final card; a second activation restarts. Hidden/unfocused windows pause the animation, and resuming restarts the melody at the matching position. F2 remains the sound control.

Artwork: `game/merrin-ending.js`. Isolated art proofs: `assets/reviews/merrin-singing-portrait.png`, `assets/reviews/merrin-final-portrait.png`. Actual synthesis preview: `assets/audio/merrin-joyful-ending-tandy.wav`. Checks: `tools/check-merrin-ending.cjs`, `tools/preview-merrin-ending.cjs`, full 105/105 headless walkthrough. No live speaker audition or browser capture was used.

The preceding swimming fix also passed 40 same-bank rescues, including eight formerly trapped landing pockets, GET OUT/SWIM BACK phrases, and homeward arrow input. Falls now choose water with a viable return path; the bridge and river-crossing restrictions remain.

### Visible current and river rock blocking — October 25, 2026

Trying to reach the opposite river bank now starts a visible current-driven return along a clear route to the original bank, with a short Tandy cue and additional wake ripples. The explanation appears after she reaches shore. Motion uses small swept steps; posts, decking, supports and rocks remain solid. Forced movement pauses the remaining reaction countdown and cannot award points or bypass bridge repair. Page/modal/focus pauses apply normally.

Swimming now checks the rocks' visible native-pixel masks at the waterline as well as their ground footprints. Dry walking retains normal behind/in-front depth ordering. Tests cover intermediate pushback positions on both banks, no solid-object overlap, unchanged story flags/score, forty rescues, both bridge halves, repaired plank, five-second drowning, pause/retry/restore, and the full 105/105 headless route. Pre-change source: `backups/current-pushback-2026-10-25/swimming.js`.

### Follow the voice home — October 25, 2026

Speaking Merrin's name to the waiting mirror now starts a roughly ten-second, three-scene flight. The golden voice leaves the gallery doorway, emerges from the gallery arch in the actual courtyard, crosses toward the outer gate, then appears outside the castle and flies into Merrin. He touches his throat and laughs. A short Tandy flight phrase and arrival cue accompany the sequence.

These are camera cutaways rendered from existing rooms. Rosella remains in the gallery, with her position and exits unchanged. Ordinary movement/typing cannot accidentally dismiss the flight; ENTER can deliberately skip it. Focus, hidden-page and popup pauses remain. Completion marks the arrival seen once, so visiting the garden afterwards does not replay a second arrival. Mid-flight saving settles the cinematic and preserves consistent returned-voice/arrival state.

Verified by `tools/check-voice-journey.cjs` (actual cutaway rendering, scene order, stationary player, pause/input lock, skip, score and save/restore), story-effects and 124 parser checks, plus the complete 105/105 headless walkthrough. Previous source: `backups/voice-flight-2026-10-25/`.

## Mill sluice puzzle — October 25, 2026

The mill now has a visual mechanical puzzle instead of an oil-only wheel unlock. Nine rotatable carved wooden troughs must carry water from the left inlet to the bottom-right outlet. The outlet fills a counterweight bucket that lifts the wheel brake. Water traces the connected channels and visibly spills when the connection fails. The close-up uses native 160×168 indexed EGA art, the existing bitmap font, and keyboard controls.

- Type INSPECT SLUICE, LOOK PANEL, FIX WHEEL, or TURN WHEEL while near the machinery.
- Arrow keys choose a trough; Enter or Space rotates it. Escape returns to the room. Number keys 1–9 also select tiles in reading order.
- Partial arrangements persist when leaving the puzzle and in saves. There is no reset requirement, timer or irreversible mistake.
- Oil remains optional on the wheel and useful for the shears; it cannot release the brake. After solving, TURN WHEEL starts the existing grain hoist.
- The original wheel reward is now earned for solving the balance, once. Maximum score remains 105. Previous saves with an already operating wheel migrate to an unlocked balance.
- Backup of the previous game sources: `backups/mill-sluice-2026-10-25/`.

Verification: real embedded game scripts and keyboard handlers in the headless acceptance harness; new puzzle tests cover solution, oil bypass prevention, solving without oil, single scoring, partial/solved restore, legacy restore, malformed saves, modal input and hidden-page pause. Full 88-command/transition adventure passes to 105/105; 124 parser/state checks and the riddle/cupboard/legacy suite pass. Native puzzle artwork inspected separately. No live browser or audio audition was performed in this pass.

## Merrin's trust and the workshop key — October 25, 2026

Fresh adventures begin with the courtyard workshop door closed and locked. Giving Merrin the rose now earns his trust and a small brass workshop key as part of the existing five-point gift reward. He keeps the rose in his coat, hands over the key and points to the shed. Looking at him before the gift mentions his guarded key; afterward the description reflects his warmer attitude.

The key has an authored 32×28 EGA inventory cel and an inventory description. LOOK WORKSHOP DOOR reports its current state. UNLOCK LEFT DOOR WITH KEY unlocks it; OPEN WORKSHOP opens it. USE KEY ON SHED DOOR performs both steps. CLOSE/SHUT and LOCK also work. Physical entry checks the same door state as typed navigation, and the courtyard draws a closed oak door whenever it is shut.

New saves preserve key ownership, lock state and open state. Older saves from inside the shed or with shed tools retain access and receive the key; older saves with an already gifted rose receive the key without replaying the gift. Score remains 105 maximum; no extra key points or duplicate keys are awarded.

Pre-change source backup: `backups/workshop-key-2026-10-25/`. Verification: dedicated embedded-game keyboard/parser/save tests, the 89-command/transition complete 105/105 route, 124 parser/state checks, legacy/riddle/cupboard tests, 13 inventory artwork states and score-chime tests. Closed-door source art inspected separately; no live browser test in this pass.

## Jar transformation storm — October 25, 2026

The belfry jar close-up now runs for 80 native cels (7.2 seconds). Three moving spectral ribbons and rising motes replace the static S-shaped mark. Enchanted glass passes through cyan, blue/violet, magenta, cyan and finally gold. Forked lightning filaments grow from both sides of the rim, change shape and withdraw before the final golden hold. Small orbiting glints finish the transformation. The red beeswax seal remains visibly intact throughout.

All drawing uses integer native pixels and the 16 EGA colors, with no transparency or smoothing. Existing reduced-motion skip, hidden/focus pause, Enter skip and single scoring remain in place. The original Tandy illumination cue accompanies the sequence.

Backup: `backups/jar-storm-2026-10-25/`. Verification: all 80 native artwork frames checked for bounds/palette/intact seal and inspected in an isolated six-frame proof; real embedded bell lifecycle, pause/skip and reward tests pass. The complete 105/105 walkthrough and resumed pool/jar acceptance suite pass. No browser screenshot or live audio audition was used.

## Mirror jar exchange — October 25, 2026

Replaced the large resampled inventory jar in Rosella's hand with a purpose-drawn 8×12 native cel. Its rounded shoulders, narrow red neck, flat golden base and moving interior light remain readable at scene scale. Rosella lifts it gently by two native pixels with a short connected forearm. The mirror uses a matching 6×10 cel positioned beside the actual reflected hand, rather than a jar fixed at an unrelated point in the glass. Both jars become empty together when the voice is released.

During the offering, gold/cyan motes travel from the held jar into its reflection. Small clipped ripples grow in the mirror and settle into a golden voice wisp before the mirror asks its existing question. The ordinary static musical glyph is suppressed during this exchange. Reflected hands, jar pixels, ripples and wisps remain inside the arched glass; the frame is untouched.

Backup: `backups/mirror-jar-2026-10-25/`. Verification: isolated 50-frame prop rendering checked for native EGA colors, geometry, gentle motion and clipping; source-art proof inspected. Embedded story-effect, automatic-question, three-room voice-journey, jar-storm and resumed pool/jar suites pass. Complete adventure walkthrough still passes at 105/105. These are headless checks, not a live browser screenshot test.

## Resumed batch — October 26, 2026

Completed Merrin's generated-reference/native-AGI ending redraw and longer 31.68-second song; identical garden banners; continued orchard trail; two front-facing eyes; enlarged workshop doorway; all-nine, paired-cog sluice puzzle and richer mechanism art; raised pickup contacts; continuing pool ripples, colored answer sparks, smoke-first naming, and a visibly hand-held open jar with eight leaking-echo cels. Full details, backup and verification are in `RESUMED-IMPROVEMENTS-2026-10-26.md`.

## Puzzle-only testing shortcut

Type **XYZZY PUZZLES** (or **SKIP PUZZLE**) while standing by the mill mechanism, awakened grotto pool, or belfry instrument. It solves only that room's puzzle and plays its normal success animation. In Lost Harmony, dismiss the success message to continue the bell sequence. Close an open puzzle panel with Escape before typing the command.

This shortcut does not grant inventory, teleport Rosella, repair the rope, seal the jar, or skip the story. Normal item/prerequisite checks still apply, and ordinary save/restore retains the solved puzzle. The original **XYZZY** remains the full pre-finale checkpoint shortcut.
