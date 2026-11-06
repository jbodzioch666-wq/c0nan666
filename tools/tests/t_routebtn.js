// RS-135: and the gravestone button beside it
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
    // RS-135: the gravestone button - only while a grave waits; walks you there, and stops
    G.player.route = null; G.routeWalk = null; if (O3.path) O3.path = []; G.player.grave = null; renderGame(); out.noGrave = !document.querySelector('.dh-grave');
    let gs = null; for (let d=8; d<16 && !gs; d++) for (const [dx,dy] of [[d,0],[-d,0],[0,d],[0,-d]]){ const x = G.owPos.x+dx, y = G.owPos.y+dy; if (o3Passable(x,y)){ gs = [x,y]; break; } }
    G.player.grave = { x:gs[0], y:gs[1], items:[], gold:50, place:'a meadow', cause:'a rat', when:Date.now() }; renderGame();
    const gb = ()=>document.querySelector('.dh-grave'); out.graveShown = !!gb() && /GRAVE/.test(gb().textContent);
    gb().click(); out.graveGo = graveWalking() && !routeWalking(); renderGame(); out.graveLbl = gb().textContent;
    gb().click(); out.graveStop = !graveWalking() && !!G.player.grave;
    G.owPos.x = gs[0]; G.owPos.y = gs[1]; const g0 = G.player.gold; gb().click(); out.reclaimed = !G.player.grave && G.player.gold === g0 + 50;
    // RS-136: the hot bar's slots scroll with a swipe, and a redraw doesn't throw away where you'd scrolled to
    const so = document.querySelector('.dh-slots'), cs = so && getComputedStyle(so); out.swipe = cs && cs.touchAction + '|' + cs.pointerEvents + '|' + cs.overflowX;
    so.scrollLeft = 40; const sx0 = so.scrollLeft; G.player.hp = Math.max(1, G.player.hp - 1); renderGame(); out.scrollKept = sx0 > 0 && document.querySelector('.dh-slots').scrollLeft === sx0; out.sx0 = sx0;
    return out; });
  console.log(JSON.stringify(r));
  A(r.shown && /ROUTE/.test(r.lbl0), 'a route button sits over the hot bar');
  A(r.map && r.mode==='route', 'with no route, it opens the world map ready to plan one');
  A(/GO/.test(r.lbl1), 'with a route planned, it offers to go');
  A(r.closed && r.walking && /STOP/.test(r.lbl2), 'tapping it sets off along the route');
  A(r.stopped && r.kept && /GO/.test(r.lbl3), 'tapping again stops, and keeps the route to carry on later');
  A(r.town, 'in town it does nothing but tell you');
  A(r.noGrave, 'no gravestone button while no grave waits');
  A(r.graveShown, 'a gravestone button once you have a grave to go back to');
  A(r.graveGo && /STOP/.test(r.graveLbl), 'tapping it walks you back to the grave (not counted as a route)');
  A(r.graveStop, 'tapping again stops, and the grave still waits');
  A(/pan-x/.test(r.swipe) && /auto/.test(r.swipe), 'the slots take a sideways swipe: '+r.swipe);
  A(r.sx0===0 || r.scrollKept, 'a redraw keeps the slots scrolled where you left them');
  A(r.reclaimed, 'standing on the grave, the button picks it up');
};
module.exports.mobile = true;
