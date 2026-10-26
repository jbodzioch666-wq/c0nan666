// RS-677: the Drowned Shrine. The sunken temple stands in a pool with a shrine on a stepped platform, bronze doors under the drowned god's
// eye; stepping onto it you walk round the pool to the path (its way round is checked from behind and both sides), the eye wakes (one
// toll), the waters part into two walls either side of the path (one rush), the doors swing in on a sea-green light, and you walk the
// path dry, up the steps and in, made small enough for the door, with no screen shake. A door you walk into faces open land, not the
// sea. Shot: shots/rs677.png (the waters parted)
module.exports = async page=>{
  page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const r = await page.evaluate(async ()=>{ const fr = n=>new Promise(res=>{ let i = 0; const f = ()=>++i >= n ? res() : requestAnimationFrame(f); requestAnimationFrame(f); });
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.gameMode = 0; G.player.clock = DAY_LENGTH*0.4; window.__trans = true;
    const m = G.ow.map, open = [OW_GRASS, OW_FOREST, OW_DESERT, OW_TUNDRA, OW_SWAMP, OW_MOUNTAINPASS], N8 = [[0,1],[1,0],[0,-1],[-1,0],[1,1],[-1,1],[1,-1],[-1,-1]], out = {};
    const sites = questNearbySites(G.owPos.x, G.owPos.y, 1, 600, ['temple']).filter(s=>m[s.x][s.y]===OW_TEMPLE); let at = null, g = null;
    for (const s of sites){ const nb = N8.map(([dx, dy])=>({ dx, dy, q:owNb(s.x, s.y, dx, dy) })).filter(o=>o.q && open.includes(m[o.q[0]][o.q[1]]) && owDiagClear(o.q[0], o.q[1], -o.dx, -o.dy)); if (!nb.length) continue;
      G.owPos = { x:nb[0].q[0], y:nb[0].q[1] }; owReveal(nb[0].q[0], nb[0].q[1], 8); await fr(120);
      const C = o3C(s.x, s.y); g = O3.doors && O3.doors.get(Math.floor(C[0]) + ',' + Math.floor(C[1])); if (!g || !g.doorWay) continue;
      const f = new THREE.Vector3(0, 0, 1).applyQuaternion(g.quaternion); let best = null, bd = 9;   /* (the open tile most behind it, so the way round is walked) */
      for (const o of nb){ const c = o3C(o.q[0], o.q[1]), dx = c[0] - C[0], dz = c[1] - C[1], d = (f.x*dx + f.z*dz)/Math.hypot(dx, dz); if (d < bd){ bd = d; best = o; } }
      at = { s, best, C }; break; }
    if (!at) return { none:true, n:sites.length };
    out.gate = !!g.doorWay; const dw = g.doorWay, P = dw.parts || {};
    out.parts = !!(P.walls && P.walls.length===2 && P.leaves && P.leaves.length===2 && P.sig && P.strip);
    { const ry = g.rotation.y, i = Math.round(Math.sin(ry)), j = Math.round(Math.cos(ry)), q = o3Tile(Math.floor(at.C[0]) + i, Math.floor(at.C[1]) + j); out.frontOpen = q!=null && q!==OW_WATER && q!==OW_MOUNTAIN; }
    if (!out.parts) return out;
    G.owPos = { x:at.best.q[0], y:at.best.q[1] }; await fr(90); { const c = o3C(at.best.q[0], at.best.q[1]); for (let i=0;i<400 && O3.ppos && Math.hypot(O3.ppos.x - c[0], O3.ppos.z - c[1]) > 0.15;i++) await fr(1); }
    moveDir(-at.best.dx, -at.best.dy); out.walk = !!O3.doorWalk;
    /* the way round keeps out of the pool (0.64 across, its ring of stones to 0.71) */
    const inside = (x, z)=>Math.hypot(x, z) < 0.7;
    const thruOf = W=>{ let n = 0; for (let i=0;i<W.length - 1;i++){ const a = W[i], b = W[i + 1]; for (let k=1;k<20;k++){ const x = a.x + (b.x - a.x)*k/20, z = a.z + (b.z - a.z)*k/20; if (inside(x, z) && Math.hypot(x - W[0].x, z - W[0].z) > 0.15) n++; } } return n; };
    if (O3.doorWalk){ g.updateMatrixWorld(true); const LP = O3.doorWalk.pts.map(p=>g.worldToLocal(new THREE.Vector3(p[0], g.position.y, p[1]))); out.thru = thruOf(LP);
      const way = (x, z)=>[{ x, z }].concat(dw.round(x, z).map(q=>({ x:q[0], z:q[1] })), [{ x:0, z:dw.front }, { x:0, z:dw.look }]);
      out.round = [[0.2, -0.78], [0.05, -1.0], [-0.1, -0.95], [0.9, -0.3], [-0.95, 0.0], [0.8, 0.5], [-0.75, 0.55]].map(([x, z])=>{ const w = way(x, z); return { n:w.length, thru:thruOf(w) }; }); }
    const s0 = window.sfx, heard = {}; window.sfx = n=>{ heard[n] = (heard[n] || 0) + 1; return s0(n); };
    const BB = new THREE.Box3(); let fitTop = 0, fitS = O3.doorWalk ? O3.doorWalk.fitS : 1, figMin = 9, sigMax = 0, wallMax = 0, stripMin = 9, leafMax = 0, shake = 0, wet = 0, climb = -9, shot = false;
    const t0 = performance.now(); while (performance.now() - t0 < 30000 && G.gameMode===0){ await fr(1); const W = O3.doorWalk;
      sigMax = Math.max(sigMax, P.sig.emissiveIntensity); for (const w of P.walls) if (w.visible) wallMax = Math.max(wallMax, w.scale.y); stripMin = Math.min(stripMin, P.strip.visible ? P.strip.scale.x : 0);
      leafMax = Math.max(leafMax, ...P.leaves.map(l=>Math.abs(l.rotation.y))); shake = Math.max(shake, O3.shake || 0);
      if (!shot && wallMax > 0.28 && W){ shot = true; out.shot = O3.renderer.domElement.toDataURL('image/png'); }
      if (W && W.v > 0 && O3.ppos){ const L = g.worldToLocal(O3.ppos.clone()), y = (O3.ppos.y - g.position.y)/g.scale.x;
        if (Math.abs(L.x) < 0.1 && L.z > 0.24 && L.z < 0.6 && y < 0.015) wet++;   /* (on the path: on its flags, not under the water) */
        if (Math.abs(L.x) < 0.1 && L.z < 0.1 && L.z > -0.03) climb = Math.max(climb, y);
        if (O3.pgrp){ figMin = Math.min(figMin, O3.pgrp.scale.x); if (Math.abs(L.x) < 0.1 && L.z > -0.05 && L.z < 0.05){ BB.setFromObject((O3.player && O3.player.e && O3.player.e.holder) || O3.pgrp); fitTop = Math.max(fitTop, (BB.max.y - g.position.y)/g.scale.x - 0.24); } } } }   /* (passing the door: how high the figure stands above the sill, on the top step) */
    window.sfx = s0;
    Object.assign(out, { fitS:+fitS.toFixed(2), figMin:+figMin.toFixed(2), fitTop:+fitTop.toFixed(3), doorH:dw.doorH, sigMax:+sigMax.toFixed(2), wallMax:+wallMax.toFixed(2), stripMin:+stripMin.toFixed(2), leafMax:+leafMax.toFixed(2),
      shake:+shake.toFixed(2), wet, climb:+climb.toFixed(2), toll:heard.drowned || 0, rush:heard.waters || 0, mode:G.gameMode, kind:G.siteKind });
    await fr(5); out.figAfter = O3.pgrp ? +O3.pgrp.scale.x.toFixed(3) : 1;
    out.reset = P.walls.every(w=>!w.visible) && P.strip.visible && P.leaves.every(l=>Math.abs(l.rotation.y) < 1e-4) && P.sig.emissiveIntensity < 0.1;
    let blackStone = 0; g.traverse(o=>{ if (o.isMesh && o.material && o.material.vertexColors && !o.geometry.attributes.color && !o.isSkinnedMesh) blackStone++; }); out.blackStone = blackStone;
    return out; });
  if (r.shot) require('fs').writeFileSync(SHOTS + '/rs677.png', Buffer.from(r.shot.split(',')[1], 'base64')); r.shot = !!r.shot;
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(!r.none && r.gate, 'a sunken temple within reach of the start, built as a doorway');
  A(r.parts, 'water walls, a strip of water over the path, two door leaves and the eye');
  A(r.frontOpen, 'its door faces open land, not the sea');
  A(r.round && r.round.every(q=>q.thru===0) && r.round[0].n >= 4, 'from behind or the side the way round keeps out of the pool');
  A(r.walk && r.thru===0, 'stepping onto it you walk round to its path');
  A(r.toll===1 && r.sigMax > 1.5, 'the drowned god\'s eye wakes: one toll');
  A(r.rush===1 && r.wallMax > 0.28 && r.stripMin < 0.05, 'the waters part into two walls: one rush');
  A(r.leafMax > 1.3, 'the doors swing in');
  A(r.wet===0 && r.climb > 0.2, 'you walk the path dry and climb the steps');
  A(r.shake < 0.05, 'and the screen does not shake');
  A(r.fitS < 1 && r.figMin <= r.fitS + 0.01 && r.fitTop > 0.1 && r.fitTop < r.doorH, 'you are made small enough to go through the door');
  A(r.mode===1 && r.kind==='temple', 'and on into the temple');
  A(r.figAfter===1, 'your own size again inside');
  A(r.reset, 'the waters close and the doors shut behind you');
  A(r.blackStone===0, 'every stone has its colours');
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
