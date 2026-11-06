// RS-344: a floor's shaders are all built while it loads - its props and its monsters too - so nothing compiles on a step
// through it. Seeing the whole floor at once right after loading adds no shader program; nor does a walk across it
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); G.player.wildWarned = 1; saveCurrentGame = ()=>{};
    let dx=-1, dy=-1; for (let x=0;x<OW_COLS && dx<0;x++) for (let y=0;y<OW_ROWS;y++) if (G.ow.map[x][y]===OW_DUNGEON){ dx=x; dy=y; break; }
    G.pendingDungeon = {x:dx, y:dy}; enterDungeonConfirm(); setUi('playing');
    // a floor with plenty on it: a chest, gold, a couple of items, the dressing it has, and its monsters
    for (let i=0;i<2;i++){ loadLevel(2 + i, false); setUi('playing'); }
    const place = (t, fn)=>{ for (let x=2;x<COLS-2;x++) for (let y=2;y<ROWS-2;y++) if (G.map[x][y]===T_FLOOR && !(G.dungeonDeco[x][y]) && !(x===G.player.x && y===G.player.y)){ G.map[x][y] = t; if (fn) fn(x, y); return; } };
    place(T_VAULT); place(T_GOLD); place(T_ITEM, (x, y)=>{ G.floorItem[x][y] = genItem(10, 'weapon'); }); place(T_ITEM, (x, y)=>{ G.floorItem[x][y] = mkAntipoison(); });
    FPD.mapRef = null; renderGame(); await new Promise(r=>setTimeout(r, 300));
    const out = { warmN:FPD.warmN, mons:G.mon.filter(m=>m.alive).length, decos:[...new Set([].concat(...G.dungeonDeco.map(c=>c.filter(Boolean))))].length };
    const n0 = FPD.r.info.programs.length, keys0 = new Set(FPD.r.info.programs.map(p=>p.cacheKey));
    // every tile seen and lit at once: everything the floor has is drawn in one frame
    for (let x=0;x<COLS;x++) for (let y=0;y<ROWS;y++) G.dungeonSeen[x][y] = true;
    const cs0 = fpCollectSprites; fpCollectSprites = vis=>cs0({ has:()=>true, size:vis&&vis.size });
    for (let i=0;i<3;i++){ renderGame(); await new Promise(r=>setTimeout(r, 100)); }
    out.afterSeen = FPD.r.info.programs.length - n0; fpCollectSprites = cs0;
    // and a walk across it: plain floor only, with the monsters standing still (a fight, a summoner's skeletons or a
    // mimic waking are new things, not a warm-up gap)
    tickMonsters = ()=>{};
    const sigOf = (o)=>[].concat(o.material).map(m=>{ let ch = [], q = o; while (q && ch.length < 5){ ch.push(q.name||q.type); q = q.parent; } return ch.join('<')+' '+m.type+(m.map?'/map':'')+(m.normalMap?'/nrm':'')+(m.vertexColors?'/vc':'')+(m.transparent?'/tr':'')+'/s'+m.side+(m.flatShading?'/fs':'')+'/'+(m.customProgramCacheKey?m.customProgramCacheKey():'')+(o.scale.x<0||o.scale.y<0||o.scale.z<0?'/mirrored':''); });
    const sigs = ()=>{ const S = new Set(); FPD.scene.traverse(o=>{ if (o.material) for (const x of sigOf(o)) S.add(x); }); return S; };
    const sig0 = sigs();
    let maxStep = 0; const dirs = [[1,0],[0,1],[-1,0],[0,-1]];
    for (let i=0;i<16;i++){ G.player.hp = effMaxHp(); G.ui = 'playing'; if (G.gameMode!==1) break;
      const m0 = G.map;
      for (const [a,b] of dirs){ const x0 = G.player.x, y0 = G.player.y, nx = x0+a, ny = y0+b; if (!G.map[nx] || G.map[nx][ny]!==T_FLOOR || G.mon.some(m=>m.alive && m.x===nx && m.y===ny)) continue; const t0 = performance.now(); moveDir(a,b); const t = performance.now()-t0; if (G.player.x!==x0 || G.player.y!==y0){ if (G.map===m0) maxStep = Math.max(maxStep, t); break; } }
      if (G.map!==m0) break; await new Promise(r=>setTimeout(r, 80)); }
    out.afterWalk = FPD.r.info.programs.length - n0; out.newKeys = FPD.r.info.programs.filter(p=>!keys0.has(p.cacheKey)).map(p=>p.name+' :: '+p.cacheKey); out.newMats = [...sigs()].filter(x=>!sig0.has(x)); out.maxStep = +maxStep.toFixed(0); out.progs = n0;
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.warmN >= 4 && r.mons >= 1, 'the floor had props and monsters to warm up');
  A(r.afterSeen===0, 'seeing the whole floor at once compiles no new shader');
  A(r.afterWalk===0, 'walking it compiles none either');
};
