// RS-862: the crafting stations and the tavern's bench made properly - every station's parts with turned edges and round parts truly
// round (no plain box, no cylinder under 20 sides but the forge's square hood); the anvil a shaped body on a bound stump, the forge with an
// arched mouth, a round flue, coals and bellows, the carpenter's bench of boards with stretchers, a vice, a toothed saw and shavings; the
// tavern's bench on trestle legs. Shots: shots/rs862-smith.png, rs862-boatyard.png, rs862-bench.png
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const A = (c, m, d)=>{ if (!c) throw new Error(m + ' :: ' + JSON.stringify(d)); };
  const shot = async (k, nm)=>{ const ok = await page.evaluate(async k=>{ if (!VILLAGE_BUILDINGS.some(b=>b.key===k)) return false; if (G.interior) exitInterior(); enterInterior(k); setUi('playing'); G.player.x = 10; G.player.y = 9; V3.dist = 9; for (let i=0;i<30;i++){ renderGame(); await new Promise(r=>setTimeout(r, 25)); } return true; }, k); if (ok) await page.screenshot({ path: SHOTS + '/rs862-' + nm + '.png' }); };
  const r = await page.evaluate(async ()=>{ const w = ms=>new Promise(r=>setTimeout(r, ms)), out = { bad:{} };
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.clock = Math.round(0.45*DAY_LENGTH) + 3*DAY_LENGTH;
    const t = townList()[0]; G.owPos = { x:t.x, y:t.y }; enterVillage(); setUi('playing'); townClosedCheck = ()=>false; for (let i=0;i<10;i++){ renderGame(); await w(25); }
    const T = THREE, mats = V3.mats, keys = ['anvil','furnace','carpentry','cauldron','hearth','loom','spinning','fletching','leather','tanning','gemcut','jeweller','kiln','sawpit','ropewalk','slipway','barber','grange','wheel','staves'];
    for (const k of keys){ const g = new T.Group(); try{ v3Bench(k, 0, 0, mats, g, 0); }catch(e){ out.bad[k] = 'threw ' + String(e).slice(0, 120); continue; }
      let plain = 0, thin = [], n = 0; const rbs = new Set(Object.values(V3_RB)); g.traverse(o=>{ if (!o.isMesh) return; n++; const G2 = o.geometry; if (G2.type==='BoxGeometry' && !rbs.has(G2)) plain++; if (G2.type==='CylinderGeometry' && G2.parameters.radialSegments < 20 && G2.parameters.radialSegments !== 4 && G2.parameters.radiusTop > 0.012) thin.push(G2.parameters.radialSegments + '@' + G2.parameters.height.toFixed(2)); });
      if (plain || thin.length || !n) out.bad[k] = { plain, thin, n }; if (k==='anvil'){ let ex = 0; g.traverse(o=>{ if (o.isMesh && o.geometry===townV3Bench.anvil) ex++; }); out.anvil = ex; }
      if (k==='furnace'){ let tor = 0, dod = 0; g.traverse(o=>{ if (o.isMesh && o.geometry.type==='TorusGeometry') tor++; if (o.isMesh && o.geometry.type==='DodecahedronGeometry') dod++; }); out.furnace = { tor, dod }; }
      if (k==='carpentry'){ let saw = 0, sh = 0; g.traverse(o=>{ if (o.isMesh && o.geometry.type==='ExtrudeGeometry') saw++; if (o.isMesh && o.geometry.type==='TorusGeometry') sh++; }); out.carp = { saw, sh }; } }
    /* the tavern's bench out in the street */ let legs = 0, slab = 0; V3.world.traverse(o=>{ if (!o.isMesh) return; const p = o.getWorldPosition(new T.Vector3()); if (Math.abs(p.x - 8.2) > 0.7 || Math.abs(p.z - 7.4) > 0.4 || p.y > 0.6) return; const P = o.geometry.parameters; if (P && o.geometry.type==='BoxGeometry' && Math.abs(P.width - 1.2) < 1e-3) slab++; if (P && Math.abs(P.height - 0.46) < 1e-3) legs++; });
    out.street = { legs, slab };
    /* the wood's grain: a straight-grain canvas, laid along each piece of the gate */ const gp = new T.Group(); v3Palisade(mats, gp); v3GrainFix(gp); let gr = 0, wd = 0; gp.traverse(o=>{ if (o.isMesh && o.material && o.material.map && o.material.map.userData.grain){ wd++; if (o.geometry.userData.grained) gr++; } });
    out.grain = { tex:!!mats.wood.map.userData.grain, size:mats.wood.map.image.width, wd, gr };
    return out; });
  console.log(JSON.stringify(r)); A(errs.length===0, errs.join('|'));
  A(Object.keys(r.bad).length===0, 'stations with plain boxes or thin cylinders', r.bad);
  A(r.anvil===1, 'the anvil body', r); A(r.furnace.tor >= 1 && r.furnace.dod >= 6, 'the forge arch and coals', r.furnace); A(r.grain.tex && r.grain.size===512 && r.grain.wd > 10 && r.grain.gr >= r.grain.wd - 2, 'the wood grain', r.grain); A(r.carp.saw >= 1 && r.carp.sh >= 4, 'the carpenter bench', r.carp);
  await shot('smith', 'smith'); await shot('boatyard', 'boatyard'); await shot('alch', 'alch');
  await page.evaluate(async ()=>{ if (G.interior) exitInterior(); setUi('playing'); G.player.x = 8; G.player.y = 9; V3.dist = 6; for (let i=0;i<30;i++){ renderGame(); await new Promise(r=>setTimeout(r, 25)); } });
  await page.screenshot({ path: SHOTS + '/rs862-bench.png' });
  await page.evaluate(async ()=>{ G.player.x = TOWN_CX; G.player.y = ROWS - 5; V3.dist = 7; for (let i=0;i<30;i++){ renderGame(); await new Promise(r=>setTimeout(r, 25)); } });
  await page.screenshot({ path: SHOTS + '/rs862-gate.png' });
  await page.evaluate(async ()=>{ const b = VILLAGE_BUILDINGS.find(b=>b.door) || VILLAGE_BUILDINGS[0]; G.player.x = b.door.x; G.player.y = b.door.y + 2; V3.dist = 5; for (let i=0;i<30;i++){ renderGame(); await new Promise(r=>setTimeout(r, 25)); } });
  await page.screenshot({ path: SHOTS + '/rs862-house.png' }); };
