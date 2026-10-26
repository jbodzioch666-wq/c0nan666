// RS-679: the Folding Stair. The pyramid is the Great Pyramid's shape again, a strip of casing stones up the middle of its front face, a
// jackal of Anubis on a shrine either side of its foot and an obelisk beyond each; stepping onto it you walk round the pyramid to its foot
// (its way round is checked from behind and both sides), the sun catches the capstone (one chime), the jackals' eyes open, and the strip's
// stones fold down one after another (one grind, a puff of sand as each lands) into a stair going down into the pyramid through a cut in
// the land, as at the barrows; the glyphs down its walls light from the top row down with the torches between them, a glow at its foot,
// and you walk down it your own size (no door, no shrinking, no shake). Shot: shots/rs679.png (the stones folding)
module.exports = async page=>{
  page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const r = await page.evaluate(async ()=>{ const fr = n=>new Promise(res=>{ let i = 0; const f = ()=>++i >= n ? res() : requestAnimationFrame(f); requestAnimationFrame(f); });
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.gameMode = 0; G.player.clock = DAY_LENGTH*0.4; window.__trans = true;
    const m = G.ow.map, open = [OW_GRASS, OW_FOREST, OW_DESERT, OW_TUNDRA, OW_SWAMP, OW_MOUNTAINPASS], N8 = [[0,1],[1,0],[0,-1],[-1,0],[1,1],[-1,1],[1,-1],[-1,-1]], out = {};
    const sites = questNearbySites(G.owPos.x, G.owPos.y, 1, 600, ['pyramid']).filter(s=>m[s.x][s.y]===OW_PYRAMID); let at = null, g = null;
    for (const s of sites){ const nb = N8.map(([dx, dy])=>({ dx, dy, q:owNb(s.x, s.y, dx, dy) })).filter(o=>o.q && open.includes(m[o.q[0]][o.q[1]]) && owDiagClear(o.q[0], o.q[1], -o.dx, -o.dy)); if (!nb.length) continue;
      G.owPos = { x:nb[0].q[0], y:nb[0].q[1] }; owReveal(nb[0].q[0], nb[0].q[1], 8); await fr(120);
      const C = o3C(s.x, s.y); g = O3.doors && O3.doors.get(Math.floor(C[0]) + ',' + Math.floor(C[1])); if (!g || !g.doorWay) continue;
      const f = new THREE.Vector3(0, 0, 1).applyQuaternion(g.quaternion); let best = null, bd = 9;   /* (the open tile most behind it, so the way round is walked) */
      for (const o of nb){ const c = o3C(o.q[0], o.q[1]), dx = c[0] - C[0], dz = c[1] - C[1], d = (f.x*dx + f.z*dz)/Math.hypot(dx, dz); if (d < bd){ bd = d; best = o; } }
      at = { s, best }; break; }
    if (!at) return { none:true, n:sites.length };
    out.gate = !!g.doorWay;
    const parts = ()=>{ const Q = g.doorWay.parts; return { slabs:Q.slabs, rows:Q.rows, sand:Q.dust, glows:[Q.capGlow, Q.deep].concat(Q.eyes, Q.torches) }; };
    let P = parts(); out.slabs = P.slabs.length; out.rows = P.rows.length; out.cut = !!g.stairCut; if (!P.slabs.length) return out;
    G.owPos = { x:at.best.q[0], y:at.best.q[1] }; await fr(90); { const c = o3C(at.best.q[0], at.best.q[1]); for (let i=0;i<400 && O3.ppos && Math.hypot(O3.ppos.x - c[0], O3.ppos.z - c[1]) > 0.15;i++) await fr(1); }   /* (there, not still on the way from the last tile) */
    const C = o3C(at.s.x, at.s.y); g = O3.doors.get(Math.floor(C[0]) + ',' + Math.floor(C[1])); P = parts();
    moveDir(-at.best.dx, -at.best.dy); out.walk = !!O3.doorWalk;
    /* the way round keeps off the pyramid (0.74 square in its own frame; a little in from its foot, where the tiles beside it always stood), the jackals' shrines and the obelisks */
    const inside = (x, z)=>(Math.abs(x) < 0.68 && Math.abs(z) < 0.68) || (Math.abs(Math.abs(x) - 0.31) < 0.05 && Math.abs(z - 0.84) < 0.13) || Math.hypot(Math.abs(x) - 0.52, z - 0.85) < 0.07;
    const thruOf = W=>{ let n = 0; for (let i=0;i<W.length - 1;i++){ const a = W[i], b = W[i + 1]; for (let k=1;k<20;k++){ const x = a.x + (b.x - a.x)*k/20, z = a.z + (b.z - a.z)*k/20; if (inside(x, z) && Math.hypot(x - W[0].x, z - W[0].z) > 0.15) n++; } } return n; };   /* (the tile beside it may stand a little in from its foot, as it always did: from there you step straight out) */
    if (O3.doorWalk){ g.updateMatrixWorld(true); const LP = O3.doorWalk.pts.map(p=>g.worldToLocal(new THREE.Vector3(p[0], g.position.y, p[1]))); out.thru = thruOf(LP);
      const dw = g.doorWay, way = (x, z)=>[{ x, z }].concat(dw.round(x, z).map(q=>({ x:q[0], z:q[1] })), [{ x:0, z:dw.front }, { x:0, z:dw.look }]);
      out.round = [[0.24, -0.61], [0.1, -1.15], [-0.05, -1.2], [1.12, -0.4], [-1.15, 0.0], [0.95, 0.75], [-0.95, 0.7]].map(([x, z])=>{ const w = way(x, z); return { n:w.length, thru:thruOf(w) }; }); }
    const s0 = window.sfx, heard = {}; window.sfx = n=>{ heard[n] = (heard[n] || 0) + 1; return s0(n); };
    const lit = new Map(), dw = g.doorWay; let fitS = O3.doorWalk ? O3.doorWalk.fitS : 1, figMin = 9;
    let folded = 0, order = true, shake = 0, camDown = 0, sand = 0, glows = 0, minY = 9, shot = false;
    const t0 = performance.now(); while (performance.now() - t0 < 30000 && G.gameMode===0){ await fr(1); const W = O3.doorWalk;
      if (W){ P.rows.forEach((m, r)=>{ if (m.emissiveIntensity > 0.5 && !lit.has(r)) lit.set(r, W.look); }); }
      const at = P.slabs.map(s=>s.o.position.distanceTo(s.b) < 1e-3); for (let i=1;i<at.length;i++) if (at[i] && !at[i - 1]) order = false; folded = Math.max(folded, at.filter(Boolean).length);   /* (one after another, the lowest first) */
      if (!shot && folded >= 3 && folded < P.slabs.length){ shot = true; out.shot = O3.renderer.domElement.toDataURL('image/png'); }
      shake = Math.max(shake, O3.shake || 0); sand = Math.max(sand, P.sand.filter(s=>s.visible && s.material.opacity > 0.05).length);
      glows = Math.max(glows, P.glows.filter(s=>s.visible).length);
      if (W && W.v > 0 && O3.pgrp) figMin = Math.min(figMin, O3.pgrp.scale.x);
      if (W && W.look > 1 && O3.camPos) camDown = Math.max(camDown, O3.camPos.y - O3.cam.position.y);
      if (W && W.v > 0.5 && O3.ppos) minY = Math.min(minY, (O3.ppos.y - O3.heightAt(O3.ppos.x, O3.ppos.z))/g.scale.x); }
    window.sfx = s0;
    const rs = [...lit.keys()].sort((a, b)=>a - b); out.rowsLit = rs.length; out.topFirst = rs.every((r, i)=>i===0 || lit.get(r) >= lit.get(rs[i - 1]) - 1e-6);
    Object.assign(out, { fitS:+fitS.toFixed(2), figMin:+figMin.toFixed(2), doorH:dw.doorH || 0, folded, order, shake:+shake.toFixed(2), camDown:+camDown.toFixed(2), sand, glows, chime:heard.sunchime || 0, grind:heard.slab || 0, down:+(-minY).toFixed(2), mode:G.gameMode, kind:G.siteKind });
    await fr(5); out.figAfter = O3.pgrp ? +O3.pgrp.scale.x.toFixed(3) : 1;
    out.reset = P.slabs.every(s=>s.o.position.distanceTo(s.a) < 1e-4) && P.rows.every(m=>m.emissiveIntensity < 0.01) && P.sand.every(s=>!s.visible) && P.glows.every(s=>!s.visible);
    let blackStone = 0; g.traverse(o=>{ if (o.isMesh && o.material && o.material.vertexColors && !o.geometry.attributes.color && !o.isSkinnedMesh) blackStone++; }); out.blackStone = blackStone;
    return out; });
  if (r.shot) require('fs').writeFileSync(SHOTS + '/rs679.png', Buffer.from(r.shot.split(',')[1], 'base64')); r.shot = !!r.shot;
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(!r.none && r.gate, 'a pyramid within reach of the start, built as a way in');
  A(r.slabs===7 && r.rows===4 && r.cut, 'seven stones in its face to fold, four rows of glyphs, and the land opened for the stair');
  A(r.round && r.round.every(q=>q.thru===0) && r.round[0].n >= 5, 'from behind or the side the way round keeps off the pyramid, the shrines and the obelisks');
  A(r.walk && r.thru===0, 'stepping onto it you walk round to its foot');
  A(r.chime===1, 'the sun catches the capstone: one chime');
  A(r.folded===7 && r.order, 'the stones fold down into a stair, one after another');
  A(r.grind===1, 'grinding, once');
  A(r.sand >= 2, 'a puff of sand as each lands');
  A(r.shake < 0.05, 'and the screen does not shake');
  A(r.rowsLit===4 && r.topFirst, 'the glyphs light, the top row first');
  A(r.glows >= 12, 'the capstone, the jackals\' eyes, the torches down the walls and the glow at the foot alight');
  A(r.camDown > 1, 'the camera looks down the stair');
  A(!r.doorH && r.fitS===1 && r.figMin > 0.999, 'no door to fit: you go down your own size');
  A(r.down > 0.2, 'you go down the stair');
  A(r.mode===1 && r.kind==='pyramid', 'and on into the pyramid');
  A(r.figAfter===1, 'your own size inside');
  A(r.reset, 'shut again behind you, its lights out');
  A(r.blackStone===0, 'every stone has its colours');
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
