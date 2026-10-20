// (probe, not in ALL) the same thing done three times over, with the game's warm-up on as it really runs: into a building and out,
// down a floor and back up, out of town and back in. For each repeat: its worst frames, and what was made again - shader programs,
// textures and geometries on the card, scene builds, creature templates, materials the warm-up hid and warmed again
module.exports = async page=>{
  page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push('page: ' + String(e).slice(0, 200))); page.on('console', m=>{ if (m.type()==='error') errs.push('console: ' + m.text().slice(0, 200)); });
  await page.evaluate(()=>{ window.__noWarmSlice = false; });
  const r = await page.evaluate(async ()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1;
    const C = { build:0, buildMs:0, fpd:0, fpdMs:0, tpl:0, tplMs:0, warmMats:0, warmCalls:0, texNew:0 };
    const wrap = (name, key, msKey)=>{ const f = window[name]; if (typeof f!=='function') return; window[name] = function(){ const t0 = performance.now(); try{ return f.apply(this, arguments); } finally { C[key]++; if (msKey) C[msKey] += performance.now() - t0; } }; };
    wrap('v3BuildScene', 'build', 'buildMs'); wrap('fpdBuild', 'fpd', 'fpdMs'); wrap('m3dTemplateSkin', 'tpl', 'tplMs');
    const cs = gfxCompileSliced; gfxCompileSliced = function(V, r, scene){ const before = gfxWarmSeen(r); let n = 0; scene.traverse(o=>{ if (o.material) for (const m of [].concat(o.material)) if (!before.has(m)) n++; }); C.warmMats += n; C.warmCalls++; return cs.apply(this, arguments); };
    const TX = THREE.Texture; const onTex = THREE.Texture.prototype.onUpdate;
    const rs = ()=>[typeof V3!=='undefined' && V3.renderer, typeof O3!=='undefined' && O3.renderer, FPD.r].filter(Boolean);
    const snap = ()=>{ const s = { progs:0, tex:0, geo:0 }; for (const r of rs()){ s.progs += r.info.programs.length; s.tex += r.info.memory.textures; s.geo += r.info.memory.geometries; } return Object.assign(s, JSON.parse(JSON.stringify(C))); };
    const fr = async n=>{ const f = []; let last = performance.now(); for (let i=0;i<n;i++){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); const now = performance.now(); f.push(now - last); last = now; } return f; };
    const out = [];
    const step = async (label, act, n)=>{ const a = snap(); act(); const f = await fr(n||90); const b = snap(); const d = {}; for (const k in b) if (typeof b[k]==='number') d[k] = +(b[k] - a[k]).toFixed(0);
      f.sort((x, y)=>y - x); out.push({ label, worst:f.slice(0, 3).map(x=>Math.round(x)), over50:f.filter(x=>x > 50).length, ...d }); };
    /* a town: in and out of a shop, three times */
    const t = G.ow.spawnPos; G.owPos = { x:t.x, y:t.y }; await step('enter town', ()=>{ enterVillage(); setUi('playing'); }, 150); townClosedCheck = ()=>false;
    const key = (G.townVendors||[]).map(v=>v.key).find(k=>ROOM_LAYOUT[k]);
    for (let i=1;i<=3;i++){ await step('into shop ' + i, ()=>enterInterior(key)); await step('out of shop ' + i, ()=>exitInterior()); }
    /* out of the town and back in, three times */
    for (let i=1;i<=3;i++){ await step('to the land ' + i, ()=>{ G.gameMode = 0; G.villageNpcs = []; setUi('playing'); }, 120); await step('back into town ' + i, ()=>{ enterVillage(); setUi('playing'); }, 120); }
    /* a dungeon: down a floor and back up, three times */
    G.gameMode = 0; setUi('playing'); await fr(30);
    const s = questNearbySites(G.owPos.x, G.owPos.y, 1, 60, ['dungeon'])[0]; G.pendingDungeon = { x:s.x, y:s.y }; await step('into the dungeon', ()=>{ enterDungeonConfirm(); setUi('playing'); G.player.hp = G.player.maxHp = 99999; }, 200);
    for (let i=1;i<=3;i++){ await step('down to floor 2 (' + i + ')', ()=>{ for (const m of G.mon) m.alive = 0; saveLevelCache(G.depth); loadLevel(G.depth + 1, false); setUi('playing'); }, 150);
      await step('up to floor 1 (' + i + ')', ()=>{ for (const m of G.mon) m.alive = 0; saveLevelCache(G.depth); loadLevel(G.depth - 1, true); setUi('playing'); }, 150); }
    return out; });
  for (const q of r) console.log(JSON.stringify(q));
  console.log('errors', JSON.stringify(errs.slice(0, 8)));
};
