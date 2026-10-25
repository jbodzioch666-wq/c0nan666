// RS-661: the barrow's mound runs out into the land: a low swell with a skirt that meets the ground flat and sinks under it (not a half
// ball standing on it), wider than it is tall, reaching farther at the back than at the door, and washed toward the land's colour at its edge.
// Every barrow near the start is checked, in its own group's space. Shot: shots/rs661.png
module.exports = async page=>{
  page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const r = await page.evaluate(async ()=>{ const fr = n=>new Promise(res=>{ let i = 0; const f = ()=>++i >= n ? res() : requestAnimationFrame(f); requestAnimationFrame(f); });
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.gameMode = 0; G.player.clock = DAY_LENGTH*0.45;
    const m = G.ow.map, sites = questNearbySites(G.owPos.x, G.owPos.y, 1, 80, ['dungeon']).filter(s=>m[s.x][s.y]===OW_DUNGEON);
    let s = null; for (const c of sites) for (const [dx, dy] of [[1,1],[0,1],[1,0],[-1,1]]){ const q = owNb(c.x, c.y, dx, dy); if (s || !q || ![OW_GRASS, OW_FOREST, OW_DESERT, OW_TUNDRA, OW_SWAMP].includes(m[q[0]][q[1]])) continue; s = { x:q[0], y:q[1] }; }
    if (!s) return { none:true }; G.owPos = s; owReveal(s.x, s.y, 8); await fr(150);
    const out = [], turfMap = O3.mats && O3.mats.turf && O3.mats.turf.map;
    for (const [k, g] of (O3.doors || new Map())){ g.updateMatrixWorld(true); const inv = g.matrixWorld.clone().invert(), v = new THREE.Vector3();
      g.traverse(o=>{ if (!o.isMesh || !o.material || o.material.map!==turfMap || !o.geometry.attributes.color) return; if (o.material.color.r > 0.9 && !o.material.vertexColors) return;
        const p = o.geometry.attributes.position, c = o.geometry.attributes.color, M = new THREE.Matrix4().multiplyMatrices(inv, o.matrixWorld); let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9, z0 = 1e9, z1 = -1e9, lowC = 0, lowN = 0, topC = 0, topN = 0;
        for (let i=0;i<p.count;i++){ v.fromBufferAttribute(p, i).applyMatrix4(M); x0 = Math.min(x0, v.x); x1 = Math.max(x1, v.x); y0 = Math.min(y0, v.y); y1 = Math.max(y1, v.y); z0 = Math.min(z0, v.z); z1 = Math.max(z1, v.z); }
        for (let i=0;i<p.count;i++){ v.fromBufferAttribute(p, i).applyMatrix4(M); const sum = c.getX(i) + c.getY(i) + c.getZ(i); if (v.y < y0 + (y1 - y0)*0.05){ lowC += sum; lowN++; } else if (v.y > y1 - (y1 - y0)*0.2){ topC += sum; topN++; } }
        out.push({ k, w:+(x1 - x0).toFixed(2), d:+(z1 - z0).toFixed(2), h:+(y1 - y0).toFixed(2), y0:+y0.toFixed(3), low:+(lowC/Math.max(1, lowN)).toFixed(2), top:+(topC/Math.max(1, topN)).toFixed(2), pit:!!g.doorPit }); }); }
    return { at:s, mounds:out }; });
  await page.screenshot({ path: SHOTS + '/rs661.png' });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(!r.none && r.mounds.length >= 1, 'a barrow is found and its mound read');
  const big = r.mounds.filter(o=>o.h > 0.4);   /* (the mound, not the lobe over the door) */
  A(big.length >= 1, 'a mound among them');
  for (const o of big){
    A(o.w/o.h > 2.2, 'wider than tall by far, a swell not a ball: ' + JSON.stringify(o));
    A(o.y0 < -0.01, 'its edge sinks under the ground: ' + JSON.stringify(o));
    A(Math.abs(o.low - o.top) > 0.05, 'its skirt washed toward the land\'s colour: ' + JSON.stringify(o)); }
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
