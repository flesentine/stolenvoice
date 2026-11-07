# Barrel animation: every-fifth-frame imagegen references

Generated with the built-in image_gen tool on 2026-10-31. These are pose references for manual AGI tracing, not imported game sprites. Existing animation code is unchanged by this generation task.

## Sheets and frame mapping

Read each sheet left to right, then top to bottom. Every cell corresponds to five 90ms game ticks; interpolation between traced keyframes is still required.

| Sheet | Row | Frames | Poses |
| --- | --- | --- | --- |
| fall-every-five-v1.png, 4x4 | 1 | 0, 5, 10, 15 | stand, step, grip rim, begin leaning |
| fall-every-five-v1.png | 2 | 20, 25, 30, 35 | overbalance, tip, hips above rim, inverted |
| fall-every-five-v1.png | 3 | 40, 45, 50, 55 | kick, sink, last shoes, hidden |
| fall-every-five-v1.png | 4 | 60, 65, 70, 75 | head emerges, shoulders, shake left, shake right |
| climb-every-five-v1.png, 4x3 | 1 | 80, 85, 90, 95 | grip rim, push up, straddle, lower legs |
| climb-every-five-v1.png | 2 | 100, 105, 110, 115 | land, tug cloth, release cloth, wipe cheek |
| climb-every-five-v1.png | 3 | 120, 125, 130, 135 | brush bodice, brush upper skirt, clean, step away |

Prompts are saved verbatim in fall-prompt.txt and climb-prompt.txt. First generation used the current native game pose sheet only for character/costume/prop identity; the second used the generated first sheet for continuity.

## Visual review

Both sheets contain the requested cell counts and readable sequential actions. Accepted as **pose guides**: fall has a recognizable hip-over-rim inversion, distinct bent knees and downward-hanging skirt; climb has weight-bearing hands, a seated/straddled transition and legs lowering outside the barrel. Compact bent-arm cleanup gestures replace the old long reach toward the knees. Linen coverage stays opaque throughout the slapstick.

These are not exact EGA stencils. The generator introduced extra shades, small contour details and some character/barrel scale variation. Do not auto-downsample or palette-convert into final art. Hand trace connected flat silhouettes using the existing character's head/torso/limb proportions; normalize all cels against one fixed barrel and ground baseline. Preserve the already approved in-game head-emergence pose. Ignore any incidental clothing ornament and small finger detail.

Trace gates: constant head size and limb lengths in display aspect; consistent body-to-barrel scale; no stretched torso in tilt/climb; no doubled original/custom arms; connected wrists/elbows/shoulders; feet and knees remain attached; no floating actor while lowering from rim; hands release cloth at reachable upper-thigh height; skirt falls independently; exact 16-color EGA data; opaque linen layer; native game-scale animated review before replacing current cels.

## Next bounded implementation

Implemented in `tools/trace-barrel-prank.cjs`: 28 manually authored native line/fill cels for frames 0–135 at five-frame spacing. Reference bitmaps are not sampled. Actor coordinates use the existing fixed barrel rim at (138,102) and floor at y135; head stencils reuse Elara's game identity. Compact limb contours, opaque linen, explicit rim straddle/lower/land and separate tug/release/cleanup keys replace the procedural rotated/stretching body.

`game/barrel-prank.js` paints immutable indexed runs from these cels. It translates intact poses to/from the real player's footpoint; collision position stays unchanged. The approved continuous head-emergence/shake at frames58–81 is preserved exactly and is regression-compared against the saved prior renderer. Frame139 restores the original facing/step stencil before ending. Lifecycle, manure state and river callback are preserved.

Native previews: `assets/reviews/barrel-trace-keys.png` (all 28 poses), `assets/reviews/barrel-prank-traced.gif` (actual 140 runtime frames over the workshop art), and `assets/reviews/barrel-prank-traced.png` (runtime milestones). No new live-browser or subjective audio check.


### Native visual pass 2
Compact filled limb tapers, shorter sleeves/cuffs, two-row shoes and sparse dress folds refine the hand trace. The fallen blue skirt is an exterior cloth layer over the barrel front; the actor underneath stays occluded. White linen coverage and approved head rise/shake remain intact. Preview: assets/reviews/barrel-prank-polished-v2.gif.


### Reference-contour revision 4
The user rejected the thin-limb approximation and asked for the closest possible copy of the generated art. The current authoring path therefore supersedes the manual-shape-only advice above: `tools/trace-barrel-reference.py` reads the two approved sheets, masks actor colors away from barrel wood/hoops, registers cells against the rim/floor, quantizes actor coverage into EGA, and removes disconnected flecks. `assets/rooms/barrel-reference-cels.json` is the cleaned native source consumed by `tools/trace-barrel-prank.cjs` and embedded by the builder. The game does not load the reference bitmaps. Prior images and manual tracer backups are preserved.

The native silhouette retains the actual image's knee bends, white linen coverage, rim straddle, lowering and short cleanup gestures. The source head-emergence/shake is still preserved in the runtime. Preview: `assets/reviews/barrel-prank-reference-v4.gif`; every-fifth-frame sheet: `assets/reviews/barrel-reference-v4-keys.png`.


### Stay at cleanup spot
The runtime stops at tick135, holding the frame130 cleanup cel instead of playing the old step-away/slide. Completion commits the valid world position (248,191), facing front, so normal movement and restored games continue at that location. The original28 reference keys remain archived; key135 is no longer played.
