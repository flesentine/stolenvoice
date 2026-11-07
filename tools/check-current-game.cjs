// Current maintained acceptance suites. Keep successful terminal output short;
// full diagnostics are retained in a unique temporary directory on each run.
const fs=require('fs'),os=require('os'),path=require('path'),cp=require('child_process');
const root=path.resolve(__dirname,'..');
const suites=[
 'standalone-build','original-branding','save-files','playtest-recording',
 'mobile-controls',
 'mobile-autocomplete',
 'mobile-key-hit-test',
 'sound-playback',
 'royal-raspberry',
 'grotto-music',
 'elara-dance',
 'mirror-curtsy',
 'bridge-fall-direction',
 'bridge-fall-priority',
 'chair-rest',
 'barrel-prank',
 'barrel-trace',
 'orchard-bee-animation',
 'window-jump',
 'bee-sting-reaction',
 'bee-dance',
 'hive-kick-trace',
 'apple-prank',
 'hive-three-stings',
 'belfry-railing',
 'bell-priority',
 'orchard-tree-details',
 'expanded-adventure','room-flow','parser-acceptance','animation-lifecycle',
 'inventory-selection','parser-inventory','inventory-cheat','garden-calling-bell','workshop-key','mill-sluice','lost-harmony','bell-pull',
 'hive-minigame','hive-flight','hive-priority','river-water','merrin-refusals',
 'bridge-commands','bridge-fall','bridge-footing','upstream-swim-return',
 'single-bridge-plank','room-hints','merrin-memory','optional-secret',
 'scenery-reactions','playful-intents','world-life','merrin-ending','opening-prologue','prologue-bonnet','chest-hand-outline','workshop-barrel','arrow-chords','playtest-audio','hive-disaster','kiss-performance','workshop-rat-trace'
];
const logs=fs.mkdtempSync(path.join(os.tmpdir(),'kq1-review-'));let failed=0;
for(const suite of suites){
 const name='check-'+suite,start=Date.now();
 const result=cp.spawnSync(process.execPath,[path.join(__dirname,name+'.cjs')],{cwd:root,encoding:'utf8',timeout:180000});
 const file=path.join(logs,name+'.log');fs.writeFileSync(file,(result.stdout||'')+(result.stderr||'')+(result.error?'\n'+result.error.message:''));
 const ok=result.status===0;if(!ok)failed++;
 console.log(`${ok?'PASS':'FAIL'} ${suite} (${((Date.now()-start)/1000).toFixed(1)}s)${ok?'':' — '+file}`);
}
console.log(`${suites.length-failed}/${suites.length} suites passed. Logs: ${logs}`);
process.exitCode=failed?1:0;
