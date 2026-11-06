// (probe, not in ALL) walking into a building and out again: frames part way through, the door's hinge, the phases
module.exports = async page=>{
  page.setDefaultTimeout(0);
  const info = await page.evaluate(async ()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    const t = G.ow.spawnPos; G.owPos = { x:t.x, y:t.y }; enterVillage(); setUi('playing'); townClosedCheck = ()=>false; G.player.clock = DAY_LENGTH*10 + DAY_LENGTH*0.3;
    for (let i=0;i<200;i++){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); }
    const b = VILLAGE_BUILDINGS.find(b=>b.key==='tavern'), d = b.door; G.player.x = d.x; G.player.y = d.y + 1; for (let i=0;i<30;i++){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); }
    const pv = V3.doors && V3.doors.tavern; const out = { keys:Object.keys(V3.doors||{}), pv:!!pv, inScene:(()=>{ let o = pv, n = 0; while (o){ if (o===V3.scene) return true; o = o.parent; n++; } return false; })(), kids:pv ? pv.children.length : 0, sgn:pv && pv.userData.sgn, mAuto:pv && pv.matrixAutoUpdate, wAuto:pv && pv.matrixWorldAutoUpdate };
    let par = pv && pv.parent, chain = []; while (par){ chain.push((par.name||par.type) + (par.matrixWorldAutoUpdate===false ? '!W' : '') + (par.matrixAutoUpdate===false ? '!M' : '')); par = par.parent; } out.chain = chain.slice(0, 6);
    return out; });
  console.log(JSON.stringify(info));
  await page.evaluate(()=>{ window.__shotT = []; tryMove(0, -1); });
  for (const [i, ms] of [[0, 120], [1, 150], [2, 150], [3, 300]].map((x, k)=>x)){ await page.waitForTimeout(ms); await page.screenshot({ path: SHOTS + '/zdoor-in' + i + '.png' }); }
  const mid = await page.evaluate(()=>({ door:V3.door && { phase:V3.door.phase, t:+V3.door.t.toFixed(2) }, interior:!!G.interior, rot:V3.doors && V3.doors.tavern ? +V3.doors.tavern.rotation.y.toFixed(2) : null }));
  console.log(JSON.stringify(mid));
};
