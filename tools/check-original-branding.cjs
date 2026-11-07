// Guard the actual release bundle and editable runtime sources against old branding.
const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const read=p=>fs.readFileSync(p,'utf8');
const forbidden=/sierra|rosella|daventry|king['’]?s\s+quest|fontData_Sierra|\bAlexander\b/i;
for(const file of ['index.html','stolen-voice.html','stolen-voice-short.html',...fs.readdirSync('game').filter(f=>/\.(js|css|html)$/.test(f)).map(f=>path.join('game',f))])assert(!forbidden.test(read(file)),file+' contains old branding');
const html=read('stolen-voice.html');assert.equal(read('index.html'),html);assert(html.includes('<title>Elara and the Stolen Voice</title>'));assert(html.includes('Alderwick'));
const bitmap=fs.readFileSync('assets/fonts/alder-pixel-8x8.bin');assert.equal(bitmap.length,2048);
assert(html.includes(bitmap.toString('base64')));assert(html.includes(fs.readFileSync('assets/fonts/alder-pixel.ttf').toString('base64')));
const glyphs=JSON.parse(read('assets/fonts/alder-pixel-glyphs.json'));
for(let n=33;n<=126;n++)assert(bitmap.subarray(n*8,n*8+8).some(v=>v),'printable glyph '+n);
for(const [char,rows]of Object.entries(glyphs))for(let y=0;y<8;y++)assert.equal(bitmap[char.charCodeAt(0)*8+y],parseInt(rows[y],2));
for(let n=97;n<=122;n++)assert(!bitmap.subarray(n*8,n*8+8).equals(bitmap.subarray((n-32)*8,(n-32)*8+8)),'distinct lowercase '+String.fromCharCode(n));
for(const c of 'gjpqy')assert(bitmap[c.charCodeAt(0)*8+7],'descender '+c);
assert(!fs.existsSync('assets/fonts/scummvm-agi-font-source.h'));assert(!fs.existsSync('assets/fonts/sierra-agi.ttf'));
assert(html.includes('share-card-v2.png'));assert(fs.existsSync('assets/social/share-card-v2.png'));assert(!fs.existsSync('assets/social/share-card-v1.png'));
assert(read('.github/workflows/pages.yml').includes('cp assets/social/share-card-v2.png'));assert(!read('.github/workflows/pages.yml').includes('backups/'));
console.log('PASS original branding: both release entry points, story/parser sources, original font bytes and printable glyphs, social metadata/art and deployment inputs.');
