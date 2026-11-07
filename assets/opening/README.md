# Grid-guided opening reference

The built-in imagegen tool received the user's square-cell 160-column by 168-row grid and the corrected wide-cell version in assets/grid/160x168-wide-grid.png. The second image specified the intended AGI picture display aspect ratio.

grid-castle-reference-v1.png is the first, overly detailed composition. grid-castle-reference-v2.png is the selected simpler redraw. The exact prompts are saved in grid-castle-prompts.txt.

These are generated composition references, not certified native AGI pictures. Image generation did not strictly enforce the requested palette or every grid boundary. The selected reference has now been manually redrawn as `opening-workshop-v1.json`: 237 authored drawing commands on the exact 160x168 grid, rendered with the shared AGI drawer in the 16-color EGA palette. No generated raster pixels are sampled.

`opening-agi-v1.png` is the native picture; `opening-art-proof.png` is an enlarged source-art proof with the Alder Pixel bitmap title. The expanded game now opens with this scene, small pennant/moat cels, and an original 7.28-second three-voice fanfare started by Enter or a tap. The original adventure and short edition are preserved.

Rebuild with `tools/draw-opening-scene.cjs`, `tools/build-expanded-adventure.cjs`, and `tools/build-agi-editor.cjs`; the opening is also available in the AGI editor Project list.
