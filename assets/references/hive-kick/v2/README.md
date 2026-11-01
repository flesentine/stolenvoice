# Original-look kick retrace v2 — 2026-11-01

Built-in image_gen, original-pose.png as the only identity/costume reference. Exact prompts are prompt-1.txt, prompt-2.txt and prompt-3.txt.

- Candidate1 rejected: closer character model, but extended shin emerges too high near the waist; soft shading.
- Candidate2 rejected: high contact pose persists despite knee-height correction; would repeat the anatomical problem after tracing.
- Candidate3 accepted as a low foot-nudge contour guide, copied to accepted-low-kick.png. Narrow original silhouette stays consistent, supporting foot is planted, foot projects below the hem. Residual generated shading is quantized away, never shipped.

The game does not import the raster or generated upper body. tools/trace-hive-kick-reference.py retains the original top20 rows, standing endpoint sprites and support shoe, then traces the lower cloth/active foot into exact EGA indices. Runtime embeds six cels. Contact14 is a low boot against the wooden hive stand, tipping the straw skep through its existing animation; this avoids the former waist-height kick. Both approaches, native palette, original body pixels and contact with the actual hive/stand mask are checked by tools/check-hive-kick-trace.cjs. Death, swarm, retry and saved quest state remain unchanged.

Previous trace source, cels and renderer are preserved here for comparison. Current native previews: assets/reviews/hive-kick-v2-cels.png, hive-kick-scene-poses-v2.png and hive-kick-retraced-v2.gif. Reproduce scene previews after node tools/check-hive-disaster.cjs using the bundled Pillow/NumPy Python with tools/preview-hive-kick.py. These are native painter captures; no live browser test was performed.

## Follow-up: raised contact and walking approach

The six traced keys now lift the active cloth/shoe side around the hip, preserving the original upper body and fixed supporting leg. Contact14 reaches the straw wall instead of the stand. The heroine walks to the contact position with her normal strides,110ms pace and four walk cels; the action clock waits for arrival. Native preview: assets/reviews/hive-kick-walk-raised-v4.gif. Tests cover both approaches, exact walking painter/real position, raised shoe contact, palette, normal scout size and unchanged retry/save behavior.
