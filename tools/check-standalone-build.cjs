const fs=require('fs'),os=require('os'),path=require('path'),assert=require('assert/strict');
const writeStandalone=require('./lib/write-standalone.cjs');
const directory=fs.mkdtempSync(path.join(os.tmpdir(),'kq1-build-check-')),output=path.join(directory,'game.html');
const old='<script>function game(){return 1}</script>';
try{
 fs.writeFileSync(output,old);
 for(const invalid of ['<script>function game( {</script>','<p>missing script</p>','<script></script><script></script>','<script>function wrong(){}</script>']){
  assert.throws(()=>writeStandalone(output,invalid,['game']));
  assert.equal(fs.readFileSync(output,'utf8'),old,'failed build preserves previous artifact');
  assert.deepEqual(fs.readdirSync(directory),['game.html'],'failed build leaves no temporary artifact');
 }
 const good='<script>function game(){throw Error("must not execute during build")}</script>';
 writeStandalone(output,good,['game']);assert.equal(fs.readFileSync(output,'utf8'),good);
 // A rename failure also cleans its temporary file and preserves the target.
 const blocked=path.join(directory,'directory.html');fs.mkdirSync(blocked);
 assert.throws(()=>writeStandalone(blocked,good,['game']));assert(fs.statSync(blocked).isDirectory());
 assert.deepEqual(fs.readdirSync(directory).sort(),['directory.html','game.html']);
 console.log('PASS standalone build: syntax/module validation, previous artifact preserved, no execution, atomic replacement and failure cleanup.');
}finally{fs.rmSync(directory,{recursive:true,force:true})}
