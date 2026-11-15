// RS-663 (after RS-662's lumps): the barrow's door dug into its mound: one sheet of turf (no lumps laid on), up behind the lintel to its top, banked down either side
// over the facade slabs to the ground past the last of them, and none over the doorway or the stair. Heights read straight down onto the
// turf in each barrow's own space, every barrow near the start. Shot: shots/rs663.png
module.exports = async page=>{
  page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const r = await page.evaluate(async ()=>{ const fr = n=>new Promise(res=>{ let i = 0; const f = ()=>++i >= n ? res() : requestAnimationFrame(f); requestAnimationFrame(f); });
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.gameMode = 0; G.player.clock = DAY_LENGTH*0.45;
    const m = G.ow.map, sites = questNearbySites(G.owPos.x, G.owPos.y, 1, 80, ['dungeon']).filter(s=>m[s.x][s.y]===OW_DUNGEON);
    let s = null; for (const c of sites) for (const [dx, dy] of [[1,1],[0,1],[1,0],[-1,1]]){ const q = owNb(c.x, c.y, dx, dy); if (s || !q || ![OW_GRASS, OW_FOREST, OW_DESERT, OW_TUNDRA, OW_SWAMP].includes(m[q[0]][q[1]])) continue; s = { x:q[0], y:q[1] }; }
    if (!s) return { none:true }; G.owPos = s; owReveal(s.x, s.y, 8); await fr(150);
    const out = [], mt = o3Mats(), rc = new THREE.Raycaster(), r2 = x=>x===null ? null : +x.toFixed(2);
    for (const [k, g] of (O3.doors || new Map())){ if (!g.doorLintel || !g.doorTurf) continue; g.updateMatrixWorld(true); const inv = g.matrixWorld.clone().invert(), v = new THREE.Vector3();
      const lb = new THREE.Box3(), lp = g.doorLintel.geometry.attributes.position, LM = new THREE.Matrix4().multiplyMatrices(inv, g.doorLintel.matrixWorld); for (let i=0;i<lp.count;i++) lb.expandByPoint(v.fromBufferAttribute(lp, i).applyMatrix4(LM));
      const at = (x, z)=>{ const o = new THREE.Vector3(x, 5, z).applyMatrix4(g.matrixWorld), d = new THREE.Vector3(x, 0, z).applyMatrix4(g.matrixWorld).sub(o).normalize(); rc.set(o, d); const h = rc.intersectObject(g.doorTurf, false)[0]; return h ? h.point.applyMatrix4(inv).y : null; };
      let turfN = 0; g.traverse(o=>{ if (o.isMesh && o.material && /^barrowTurf/.test(Object.keys(mt).find(k=>mt[k]===o.material) || '')) turfN++;   /* (RS-754: or its land's, barrowTurf_<biome>) */ });
      const L = { top:lb.max.y, back:lb.min.z, mid:(lb.min.z + lb.max.z)/2, x1:Math.max(-lb.min.x, lb.max.x) };
      out.push({ k, pit:!!g.doorPit, turfN, lin:{ top:r2(L.top), back:r2(L.back), x1:r2(L.x1) }, behind:r2(at(0, L.back - 0.03)),
        bank:[-1, 1].map(s=>r2(at(s*(L.x1 - 0.1), L.back - 0.3))), out:[-1, 1].map(s=>r2(at(s*1.05, L.back))), door:r2(at(0, L.mid + 0.15)) }); }
    return { at:s, doors:out }; });
  await page.screenshot({ path: SHOTS + '/rs663.png' });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(!r.none && r.doors.length >= 1, 'a barrow is found with its lintel and turf');
  A(r.doors.some(d=>d.pit) || r.doors.some(d=>!d.pit), 'barrows read');
  for (const d of r.doors){ const j = JSON.stringify(d);
    A(d.turfN===1, 'one sheet of turf, no lumps laid on: ' + j);
    A(d.behind!==null && d.behind >= d.lin.top - 0.03, 'the turf rises behind the lintel to its top, the door dug into the hill: ' + j);
    for (const b of d.bank) A(b!==null && b > 0.2 && b < d.lin.top, 'a bank of turf either side, lower than the lintel: ' + j);
    for (const o of d.out) A(o===null || o < 0.12, 'the bank down to the ground past the facade: ' + j);
    A(d.door===null || d.door < 0.05, 'no turf over the doorway or the stair: ' + j); }
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
