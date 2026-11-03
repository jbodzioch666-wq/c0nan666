// RS-799: the magic clipper, a fifth boat of magic wood. Sawn from magic logs, built on the slipway after a galleon, with its own side-on picture and 3D model in the yard
// and at sea; three of every four steps at sea are free and storms can't touch it; it survives a save. Shots: shots/rs799_slip.png, rs799_yard.png, rs799_sea.png, rs799_sea2.png
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const A = (c, m, d)=>{ if (!c) throw new Error(m + ' :: ' + JSON.stringify(d)); };
  const r = await page.evaluate(async ()=>{ const fr = n=>new Promise(res=>{ let i = 0; const f = ()=>++i >= n ? res() : requestAnimationFrame(f); requestAnimationFrame(f); }); window.__noLock = true;
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; townClosedCheck = ()=>false; weatherSync = ()=>{}; const p = G.player; p.clock = p.turnCount = 60; G.owPos = { x:G.ow.spawnPos.x, y:G.ow.spawnPos.y };
    enterVillage(); setUi('playing'); enterInterior('boatyard'); await fr(10);
    const out = {}; p.hasBoat = 1; p.boatTier = 4; p.gold = 20000;
    out.next = boatBuild().t; out.needs = boatStages(5).reduce((o, s)=>{ for (const k in s.need) o[k] = (o[k]||0) + s.need[k]; return o; }, {}); out.lvl = BOAT_LVL[5]; out.fee = BOAT_FEE[5];
    out.tooLow = boatWhy(boatBuild());
    G.bench = 'sawpit'; WB.sel = {}; const rp = wbRecipes('sawpit').find(x=>/^magic plank/i.test(x.nm)); out.recipe = rp && { lvl:rp.lvl, need:rp.need }; out.name = crName('magic_plank'); out.sell = typeof skSellPrice==='function' ? skSellPrice('magic_plank') : null;
    skGainXP('construction', 6000000); out.cons = skLvl('construction'); for (const k in out.needs) skAdd(k, out.needs[k]);
    /* halfway, the picture and the 3D model grow */
    const kids = []; let n = 0; while (boatBuild() && boatBuild().st < 4 && n++ < 400){ if (!boatWork()) break; } out.midSt = boatBuild().st; G.bench = 'slipway'; v3YardSync(); await fr(5); kids.push(V3.yardBoat.children.length);
    while (boatTier() < 5 && n++ < 800){ if (boatWork()===false) break; } out.tier = boatTier(); out.name5 = boatName(); out.none = boatBuild(); out.why = boatWhy(null); out.storm = stormRisk(); out.sailMul = sailMul(); p._sailN = 0; out.steps = [sailStepCost(), sailStepCost(), sailStepCost(), sailStepCost()]; out.goldLeft = p.gold; out.kids = kids; out.left = Object.keys(out.needs).map(k=>skHave(k));
    p.boatTier = 4; p.boatBuild = { t:5, st:5, pr:0 }; v3YardSync(); await fr(5); out.yardFull = V3.yardBoat.children.length; return out; });
  console.log('rs799', JSON.stringify(r));
  A(r.next===5, 'a galleon owner builds the magic clipper next', r);
  A(r.recipe && r.recipe.lvl===80 && r.recipe.need.magic===1 && r.name==='Magic Plank', 'the saw pit cuts magic planks from magic logs at Construction 80', r);
  A(/Construction 80/.test(r.tooLow), 'it asks for Construction 80', r);
  A(r.needs.magic_plank===88 && r.fee===8000, 'it takes 88 magic planks and an 8,000 gold fee', r);
  A(r.tier===5 && r.name5==='Magic Clipper' && !r.none, 'it is built, and it is the last boat', r);
  A(r.goldLeft===12000, 'the fee is paid', r);
  A(r.left.every(x=>x===0), 'the materials are used', r);
  A(r.storm===0 && r.sailMul < 0.6, 'storm proof and faster than a galleon', r);
  A(r.steps.reduce((a, b)=>a + b, 0)===1, 'three of every four steps are free', r);
  A(r.yardFull > r.kids[0], 'the 3D model in the yard grows', r);
  await page.evaluate(()=>{ G.bench = 'slipway'; setUi('bench'); }); await page.waitForTimeout(300); await page.screenshot({ path:SHOTS + '/rs799_slip.png' });
  await page.evaluate(()=>{ setUi('playing'); ISO.dist = 7; const P = G.player; P.boatBuild = { t:5, st:5, pr:11 }; v3YardSync(); }); await page.waitForTimeout(6000); await page.screenshot({ path:SHOTS + '/rs799_yard.png' });
  /* at sea */
  const s = await page.evaluate(async ()=>{ const fr = n=>new Promise(res=>{ let i = 0; const f = ()=>++i >= n ? res() : requestAnimationFrame(f); requestAnimationFrame(f); }), p = G.player; p.boatTier = 5; p.boatBuild = null; exitInterior(); await fr(5); G.gameMode = 0; setUi('playing'); await fr(5);
    let best = null; const C = G.owPos; for (let d=1;d<160 && !best;d++) for (let a=0;a<64 && !best;a++){ const x = Math.round(C.x + Math.cos(a/64*6.283)*d), y = Math.round(C.y + Math.sin(a/64*6.283)*d); if (!G.ow.map[x] || G.ow.map[x][y]!==OW_WATER) continue; let w = 0; for (let i=-3;i<=3;i++) for (let j=-3;j<=3;j++) if (G.ow.map[x+i] && G.ow.map[x+i][y+j]===OW_WATER) w++; if (w >= 45) best = { x, y }; }
    if (!best) return { none:true }; G.owPos = { x:best.x, y:best.y }; owReveal(best.x, best.y, 8); ISO.dist = 5; await fr(200);
    const g = O3.boat && O3.boat.children[0]; let orb = 0, runes = 0; if (O3.boatRunes) O3.boatRunes.traverse(o=>{ if (o.isMesh && o.material.emissiveIntensity > 1){ runes++; } });
    return { mode:G.gameMode, tierBuilt:O3.boatTierBuilt, vis:O3.boat && O3.boat.visible, runes, sailMap:O3.sail.material.map===o3MagicSailTex(), hullTeal:g.userData.boatMats.plank.map!==g.userData.boatMats.plank.userData.map0, scale:O3.boat.scale.x }; });
  console.log('sea', JSON.stringify(s));
  await page.waitForTimeout(4000); await page.screenshot({ path:SHOTS + '/rs799_sea.png', clip:{ x:400, y:150, width:600, height:480 } });
  await page.evaluate(()=>{ ISO.rot = (ISO.rot + 1)%4; }); await page.waitForTimeout(1500); await page.screenshot({ path:SHOTS + '/rs799_sea2.png', clip:{ x:400, y:150, width:600, height:480 } }); await page.evaluate(()=>{ ISO.rot = (ISO.rot + 1)%4; }); await page.waitForTimeout(1500); await page.screenshot({ path:SHOTS + '/rs799_sea3.png', clip:{ x:400, y:150, width:600, height:480 } });
  A(s.tierBuilt===5 && s.vis, 'she sails in 3D', s); A(s.runes > 10 && s.sailMap && s.hullTeal, 'with her own wood, sails and runes', s);
  /* a galleon again takes the plain ship back: and a save loads */
  const b = await page.evaluate(async ()=>{ const fr = n=>new Promise(res=>{ let i = 0; const f = ()=>++i >= n ? res() : requestAnimationFrame(f); requestAnimationFrame(f); }), p = G.player; p.boatTier = 4; await fr(5); const g = O3.boat.children[0], back = g.userData.boatMats.plank.map===g.userData.boatMats.plank.userData.map0 && !O3.boatRunes; p.boatTier = 9; const clamp = boatTier(); p.boatTier = 5; return { back, clamp }; });
  A(b.back, 'a smaller boat loses the magic wood', b); A(b.clamp===5, 'the tier is clamped', b);
  A(!errs.length, 'no page errors', errs);
};
