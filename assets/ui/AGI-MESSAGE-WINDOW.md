# DOS/EGA AGI message windows

The expanded adventure renders message windows at 320×200 display resolution using the existing 8×8 bitmap font. Layout follows the default AGI print window: 30-column wrapping, text-grid positioning, ten horizontal padding pixels and five vertical padding pixels. Long messages are paginated.

The EGA frame uses palette index 4 on index 15. Horizontal edges occupy one scanline; vertical edges occupy two display pixels. The outside white inset is two pixels horizontally and one vertically. Text is palette index 0.

Reference implementations:
- https://github.com/scummvm/scummvm/blob/master/engines/agi/text.cpp (drawMessageBox)
- https://github.com/scummvm/scummvm/blob/master/engines/agi/graphics.cpp (drawBox)
- https://github.com/scummvm/scummvm/blob/master/engines/agi/text.h (font dimensions)

Scope: DOS/EGA default message windows. Other ports differ. Native geometry and palette were checked; no pixel comparison against an original interpreter capture has been performed. Fractional browser scaling can affect the final apparent edge thickness.
