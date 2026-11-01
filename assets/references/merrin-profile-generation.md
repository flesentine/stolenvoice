# Merrin reference generation and AGI trace — 2026-10-28

Used the built-in image generator. Images are drawing references; the game uses manually authored editable polygon/line commands, not resampled raster pixels.

## Review
- Attempt 1, `merrin-profile-rejected-v1.png`: rejected for rendered texture/gradients, peach skin and exaggerated cap/nose/chin.
- Attempt 2, `merrin-profile-rejected-v2.png`: rejected for oversized cap/eye and remaining soft shading.
- Attempt 3, `merrin-profile-approved-v3.png`: accepted as a traceable design. One visible eye, recognizable adult profile, snug conventional cap, separated hair/face/clothing and simple closed regions. Residual raster texture is discarded by the manual trace; native output uses exact EGA fills.

## Final prompt used (attempt 3)

Create ONE clean character reference: a normal, kindly older HUMAN MALE gardener, age 65, in strict RIGHT-FACING SIDE PROFILE, head and shoulders. One visible eye. Closed mouth, slight friendly smile.

This is a COLOR-BY-NUMBER SHAPE DESIGN for manual tracing into a very low-resolution AGI adventure game. Draw it with the extreme simplicity of eight pieces of colored paper. It must be traceable as a handful of closed polygons. Do not create a rendered illustration.

ANATOMY:
Natural adult proportions, mature gently angular face, short rounded nose with little projection, modest chin, short neck, SMALL eye. The visible eye should occupy less than one eighth of the face width. Short neat gray hair close to the skull with NO puffed curls or long hair. One simple ear of ordinary size. At most two short cheek/age lines.

CAP:
A SMALL snug brown cloth work cap with a VERY SHORT bill. Not a beret. Not a floppy hat. It follows the top of the skull closely. The cap is no wider than the gray hair/head silhouette except for its short forward bill. Its crown rises no more than a quarter of the face height above the brow. Keep the head and face visually dominant, not the hat.

COSTUME:
Plain dark-blue tunic, plain white collar, two plain brown apron straps. Minimal head-and-shoulders bust. No hands.

ABSOLUTE EIGHT-COLOR LIMIT:
Uniform background #AA00AA.
Uniform skin #FF5555.
Uniform brown cap and straps #AA5500.
Uniform gray hair #AAAAAA.
Uniform blue tunic #0000AA.
Uniform white collar and eye #FFFFFF.
Thin black boundaries and pupil #000000.
At most one small dark-red shadow shape under the jaw #AA0000.

EVERY FILL MUST BE ONE SOLID COLOR. Do not add highlights, lighting, gradients, shine, texture, grain, airbrushing, dithering, watercolor, fabric patterns, shading inside regions, or additional colors. No peach/tan skin. No shaded hair. No shaded cap. No gray shading on the collar. Think flat-color paper cutout with clean thin black contours and restrained adult anatomy.

Composition: entire cap, head, neck and shoulders visible with a generous uniform magenta margin. No second portrait, reflected face, scenery, mirror, diagrams, text, swatches or borders.

## Native trace

- `tools/trace-merrin-prologue-head.cjs`: hand-authored source-coordinate polygons/lines, mapped into the 160x168 scene. Horizontal scale0.0475, vertical scale0.095 preserves proportions at the game's double-width pixel display.
- `assets/rooms/merrin-profile-head-trace-v3.json`: editable AGI workshop head project.
- `tools/draw-prologue-closeup.cjs`: integrates the trace and derives the reflection, blinks and singing mouths across all40 cels.

## Subsequent costume correction

The generated reference's cap read as a modern baseball cap in the game. The native trace now substitutes a medieval brown felt bonnet with a soft crown/folded edge, removing the projecting bill and panel stitching. Face, hair, collar and facial animation remain reference-derived.
