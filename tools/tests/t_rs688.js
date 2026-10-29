// RS-688: Temples to Your Size - the Guardians' Gate. The sunken temple on the land (generator 24 puts every other one there, with open
// land two tiles round it) is a massive gate shrine whose door is taller than you: a coursed block on a two-step base, the door under a
// great lintel and a relieving triangle with the drowned god's eye, two hooded stone guardians on their swords before it. Nothing grows or
// is gathered under it, and on the tiles round it you stand clear of it. Stepping onto it from behind you walk round it to the front; the
// eye wakes (one toll), the guardians' eyes kindle under their hoods, the bronze doors swing in on the dark (one grind) with a sea-green
// light within, and you walk in through them your own size - no stair, no shake, no zoom. Shot: shots/rs688.png (the doors open)
module.exports = async page=>{
  page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const r = await page.evaluate(async ()=>{ const fr = n=>new Promise(res=>{ let i = 0; const f = ()=>++i >= n ? res() : requestAnimationFrame(f); requestAnimationFrame(f); });
    const settle = async ()=>{ let last = null, still = 0; for (let i=0;i<500 && O3.ppos && still < 12;i++){ await fr(1); const p = [O3.ppos.x, O3.ppos.z]; still = last && Math.hypot(p[0] - last[0], p[1] - last[1]) < 1e-4 ? still + 1 : 0; last = p; } };
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.gameMode = 0; G.player.clock = DAY_LENGTH*0.4; window.__trans = true;
    const m = G.ow.map, N8 = [[0,1],[1,0],[0,-1],[-1,0],[1,1],[-1,1],[1,-1],[-1,-1]], out = { ver:G.ow.genVer };
    const land = []; for (let x=0;x<OW_COLS;x++) for (let y=0;y<OW_ROWS;y++) if (m[x][y]===OW_TEMPLE && !owSeaSite(x, y)) land.push({ x, y });
    out.land = land.length; out.room = land.filter(t=>owTempleRoom(t.x, t.y)).length;
    out.nodes = 0; for (const t of land) for (const [dx, dy] of N8) if (skNodeStatic(t.x + dx, t.y + dy)) out.nodes++;   /* (nothing gathered under it) */
    land.sort((a, b)=>Math.hypot(a.x - G.owPos.x, a.y - G.owPos.y) - Math.hypot(b.x - G.owPos.x, b.y - G.owPos.y)); const s = land[0]; if (!s) return out;
    /* the tile most behind it: the gate's frame from its yaw */
    G.owPos = { x:s.x, y:s.y + 3 }; owReveal(s.x, s.y, 8); await fr(150);
    const C = o3C(s.x, s.y), g = O3.doors && O3.doors.get(Math.floor(C[0]) + ',' + Math.floor(C[1])); if (!g || !g.doorWay) return Object.assign(out, { nog:true });
    const dw = g.doorWay, P = dw.parts || {}, S = g.scale.x;
    out.parts = !!(P.sig && P.kin && P.kin.length===4 && P.deep && P.open && P.open.leaves.length===2); out.cut = !!g.stairCut; out.sea = !!dw.sea;
    out.door = +(dw.doorH*S).toFixed(2);
    { const ry = g.rotation.y, i = Math.round(Math.sin(ry)), j = Math.round(Math.cos(ry)), q = o3Tile(Math.floor(C[0]) + i, Math.floor(C[1]) + j); out.frontOpen = q!=null && q!==OW_WATER && q!==OW_MOUNTAIN; }
    const f = new THREE.Vector3(0, 0, 1).applyQuaternion(g.quaternion); let back = null, bd = 9;
    for (const [dx, dy] of N8){ const q = owNb(s.x, s.y, dx, dy); if (!q || !owDiagClear(q[0], q[1], -dx, -dy)) continue; const c = o3C(q[0], q[1]), ex = c[0] - C[0], ez = c[1] - C[1], d = (f.x*ex + f.z*ez)/Math.hypot(ex, ez); if (d < bd){ bd = d; back = { dx, dy, q }; } }
    /* the footprint, in its frame: inside |x| < 1.62, |z| < 1.4 (world) */
    const inside = (wx, wz)=>{ const L = g.worldToLocal(new THREE.Vector3(wx, g.position.y, wz)); return Math.abs(L.x*S) < 1.6 && Math.abs(L.z*S) < 1.38; };
    /* standing on each tile round it, clear of it */
    out.standIn = 0; for (const [dx, dy] of N8){ const q = owNb(s.x, s.y, dx, dy); if (!q) continue; G.owPos = { x:q[0], y:q[1] }; await settle(); if (inside(O3.ppos.x, O3.ppos.z)) out.standIn++; }
    out.veg = o3NearTemple(C[0] + 1.2*f.z, C[1] - 1.2*f.x, 1.3);   /* (a tree's spot beside it counts as under it) */
    G.owPos = { x:back.q[0], y:back.q[1] }; await settle();
    moveDir(-back.dx, -back.dy); out.walk = !!O3.doorWalk;
    if (O3.doorWalk){ const W = O3.doorWalk.pts; let thru = 0; for (let i=0;i<W.length - 1;i++) for (let k=1;k<20;k++){ const x = W[i][0] + (W[i + 1][0] - W[i][0])*k/20, z = W[i][1] + (W[i + 1][1] - W[i][1])*k/20; if (inside(x, z)) thru++; } out.thru = thru; out.legs = W.length; }
    const s0 = window.sfx, heard = {}; window.sfx = n=>{ heard[n] = (heard[n] || 0) + 1; return s0(n); };
    let sigMax = 0, kinMax = 0, leaf = 0, deep = 0, shake = 0, camDown = 0, figMin = 9, shot = false, lookIn = 9;
    const t0 = performance.now(); while (performance.now() - t0 < 30000 && G.gameMode===0){ await fr(1); const W = O3.doorWalk;
      sigMax = Math.max(sigMax, P.sig.emissiveIntensity); kinMax = Math.max(kinMax, P.kin.filter(e=>e.visible).length); leaf = Math.max(leaf, Math.abs(P.open.leaves[0].rotation.y)); if (P.deep.visible) deep++;
      shake = Math.max(shake, O3.shake || 0); if (W && W.look > 1 && O3.camPos) camDown = Math.max(camDown, O3.camPos.y - O3.cam.position.y);
      if (W && W.v > 0 && O3.pgrp) figMin = Math.min(figMin, O3.pgrp.scale.x);
      if (W && W.leg >= W.pts.length - 1 && W.look > 0 && W.look < 0.1){ const L = g.worldToLocal(new THREE.Vector3(O3.ppos.x, g.position.y, O3.ppos.z)); lookIn = +(L.z*S).toFixed(2); }
      if (!shot && leaf > 1.3 && W && W.v < 0.2){ shot = true; out.shot = O3.renderer.domElement.toDataURL('image/png'); } }
    window.sfx = s0;
    Object.assign(out, { sigMax:+sigMax.toFixed(2), kinMax, leaf:+leaf.toFixed(2), deep, shake:+shake.toFixed(2), camDown:+camDown.toFixed(2), figMin:+figMin.toFixed(2), lookIn, toll:heard.drowned || 0, grind:heard.slab || 0, rush:heard.waters || 0, mode:G.gameMode, kind:G.siteKind, cam:!!dw.cam });
    await fr(5); out.figAfter = O3.pgrp ? +O3.pgrp.scale.x.toFixed(3) : 1;
    out.reset = Math.abs(P.open.leaves[0].rotation.y) < 1e-4 && !P.deep.visible && P.kin.every(e=>!e.visible) && P.sig.emissiveIntensity < 0.1;
    let blackStone = 0; g.traverse(o=>{ if (o.isMesh && o.material && o.material.vertexColors && !o.geometry.attributes.color && !o.isSkinnedMesh) blackStone++; }); out.blackStone = blackStone;
    return out; });
  if (r.shot) require('fs').writeFileSync(SHOTS + '/rs688.png', Buffer.from(r.shot.split(',')[1], 'base64')); r.shot = !!r.shot;
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.ver >= 24 && r.land >= 1 && r.room===r.land, 'every other temple on the land, with open land two tiles round it');
  A(r.nodes===0 && r.veg, 'nothing gathered or growing under it');
  A(r.parts && !r.cut && !r.sea, 'built as the Guardians\' Gate: the eye, four eyes under the hoods, a light within, two bronze doors; no stair cut');
  A(r.door >= 1.25, 'its door taller than you (0.95): ' + r.door);
  A(r.frontOpen, 'its door faces open land');
  A(r.standIn===0, 'on the tiles round it you stand clear of it');
  A(r.walk && r.thru===0 && r.legs >= 4, 'stepping onto it from behind you walk round it to the front');
  A(r.lookIn > 1.4, 'and stop before its steps: ' + r.lookIn);
  A(r.toll===1 && r.sigMax > 1.5 && r.kinMax===4, 'the eye wakes, one toll, the guardians\' eyes kindle');
  A(r.leaf > 1.3 && r.grind===1 && r.deep > 0 && r.rush===0, 'the doors swing in: one grind, a light within, no water');
  A(r.shake < 0.05 && !r.cam && r.camDown < 0.01 && r.figMin > 0.999, 'no shake, no zoom, your own size');
  A(r.mode===1 && r.kind==='temple' && r.figAfter===1, 'and on into the temple');
  A(r.reset, 'the doors shut again behind you');
  A(r.blackStone===0, 'every stone has its colours');
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
