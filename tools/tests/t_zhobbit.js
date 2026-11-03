// (probe) RS-780: a hobbit's foot close up, from five sides, in boots and out; the boatyard and pond from the game's camera and near. Env ZH_TAG, ZH_TIER
module.exports = async page=>{ page.setDefaultTimeout(0); page.on('console', m=>{ if (m.type()==='error') console.log('CERR', m.text().slice(0, 300)); }); const tag = process.env.ZH_TAG || 'x';
  const info = await page.evaluate(async ({ tier })=>{ window.__noLock = true; if (tier!=null){ const ti = townInfo; townInfo = ()=>Object.assign({}, ti(), { tier }); } goToCharCreate(); ccSelectRace(RACES.findIndex(r=>r[0]==='Halfling')); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.hp = G.player.maxHp = 99999; G.player.clock = DAY_LENGTH*0.35;
    if (G.gameMode!==3 || G.villageRace!=='halfling'){ const t = townList().find(t=>(townFlavorAt(t.x, t.y)||{}).race==='halfling'); G.owPos = { x:t.x, y:t.y }; enterVillage(); setUi('playing'); }
    const t = performance.now() + 2500; while (performance.now() < t) await new Promise(r=>requestAnimationFrame(r));
    const b = VILLAGE_BUILDINGS.find(b=>b.key==='boatyard'), o = doorOut(b); G.player.x = o.x; G.player.y = o.y; if (V3.player && V3.player.g) V3.player.g.position.set(o.x + 0.5, 0, o.y + 0.5); if (V3.player) V3.player.at = [o.x, o.y]; const t2 = performance.now() + 1500; while (performance.now() < t2) await new Promise(r=>requestAnimationFrame(r));
    return { b:[b.x0, b.y0, b.w, b.h, b.door], out:o, gate:[TOWN_CX, ROWS - 1], cols:COLS, rows:ROWS, pond:shirePond() }; }, { tier:process.env.ZH_TIER ? +process.env.ZH_TIER : null });
  console.log('info', JSON.stringify(info));
  const R = async (nm, f, arg)=>{ const s = await page.evaluate(f, arg); require('fs').writeFileSync(__dirname + '/shots/zhobbit_' + tag + '_' + nm + '.jpg', Buffer.from(s.split(',')[1], 'base64')); };
  await R('game', ()=>new Promise(res=>requestAnimationFrame(()=>{ V3.renderer.render(V3.scene, V3.cam); res(V3.renderer.domElement.toDataURL('image/jpeg', 0.92)); })));
  const shot = ([dx, dy, dz, tx, ty, tz, fov])=>{ const T = THREE, c = new T.PerspectiveCamera(fov, V3.renderer.domElement.width/V3.renderer.domElement.height, 0.02, 300), p = V3.player.g.position, vis = []; V3.world.traverse(o=>{ if (/^shire(Grass|Flowers|Stems)/.test(o.name)){ vis.push(o); o.visible = false; } }); c.position.set(p.x + dx, p.y + dy, p.z + dz); c.lookAt(p.x + tx, p.y + ty, p.z + tz); V3.renderer.render(V3.scene, c); const u = V3.renderer.domElement.toDataURL('image/jpeg', 0.92); vis.forEach(o=>o.visible = true); return u; };
  await page.evaluate(()=>{ const e = V3.player.e; const lg = e && e.rig && e.rig.legs; window.__hipX = lg ? lg.map(L=>+L.hip.position.x.toFixed(3)) : null; });
  await R('front', shot, [0.15, 0.22, 0.55, 0, 0.07, 0.03, 30]);
  await R('side', shot, [0.6, 0.18, 0.1, 0, 0.07, 0.03, 30]);
  await R('top', shot, [0.05, 0.7, 0.3, 0, 0.02, 0.03, 28]);
  await R('body', shot, [0.5, 0.5, 1.6, 0, 0.4, 0, 30]);
  await R('pond', ({ })=>{ const T = THREE, c = new T.PerspectiveCamera(36, V3.renderer.domElement.width/V3.renderer.domElement.height, 0.1, 300), P = shirePond(); c.position.set(P.cx + 2.6, 2.4, P.cz + 3.4); c.lookAt(P.cx + 0.3, 0.1, P.cz - 0.5); V3.renderer.render(V3.scene, c); return V3.renderer.domElement.toDataURL('image/jpeg', 0.92); }, {});
};
