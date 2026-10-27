// RS-686: no more clusters of sites. Generator 22 keeps a site's spacing before its liked terrain (a graveyard looked for tundra all
// the way down to touching another site, so a world with a little tundra had them side by side) and halves the graveyards (as many as
// the mines before); a mine (its gate in its mountain) and a pyramid (in its sand) keep to their ground. An older world keeps its generator's counts and its sites where they were
module.exports = async page=>{
  page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const r = await page.evaluate(()=>{ const out = {}; goToCharCreate(); ccBegin();
    const look = ()=>{ const cube = owCube(), M = G.ow.map, sites = [], gy = []; for (let x=0;x<OW_COLS;x++) for (let y=0;y<OW_ROWS;y++){ if (cube && cubeFace(x, y) < 0) continue; const t = M[x][y]; if (OW_SITE_TILES.includes(t)){ sites.push([x, y, t]); if (t===OW_GRAVEYARD) gy.push([x, y]); } }
      let near = 0, pack = 0, gpack = 0; for (const [x, y, t] of sites){ if (t===OW_TOWN) continue; if (sites.some(([a, b])=>(a!==x || b!==y) && Math.hypot(a - x, b - y) < 4)) near++; pack = Math.max(pack, sites.filter(([a, b, u])=>u!==OW_TOWN && Math.hypot(a - x, b - y) <= 8).length); }
      for (const [x, y] of gy) gpack = Math.max(gpack, gy.filter(([a, b])=>Math.hypot(a - x, b - y) <= 12).length);
      return { ver:G.ow.genVer, graveyards:gy.length, ng:NGRAVEYARD, near, pack, gpack }; };
    setWorldSizeTier('medium'); for (const seed of [777, 31337]){ wgRegenerate(seed); out['medium' + seed] = look(); }
    setWorldSizeTier('planet'); for (const seed of [777, 424242]){ wgRegenerate(seed); out['planet' + seed] = look(); }
    setWorldSizeTier('medium'); G.ow.genVer = 21; wgRegenerate(777); out.old = look(); G.ow.genVer = OW_GEN_VER;
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  const now = ['medium777', 'medium31337', 'planet777', 'planet424242'].map(k=>r[k]);
  A(now.every(w=>w.ver===22), 'new worlds on generator 22');
  A(now.every(w=>w.near===0), 'no site within 4 tiles of another');
  A(now.every(w=>w.pack <= 3), 'no more than three sites within 8 tiles of one');
  A(r.medium777.graveyards===4 && r.planet777.graveyards <= 13 && now.every(w=>w.graveyards===w.ng), 'half as many graveyards: 4 on a medium world');
  A(now.every(w=>w.gpack <= 3), 'and no clusters of them (a planet had five within 12 of one)');
  A(r.old.ver===21 && r.old.ng===8 && r.old.graveyards===8, 'an older world keeps its generator\'s eight');
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
