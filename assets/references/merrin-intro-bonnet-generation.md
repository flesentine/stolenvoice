# Merrin intro bonnet — image generation and trace

Built-in ImageGen, three passes, 2026-10-30. Reference: user-supplied ending-scene hat plus existing right-profile intro head. Pass 1 established the broad crown and low rear lobe. Pass 2 requested flat colors while retaining that shape. Pass 3 isolated the hat into large, clear tracing regions. The generator retained some shading; the accepted reference has unambiguous outlines/fill boundaries, and the hand trace deliberately discards all shading and texture for four solid EGA polygons.

Selected assets:
- `merrin-intro-bonnet-profile-v2.png`: fit reference, second generation.
- `merrin-intro-bonnet-stencil-v3.png`: final hat-only trace reference, third generation.

Final prompt (third generation; input was the second-generation profile):

> Use case: precise-object-edit. Output ONLY THE HAT from this reference, in the same right-facing side orientation, on perfectly solid white. Remove the man, face, hair, clothing and magenta completely. Redraw the hat as a technical cut-paper pattern made from FIVE SIMPLE CLOSED SHAPES: 1) full black outer silhouette; 2) solid ochre-brown #aa5500 inset main silhouette; 3) solid dark-red #aa0000 broad curved underside fold at the drooping left/back; 4) solid pale yellow #ffff55 narrow curved forehead rim along the lower-right inner edge; 5) one small solid dark-red crown crease. Keep the full rounded slouched crown and broad low drooping back lobe exactly like reference, not a thin strip. ABSOLUTELY NO gradients, no texture, no grain, no shading, no glow, no fabric simulation, no photographic rendering, no stipple, no anti-aliased noise. This is a five-piece paper stencil diagram with large areas of dead flat uniform ink, suitable for tracing by hand into a tiny retro game. No labels, no numbers, no text. Single hat, fully visible, generous white margin. Keep its opening facing RIGHT, with the floppy rear lobe hanging down at LEFT.

Trace: `tools/trace-merrin-prologue-cap.cjs`; original illustration coordinates map to the native 160x168 picture grid. Face/body geometry and ending-scene hat remain unchanged. The ear paints over the bonnet lobe so the hat sits behind it.
