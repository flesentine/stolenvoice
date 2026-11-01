# Sierra AGI font

The game uses the original 8×8 `fontData_Sierra` bitmap table preserved in ScummVM's source history:

https://raw.githubusercontent.com/scummvm/scummvm/a709596b48b93e46b36f2142f6d781a5198fe8a2/engines/agi/font.h

Implementation history:
https://lists.scummvm.org/pipermail/scummvm-git-logs/2015-May/068384.html

`scummvm-agi-font-source.h` retains the original source and GPL-2.0-or-later notice. The table is extracted to `sierra-agi-8x8.bin` and `sierra-agi-data.json`. `../../tools/build-sierra-font.py` wraps each bitmap row as rectangular TrueType outlines to produce `sierra-agi.ttf` for the HTML controls. All these assets are local. The TTF and bitmap bytes are also embedded in `../../index.html`, so opening the game directly from a file requires no web font request.

Popup text is rasterized directly from the bitmap bytes, with nearest-neighbor scaling and the DOS text pixel aspect correction. It does not use browser text rasterization. Curly quotation marks, long dashes and ellipses are normalized to the corresponding ASCII punctuation for the message bitmap. The CSS font additionally maps those Unicode characters to their ASCII glyphs.

Messages use a centered white window with one native-pixel dark-red border and black text. Enter, Space, Escape or a click/tap dismisses it. Movement and background animation pause while a message is open, and the underlying interface is inert until dismissal.
