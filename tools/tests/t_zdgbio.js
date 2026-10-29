// (art probe, not in ALL; RS-754) a plain dungeon as each land would have it: owBiomeOf forced to each biome, the same barrow entered fresh.
// ZBIO='desert,tundra' picks the biomes (default all); ZOUT=1 instead shows the barrow from outside on the land. Shots: shots/zdgbio_<biome>.png
module.exports = async page=>{ page.setDefaultTimeout(0);
  const bios = (process.env.ZBIO || 'grass,forest,desert,tundra,swamp,jungle,volcanic,haunted,crystal').split(','), outside = !!process.env.ZOUT;
  const at = await page.evaluate(async seed=>{ const fr = n=>new Promise(res=>{ let i = 0; const f = ()=>++i >= n ? res() : requestAnimationFrame(f); requestAnimationFrame(f); });
    goToCharCreate(); ccBegin(); wgRegenerate(seed); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; weatherSync = ()=>{}; G.player.wildWarned = 1; G.player.hp = G.player.maxHp = 99999; G.player.clock = DAY_LENGTH*0.45;
    const m = G.ow.map; window.__owBio = owBiomeOf;
    const sites = questNearbySites(G.owPos.x, G.owPos.y, 1, 80, ['dungeon']).filter(s=>m[s.x][s.y]===OW_DUNGEON);
    for (const s of sites){ const q = owNb(s.x, s.y, 0, 1); if (q && OW_LAND_KEY[m[q[0]][q[1]]]) return { x:s.x, y:s.y, sx:q[0], sy:q[1] }; }
    return null; }, +(process.env.ZSEED || 12345));
  if (!at) throw new Error('no barrow');
  for (const b of bios){
    const r = await page.evaluate(async ([b, at, outside])=>{ const fr = n=>new Promise(res=>{ let i = 0; const f = ()=>++i >= n ? res() : requestAnimationFrame(f); requestAnimationFrame(f); });
      owBiomeOf = (x, y)=>b; G.dgCache = {};
      if (outside){ G.gameMode = 0; setUi('playing'); G.owPos = { x:at.sx, y:at.sy }; owReveal(at.sx, at.sy, 8); O3.win = null; ISO.rot = 0; O3.dist = 7; await fr(140); return { bio:b }; }
      G.gameMode = 0; G.ui = 'playing'; G.pendingDungeon = { x:at.x, y:at.y }; enterDungeonConfirm(); setUi('playing'); G.mon = []; ISO.dist = 9;
      for (let i=0;i<60;i++){ renderGame(); await new Promise(r=>setTimeout(r, 40)); }
      const out = { bio:b, theme:fpTheme().key, deco:{} }; for (const c of G.dungeonDeco) for (const d of c) if (d) out.deco[d] = (out.deco[d]||0) + 1; return out; }, [b, at, outside]);
    console.log(JSON.stringify(r));
    await page.screenshot({ path: SHOTS + '/zdgbio_' + (outside ? 'out_' : '') + b + '.png', timeout:120000 });
    if (!outside) await page.evaluate(()=>{ G.gameMode = 0; setUi('playing'); });
  }
};
