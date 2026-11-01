// Validate without executing the game, then replace the final artifact in one
// rename. A failed validation/write must leave the previous game untouched.
const fs=require('fs'),path=require('path'),vm=require('vm'),{randomUUID}=require('crypto');
module.exports=function writeStandalone(output,html,requiredFunctions=[]){
 const scripts=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
 if(scripts.length!==1)throw Error('Expected exactly one inline game script: '+output);
 const script=scripts[0][1];
 new vm.Script(script,{filename:path.basename(output)+':game'});
 for(const name of requiredFunctions){
  if(!new RegExp('\\bfunction '+name+'\\s*\\(').test(script))throw Error('Missing generated game function: '+name);
 }
 const temporary=output+'.tmp-'+randomUUID();
 try{
  fs.writeFileSync(temporary,html,{encoding:'utf8',flag:'wx'});
  fs.renameSync(temporary,output);
 }finally{fs.rmSync(temporary,{force:true})}
};
