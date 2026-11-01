// Native contour trace of the approved imagegen sheets. Authoring/masking and
// EGA registration are reproducible with tools/trace-barrel-reference.py.
// Runtime uses only these cleaned indexed cels; no reference bitmap is shipped.
module.exports=function(){return JSON.parse(JSON.stringify(require('../assets/rooms/barrel-reference-cels.json')))};
