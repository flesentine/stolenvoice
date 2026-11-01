# Outline-and-fill art direction

Reviewed original KQ1, KQ2 and KQ3 screens on ScummVM's screenshot gallery, including the cottage interior, cave, forest house, kitchen and purple bedroom:

https://www.scummvm.org/en/screenshots/agi/kq/

Observed design choices: long deliberate outlines, large uninterrupted wall and ground colors, simple shadow planes, detail concentrated on recognizable props, and occasional expressive texture. Rich rooms can still have numerous objects without covering every surface in small marks.

Renderer reference, maintained by ScummVM's AGI implementers:

https://github.com/scummvm/scummvm/blob/master/engines/agi/picture.cpp

Its picture decoder describes vector instructions, line/corner drawing, fill operations and optional brush patterns. The custom browser art builder now renders complete authored room pictures as native-grid line strokes and flat filled polygons. The generated raster pictures are composition references only; they are not sampled or embedded in the final backgrounds. It does not implement the complete AGI picture resource format.

No screenshot artwork or ScummVM renderer code was copied into the game. The sources informed the drawing approach. Generated room compositions remain the layout references. Previous pictures are preserved in `before-outline-fill-v4/`.
