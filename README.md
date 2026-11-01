# Rosella and the Stolen Voice

A browser adventure with a text parser, nine connected rooms, native EGA-style art, and three-voice Tandy-style music. Help Rosella recover Merrin's stolen voice, with plenty of optional mischief along the way.

## Play

Download the repository and open **[stolen-voice.html](stolen-voice.html)** in a desktop browser. The current game is self-contained; no installation or server is required.

- Arrow keys: walk; hold a horizontal and vertical arrow for diagonal walking.
- Type commands such as `look`, `inventory`, or `look rose`, then press Enter.
- F1: help. F2: sound. F5: save. F7: restore. Escape: menu.
- Try optional actions such as `dance`, `bow`, `curtsy`, and `fart`.

`index.html` is the original prototype. `stolen-voice-short.html` is an earlier short edition and the source template used by the expanded-game builder.

## Develop

Use a recent Node.js version. Edit `game/`, `tools/`, or the editable art projects in `assets/rooms/`, then rebuild:

```sh
node tools/build-expanded-adventure.cjs
node tools/check-current-game.cjs
```

The maintained test runner checks the generated standalone game and its parser, room flow, puzzles, animation, and synthesized audio. Some checks generate local review files under `assets/reviews/`. These automated checks do not replace browser playtesting or listening to the audio.

Open [editor/index.html](editor/index.html) for the native-grid room editor. See [editor/README.md](editor/README.md) for its drawing workflow. Image-tracing authoring scripts may additionally need Python with Pillow/NumPy; optional image-preview tools may need the Node package `sharp`. Playing the game needs neither.

The checked-in standalone HTML includes its art and audio. Keep it in sync with source changes by running the builder. Historical fixtures required by tests are retained under `backups/`; local backup archives and generated review media are excluded from Git.

[STOLEN-VOICE.md](STOLEN-VOICE.md) contains detailed design and puzzle notes, including spoilers.
