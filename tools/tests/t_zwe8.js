// (art probe, not in ALL) the face sliders on the creator's sculpted head: every slider at 0, at the default and at 1 (ZW_ONE: one slider at 1, the rest default;
// ZW_RACE the race, ZW_FEM 1 for a woman), the head close from the front and the side: shots/zwe8_<set>_<view>.png
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const race = +(process.env.ZW_RACE || 0), one = process.env.ZW_ONE || '', fem = process.env.ZW_FEM==='1', drawn = process.env.ZW_DRAWN==='1';
  if (drawn) await page.evaluate(()=>{ tpOn = ()=>false; });
  await page.evaluate(([race, fem])=>{ goToCharCreate(); renderOverlay(); ccSelectRace(race); const L = lookTarget(); L.beard = 0; L.beardStyle = 0; if (fem) L.body = 1; }, [race, fem]);
  const sets = one ? [['lo', 0], ['mid', null], ['hi', 1]] : [['lo', 0], ['mid', null], ['hi', 1]];
  for (const [name, v] of sets){
    const r = await page.evaluate(async ([v, one])=>{ const L = lookTarget(); L.fc = {}; if (v!=null) for (const [k] of LOOK_FACE) if (!one || k===one) L.fc[k] = v; lookBodyTouched(); let k = 0; do { await new Promise(r=>requestAnimationFrame(r)); } while ((LP.pend || !LP.e) && k++ < 900);
      for (let i=0;i<3;i++) await new Promise(r=>requestAnimationFrame(r)); const e = LP.e, hm = e.tp && e.tp.meshes.find(m=>/\.head$/.test(m.name)); return { tp:!!(e && e.tp), face:document.body.innerHTML.includes('lookFaceRandom()'), faceGeo:!!(hm && Object.keys(TPB.geo).some(k2=>TPB.geo[k2]===hm.geometry && k2.includes('|face|'))) }; }, [v, one]);
    console.log(name, JSON.stringify(r));
    for (const [view, yaw] of [['front', 0], ['side', Math.PI/2], ['three', 0.7]]){
      await page.evaluate(async yaw=>{ LP.yaw = yaw; LP.zoom = 5; LP.panY = null; for (let i = 0; i < 4; i++) await new Promise(r=>requestAnimationFrame(r)); }, yaw);
      await (await page.$('#lpSlot canvas')).screenshot({ path:__dirname + '/shots/zwe8_' + (drawn ? 'D' : '') + (one || 'all') + '_' + name + '_' + view + '.png' }); } }
  if (errs.length) throw new Error('page errors: ' + errs.join(' | '));
};
