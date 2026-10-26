// RS-675: the Sun-Slab Tomb. The pyramid has a doorway cut into its face with a sun-slab for a door and a jackal of Anubis either side of
// the way in; stepping onto it you walk round the pyramid to the causeway (its way round is checked from behind and both sides), the sun
// catches the capstone (one chime), the winged sun blazes, the glyphs light from the top row down, the jackals' eyes open, the slab grinds
// down into the ground (one grind, sand pours; RS-676: no screen shake, and you shrink to fit the door), the torches down the passage light, the camera comes down before the
// door, and you go in and down. Shot: shots/rs675.png (the slab going down)
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
    const parts = ()=>{ const P = { slab:null, rows:new Set(), sand:[], glows:[] }; g.traverse(o=>{ if (o.isMesh && o.material.map===O3.tex.aten) P.slab = o.parent; if (o.isMesh && o.material.map===O3.tex.glyphs) P.rows.add(o); if (o.isSprite && o.userData.mv){ if (o.material.map===O3.tex.sandDot2) P.sand.push(o); else P.glows.push(o); } }); return P; };
    let P = parts(); out.slab = !!P.slab; out.rows = P.rows.size; if (!P.slab) return out;
    G.owPos = { x:at.best.q[0], y:at.best.q[1] }; await fr(90); { const c = o3C(at.best.q[0], at.best.q[1]); for (let i=0;i<400 && O3.ppos && Math.hypot(O3.ppos.x - c[0], O3.ppos.z - c[1]) > 0.15;i++) await fr(1); }   /* (there, not still on the way from the last tile) */
    const C = o3C(at.s.x, at.s.y); g = O3.doors.get(Math.floor(C[0]) + ',' + Math.floor(C[1])); P = parts();
    moveDir(-at.best.dx, -at.best.dy); out.walk = !!O3.doorWalk;
    /* the way round keeps off the pyramid (0.74 square in its own frame; a little in from its foot, where the tiles beside it always stood) and the obelisks */
    const inside = (x, z)=>(Math.abs(x) < 0.68 && Math.abs(z) < 0.68) || Math.hypot(Math.abs(x) - 0.46, z - 0.85) < 0.07;
    const thruOf = W=>{ let n = 0; for (let i=0;i<W.length - 1;i++){ const a = W[i], b = W[i + 1]; for (let k=1;k<20;k++){ const x = a.x + (b.x - a.x)*k/20, z = a.z + (b.z - a.z)*k/20; if (inside(x, z) && Math.hypot(x - W[0].x, z - W[0].z) > 0.15) n++; } } return n; };   /* (the tile beside it may stand a little in from its foot, as it always did: from there you step straight out) */
    if (O3.doorWalk){ g.updateMatrixWorld(true); const LP = O3.doorWalk.pts.map(p=>g.worldToLocal(new THREE.Vector3(p[0], g.position.y, p[1]))); out.thru = thruOf(LP);
      const dw = g.doorWay, way = (x, z)=>[{ x, z }].concat(dw.round(x, z).map(q=>({ x:q[0], z:q[1] })), [{ x:0, z:dw.front }, { x:0, z:dw.look }]);
      out.round = [[0.24, -0.61], [0.1, -1.15], [-0.05, -1.2], [1.12, -0.4], [-1.15, 0.0], [0.95, 0.75], [-0.95, 0.7]].map(([x, z])=>{ const w = way(x, z); return { n:w.length, thru:thruOf(w) }; }); }
    const s0 = window.sfx, heard = {}; window.sfx = n=>{ heard[n] = (heard[n] || 0) + 1; return s0(n); };
    const rowY = [...P.rows].map(o=>({ m:o.material, y:o.position.y })), lit = new Map();
    const dw = g.doorWay, ZW = dw.inPts[0][1] - 0.1, BB = new THREE.Box3(); let fitTop = 0, fitS = O3.doorWalk ? O3.doorWalk.fitS : 1, figMin = 9;
    let slabMin = 9, shake = 0, camDown = 0, sand = 0, glows = 0, minY = 9, shot = false;
    const t0 = performance.now(); while (performance.now() - t0 < 30000 && G.gameMode===0){ await fr(1); const W = O3.doorWalk;
      if (W){ for (const q of rowY) if (q.m.emissiveIntensity > 0.5 && !lit.has(q.y)) lit.set(q.y, W.look); }
      slabMin = Math.min(slabMin, P.slab.position.y); shake = Math.max(shake, O3.shake || 0);
      const sn = P.sand.filter(s=>s.visible && s.material.opacity > 0.05).length; if (sn > sand){ sand = sn; if (sn > 30 && !shot){ shot = true; out.shot = O3.renderer.domElement.toDataURL('image/png'); } }
      glows = Math.max(glows, P.glows.filter(s=>s.visible).length);
      if (W && W.v > 0 && O3.pgrp){ figMin = Math.min(figMin, O3.pgrp.scale.x); const L = g.worldToLocal(O3.pgrp.position.clone()); if (Math.abs(L.x) < 0.1 && L.z > ZW - 0.06 && L.z < ZW + 0.06){ BB.setFromObject((O3.player && O3.player.e && O3.player.e.holder) || O3.pgrp); fitTop = Math.max(fitTop, (BB.max.y - g.position.y)/g.scale.x); } }   /* (passing the door: how high the figure stands above the sill) */
      if (W && W.look > 1 && O3.camPos) camDown = Math.max(camDown, O3.camPos.y - O3.cam.position.y);
      if (W && W.v > 0.5 && O3.ppos) minY = Math.min(minY, (O3.ppos.y - O3.heightAt(O3.ppos.x, O3.ppos.z))/g.scale.x); }
    window.sfx = s0;
    const ys = [...lit.keys()].sort((a, b)=>b - a); out.rowsLit = ys.length; out.topFirst = ys.every((y, i)=>i===0 || lit.get(y) >= lit.get(ys[i - 1]) - 1e-6);
    Object.assign(out, { fitS:+fitS.toFixed(2), figMin:+figMin.toFixed(2), fitTop:+fitTop.toFixed(3), doorH:dw.doorH, slabDown:+(-slabMin).toFixed(2), shake:+shake.toFixed(2), camDown:+camDown.toFixed(2), sand, glows, chime:heard.sunchime || 0, grind:heard.slab || 0, down:+(-minY).toFixed(2), mode:G.gameMode, kind:G.siteKind });
    await fr(5); out.figAfter = O3.pgrp ? +O3.pgrp.scale.x.toFixed(3) : 1;
    out.reset = Math.abs(P.slab.position.y) < 1e-4 && [...P.rows].every(o=>o.material.emissiveIntensity < 0.01) && P.sand.every(s=>!s.visible) && P.glows.every(s=>!s.visible);
    let blackStone = 0; g.traverse(o=>{ if (o.isMesh && o.material && o.material.vertexColors && !o.geometry.attributes.color && !o.isSkinnedMesh) blackStone++; }); out.blackStone = blackStone;
    return out; });
  if (r.shot) require('fs').writeFileSync(SHOTS + '/rs675.png', Buffer.from(r.shot.split(',')[1], 'base64')); r.shot = !!r.shot;
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(!r.none && r.gate, 'a pyramid within reach of the start, built as a doorway');
  A(r.slab && r.rows===12, 'a sun-slab for a door, and a column of six glyphs either side');
  A(r.round && r.round.every(q=>q.thru===0) && r.round[0].n >= 5, 'from behind or the side the way round keeps off the pyramid and its obelisks');
  A(r.walk && r.thru===0, 'stepping onto it you walk round to its causeway');
  A(r.chime===1, 'the sun catches the capstone: one chime');
  A(r.rowsLit===6 && r.topFirst, 'the glyphs light, the top row first');
  A(r.slabDown > 0.4, 'the slab goes down into the ground');
  A(r.grind===1, 'grinding, once');
  A(r.shake < 0.05, 'and the screen does not shake (RS-676)');
  A(r.fitS < 1 && r.figMin <= r.fitS + 0.01 && r.fitTop > 0.1 && r.fitTop < r.doorH, 'you are made small enough to go through the door (RS-676)');
  A(r.sand > 30, 'sand pours from the slot');
  A(r.glows >= 9, 'the capstone, the winged sun, the jackals\' eyes and the torches down the passage alight');
  A(r.camDown > 1, 'the camera comes down before the door');
  A(r.down > 0.15, 'you go down into it');
  A(r.mode===1 && r.kind==='pyramid', 'and on into the pyramid');
  A(r.figAfter===1, 'your own size again inside');
  A(r.reset, 'shut again behind you, its lights out');
  A(r.blackStone===0, 'every stone has its colours');
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
