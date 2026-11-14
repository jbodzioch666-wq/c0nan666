// RS-863: the townsfolk's cloaks. An elf town's guards (chain made a gown by highElfLook) wore their tabard under the gown, showing in
// patches through its chest - no tabard over a gown now; a cloak is cut to the gown's flared skirt as well as the back, so it falls outside
// it, not through it; townsfolk walk at a steady pace (they eased into each tile, surging and stalling), and their cloaks keep at most
// 1 unit a second of the world's motion (the air dragged them back at a slant, and turning about flung the hem out like a flag); cloth
// moves on everyone within 7 heights of you (3.2). Shot: shots/rs863-guard.png
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const A = (c, m, d)=>{ if (!c) throw new Error(m + ' :: ' + JSON.stringify(d)); };
  const r = await page.evaluate(async ()=>{ const w = ms=>new Promise(r=>setTimeout(r, ms)), out = {}; goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.clock = Math.round(0.45*DAY_LENGTH) + 3*DAY_LENGTH;
    const t = townList().find(t=>(townFlavorAt(t.x, t.y)||{}).race==='elf'); out.elf = !!t; if (!t) return out; G.owPos = { x:t.x, y:t.y }; enterVillage(); setUi('playing'); townClosedCheck = ()=>false;
    for (let i=0;i<400 && (i<20 || V3.peopleQ);i++){ renderGame(); await w(20); }
    /* no tabard on anyone in a gown */ let robedTab = 0, guards = 0; for (const p of [...V3.villagers, ...V3.npcs]){ if (!p.e || !p.e.rig) continue; let tab = false, skirt = !!p.e.rig.skirt; p.g.traverse(o=>{ if (o.name==='tabard') tab = true; }); if (tab && skirt) robedTab++; if (p.v && p.v.guard) guards++; }
    out.robedTab = robedTab; out.guards = guards;
    const caped = V3.villagers.filter(p=>{ let c = 0; p.g.traverse(o=>{ if (o.userData && o.userData.grid) c++; }); return c && p.e.rig.skirt; }); out.caped = caped.length; const p = caped.find(p=>p.v && p.v.guard) || caped[0]; if (!p) return out;
    let cape; p.g.traverse(o=>{ if (o.userData && o.userData.grid) cape = o; }); const u = cape.userData;
    /* the cloak's hem behind the skirt: the skirt's furthest-back point at the hem's height, in the cloak's frame */ { const T = THREE, inv = cape.matrixWorld.clone().invert(), v = new T.Vector3(); p.g.updateMatrixWorld(true); const NX = u.grid[0], NY = u.grid[1], W = NX + 1, hy = u.base[(NY*W)*3 + 1] + 0.06; let skBack = Infinity;
      const sk = p.e.rig.skirt, pa = sk.geometry.attributes.position; for (let k=0;k<pa.count;k+=3){ v.fromBufferAttribute(pa, k).applyMatrix4(sk.matrixWorld).applyMatrix4(inv); if (Math.abs(v.y - hy) < 0.05 && Math.abs(v.x) < 0.06) skBack = Math.min(skBack, v.z); }
      let hem = Infinity; for (let i=0;i<=NX;i++){ const k = ((NY - 1)*W + i)*3; if (Math.abs(u.base[k]) < 0.06) hem = Math.min(hem, u.base[k+2]); } out.fit = { skBack:+skBack.toFixed(3), hemMax:+(-hem).toFixed(3), hem:+hem.toFixed(3) }; }
    /* walking: how far its hem swings from where it hangs */ const lifts = []; for (let f=0; f<300; f++){ const q = p.g.position; G.player.x = Math.floor(q.x); G.player.y = Math.floor(q.z); V3.dist = 3; renderGame(); await new Promise(r=>requestAnimationFrame(r));
      if (u.P){ const NX = u.grid[0], NY = u.grid[1], W = NX + 1; let mx = 0; for (let i=0;i<=NX;i++){ const k = (NY*W + i)*3; mx = Math.max(mx, Math.hypot(u.P[k] - u.rest[k], u.P[k+1] - u.rest[k+1], u.P[k+2] - u.rest[k+2])/u.h); } lifts.push(mx); } }
    lifts.sort((a, b)=>a - b); out.lift = { med:+lifts[lifts.length>>1].toFixed(2), p90:+lifts[Math.floor(lifts.length*0.9)].toFixed(2) }; out.near = m3dClothOn(p.e.rig);
    return out; });
  await page.screenshot({ path: SHOTS + '/rs863-guard.png' }); console.log(JSON.stringify(r)); A(errs.length===0, errs.join('|'));
  if (!r.elf) return; A(r.robedTab===0, 'a tabard under a gown', r); A(r.caped > 0, 'no cloaked townsfolk in a gown', r);
  A(r.fit.hem < r.fit.skBack, 'the cloak hangs through the skirt', r.fit); A(r.lift.med < 0.3 && r.lift.p90 < 0.55, 'the cloak swings out too far as they walk', r.lift); };
