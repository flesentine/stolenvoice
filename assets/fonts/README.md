# Alder Pixel

Original bitmap glyphs authored for this game in eight-by-eight cells. Version 1.1 uses wider six-column letterforms, paired vertical strokes, distinct lowercase letters, and descenders for g/j/p/q/y. `alder-pixel-glyphs.json` is the editable source: eight strings of eight bits per glyph. No external font data is used.

Run `python3 tools/build-alder-font.py` to rebuild the 2,048-byte bitmap, metadata JSON, and TrueType wrapper. The adventure builder embeds both generated font files into the standalone game. Run `python3 tools/preview-font.py` for a mixed-case proof.
