# Elara swimming

The built-in imagegen tool generated elara-swimming-reference-v1.png. Sixteen poses were then manually redrawn with the shared AGI drawer's integer polygon and line commands. No generated pixels are sampled. The original generation prompt is in reference-prompt.txt.

There are four frames each facing left, right, away and toward the viewer. Each editable project uses a 24x20 native sprite region at [64,64] within the standard 160x168 project. Index 16 is transparent in the game's encoded cels; the visible colors are standard EGA. White blouse, blonde hair and blue dress retain Elara's design. Preview: swimming-cels-preview.png.

The editor's Project selector includes all sixteen swim cels. Save edited JSON back into assets/swimming and rebuild with tools/build-expanded-adventure.cjs. Existing projects are preserved by normal builds; tools/draw-swimming-cels.cjs --force recreates the authored versions.

Water rules are in game/swimming.js. The native river polygon determines water contact; safe bridge decks override it. Walking beyond a deck or bank enters swimming. Arrow keys paddle; SWIM LEFT/RIGHT/NORTH/SOUTH and SWIM TO SHORE are supported. Five seconds of active, focused gameplay are available to reach a bank or safe deck. Messages, menus, hidden tabs and an unfocused window pause the clock. No progress or items are lost on the bank retry. Saving while swimming is disallowed; restore resets the hazard. Death offers Enter retry, F7 restore, or R restart.

Verification: tools/check-swimming.cjs uses the built game and a controlled clock to check the 4999/5000ms boundary, native cels, movement, both escape directions, repaired-bridge safety, modal and background pauses, retry, restore and save protection. tools/check-gameplay-copy.cjs still completes the original quest at 100/100. These are headless checks; no live browser gameplay capture was performed for this change.
