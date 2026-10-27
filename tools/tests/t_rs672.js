// RS-672: the Crypt Stair. A graveyard is a churchyard round a crypt; stepping onto it from behind you walk round the railings to the
// gate and up the path to the crypt's door, its carving wakes, the barred gates swing in, and you go on down the stair into the dark and
// the graveyard below. RS-684: it stands a little bigger (1.55, the other sites 1.3). Shot: shots/rs672.png (the gates open)
module.exports = async page=>{
  page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const r = await page.evaluate(async ()=>{ const fr = n=>new Promise(res=>{ let i = 0; const f = ()=>++i >= n ? res() : requestAnimationFrame(f); requestAnimationFrame(f); });
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.gameMode = 0; G.player.clock = DAY_LENGTH*0.4; window.__trans = true;   /* (the walk-in plays with transitions on) */
    const m = G.ow.map, open = [OW_GRASS, OW_FOREST, OW_DESERT, OW_TUNDRA, OW_SWAMP], N8 = [[0,1],[1,0],[0,-1],[-1,0],[1,1],[-1,1],[1,-1],[-1,-1]], out = {};
    const sites = questNearbySites(G.owPos.x, G.owPos.y, 1, 400, ['graveyard']).filter(s=>m[s.x][s.y]===OW_GRAVEYARD); let at = null, g = null;
    for (const s of sites){ const nb = N8.map(([dx, dy])=>({ dx, dy, q:owNb(s.x, s.y, dx, dy) })).filter(o=>o.q && open.includes(m[o.q[0]][o.q[1]]) && owDiagClear(o.q[0], o.q[1], -o.dx, -o.dy));   /* (a step in you can take: not a diagonal between two blocked tiles) */ if (nb.length < 3) continue;
      G.owPos = { x:nb[0].q[0], y:nb[0].q[1] }; owReveal(nb[0].q[0], nb[0].q[1], 8); await fr(120);
      const C = o3C(s.x, s.y); g = O3.doors && O3.doors.get(Math.floor(C[0]) + ',' + Math.floor(C[1])); if (!g || !g.doorWay) continue;
      /* the open tile most behind the crypt */
      const f = new THREE.Vector3(0, 0, 1).applyQuaternion(g.quaternion); let best = null, bd = 9;
      for (const o of nb){ const c = o3C(o.q[0], o.q[1]), dx = c[0] - C[0], dz = c[1] - C[1], d = (f.x*dx + f.z*dz)/Math.hypot(dx, dz); if (d < bd){ bd = d; best = o; } }
      at = { s, best, behind:+bd.toFixed(2) }; break; }
    if (!at) return { none:true, n:sites.length };
    out.behind = at.behind; out.gate = !!g.doorWay;
    /* (RS-684) a little bigger than the other sites, and the land kept clear inside its railings */
    out.scale = +g.scale.x.toFixed(2); { const c = o3C(at.s.x, at.s.y); out.clearIn = o3NearGraveyard(c[0], c[1], 0) && !o3NearGraveyard(c[0] + Math.sin(g.rotation.y)*1.3, c[1] + Math.cos(g.rotation.y)*1.3, 0.2); }
    G.owPos = { x:at.best.q[0], y:at.best.q[1] }; await fr(90); { const c = o3C(at.best.q[0], at.best.q[1]); for (let i=0;i<400 && O3.ppos && Math.hypot(O3.ppos.x - c[0], O3.ppos.z - c[1]) > 0.15;i++) await fr(1); }   /* (there, not still on the way from the last tile) */
    const C = o3C(at.s.x, at.s.y); g = O3.doors.get(Math.floor(C[0]) + ',' + Math.floor(C[1]));
    moveDir(-at.best.dx, -at.best.dy); out.walk = !!O3.doorWalk;
    /* the way in: round the railings, never through them (the yard is |x| < 0.6, z -0.58..0.58 in the crypt's frame; you come in by the gate, x near 0) */
    if (O3.doorWalk){ g.updateMatrixWorld(true); const P = O3.doorWalk.pts.map(p=>g.worldToLocal(new THREE.Vector3(p[0], g.position.y, p[1]))); out.pts = P.map(v=>[+v.x.toFixed(2), +v.z.toFixed(2)]);
      let thru = 0; for (let i=0;i<P.length - 1;i++){ const a = P[i], b = P[i + 1]; for (let k=1;k<20;k++){ const x = a.x + (b.x - a.x)*k/20, z = a.z + (b.z - a.z)*k/20; if (Math.abs(x) < 0.58 && z > -0.56 && z < 0.56 && !(Math.abs(x) < 0.14 && z > 0.3)) thru++; } } out.thru = thru; }
    let maxA = 0, maxGlow = 0, minY = 9, shot = false; const y0 = g.position.y;
    const t0 = performance.now(); while (performance.now() - t0 < 20000 && G.gameMode===0){ await fr(1); const W = O3.doorWalk; if (W && W.dw){ for (const c of W.g.children) if (c.userData.mv && c.isGroup) maxA = Math.max(maxA, Math.abs(c.rotation.y)); if (O3.ppos) minY = Math.min(minY, (O3.ppos.y - y0)/g.scale.x); }
      g.traverse(o=>{ if (o.isMesh && o.material && o.material.emissiveMap) maxGlow = Math.max(maxGlow, o.material.emissiveIntensity); });
      if (maxA > 1.3 && !shot){ shot = true; out.openShot = O3.renderer.domElement.toDataURL('image/png'); } }
    out.maxA = +maxA.toFixed(2); out.maxGlow = +maxGlow.toFixed(2); out.down = +(-minY).toFixed(2); out.mode = G.gameMode; out.kind = G.siteKind;
    let shutA = 0; for (const c of g.children) if (c.userData.mv && c.isGroup) shutA = Math.max(shutA, Math.abs(c.rotation.y)); out.shut = +shutA.toFixed(2);
    let blackStone = 0; g.traverse(o=>{ if (o.isMesh && o.material && o.material.vertexColors && !o.geometry.attributes.color) blackStone++; }); out.blackStone = blackStone;   /* (a vertex-coloured material on a mesh with no colours draws black) */
    return out; });
  if (r.openShot) require('fs').writeFileSync(SHOTS + '/rs672.png', Buffer.from(r.openShot.split(',')[1], 'base64')); r.openShot = !!r.openShot;
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(!r.none && r.gate, 'a graveyard near the start, built as a doorway');
  A(r.behind < 0, 'you come at it from behind the crypt');
  A(r.scale===1.55 && r.clearIn, 'a little bigger than the other sites (RS-684), nothing growing inside its railings');
  A(r.walk, 'stepping onto it you walk up to the crypt');
  A(r.thru===0, 'the way round keeps outside the railings until the gate');
  A(r.maxGlow > 1.5, 'its carving wakes');
  A(r.maxA > 1.3, 'its gates swing open');
  A(r.down > 0.3, 'you go down the stair');
  A(r.mode===1 && r.kind==='graveyard', 'and on into the graveyard below');
  A(r.shut < 0.01, 'the gates are shut again behind you');
  A(r.blackStone===0, 'every stone has its colours');
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
