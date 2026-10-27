// RS-682: the Draining Pool (was RS-681's Drowned Stair). The sunken temple stands a little bigger, a shrine on a three-tiered platform in
// a pool, its bronze doors shut under the drowned god's eye; stepping onto it you walk round the pool to the path (its way round is checked
// from behind and both sides), the eye wakes (one toll), the path's eight flags sink one after another (one grind) into a stair going down
// through a cut in the land to a dark way on under the platform, and the pool drains down it (one rush): the water running down each step,
// the level falling to the bed, the lily pads settling with it, then a sea-green light at the foot; no walls of water. You walk down your
// own size, with no screen shake and no zoom. A door you walk into faces open land, not the sea. Where the land has no cut for it the
// path stays a path and the pool stays full. Shot: shots/rs682.png (the water running down the stair)
module.exports = async page=>{
  page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const r = await page.evaluate(async ()=>{ const fr = n=>new Promise(res=>{ let i = 0; const f = ()=>++i >= n ? res() : requestAnimationFrame(f); requestAnimationFrame(f); });
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.gameMode = 0; G.player.clock = DAY_LENGTH*0.4; window.__trans = true; G.ow.genVer = 22; wgRegenerate(G.ow.seed); G.ow.genVer = OW_GEN_VER;   /* (RS-687: generator 23 puts the temples out at sea; this is the one on the land) */
    const m = G.ow.map, open = [OW_GRASS, OW_FOREST, OW_DESERT, OW_TUNDRA, OW_SWAMP, OW_MOUNTAINPASS], N8 = [[0,1],[1,0],[0,-1],[-1,0],[1,1],[-1,1],[1,-1],[-1,-1]], out = {};
    const sites = questNearbySites(G.owPos.x, G.owPos.y, 1, 600, ['temple']).filter(s=>m[s.x][s.y]===OW_TEMPLE); let at = null, g = null;
    for (const s of sites){ const nb = N8.map(([dx, dy])=>({ dx, dy, q:owNb(s.x, s.y, dx, dy) })).filter(o=>o.q && open.includes(m[o.q[0]][o.q[1]]) && owDiagClear(o.q[0], o.q[1], -o.dx, -o.dy)); if (!nb.length) continue;
      G.owPos = { x:nb[0].q[0], y:nb[0].q[1] }; owReveal(nb[0].q[0], nb[0].q[1], 8); await fr(120);
      const C = o3C(s.x, s.y); g = O3.doors && O3.doors.get(Math.floor(C[0]) + ',' + Math.floor(C[1])); if (!g || !g.doorWay) continue;
      if (!g.stairCut && s!==sites[sites.length - 1] && sites.indexOf(s) < 4) continue;   /* (one with its stair, if one's near) */
      const f = new THREE.Vector3(0, 0, 1).applyQuaternion(g.quaternion); let best = null, bd = 9;   /* (the open tile most behind it, so the way round is walked) */
      for (const o of nb){ const c = o3C(o.q[0], o.q[1]), dx = c[0] - C[0], dz = c[1] - C[1], d = (f.x*dx + f.z*dz)/Math.hypot(dx, dz); if (d < bd){ bd = d; best = o; } }
      at = { s, best, C }; break; }
    if (!at) return { none:true, n:sites.length };
    out.gate = !!g.doorWay; const dw = g.doorWay, P = dw.parts || {};
    out.parts = !!(P.pool && P.pads && P.runs && P.runs.length===8 && P.flowM && P.flags && P.flags.length===8 && P.sig && P.strip && P.deep); out.walls = 0; g.traverse(o=>{ if (o.isMesh && o.geometry.type==='ExtrudeGeometry' && o.material.transparent && o.material.side===THREE.DoubleSide) out.walls++; }); out.cut = !!g.stairCut;
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
    let fitS = O3.doorWalk ? O3.doorWalk.fitS : 1, figMin = 9, sigMax = 0, stripMin = 9, runsMax = 0, flowMax = 0, padsMin = 9, drained = false, shake = 0, minY = 9, camDown = 0, deep = 0, folded = 0, order = true, shot = false;
    const t0 = performance.now(); while (performance.now() - t0 < 30000 && G.gameMode===0){ await fr(1); const W = O3.doorWalk;
      sigMax = Math.max(sigMax, P.sig.emissiveIntensity); runsMax = Math.max(runsMax, P.runs.filter(o=>o.visible).length); flowMax = Math.max(flowMax, P.flowM.opacity); padsMin = Math.min(padsMin, ...P.pads.map(p=>p.position.y)); if (!P.pool.visible) drained = true; stripMin = Math.min(stripMin, P.strip.visible ? P.strip.scale.x : 0);
      shake = Math.max(shake, O3.shake || 0); if (P.deep.visible) deep++;
      const at = P.flags.map(f=>f.o.position.distanceTo(f.b) < 1e-3); for (let i=1;i<at.length;i++) if (at[i] && !at[i - 1]) order = false; folded = Math.max(folded, at.filter(Boolean).length);   /* (one after another, from the pool's edge in) */
      if (!shot && runsMax >= 6 && P.flowM.opacity > 0.5 && W){ shot = true; out.shot = O3.renderer.domElement.toDataURL('image/png'); }
      if (W && W.look > 1 && O3.camPos) camDown = Math.max(camDown, O3.camPos.y - O3.cam.position.y);
      if (W && W.v > 0 && O3.ppos){ if (O3.pgrp) figMin = Math.min(figMin, O3.pgrp.scale.x); if (W.v > 0.5) minY = Math.min(minY, (O3.ppos.y - O3.heightAt(O3.ppos.x, O3.ppos.z))/g.scale.x); } }
    window.sfx = s0;
    Object.assign(out, { fitS:+fitS.toFixed(2), figMin:+figMin.toFixed(2), doorH:dw.doorH || 0, cam:!!dw.cam, sigMax:+sigMax.toFixed(2), runsMax, flowMax:+flowMax.toFixed(2), padsMin:+padsMin.toFixed(3), drained, stripMin:+stripMin.toFixed(2), folded, order, deep,
      shake:+shake.toFixed(2), camDown:+camDown.toFixed(2), down:+(-minY).toFixed(2), toll:heard.drowned || 0, rush:heard.waters || 0, grind:heard.slab || 0, mode:G.gameMode, kind:G.siteKind });
    await fr(5); out.figAfter = O3.pgrp ? +O3.pgrp.scale.x.toFixed(3) : 1;
    out.reset = P.pool.visible && Math.abs(P.pool.position.y - 0.05) < 1e-4 && P.runs.every(o=>!o.visible) && P.flowM.opacity < 0.01 && P.strip.visible && P.flags.every(f=>f.o.position.distanceTo(f.a) < 1e-4) && !P.deep.visible && P.sig.emissiveIntensity < 0.1;
    let blackStone = 0; g.traverse(o=>{ if (o.isMesh && o.material && o.material.vertexColors && !o.geometry.attributes.color && !o.isSkinnedMesh) blackStone++; }); out.blackStone = blackStone;
    return out; });
  if (r.shot) require('fs').writeFileSync(SHOTS + '/rs682.png', Buffer.from(r.shot.split(',')[1], 'base64')); r.shot = !!r.shot;
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(!r.none && r.gate, 'a sunken temple within reach of the start, built as a way in');
  A(r.parts, 'a pool, lily pads, water to run down eight steps, a strip of water over the path, eight flags, the eye and a light below');
  A(r.frontOpen, 'its path faces open land, not the sea');
  A(r.round && r.round.every(q=>q.thru===0) && r.round[0].n >= 4, 'from behind or the side the way round keeps out of the pool');
  A(r.walk && r.thru===0, 'stepping onto it you walk round to its path');
  A(r.toll===1 && r.sigMax > 1.5, 'the drowned god\'s eye wakes: one toll');
  A(r.walls===0, 'no walls of water');
  if (r.cut){
    A(r.folded===8 && r.order, 'the path\'s flags sink into a stair, one after another');
    A(r.grind===1, 'grinding, once');
    A(r.rush===1 && r.stripMin < 0.05, 'the water over the path goes down with them: one rush');
    A(r.runsMax===8 && r.flowMax > 0.6, 'the pool runs down every step of the stair');
    A(r.drained && r.padsMin < 0.02, 'the pool drains to its bed, the lily pads settling with it');
    A(r.deep > 0, 'a sea-green light at its foot');
    A(r.down > 0.25, 'you go down the stair'); }
  else A(r.folded===0 && r.grind===0 && r.down < 0.05 && !r.drained && r.runsMax===0, 'no cut in the land: the path stays a path, the pool full');
  A(r.shake < 0.05, 'the screen does not shake');
  A(!r.cam && r.camDown < 0.01, 'and the camera does not zoom in');
  A(!r.doorH && r.fitS===1 && r.figMin > 0.999, 'no door to fit: your own size');
  A(r.mode===1 && r.kind==='temple', 'and on into the temple');
  A(r.figAfter===1, 'your own size again inside');
  A(r.reset, 'the pool full again behind you');
  A(r.blackStone===0, 'every stone has its colours');
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
