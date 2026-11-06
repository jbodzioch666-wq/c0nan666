// RS-599: the tavern's stairs walked - up the flight to the rooms over the bar, down the stairwell back to the bar, the room going dark
// on the way and coming off the far end of the other floor's stairs; and a canopy (the willow's open dome) casting its whole shadow.
// Shots: shots/rs599-up.png, shots/rs599-down.png
module.exports = async page=>{
  page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 200)));
  const wait = ms=>page.waitForTimeout(ms), out = {};
  await page.evaluate(async ()=>{ window.__trans = true; goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    const t = G.ow.spawnPos; G.owPos = { x:t.x, y:t.y }; enterVillage(); setUi('playing'); townClosedCheck = ()=>false; G.player.clock = DAY_LENGTH*10 + DAY_LENGTH*0.4;
    for (let i=0;i<60;i++) await new Promise(r=>requestAnimationFrame(r));
    enterInterior('tavern'); setUi('playing'); G.player.x = ROOM_STAIRS_LAND[0]; G.player.y = ROOM_STAIRS_LAND[1]; for (let i=0;i<90;i++) await new Promise(r=>requestAnimationFrame(r)); });
  Object.assign(out, await page.evaluate(()=>{ const k = G.interior.key, ok = townBench('stairs'); return { start:k, walking:!!V3.stair, ok }; }));
  await wait(750); Object.assign(out, await page.evaluate(()=>({ upMid:{ key:G.interior.key, y:+V3.player.g.position.y.toFixed(2), walking:!!V3.stair } })));
  await page.screenshot({ path: SHOTS + '/rs599-up.png' });
  await wait(4000);
  Object.assign(out, await page.evaluate(()=>({ upEnd:{ key:G.interior.key, y:+V3.player.g.position.y.toFixed(2), walking:!!V3.stair, arriving:!!V3.stairArr } })));
  Object.assign(out, await page.evaluate(()=>{ townBench('stairsdown'); return { downStart:!!V3.stair }; }));
  await wait(750); Object.assign(out, await page.evaluate(()=>({ downMid:{ key:G.interior.key, y:+V3.player.g.position.y.toFixed(2) } })));
  await page.screenshot({ path: SHOTS + '/rs599-down.png' });
  await wait(4000);
  Object.assign(out, await page.evaluate(()=>({ downEnd:{ key:G.interior.key, y:+V3.player.g.position.y.toFixed(2), walking:!!(V3.stair || V3.stairArr) } })));
  /* the willow: its leaves throw their shadow from both faces */
  Object.assign(out, await page.evaluate(()=>{ exitInterior(); G.gameMode = 0; const g = o3NodeTree('willow'); let side = null; g.traverse(o=>{ if (o.isMesh && o.material && /leaf_/.test(Object.keys(O3.nm||{}).find(k=>O3.nm[k]===o.material)||'')) side = o.material.shadowSide; }); return { willow:side===THREE.DoubleSide }; }));
  console.log(JSON.stringify(out));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(out)); };
  A(out.start==='tavern' && out.ok && out.walking, 'onto the stairs: the walk begins');
  A(out.upMid.key==='tavern' && out.upMid.y > 0.1, 'part way, up the flight, still in the bar: ' + JSON.stringify(out.upMid));
  A(out.upEnd.key==='tavern_up' && !out.upEnd.walking && !out.upEnd.arriving && Math.abs(out.upEnd.y) < 0.02, 'then upstairs, off the stairs onto the landing: ' + JSON.stringify(out.upEnd));
  A(out.downStart && out.downMid.key==='tavern_up' && out.downMid.y < -0.08, 'and down the stairwell: ' + JSON.stringify(out.downMid));
  A(out.downEnd.key==='tavern' && !out.downEnd.walking && Math.abs(out.downEnd.y) < 0.02, 'back in the bar: ' + JSON.stringify(out.downEnd));
  A(out.willow, 'the willow\'s canopy throws its whole shadow');
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
