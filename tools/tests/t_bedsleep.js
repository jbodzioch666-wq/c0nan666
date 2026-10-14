// RS-389: renting a bed (or sleeping in your own) is seen: you lie down in it, the room fades out, the night passes and you
// wake in the morning light - the room built afresh so its windows show the day - then get up beside the bed
module.exports = async page=>{
  const S = '/tmp/claude-0/-home-user-c0nan666/3bb54428-39f0-502a-8d60-2c5df0a710a2/scratchpad';
  const step = async (n)=>page.evaluate(async (n)=>{ for (let i=0;i<n;i++){ renderGame(); await new Promise(r=>setTimeout(r, 30)); } }, n);
  const r0 = await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    const p = G.player; p.clock = DAY_LENGTH*5 + DAY_LENGTH*0.85; p.gold = 100; enterVillage(); setUi('playing'); enterInterior('tavern'); setUi('playing'); townFloor('tavern_up', ROOM_STAIRS_LAND[0], ROOM_STAIRS_LAND[1]); setUi('playing');
    for (let i=0;i<10;i++){ renderGame(); await new Promise(r=>setTimeout(r, 30)); }
    const bed = ROOM_LAYOUT.tavern_up.benches.find(b=>b[0]==='innbed'); p.x = bed[1] + 1; p.y = bed[2] + 1; for (let i=0;i<10;i++){ renderGame(); await new Promise(r=>setTimeout(r, 30)); }
    const glassDay = ()=>{ let c = null; V3.world.traverse(o=>{ if (o.isMesh && o.material && o.material.emissive && o.geometry.type==='BoxGeometry' && Math.abs(o.geometry.parameters.width - 0.9) < 1e-6 && Math.abs(o.geometry.parameters.height - 0.9) < 1e-6) c = o.material.color.getHex(); }); return c; };
    const out = { night:isNightTime(), glass0:glassDay(), bed:[bed[1], bed[2]] };
    G.benchXY = [bed[1], bed[2] + 1]; townBench('innbed'); out.fx = !!G.sleepFx; out.gold = p.gold;
    window.__glassDay = glassDay; return out; });
  await step(5);
  const r1 = await page.evaluate(()=>{ const P = V3.player; P.g.updateMatrixWorld(true); const up = new THREE.Vector3(0, 1, 0).applyQuaternion(P.g.getWorldQuaternion(new THREE.Quaternion())); const c0 = G.player.clock; moveDir(1, 0); return { lying:+up.y.toFixed(2), y:+P.g.position.y.toFixed(2), still:G.player.clock===c0 && !!G.sleepFx, fade:V3.fadeEl ? +V3.fadeEl.style.opacity : 0 }; });
  await page.screenshot({ path:S+'/s389-lying.png', timeout:150000 });
  await page.evaluate(async ()=>{ for (let i=0;i<300 && G.sleepFx;i++){ renderGame(); await new Promise(r=>setTimeout(r, 30)); } for (let i=0;i<10;i++){ renderGame(); await new Promise(r=>setTimeout(r, 30)); } });
  const r2 = await page.evaluate(()=>{ const P = V3.player; P.g.updateMatrixWorld(true); const up = new THREE.Vector3(0, 1, 0).applyQuaternion(P.g.getWorldQuaternion(new THREE.Quaternion())); return { done:!G.sleepFx, day:!isNightTime(), phase:+dayPhase().toFixed(3), glass1:window.__glassDay(), upright:+up.y.toFixed(2), fade:V3.fadeEl ? +V3.fadeEl.style.opacity : 0, hp:G.player.hp===effMaxHp() }; });
  await page.screenshot({ path:S+'/s389-morning.png', timeout:150000 });
  const r = { r0, r1, r2 }; console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r0.night && r0.fx && r0.gold===85, 'at night you pay for the bed and climb in');
  A(Math.abs(r1.lying) < 0.15 && r1.y > 0.3 && r1.still, 'you lie down on it, and moving does nothing while you sleep');
  A(r2.done && r2.day && r2.phase > 0.24 && r2.phase < 0.32 && r2.hp, 'you wake fully rested just after dawn');
  A(r2.glass1 > r0.glass0*20, 'the windows show the day: their glass is the bright daytime glass');
  A(r2.upright > 0.95 && r2.fade===0, 'and you get up, the fade gone');
};
