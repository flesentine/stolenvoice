# The Borrowed Note

Original 7.28-second opening fanfare for Rosella and the Stolen Voice. Three mono square-wave voices use SN76489-style frequency-divisor quantization and discrete 2 dB volume steps. The melody rises through a bright courtly phrase, answers over a moving bass, and resolves to C. No sampled instruments, reverb or extra voices.

`stolen-voice-opening-score.json` contains the score; `tools/render-opening-jingle.cjs` produces the WAV embedded by the expanded-game builder. Enter/tap supplies the browser audio gesture. F2 mutes; focus loss stops sound.

Additional short three-voice event cues are authored in `game/tandy-sound.js`. Each cue replaces the previous cue, so effects cannot accumulate extra simultaneous voices.
