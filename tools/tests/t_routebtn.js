// RS-134: the route button over the hot bar - with no route it opens the world map ready to plan one; with one, it sets off; while walking, it stops
module.exports = async page=>{
  const ev = (f, a)=>page.evaluate(f, a), A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
  const r = await ev(async ()=>{ const out = {};
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); G.gameMode = 0; G.player.route = null; G.owZoomedOut = false; renderGame();
    const btn = ()=>document.querySelector('.dh-route');
    out.shown = !!btn(); out.lbl0 = btn() && btn().textContent;
    btn().click(); out.map = G.owZoomedOut; out.mode = G.mapMode;
    // plan a stop a few tiles away, then the button sets off
    let st = null; for (let d=6; d<14 && !st; d++) for (const [dx,dy] of [[d,0],[-d,0],[0,d],[0,-d]]){ const x = G.owPos.x+dx, y = G.owPos.y+dy; if (o3Passable(x,y)){ st = [x,y]; break; } }
    routeAdd(st[0], st[1]); renderGame(); out.lbl1 = btn().textContent;
    btn().click(); out.closed = !G.owZoomedOut; out.walking = routeWalking(); renderGame(); out.lbl2 = btn().textContent;
    btn().click(); out.stopped = !routeWalking(); out.kept = !!(G.player.route && G.player.route.pts.length); renderGame(); out.lbl3 = btn().textContent;
    // in town it says so instead
    G.gameMode = 3; const n0 = document.querySelectorAll('.notif, .toast').length; routeButton(); out.town = G.gameMode===3 && !G.owZoomedOut; G.gameMode = 0;
    return out; });
  console.log(JSON.stringify(r));
  A(r.shown && /ROUTE/.test(r.lbl0), 'a route button sits over the hot bar');
  A(r.map && r.mode==='route', 'with no route, it opens the world map ready to plan one');
  A(/GO/.test(r.lbl1), 'with a route planned, it offers to go');
  A(r.closed && r.walking && /STOP/.test(r.lbl2), 'tapping it sets off along the route');
  A(r.stopped && r.kept && /GO/.test(r.lbl3), 'tapping again stops, and keeps the route to carry on later');
  A(r.town, 'in town it does nothing but tell you');
};
module.exports.mobile = true;
