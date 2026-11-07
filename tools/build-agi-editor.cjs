const fs=require('fs'),path=require('path');
const vm=require('vm');
const root=path.resolve(__dirname,'..'),read=name=>fs.readFileSync(path.join(root,name),'utf8');
new vm.Script(read('editor/workshop.js'),{filename:'workshop.js'});
const project=JSON.stringify(JSON.parse(read('assets/rooms/gallery-workshop-v1.json'))).replace(/</g,'\\u003c');
const library={};for(const room of ['gallery','potting','orchard','bridge','mill','grotto','belfry','courtyard'])library[room]=JSON.parse(read('assets/rooms/'+room+'-workshop-v1.json'));
library['prologue-closeup']=JSON.parse(read('assets/rooms/prologue-closeup-workshop-v1.json'));
library.opening=JSON.parse(read('assets/opening/opening-workshop-v1.json'));
library['merrin-ending']=JSON.parse(read('assets/rooms/merrin-ending-workshop-v2.json'));
const inventory=JSON.parse(read('assets/inventory/manifest.json'));
for(const file of inventory.projects){const item=JSON.parse(read('assets/inventory/'+file));library['item-'+item.name.replaceAll(' ','-')]=item;}
const inventoryOptions=inventory.names.map(name=>'<option value="item-'+name.replaceAll(' ','-')+'">Inventory: '+name+'</option>').join('');
let animationOptions='';
for(const direction of ['left','right','back','front'])for(let frame=0;frame<4;frame++){const key='swim-'+direction+'-'+frame;library[key]=JSON.parse(read('assets/swimming/'+direction+'-'+frame+'.json'));animationOptions+='<option value="'+key+'">Swim: '+direction+' '+(frame+1)+'</option>';}
const libraryJSON=JSON.stringify(library).replace(/</g,'\\u003c');
const spriteSource=read('stolen-voice-short.html');
const sprites=JSON.parse(read('assets/elara-walk-stable-face-v2.json')).views;
const spriteColors=JSON.parse(spriteSource.match(/const elaraColors=(\[[^\n]+\]);/)[1]);
const heroJSON=JSON.stringify({rows:sprites.front[1],colors:spriteColors});
const html=read('editor/workshop.template.html').replace('</select></label>','<option value="opening">Opening: Elara and the Stolen Voice</option>'+'<option value="prologue-closeup">Intro: Merrin polishing the mirror</option><option value="merrin-ending">Ending: Merrin singing</option>'+inventoryOptions+animationOptions+'</select></label>').replace('<label>Room <select','<label>Project <select').replace('__PROJECT__',()=>project).replace('__LIBRARY__',()=>libraryJSON).replace('__HERO__',()=>heroJSON).replace('__RENDERER__',()=>read('editor/agi-picture.js')).replace('__EDITOR__',()=>read('editor/workshop.js'));
fs.writeFileSync(path.join(root,'editor/index.html'),html);
console.log('Built standalone AGI editor with eight rooms, '+inventory.names.length+' inventory objects, sixteen swim cels and shared renderer.');
