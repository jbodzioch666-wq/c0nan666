// (art probe, not in ALL) a site of a named kind on a fixed world seed, into shots/zdg_<name>.png; ZDG_GPU=1 prints the card's ms.
// ZDG='[["name", "kind", depth, dist], ...]' - kinds dungeon, mine, graveyard (depth 2 = the catacombs), necro, temple, castle, pyramid, lair
module.exports = async page=>{
  const sets = process.env.ZDG ? JSON.parse(process.env.ZDG) : [['dungeon', 'dungeon', 1], ['mine', 'mine', 1], ['crypt', 'graveyard', 2]];
  const seed = +(process.env.ZSEED || 12345);
  await page.evaluate(seed=>{ goToCharCreate(); ccBegin(); wgRegenerate(seed); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; weatherSync = ()=>{}; window.__zdgGpu = !!window.__zdgGpuWant; }, seed);
  if (process.env.ZDG_GPU) await page.evaluate(()=>{ window.__zdgGpu = true; });
  if (process.env.ZNOCHEAP) await page.evaluate(()=>{ window.__noCheapPt = true; const C = THREE.ShaderChunk; if (C.__ptOrig) C.shadowmap_pars_fragment = C.__ptOrig; });
  if (process.env.ZDG_WAIT) await page.evaluate(w=>{ window.__zdgWait = w; }, +process.env.ZDG_WAIT);
  for (const [nm, kind, depth, dist] of sets){
    const r = await page.evaluate(async ([kind, depth, dist])=>{ G.gameMode = 0; G.ui = 'playing';
      const want = kind==='dungeon' ? OW_DUNGEON : Object.keys(TILE_SITE_KIND).find(k=>TILE_SITE_KIND[k]===kind)|0; let dx = -1, dy = -1;
      for (let x=0;x<OW_COLS && dx<0;x++) for (let y=0;y<OW_ROWS;y++) if (G.ow.map[x][y]===want){ dx = x; dy = y; break; }
      if (dx < 0) return { missing:kind };
      G.pendingDungeon = { x:dx, y:dy }; enterDungeonConfirm(); setUi('playing'); G.mon = [];
      if (depth && depth > 1){ loadLevel(depth, false); G.mon = []; }
      if (dist) ISO.dist = dist; G.player.clock = DAY_LENGTH*0.5;
      for (let i=0;i<(+window.__zdgWait || 16);i++){ renderGame(); await new Promise(r=>setTimeout(r, 40)); }
      let gpu = null; if (window.__zdgGpu){ SET.fps = true; for (let k=0;k<3;k++){ PROF.t = {}; PROF.gpuN = 0; for (let i=0;i<80;i++){ renderGame(); gfxGpuPoll(); await new Promise(r=>setTimeout(r, 16)); } gfxGpuPoll(); if (PROF.gpuN > 10){ const n = PROF.gpuN; gpu = { gpu:+((PROF.t.gpu||0)/n).toFixed(2), sc:+((PROF.t.g_scene||0)/n).toFixed(2), post:+((PROF.t.g_post||0)/n).toFixed(2), n }; break; } } SET.fps = false; }
      return { at:[dx, dy], kind:G.siteKind, theme:fpTheme().key, depth:G.depth, gpu }; }, [kind, depth, dist]);
    console.log(nm, JSON.stringify(r));
    await page.screenshot({ path: SHOTS + '/zdg_' + nm + '.png', timeout:120000 });
  }
};
