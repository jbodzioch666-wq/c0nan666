// FP-008: through your eyes a town on the land stands at full size, with its wall a few tiles out; leaving a town puts you
// outside its gate, its wall stops you but for the gate, and walking in at the gate takes you into the town. Rooms have ceilings.
// Shots: shots/fp008-town.jpg (the town from outside its gate), shots/fp008-ceiling.jpg (the tavern looking up)
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
  const ev = (f, a)=>page.evaluate(f, a), wait = ms=>ev(async ms=>{ const t = performance.now() + ms; while (performance.now() < t){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); } }, ms);
  await ev(()=>{ window.__noLock = true; goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.player.hp = G.player.maxHp = 99999;
    if (G.gameMode!==3){ const t = townList()[0]; G.gameMode = 0; G.owPos = { x:t.x, y:t.y }; enterVillage(); setUi('playing'); } G.interior = null; G.player.clock = DAY_LENGTH*0.4; });
  await wait(1200); const town = await ev(()=>(window.__town = { x:G.owPos.x, y:G.owPos.y })); await page.keyboard.press('o'); await wait(600);

  /* ---- a room has a ceiling ---- */
  await ev(()=>{ enterInterior('tavern'); setUi('playing'); const p = G.player; for (let d=4; d>0; d--) if (tileOpen(p.x, p.y-d)){ p.y -= d; break; } }); await wait(2000);
  const ceil = await ev(()=>{ let n = 0; V3.world.traverse(o=>{ if (o.isMesh && o.geometry && o.geometry.parameters){ const w = o.getWorldPosition(new THREE.Vector3()), q = o.geometry.parameters; if (w.y > 2.6 && q.width > 5 && q.depth > 5) n++; } }); return n; });
  A(ceil >= 1, 'the tavern has a ceiling through your eyes: ' + ceil);
  await ev(()=>{ FP.lookF = G.player.facing; FP.lookYaw = fpvYawNow(); FP.pitch = 0.7; }); await wait(500); await ev(()=>{ FP.lookYaw = fpvYawNow(); FP.pitch = 0.7; }); await wait(100);
  await page.screenshot({ path:SHOTS + '/fp008-ceiling.jpg', type:'jpeg', quality:82 });
  await ev(()=>{ FP.lookYaw = null; FP.pitch = 0; exitInterior(); setUi('playing'); }); await wait(800);

  /* ---- out of the town: outside its gate ---- */
  await ev(()=>{ G.interior = null; G.gameMode = 0; setUi('playing'); }); await wait(2500);
  const o1 = await ev(()=>{ const l = o3L(window.__town.x, window.__town.y), f = o3TownFoot(l[0], l[1]), d = Math.hypot(FPM.x - f.cx, FPM.y - f.cz);
    let hb = 0; for (const h of O3.hits) if (h.userData.act && h.userData.act.kind==='site' && h.userData.act.x===window.__town.x && h.userData.act.y===window.__town.y) hb = h.geometry.parameters.width;
    return { mode:G.gameMode, pos:G.owPos, on:fpvLand(), r:f.r, d, open:f.open, hb, ga:f.ga, gate:Math.abs(Math.atan2(Math.sin(Math.atan2(FPM.y - f.cz, FPM.x - f.cx) - f.ga), Math.cos(Math.atan2(FPM.y - f.cz, FPM.x - f.cx) - f.ga))) }; });
  A(o1.mode===0 && o1.on, 'out on the land through your eyes');
  A(o1.r > 2.5 && Math.abs(o1.hb - o1.r*2) < 0.01, 'the town stands at full size: its wall ' + o1.r.toFixed(2) + ' tiles out, its tap box ' + o1.hb);
  A(o1.d > o1.r + 0.5 && (o1.pos.x!==town.x || o1.pos.y!==town.y), 'you come out outside its wall, off its tile: ' + JSON.stringify(o1));
  A(o1.open || o1.gate < 0.6, 'at its gate: ' + o1.gate.toFixed(2));
  /* its wall stops you but for the gate */
  const pen = await ev(()=>{ const l = o3L(window.__town.x, window.__town.y), f = o3TownFoot(l[0], l[1]), at = (a, d)=>{ const s = FPM.x, t = FPM.y; return fpmPen(f.cx + Math.cos(a)*d, f.cz + Math.sin(a)*d); };
    return { open:f.open, wall:at(f.ga + Math.PI, f.r - 0.2), gate:at(f.ga, f.r - 0.2) }; });
  A(pen.open || (pen.wall > 0.3 && pen.gate < 0.3), 'the wall is solid, the gate open: ' + JSON.stringify(pen));
  /* look at it */
  await ev(()=>{ const l = o3L(window.__town.x, window.__town.y), f = o3TownFoot(l[0], l[1]), a = Math.atan2(f.cz - FPM.y, f.cx - FPM.x); G.player.facing = fpvQuarter(a); FP.lookF = G.player.facing; FP.lookYaw = a; FP.pitch = 0.08; });
  await wait(1200); await ev(()=>{ const l = o3L(window.__town.x, window.__town.y), f = o3TownFoot(l[0], l[1]); FP.lookYaw = Math.atan2(f.cz - FPM.y, f.cx - FPM.x); }); await wait(200);
  await page.screenshot({ path:SHOTS + '/fp008-town.jpg', type:'jpeg', quality:82 });
  /* and walk in at the gate */
  await page.keyboard.down('w'); const t0 = Date.now(); let inT = false;
  while (Date.now() - t0 < 9000){ await wait(80); await ev(()=>{ if (G.gameMode===0 && FP.lookYaw!=null){ const l = o3L(window.__town.x, window.__town.y), f = o3TownFoot(l[0], l[1]); FP.lookYaw = Math.atan2(f.cz - FPM.y, f.cx - FPM.x); } }); if (await ev(()=>G.gameMode===3)){ inT = true; break; } }
  await page.keyboard.up('w');
  const o2 = await ev(()=>({ mode:G.gameMode, pos:G.owPos, d:G.gameMode===0 ? (()=>{ const l = o3L(window.__town.x, window.__town.y), f = o3TownFoot(l[0], l[1]); return Math.hypot(FPM.x - f.cx, FPM.y - f.cz); })() : 0 }));
  A(inT && o2.pos.x===town.x && o2.pos.y===town.y, 'walking in at the gate takes you into the town: ' + JSON.stringify(o2));
  A(!errs.length, 'page errors: ' + errs.join(' | '));
};
