// RS-674: the dragon's lair. A crag with a cave mouth and the dragon asleep across his hoard in it; stepping onto it you walk round the crag
// to the mouth (its way round is checked from behind and both sides), he wakes, comes out over the gold and rears, roars once and breathes fire,
// the camera comes down before the mouth and shakes, then he draws back into the dark and you go on in and down. Shot: shots/rs674.png (fire)
module.exports = async page=>{
  page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const r = await page.evaluate(async ()=>{ const fr = n=>new Promise(res=>{ let i = 0; const f = ()=>++i >= n ? res() : requestAnimationFrame(f); requestAnimationFrame(f); });
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.gameMode = 0; G.player.clock = DAY_LENGTH*0.4; window.__trans = true;
    const m = G.ow.map, open = [OW_GRASS, OW_FOREST, OW_DESERT, OW_TUNDRA, OW_SWAMP, OW_MOUNTAINPASS], N8 = [[0,1],[1,0],[0,-1],[-1,0],[1,1],[-1,1],[1,-1],[-1,-1]], out = {};
    const sites = questNearbySites(G.owPos.x, G.owPos.y, 1, 600, ['lair']).filter(s=>m[s.x][s.y]===OW_LAIR); let at = null, g = null;
    for (const s of sites){ const nb = N8.map(([dx, dy])=>({ dx, dy, q:owNb(s.x, s.y, dx, dy) })).filter(o=>o.q && open.includes(m[o.q[0]][o.q[1]]) && owDiagClear(o.q[0], o.q[1], -o.dx, -o.dy));   /* (a step in you can take: not a diagonal between two blocked tiles) */ if (!nb.length) continue;
      G.owPos = { x:nb[0].q[0], y:nb[0].q[1] }; owReveal(nb[0].q[0], nb[0].q[1], 8); await fr(120);
      const C = o3C(s.x, s.y); g = O3.doors && O3.doors.get(Math.floor(C[0]) + ',' + Math.floor(C[1])); if (!g || !g.doorWay) continue;
      const f = new THREE.Vector3(0, 0, 1).applyQuaternion(g.quaternion); let best = null, bd = 9;
      for (const o of nb){ const c = o3C(o.q[0], o.q[1]), dx = c[0] - C[0], dz = c[1] - C[1], d = (f.x*dx + f.z*dz)/Math.hypot(dx, dz); if (d < bd){ bd = d; best = o; } }
      at = { s, best }; break; }
    if (!at) return { none:true, n:sites.length };
    out.gate = !!g.doorWay;
    /* the dragon: the moving group with a skinned body in it */
    let hold = null; for (const c of g.children) if (c.isGroup && c.userData.mv){ let sk = false; c.traverse(o=>{ if (o.isSkinnedMesh || (o.isMesh && o.parent && o.parent!==c)) sk = true; }); if (sk) hold = c; }
    out.dragon = !!hold; if (!hold) return out;
    const z0 = hold.position.z, headY = ()=>{ const H = new THREE.Vector3(); let best = -9; hold.traverse(o=>{ if (o.isMesh || o.isBone || o.isGroup){ o.getWorldPosition(H); best = Math.max(best, H.y); } }); return best; };
    out.asleepTop = +((headY() - g.position.y)/g.scale.x).toFixed(2);
    G.owPos = { x:at.best.q[0], y:at.best.q[1] }; await fr(90); { const c = o3C(at.best.q[0], at.best.q[1]); for (let i=0;i<400 && O3.ppos && Math.hypot(O3.ppos.x - c[0], O3.ppos.z - c[1]) > 0.15;i++) await fr(1); }   /* (there, not still on the way from the last tile) */
    const C = o3C(at.s.x, at.s.y); g = O3.doors.get(Math.floor(C[0]) + ',' + Math.floor(C[1]));
    moveDir(-at.best.dx, -at.best.dy); out.walk = !!O3.doorWalk;
    /* the way round keeps off the crag (its body about (0, -0.5), 1.15 by 1.0 in its own frame, the mouth open at the front) */
    const thruOf = P=>{ let n = 0; for (let i=0;i<P.length - 1;i++){ const a = P[i], b = P[i + 1]; for (let k=1;k<20;k++){ const x = a.x + (b.x - a.x)*k/20, z = a.z + (b.z - a.z)*k/20; if (Math.hypot(x/1.15, (z + 0.5)/1.0) < 0.85 && !(Math.abs(x) < 0.5 && z > -0.1)) n++; } } return n; };
    if (O3.doorWalk){ g.updateMatrixWorld(true); const P = O3.doorWalk.pts.map(p=>g.worldToLocal(new THREE.Vector3(p[0], g.position.y, p[1]))); out.thru = thruOf(P);
      const dw = g.doorWay, way = (x, z)=>[{ x, z }].concat(dw.round(x, z).map(q=>({ x:q[0], z:q[1] })), [{ x:0, z:dw.front }, { x:0, z:dw.look }]);
      out.round = [[0.1, -1.55], [-0.05, -1.6], [1.4, -0.4], [-1.4, 0.0], [1.0, 0.7]].map(([x, z])=>{ const w = way(x, z); return { n:w.length, thru:thruOf(w) }; }); }
    let topMax = -9, outMax = 0, fire = 0, shake = 0, camDown = 0, gone = false, minY = 9, shot = false, roars = 0; const s0 = window.sfx; window.sfx = n=>{ if (n==='roar') roars++; return s0(n); };
    const sprites = []; g.traverse(o=>{ if (o.isSprite && o.userData.mv) sprites.push(o); });
    const lit0 = sprites.filter(s=>s.visible).length;
    const t0 = performance.now(); while (performance.now() - t0 < 25000 && G.gameMode===0){ await fr(1); const W = O3.doorWalk;
      if (hold.visible){ topMax = Math.max(topMax, (headY() - g.position.y)/g.scale.x); outMax = Math.max(outMax, hold.position.z - z0); } else if (W) gone = true;
      const lit = sprites.filter(s=>s.visible && s.material.opacity > 0.05).length; if (lit > fire){ fire = lit; if (lit > 20 && !shot){ shot = true; out.fireShot = O3.renderer.domElement.toDataURL('image/png'); } }
      shake = Math.max(shake, O3.shake || 0); if (W && W.look > 1 && O3.camPos) camDown = Math.max(camDown, O3.camPos.y - O3.cam.position.y);
      if (W && W.v > 0.5 && O3.ppos) minY = Math.min(minY, (O3.ppos.y - O3.heightAt(O3.ppos.x, O3.ppos.z))/g.scale.x); }
    window.sfx = s0;
    Object.assign(out, { rise:+(topMax - out.asleepTop).toFixed(2), out:+outMax.toFixed(2), fire, shake:+shake.toFixed(2), camDown:+camDown.toFixed(2), gone, roars, down:+(-minY).toFixed(2), mode:G.gameMode, kind:G.siteKind });
    out.reset = hold.visible && Math.abs(hold.position.z - z0) < 1e-3 && sprites.filter(s=>s.visible).length===lit0;
    let blackStone = 0; g.traverse(o=>{ if (o.isMesh && o.material && o.material.vertexColors && !o.geometry.attributes.color && !o.isSkinnedMesh) blackStone++; }); out.blackStone = blackStone;
    return out; });
  if (r.fireShot) require('fs').writeFileSync(SHOTS + '/rs674.png', Buffer.from(r.fireShot.split(',')[1], 'base64')); r.fireShot = !!r.fireShot;
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(!r.none && r.gate, 'a lair within reach of the start, built as a doorway');
  A(r.dragon, 'a dragon in it');
  A(r.round && r.round.every(q=>q.thru===0) && r.round[0].n >= 5, 'from behind or the side the way round keeps off the crag');
  A(r.walk && r.thru===0, 'stepping onto it you walk round to its mouth');
  A(r.rise > 0.4, 'he wakes and rears up');
  A(r.out > 0.3, 'coming out over his hoard');
  A(r.roars===1, 'he roars, once');
  A(r.fire >= 20, 'and breathes fire');
  A(r.shake > 0.5, 'the ground shakes');
  A(r.camDown > 1, 'the camera comes down before the mouth');
  A(r.gone, 'he draws back into the dark before you go in');
  A(r.down > 0.15, 'you go down into it');
  A(r.mode===1 && r.kind==='lair', 'and on into the lair');
  A(r.reset, 'asleep again behind you, his fire out');
  A(r.blackStone===0, 'every rock has its colours');
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
