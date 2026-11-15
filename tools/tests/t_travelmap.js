// RS-368: the waypoint map and the house portal's map zoom and pan. The wheel or a pinch zooms about the pointer, a drag pans
// (and doesn't count as a pick), + / - / fit buttons sit under the map, and a tap on a spot travels there. The portal chamber
// shows every place it can take you on the world map, coloured by kind, with "you are here" (RS-369: no list under it)
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.gameMode = 0;
    const towns = townList().slice(0, 5); for (const t of towns){ const k = t.x+','+t.y; if (!(G.ow.visitedTowns||[]).includes(k)) (G.ow.visitedTowns = G.ow.visitedTowns||[]).push(k); owReveal(t.x, t.y, 8); }
    G.owPos = { x:towns[0].x, y:towns[0].y }; G.player.gold = 99999;
    const out = {}, ev = (cv, type, x, y, id)=>{ const rc = cv.getBoundingClientRect(); const e = new PointerEvent(type, { clientX:rc.left + x*rc.width/TM_W, clientY:rc.top + y*rc.height/TM_H, pointerId:id||1, bubbles:true }); cv.dispatchEvent(e); };
    // the waypoint map
    setUi('waypoint'); await new Promise(r=>setTimeout(r, 100)); const cv = document.getElementById('wpMap'), S = cv._tm;
    out.wpCtl = !!document.querySelector('#overlay .tm-ctl'); out.wpPts = WP.pts.length; out.z0 = S.view.z;
    tmZoom('wpMap', 1.4); out.zIn = S.view.z > out.z0;
    const cx0 = S.view.cx; cv.dispatchEvent(new WheelEvent('wheel', { deltaY:-100, clientX:cv.getBoundingClientRect().left + 50, clientY:cv.getBoundingClientRect().top + 50, bubbles:true, cancelable:true })); out.wheel = S.view.z > out.z0*1.4 && S.view.cx!==cx0;
    // a drag pans and is not a pick
    let went = null; const keep = waypointTravel; waypointTravel = k=>{ went = k; };
    const cx1 = S.view.cx; ev(cv, 'pointerdown', 300, 200); ev(cv, 'pointermove', 340, 200); ev(cv, 'pointermove', 400, 210); ev(cv, 'pointerup', 400, 210); cv.onclick({ clientX:cv.getBoundingClientRect().left + 400*cv.getBoundingClientRect().width/TM_W, clientY:cv.getBoundingClientRect().top + 210*cv.getBoundingClientRect().height/TM_H });
    out.panned = S.view.cx < cx1; out.dragNoPick = went===null;
    // fit, then a tap on another town travels there
    tmFit('wpMap'); const other = S.pts.find(p=>!p.me && p.px > 0 && p.px < TM_W && p.py > 0 && p.py < TM_H);
    ev(cv, 'pointerdown', other.px, other.py); ev(cv, 'pointerup', other.px, other.py); cv.onclick({ clientX:cv.getBoundingClientRect().left + other.px*cv.getBoundingClientRect().width/TM_W, clientY:cv.getBoundingClientRect().top + other.py*cv.getBoundingClientRect().height/TM_H });
    out.tapTravel = went===other.key; waypointTravel = keep; setUi('playing');
    // the house portal
    setUi('housePortal'); await new Promise(r=>setTimeout(r, 100)); const hv = document.getElementById('hpMap'), H = hv && hv._tm;
    out.hp = !!hv; out.hpDests = housePortalDests().length; out.hpPts = H ? H.pts.length : 0; out.hpMe = H ? H.pts.some(p=>p.me && p.noPick) : false;
    out.legend = document.querySelectorAll('#overlay .tm-legend span').length; out.list = document.querySelectorAll('#overlay .hp-list .choice-row').length;
    let picked = null; const kg = housePortalGo; housePortalGo = i=>{ picked = i; };
    const dst = H.pts.find(p=>!p.me && p.px > 0 && p.px < TM_W && p.py > 0 && p.py < TM_H); ev(hv, 'pointerdown', dst.px, dst.py); ev(hv, 'pointerup', dst.px, dst.py);
    hv.onclick({ clientX:hv.getBoundingClientRect().left + dst.px*hv.getBoundingClientRect().width/TM_W, clientY:hv.getBoundingClientRect().top + dst.py*hv.getBoundingClientRect().height/TM_H });
    out.hpPick = picked===dst.key; housePortalGo = kg;
    const hz = H.view.z; tmZoom('hpMap', 1.4); out.hpZoom = H.view.z > hz; setUi('playing');
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.wpCtl && r.wpPts===5, 'the waypoint map has its controls and its five towns');
  A(r.zIn && r.wheel, 'the buttons and the wheel zoom');
  A(r.panned && r.dragNoPick, 'a drag pans the map and picks nothing');
  A(r.tapTravel, 'a tap on a town travels there');
  A(r.hp && r.hpPts===r.hpDests + 1 && r.hpMe && r.legend===4 && r.list===0, 'the portal chamber shows its places on the map, you are here and a legend, and no list');
  A(r.hpPick && r.hpZoom, 'a tap on the portal map steps through, and it zooms');
};
