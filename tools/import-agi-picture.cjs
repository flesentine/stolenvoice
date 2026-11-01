// Apply a JSON project downloaded from the editor as the game's gallery source.
// Artwork/game rebuilds are explicit next steps so an import never conceals a
// failed dependency or build behind a successful file copy.
const fs=require('fs'),path=require('path'),Agi=require('../editor/agi-picture.js');
const input=process.argv[2];
if(!input){console.error('Usage: node tools/import-agi-picture.cjs /path/to/agi-picture.json');process.exit(2)}
const project=Agi.project(JSON.parse(fs.readFileSync(path.resolve(input),'utf8')));
project.palette=[...Agi.palette];
const room=process.argv[3]||project.room||'gallery';
if(!['gallery','potting','orchard','bridge','mill','grotto','belfry','courtyard'].includes(room))throw Error('Unknown room project');
project.room=room;
const target=path.resolve(__dirname,'../assets/rooms/'+room+'-workshop-v1.json');
const backup=target.replace('.json','-backup-'+new Date().toISOString().replace(/[:.]/g,'-')+'.json');
if(fs.existsSync(target))fs.copyFileSync(target,backup);
fs.writeFileSync(target,JSON.stringify(project,null,2)+'\n');
console.log('Imported '+project.commands.length+' commands. Previous project saved at '+backup);
console.log('Rebuild with tools/trace-room-art.cjs, tools/build-expanded-adventure.cjs and tools/build-agi-editor.cjs.');
