// RS-668: the Dwarf Gate. Generator 21 sets every mine at the foot of a mountain (one right beside it, open land across from it), and the 3D
// gate turns its back to that mountain; stepping onto it you walk up to the gate, its runes wake, the stone leaves swing in, and you go on
// into the dark and down into the mine. Shot: shots/rs668.png (the leaves open)
module.exports = async page=>{
  page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const r = await page.evaluate(async ()=>{ const fr = n=>new Promise(res=>{ let i = 0; const f = ()=>++i >= n ? res() : requestAnimationFrame(f); requestAnimationFrame(f); });
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.gameMode = 0; G.player.clock = DAY_LENGTH*0.4; window.__trans = true;   /* (the walk-in plays with transitions on) */
    const m = G.ow.map, open = [OW_GRASS, OW_FOREST, OW_DESERT, OW_TUNDRA, OW_SWAMP], N4 = [[0,1],[1,0],[0,-1],[-1,0]], out = { gen:G.ow.genVer, mines:0, side:0 };
    for (let x=0;x<OW_COLS;x++) for (let y=0;y<OW_ROWS;y++) if (m[x][y]===OW_MINE){ out.mines++; if (N4.some(([dx, dy])=>{ const a = owNbG(x, y, dx, dy), b = owNbG(x, y, -dx, -dy); return a && b && m[a[0]][a[1]]===OW_MOUNTAIN && open.includes(m[b[0]][b[1]]); })) out.side++; }
    /* the nearest gate: from the open tile across from its mountain, step on */
    const sites = questNearbySites(G.owPos.x, G.owPos.y, 1, 400, ['mine']).filter(s=>m[s.x][s.y]===OW_MINE); let at = null;
    for (const s of sites){ if (at) break; for (const [dx, dy] of N4){ const a = owNb(s.x, s.y, -dx, -dy), q = owNb(s.x, s.y, dx, dy); if (!at && a && q && m[a[0]][a[1]]===OW_MOUNTAIN && open.includes(m[q[0]][q[1]])) at = { s, q, d:[-dx, -dy] }; } }
    if (!at) return Object.assign(out, { none:true });
    G.owPos = { x:at.q[0], y:at.q[1] }; owReveal(at.q[0], at.q[1], 8); await fr(150);
    const C = o3C(at.s.x, at.s.y), g = O3.doors && O3.doors.get(Math.floor(C[0]) + ',' + Math.floor(C[1]));
    out.gate = !!(g && g.doorWay);
    if (g){ const f = new THREE.Vector3(0, 0, 1).applyQuaternion(g.quaternion), mc = o3C(at.s.x + at.d[0]*-1, at.s.y + at.d[1]*-1); out.facing = +(f.x*(mc[0] - C[0]) + f.z*(mc[1] - C[1])).toFixed(2); }   /* (its front toward the open tile, away from the mountain) */
    moveDir(at.d[0], at.d[1]); out.walk = !!O3.doorWalk; let maxA = 0, maxRune = 0, mode = 0, shot = false;
    const t0 = performance.now(); while (performance.now() - t0 < 15000 && G.gameMode===0){ await fr(1); const W = O3.doorWalk; if (W && W.dw){ const l = W.g.children.filter(c=>c.userData.mv && c.isGroup); for (const c of l) maxA = Math.max(maxA, Math.abs(c.rotation.y)); }
      if (g){ g.traverse(o=>{ if (o.isMesh && o.material && o.material.emissiveMap) maxRune = Math.max(maxRune, o.material.emissiveIntensity); }); }
      if (maxA > 1.4 && !shot){ shot = true; out.openShot = O3.renderer.domElement.toDataURL('image/png'); } }
    out.maxA = +maxA.toFixed(2); out.maxRune = +maxRune.toFixed(2); out.mode = G.gameMode; out.kind = G.siteKind; out.ui = G.ui;
    let shutA = 0; if (g) for (const c of g.children) if (c.userData.mv && c.isGroup) shutA = Math.max(shutA, Math.abs(c.rotation.y)); out.shut = +shutA.toFixed(2);
    return out; });
  if (r.openShot) require('fs').writeFileSync(SHOTS + '/rs668.png', Buffer.from(r.openShot.split(',')[1], 'base64')); r.openShot = !!r.openShot;
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.gen >= 21, 'a new world is made by generator 21');
  A(r.mines >= 3 && r.side >= r.mines - 1, 'the mines are at the foot of a mountain, looking out on open land');
  A(!r.none && r.gate, 'a gate near the start, built as a doorway');
  A(r.facing > 0.5, 'the gate looks out from the mountain');
  A(r.walk, 'stepping onto it you walk up to the gate');
  A(r.maxRune > 1.5, 'its runes wake');
  A(r.maxA > 1.3, 'its leaves swing open');
  A(r.mode===1 && r.kind==='mine', 'and you go on down into the mine');
  A(r.shut < 0.01, 'the leaves are shut again behind you');
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
