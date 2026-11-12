# Elara and the Stolen Voice

A browser adventure with a text parser, nine connected rooms, native EGA-style art, and three-voice Tandy-style music. Help Elara recover Merrin's stolen voice, with plenty of optional mischief along the way.

## Play

Download the repository and open **[stolen-voice.html](stolen-voice.html)** in a desktop browser. The current game is self-contained; no installation or server is required.

- Arrow keys: walk; hold a horizontal and vertical arrow for diagonal walking.
- Type commands such as `look`, `inventory`, or `look rose`, then press Enter. `x rose` and `l rose` are shortcuts for `examine rose`, including special puzzle objects.
- F1: instructions. F2: sound. F3: repeat the last command. F5: save. F7: restore. Escape: menu.
- Alt+Up/Down: volume. Alt+Left/Right: intro caption duration (short, normal, long). These preferences are kept in this browser separately from quest saves.
- The intro continues when unfocused. Browsers may suspend background audio; returning or pressing a key attempts to resume it. F5/F7 are suppressed until gameplay begins.
- Try optional actions such as `dance`, `bow`, `curtsy`, and `fart`.

## Record a playtest

Click **Playtest / Reports** in the upper-right corner, then **Start recording** to opt in. This works in the standalone offline game and the hosted version.

- The recording captures submitted commands and responses, room changes, puzzle milestones, active time and pauses, saves/restores, deaths/retries, and JavaScript errors. Each report identifies the exact build with a content hash.
- Click **Playtest recording • Notes / Finish** to pause and add a note. **Finish playtest…** asks what was confusing, where you got stuck, and what worked well, then stops recording and downloads a JSON report. Send that file to the playtest organizer.
- **Download report** exports at any time. A local draft is kept separately from game saves when browser storage is available. After a reload, use **Recover previous report** to export the interrupted session; start a new recording to continue testing. Recovery does not restore game progress.
- No video, microphone audio, individual keystrokes, account details, or page URLs are recorded or uploaded. Avoid putting personal information in commands, notes, or feedback. **Delete local report** removes the retained draft. Browser storage can be cleared or blocked, so download before closing.
- Reports flag three identical consecutive commands and ten active minutes without a milestone as possible trouble. These flags require human review. Recording is capped at 10,000 events and reports indicate truncation. Active time excludes game messages, menus, notes, and unfocused/hidden time, with approximately one-second sampling for ordinary game pauses.

## Keep and move your saves

- **Desktop:** press Escape → Game → **Save files...**, or type `save files`.
- **Touch:** tap **Save** to open the same panel.
- **Download save** creates a dated JSON file. Keep that file outside the game folder before moving/updating the game or clearing browser data.
- **Open save file** restores that file in another copy/location of the game. Older raw v2 JSON and original short-edition v1 saves can also be opened; early saves migrate useful progress into the expanded quest.
- **F5 / `save`** still quick-saves in this browser. **F7 / `restore`** restores the quick save, automatically trying the previous valid save if the primary is damaged. **Previous quick save** in the panel, or `recover save`, selects the previous checkpoint explicitly.
- If browser storage is blocked, use **Download save** before closing the game. Session-only progress cannot survive closing the page without a downloaded file.

Save files include a corruption check and undergo progress/schema validation before loading. Rejected files leave your quest and stored saves unchanged. Cancel the picker or press Escape during a pending read to keep playing.

`index.html` is a second entry point for the current game. The original prototype is preserved in the local pre-rebranding backup. `stolen-voice-short.html` is an earlier short edition and the source template used by the expanded-game builder.

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

## Original branding pass

The active game is **Elara and the Stolen Voice**, set in **Alderwick**. Its Alder Pixel font is newly authored; the copied font files have been removed. The heroine has auburn hair and a blue-and-white outfit. The share image is original geometric pixel artwork. Build output and the Pages workflow include only the current game and share image. See [BRANDING-CHANGES.md](BRANDING-CHANGES.md) for the backup and scope.
