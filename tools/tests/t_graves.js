// RS-136: every death leaves its own gravestone (up to GRAVE_MAX); all of them show, the nearest is the one you head for,
// and picking one up leaves the others waiting. Older saves with one grave carry it over.
module.exports = async page=>{
  const ev = (f, a)=>page.evaluate(f, a), A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
  const r = await ev(()=>{ const out = {}, p = G.player || null;
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); o3Pref = false; G.gameMode = 0;
    const P = G.player, spot = (d)=>{ for (let k=d; k<d+20; k++) for (const [dx,dy] of [[k,0],[-k,0],[0,k],[0,-k]]){ const x = G.owPos.x+dx, y = G.owPos.y+dy; if (o3Passable(x,y) && !OW_SITE_TILES.includes(G.ow.map[x][y])) return [x,y]; } return null; };
    const die = (x, y)=>{ G.owPos.x = x; G.owPos.y = y; G.gameMode = 0; P.gold = 1000; G.deathWild = false; playerDies('a test'); G.deathWild = false; continueAfterDeath(); G.gameOver = 0; };
    const home = [G.owPos.x, G.owPos.y], a = spot(8), b = spot(25);
    die(a[0], a[1]); die(b[0], b[1]);
    out.n = P.graves.length; out.at = P.graves.map(g=>[g.x,g.y]);
    // nearest is the one you head for
    G.owPos.x = a[0]+1; G.owPos.y = a[1]; graveCheck(); out.nearA = P.grave && P.grave.x===a[0] && P.grave.y===a[1];
    G.owPos.x = b[0]+1; G.owPos.y = b[1]; graveCheck(); out.nearB = P.grave && P.grave.x===b[0] && P.grave.y===b[1];
    // pick up the one at b: the one at a still waits
    G.owPos.x = b[0]; G.owPos.y = b[1]; graveCheck(); out.left = P.graves.length; out.leftAt = P.grave && [P.grave.x, P.grave.y];
    // an old save with only p.grave
    P.graves = undefined; P.grave = { x:a[0], y:a[1], items:[], gold:5, place:'old', cause:'old', when:1 }; out.migr = gravesP().length===1 && !!P.grave.id;
    // the cap
    P.graves = []; P.grave = null; for (let i=0;i<GRAVE_MAX+2;i++) die(a[0], a[1]); out.capped = P.graves.length;
    return out; });
  console.log(JSON.stringify(r));
  A(r.n===2, 'two deaths, two gravestones: '+JSON.stringify(r));
  A(r.nearA && r.nearB, 'the nearest gravestone is the one you head for');
  A(r.left===1 && r.leftAt && r.leftAt[0]===r.at[0][0], 'picking one up leaves the other waiting');
  A(r.migr, 'an older save keeps its single gravestone');
  A(r.capped===10, 'at most ten gravestones wait at once');
};
