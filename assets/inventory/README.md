# Inventory objects

The built-in imagegen tool produced inventory-reference-v1.png as one composition sheet. Its shapes were then independently redrawn with integer-coordinate polygons and lines through editor/agi-picture.js. The game does not sample or quantize the generated raster.

All twelve possible inventory labels have art: rose, silver clapper, oil flask, twine, wooden plank, rusty shears, sharp shears, beeswax, glass jar, echo jar, sealed echo and voice jar. Carried state determines what appears; the jar and shears change appearance with puzzle progress. Artwork compensates for AGI's wide native pixels.

Each *-workshop-v1.json opens in the AGI drawer. They are also included under Inventory in the editor's Project selector, with separate autosaves. The authored sprite region is [64,64,32,28] inside the standard 160x168 project. Exported edits must be saved back to these source projects; the game is rebuilt by tools/build-expanded-adventure.cjs. Ordinary builds preserve existing project edits. Running tools/draw-inventory-objects.cjs with --force recreates the initial authored projects.

The inventory opens as a black-screen text list in the Sierra font. Up/Down (or Left/Right) changes the black-on-white selection. Enter or Space opens only the selected object's native picture in a DOS/EGA frame. Enter/Escape returns to the list with selection retained; Escape/Tab from the list returns to the game. Home/End select the first/last item. Empty inventory remains a short text message. No mouse-only controls or new game-state fields were introduced.

Generation prompt is saved in inventory-reference-prompt.txt. Native art previews are objects-agi-preview.png and inventory-window-preview.png.
