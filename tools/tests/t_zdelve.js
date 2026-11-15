// (probe, not in ALL) a cave, a grotto and a ruin delve with the real warm-up on: the entry frames, then a steady stretch -
// frame times, draw calls, triangles, lights, shadow casters, and the scene's heaviest meshes
module.exports = async page=>{
  page.setDefaultTimeout(0);
  const r = await page.evaluate(async ()=>{ window.__noWarmSlice = false; goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1;
    const p = G.player; p.hp = p.maxHp = 99999;
    const fr = async n=>{ const f = []; let last = performance.now(); for (let i=0;i<n;i++){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); const now = performance.now(); f.push(now - last); last = now; } return f; };
    const out = {};
    for (const kind of ['cave', 'grotto', 'ruin']){
      const poi = (G.ow.pois||[]).find(q=>q.k===kind) || { k:kind, id:'z' + kind, x:G.owPos.x, y:G.owPos.y, name:'the ' + kind };
      G.gameMode = 0; setUi('playing'); await fr(10);
      wgDelve(poi); setUi('playing'); for (const m of G.mon) m.ai = 'idle';
      const entry = await fr(120); const steady = await fr(180); steady.sort((a, b)=>a - b);
      const R = FPD.r, sc = FPD.scene; let meshes = 0, casters = 0, inst = 0, lights = 0, shadowLights = 0; const heavy = [];
      sc.traverse(o=>{ if (o.isLight){ lights++; if (o.castShadow && o.visible && o.intensity > 0) shadowLights++; } if (!o.isMesh || !o.visible) return; meshes++; if (o.castShadow) casters++; if (o.isInstancedMesh) inst += o.count;
        const g = o.geometry, tri = (g.index ? g.index.count : g.attributes.position.count)/3*(o.isInstancedMesh ? o.count : 1); heavy.push([o.name || o.geometry.type || o.type, Math.round(tri), o.isInstancedMesh ? o.count : 1]); });
      heavy.sort((a, b)=>b[1] - a[1]);
      R.info.autoReset = false; R.info.reset(); renderGame(); await new Promise(r=>requestAnimationFrame(r)); const calls = R.info.render.calls, tris = R.info.render.triangles; R.info.autoReset = true;
      out[kind] = { entryWorst:entry.slice().sort((a, b)=>b - a).slice(0, 4).map(Math.round), median:Math.round(steady[steady.length>>1]), p90:Math.round(steady[Math.floor(steady.length*0.9)]), worst:Math.round(steady[steady.length - 1]),
        calls, tris, meshes, casters, instances:inst, lights, shadowLights, mons:G.mon.length, heavy:heavy.slice(0, 8), deco:(()=>{ const c = {}; for (let x=0;x<COLS;x++) for (let y=0;y<ROWS;y++){ const d = G.arenaDeco && G.arenaDeco[x][y]; if (d) c[d] = (c[d]||0) + 1; } return c; })(), size:COLS + 'x' + ROWS, theme:G.arenaTheme };
      try{ G.mon.forEach(m=>m.alive = 0); }catch(e){}
    }
    /* and a plain roadside fight for comparison */
    G.gameMode = 0; setUi('playing'); await fr(10);
    return out; });
  for (const k in r) console.log(k, JSON.stringify(r[k]));
};
