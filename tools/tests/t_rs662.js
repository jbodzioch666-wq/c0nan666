// RS-662: the barrow's door set into its mound: the turf over the passage rises behind the lintel to its top (not a low lump in front of
// the hill), and two low banks of turf either side bury the facade slabs' backs. Every barrow near the start, in its own group's space.
// Shot: shots/rs662.png
module.exports = async page=>{
  page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const r = await page.evaluate(async ()=>{ const fr = n=>new Promise(res=>{ let i = 0; const f = ()=>++i >= n ? res() : requestAnimationFrame(f); requestAnimationFrame(f); });
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.gameMode = 0; G.player.clock = DAY_LENGTH*0.45;
    const m = G.ow.map, sites = questNearbySites(G.owPos.x, G.owPos.y, 1, 80, ['dungeon']).filter(s=>m[s.x][s.y]===OW_DUNGEON);
    let s = null; for (const c of sites) for (const [dx, dy] of [[1,1],[0,1],[1,0],[-1,1]]){ const q = owNb(c.x, c.y, dx, dy); if (s || !q || ![OW_GRASS, OW_FOREST, OW_DESERT, OW_TUNDRA, OW_SWAMP].includes(m[q[0]][q[1]])) continue; s = { x:q[0], y:q[1] }; }
    if (!s) return { none:true }; G.owPos = s; owReveal(s.x, s.y, 8); await fr(150);
    const out = [];
    for (const [k, g] of (O3.doors || new Map())){ if (!g.doorLintel) continue; g.updateMatrixWorld(true); const inv = g.matrixWorld.clone().invert(), v = new THREE.Vector3();
      const box = o=>{ const p = o.geometry.attributes.position, M = new THREE.Matrix4().multiplyMatrices(inv, o.matrixWorld), b = new THREE.Box3(); for (let i=0;i<p.count;i++) b.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(M)); return b; };
      const lb = box(g.doorLintel), parts = { lobe:[], cheek:[] }; g.traverse(o=>{ if (o.isMesh && o.userData.barrow) parts[o.userData.barrow].push(box(o)); });
      const r2 = x=>+x.toFixed(2);
      out.push({ k, pit:!!g.doorPit, lin:{ top:r2(lb.max.y), back:r2(lb.min.z), x0:r2(lb.min.x), x1:r2(lb.max.x) }, lobe:parts.lobe.map(b=>({ top:r2(b.max.y), front:r2(b.max.z) })),
        cheek:parts.cheek.map(b=>({ x:r2((b.min.x + b.max.x)/2), w:r2(b.max.x - b.min.x), h:r2(b.max.y - b.min.y), y0:r2(b.min.y) })) }); }
    return { at:s, doors:out }; });
  await page.screenshot({ path: SHOTS + '/rs662.png' });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(!r.none && r.doors.length >= 1, 'a barrow is found with its lintel');
  for (const d of r.doors){ const j = JSON.stringify(d);
    A(d.lobe.length===1, 'one lobe of turf over the door: ' + j);
    A(d.lobe[0].top >= d.lin.top + 0.1, 'the turf rises above the lintel, the door set into the hill: ' + j);
    A(d.lobe[0].front >= d.lin.back - 0.06, 'its face meets the lintel\'s back, no gap of ground between: ' + j);
    A(d.cheek.length===2 && d.cheek.some(c=>c.x < d.lin.x0 + 0.1) && d.cheek.some(c=>c.x > d.lin.x1 - 0.1), 'a bank either side of the door: ' + j);
    for (const c of d.cheek) A(c.w > c.h*1.2 && c.y0 < 0, 'each bank low and broad, sunk into the ground: ' + j); }
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
