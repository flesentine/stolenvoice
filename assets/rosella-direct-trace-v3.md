# Direct reference conversion

The earlier hand-authored sprite changed the reference silhouette and proportions too much. This version derives the game pixels directly from `rosella-turnaround-reference-v2.png`.

`../tools/trace-rosella.cjs` finds each figure's largest opaque connected component, crops away empty margins, and converts the covered source pixels to majority EGA colors per native pixel. Transparent edges remain transparent. The cell is 8×40 with six columns of figure content, preserving the source's tall, narrow proportions after the game's 5:3 pixel aspect correction. Left is mirrored from the right profile because both generated profile panels face right.

`rosella-direct-trace-v3.json` preserves the exact source bounds, palette and indexed rows. The same rows are embedded in `../index.html`, so the game has no runtime image dependency. The generated standing pose is preserved during movement; the previous invented walking foot poses have been removed.

This is a resolution reduction, so fine source detail cannot all survive. It does not invent new facial features, blouse details, skirt folds or colors.
