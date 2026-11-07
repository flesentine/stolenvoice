# Reliable saves

Use **Escape → Game → Save files...** on desktop, **Save** on touch, or the parser command `save files`.

The panel offers Quick save, Download save, Open save file, Previous quick save, and Cancel. F5/F7 and the existing `save`/`restore` commands retain their quick-save behavior. `export save`, `import save`, and `recover save` are direct parser alternatives.

## Persistence

Downloaded files carry quest flags, player position/facing, puzzle settings and Merrin memories. Their filenames include a date/time. They can be opened in a fresh copy/location of the game without access to the original browser storage. Keep a downloaded file before moving/updating the game or clearing browser data. If storage is blocked, the game says the quick save is only available for the current visit and directs players to download a file.

Quick saves preserve the previous valid checkpoint in a separate backup slot. Restore tries the current save, then the backup, then the original short-edition save. A failed backup write leaves the existing primary slot intact. The previous-save option can also recover that checkpoint explicitly. These browser slots are local convenience copies, not substitutes for a downloaded file.

## Validation and compatibility

Portable format 1 wraps the existing expanded-adventure version-2 state. Its checksum detects accidental data changes; it is not a security signature or anti-cheat system. The importer also accepts raw expanded v2 JSON and migrates the original short-edition v1 state using the existing progression rules. It rejects unsupported versions, invalid/inconsistent progress and files over 256 KiB before replacing the current quest or stored saves.

Cancellation, unreadable files and validation errors leave progress intact. The picker has both native cancel handling and a visible **Cancel file** control. Escape can cancel an asynchronous read; a late result from that cancelled read cannot restore a different quest. File I/O and native-dialog callbacks are covered by a headless browser-API stand-in, so actual browser/OS picker behavior remains a device-QA item.

## Verification

- `node tools/check-save-files.cjs`: fresh-storage exact-state round trips; raw v2/v1 migration; checksum, size, schema and version rejection; unchanged quest/storage on failure; previous-slot recovery; blocked storage; backup-write failure; download contents and object-URL cleanup; save-panel navigation; file selection/cancel/late-read handling.
- `node tools/check-adventure-playthrough.cjs`: earned 105/105 through all nine rooms using physical routes and actual hive, sluice and harmony inputs, with two portable files written to disk and imported into fresh-storage game instances, two browser-restart restores, and a completed-file restore.
- `node tools/check-current-game.cjs`: 64 maintained suites passed. Targeted save checks were rerun after adding pointer-input protection and the explicit picker-cancel control.

Playthrough artifacts are under `assets/reviews/`: `current-playthrough.json`, `playthrough-save-1.json`, `playthrough-save-3.json`, and `playthrough-save-complete.json`. They are test-earned saves, not the player's personal browser save. Generated review files are excluded from Git and the deployment allowlist.
