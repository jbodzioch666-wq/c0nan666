// probe: a sword and a kite shield through your eyes on the land: the left hand before chopping, while, and after
module.exports = async page=>{ page.setDefaultTimeout(0); page.on('pageerror', e=>console.log('PAGEERR', String(e).slice(0, 300)));
  const ev = (f, a)=>page.evaluate(f, a), wait = ms=>ev(async ms=>{ const t = performance.now() + ms; while (performance.now() < t){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); } }, ms);
  await ev(()=>{ window.__noLock = true; window.__trans = true; goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.player.hp = G.player.maxHp = 99999;
    G.player.clock = DAY_LENGTH*0.4; const t = townList()[0]; G.interior = null; G.gameMode = 0; G.mon = []; const P = skP(); P.tools = P.tools || {}; P.tools.axe = 1;
    for (const [dx, dy] of [[0,6],[6,0],[0,-6],[-6,0],[7,7],[-7,-7]]){ const x = t.x+dx, y = t.y+dy; if (G.ow.map[x] && G.ow.map[x][y]!==OW_WATER && o3Passable(x, y) && !owSiteKindAt(x, y) && o3Passable(x+1, y)){ G.owPos = { x, y }; break; } } setUi('playing');
    G.gear.offhand = rsMakeArmour('metal', 3, 'offhand'); G.gear.offhand.used = true; });
  await wait(1500); await page.keyboard.press('o'); await ev(()=>{ rsFightNow = ()=>G.ui==='playing'; }); await wait(1500);
  const st = tag=>ev(tag=>{ const e = O3.player.e, r = e.rig; let wv = true; for (let o = r.shield; o; o = o.parent) if (!o.visible) wv = false;
    return JSON.stringify({ tag, offKind:FPW.offKind, offG:!!FPW.offG, offInScene:!!(FPW.offG && FPW.offG.parent), offVis:FPW.offG ? FPW.offG.visible : null, figShield:!!r.shield, shieldVis:r.shield && r.shield.visible, shieldWorldVis:wv, sheathed:r.sheathed, shK:r.shK, toolKey:e.toolKey, key:FPW.wkey && FPW.wkey.slice(-60), style:FPW.style, work:FPW.work }); }, tag).then(console.log);
  await st('before'); console.log('COPY', await ev(()=>{ const T = THREE, o = []; FPW.offG.traverse(m=>{ if (m.isMesh){ m.geometry.computeBoundingBox(); const b = m.geometry.boundingBox; o.push([m.geometry.type, m.geometry.attributes.position.count, m.visible, m.material.visible!==false, +(b.max.x-b.min.x).toFixed(3), +(b.max.y-b.min.y).toFixed(3), +(b.max.z-b.min.z).toFixed(3), m.userData.fpwShared?1:0, m.material.opacity]); } }); const bb = new T.Box3().setFromObject(FPW.offG); return JSON.stringify({ o, bb:[bb.min, bb.max] }); })); await page.screenshot({ path:'tools/tests/out/zfpshield0.png' });
  await ev(()=>{ G.gather = { o:{ k:'woodcutting', label:'w', at:{ x:G.owPos.x + 1, y:G.owPos.y } }, iv:900000, next:performance.now()+600000, pos:G.owPos.x+','+G.owPos.y, mode:0, n:0, last:'start' }; G.player.facing = 2; });
  await wait(2000); await st('chopping');
  await ev(()=>{ skStop(); G.gather = null; }); await wait(300); await st('stopped+0.3');
  await wait(2000); await st('stopped+2.3');
  await page.screenshot({ path:'tools/tests/out/zfpshield.png' });
};
