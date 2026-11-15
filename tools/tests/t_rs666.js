// RS-666: after coming out of a barrow you stand on its tile, 1.05 out in front of the door (RS-651), and every step used to wait
// for the figure to come within FIG_LAG_MAX of the tile's middle - which it never did, so you couldn't click to move or walk off.
// A barrow near the start: stand on its tile, let the figure settle, then click-walk and key-walk away from it.
module.exports = async page=>{
  page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const r = await page.evaluate(async ()=>{ const fr = n=>new Promise(res=>{ let i = 0; const f = ()=>++i >= n ? res() : requestAnimationFrame(f); requestAnimationFrame(f); });
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.gameMode = 0; G.player.clock = DAY_LENGTH*0.45;
    const m = G.ow.map, open = [OW_GRASS, OW_FOREST, OW_DESERT, OW_TUNDRA, OW_SWAMP], sites = questNearbySites(G.owPos.x, G.owPos.y, 1, 80, ['dungeon']).filter(s=>m[s.x][s.y]===OW_DUNGEON);
    let b = null; for (const c of sites){ if (b) break; const n = [[0,1],[1,0],[-1,0],[0,-1]].map(([dx, dy])=>owNb(c.x, c.y, dx, dy)).filter(q=>q && open.includes(m[q[0]][q[1]])); if (n.length >= 2) b = { x:c.x, y:c.y, n }; }
    if (!b) return { none:true };
    const out = { at:b };
    const stand = async ()=>{ G.owPos = { x:b.x, y:b.y }; O3.path = []; O3.prevTile = b.n[0]; owReveal(b.x, b.y, 8); await fr(120); return { lag:+figLag().toFixed(2), off:o3SiteStandOff(b.x, b.y) }; };
    out.s1 = await stand(); const q = b.n[1]; o3WalkTo({ kind:'ground', x:q[0], y:q[1] }); await fr(120);
    out.click = { now:{ ...G.owPos }, ui:G.ui };
    out.s2 = await stand(); const d = [q[0] - b.x, q[1] - b.y]; moveDir(d[0], d[1]); await fr(60);
    out.key = { now:{ ...G.owPos }, ui:G.ui };
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(!r.none, 'a barrow with open land beside it near the start');
  A(r.s1.off && Math.hypot(r.s1.off[0], r.s1.off[1]) > FIG_LAG_MAX_T, 'the barrow\'s stand-off is past the old limit (the case that stuck)');
  A(r.s1.lag < 0.1, 'the figure counts as caught up where it stands');
  A(r.click.now.x!==r.at.x || r.click.now.y!==r.at.y, 'a click walks you off the barrow\'s tile');
  A(r.key.now.x!==r.at.x || r.key.now.y!==r.at.y, 'a key step walks you off it');
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
const FIG_LAG_MAX_T = 0.75;
