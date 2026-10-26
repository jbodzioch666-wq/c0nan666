// RS-673: the Dragon Maw. A dragon's lair is a hill of scorched basalt with a cave mouth framed by fangs and the hoard spilling out; stepping
// onto it you walk to the mouth (round the hill from behind or the side - its way round is checked from both), two great eyes open in the dark and the light inside swells, and you go on in
// and down into the lair. Shot: shots/rs673.png (the eyes open)
module.exports = async page=>{
  page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const r = await page.evaluate(async ()=>{ const fr = n=>new Promise(res=>{ let i = 0; const f = ()=>++i >= n ? res() : requestAnimationFrame(f); requestAnimationFrame(f); });
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.gameMode = 0; G.player.clock = DAY_LENGTH*0.4; window.__trans = true;
    const m = G.ow.map, open = [OW_GRASS, OW_FOREST, OW_DESERT, OW_TUNDRA, OW_SWAMP, OW_MOUNTAINPASS], N8 = [[0,1],[1,0],[0,-1],[-1,0],[1,1],[-1,1],[1,-1],[-1,-1]], out = {};
    const sites = questNearbySites(G.owPos.x, G.owPos.y, 1, 600, ['lair']).filter(s=>m[s.x][s.y]===OW_LAIR); let at = null, g = null;
    for (const s of sites){ const nb = N8.map(([dx, dy])=>({ dx, dy, q:owNb(s.x, s.y, dx, dy) })).filter(o=>o.q && open.includes(m[o.q[0]][o.q[1]])); if (!nb.length) continue;
      G.owPos = { x:nb[0].q[0], y:nb[0].q[1] }; owReveal(nb[0].q[0], nb[0].q[1], 8); await fr(120);
      const C = o3C(s.x, s.y); g = O3.doors && O3.doors.get(Math.floor(C[0]) + ',' + Math.floor(C[1])); if (!g || !g.doorWay) continue;
      const f = new THREE.Vector3(0, 0, 1).applyQuaternion(g.quaternion); let best = null, bd = 9;
      for (const o of nb){ const c = o3C(o.q[0], o.q[1]), dx = c[0] - C[0], dz = c[1] - C[1], d = (f.x*dx + f.z*dz)/Math.hypot(dx, dz); if (d < bd){ bd = d; best = o; } }
      at = { s, best, behind:+bd.toFixed(2) }; break; }
    if (!at) return { none:true, n:sites.length };
    out.behind = at.behind; out.gate = !!g.doorWay;
    G.owPos = { x:at.best.q[0], y:at.best.q[1] }; await fr(90);
    const C = o3C(at.s.x, at.s.y); g = O3.doors.get(Math.floor(C[0]) + ',' + Math.floor(C[1]));
    moveDir(-at.best.dx, -at.best.dy); out.walk = !!O3.doorWalk;
    /* the way in keeps off the hill (a dome about (0, -0.2), 0.7 across and 0.58 deep in its own frame) until the mouth */
    if (O3.doorWalk){ g.updateMatrixWorld(true); const P = O3.doorWalk.pts.map(p=>g.worldToLocal(new THREE.Vector3(p[0], g.position.y, p[1]))); out.pts = P.map(v=>[+v.x.toFixed(2), +v.z.toFixed(2)]);
      const thruOf = P=>{ let n = 0; for (let i=0;i<P.length - 1;i++){ const a = P[i], b = P[i + 1]; for (let k=1;k<20;k++){ const x = a.x + (b.x - a.x)*k/20, z = a.z + (b.z - a.z)*k/20; if (Math.hypot(x/0.7, (z + 0.2)/0.58) < 0.9 && !(Math.abs(x) < 0.3 && z > 0.1)) n++; } } return n; };
      out.thru = thruOf(P);
      /* the way round from behind and from each side, as o3DoorWalkStart lays it: round(), then the front, then where you look in */
      const dw = g.doorWay, way = (x, z)=>[{ x, z }].concat(dw.round(x, z).map(q=>({ x:q[0], z:q[1] })), [{ x:0, z:dw.front }, { x:0, z:dw.look }]);
      out.round = [[0.1, -1.1], [-0.05, -1.12], [0.95, -0.2], [-0.95, 0.1], [0.7, 0.6]].map(([x, z])=>{ const w = way(x, z); return { n:w.length, thru:thruOf(w) }; }); }
    let maxEye = 0, maxGlow = 0, minY = 9, shot = false, sounds = 0; const y0 = g.position.y, s0 = window.sfx; window.sfx = n=>{ if (n==='rumble') sounds++; return s0(n); };
    const eyes = [], glows = []; g.traverse(o=>{ if (o.isMesh && o.material && o.material.map && o.material.isMeshBasicMaterial && o.userData.mv) eyes.push(o); if (o.isSprite && o.userData.mv) glows.push(o); }); out.eyes = eyes.length;
    const t0 = performance.now(); while (performance.now() - t0 < 20000 && G.gameMode===0){ await fr(1);
      for (const e of eyes) if (e.visible) maxEye = Math.max(maxEye, e.scale.y); for (const q of glows) maxGlow = Math.max(maxGlow, q.scale.x);
      if (O3.doorWalk && O3.doorWalk.v > 0.5 && O3.ppos) minY = Math.min(minY, (O3.ppos.y - O3.heightAt(O3.ppos.x, O3.ppos.z))/g.scale.x);   /* (on the way in: below the land) */
      if (maxEye > 0.9 && !shot){ shot = true; out.openShot = O3.renderer.domElement.toDataURL('image/png'); } }
    window.sfx = s0;
    out.maxEye = +maxEye.toFixed(2); out.maxGlow = +maxGlow.toFixed(2); out.down = +(-minY).toFixed(2); out.sounds = sounds; out.mode = G.gameMode; out.kind = G.siteKind;
    out.shut = eyes.filter(e=>e.visible).length;
    let blackStone = 0; g.traverse(o=>{ if (o.isMesh && o.material && o.material.vertexColors && !o.geometry.attributes.color) blackStone++; }); out.blackStone = blackStone;
    return out; });
  if (r.openShot) require('fs').writeFileSync(SHOTS + '/rs673.png', Buffer.from(r.openShot.split(',')[1], 'base64')); r.openShot = !!r.openShot;
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(!r.none && r.gate, 'a lair within reach of the start, built as a doorway');
  A(r.round && r.round.every(q=>q.thru===0) && r.round[0].n >= 5, 'from behind or the side the way round keeps off the hill');
  A(r.walk, 'stepping onto it you walk to its mouth');
  A(r.thru===0, 'the way round keeps off the hill');
  A(r.eyes===2 && r.maxEye > 0.9, 'two eyes open in the dark');
  A(r.maxGlow > 0.7, 'the light inside swells');
  A(r.sounds===1, 'the ground rumbles, once');
  A(r.down > 0.15, 'you go down into it');
  A(r.mode===1 && r.kind==='lair', 'and on into the lair');
  A(r.shut===0, 'the eyes close again behind you');
  A(r.blackStone===0, 'every rock has its colours');
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
