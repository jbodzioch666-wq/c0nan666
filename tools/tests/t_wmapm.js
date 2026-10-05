// RS-138: the world map on a phone - the map gets the screen (no legend box by default, the tools on one sideways-scrolling row,
// the other panels step aside), and tapping a gravestone on it offers to walk there or forget it
module.exports = async page=>{
  const ev = (f, a)=>page.evaluate(f, a), A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
  const r = await ev(async ()=>{ const out = {};
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); G.gameMode = 0;
    let a = null, b = null; for (let d=5; d<30 && !(a && b); d++) for (const [dx,dy] of [[d,0],[0,d],[-d,0],[0,-d]]){ const x = G.owPos.x+dx, y = G.owPos.y+dy; if (o3Passable(x,y) && !OW_SITE_TILES.includes(G.ow.map[x][y])){ if (!a) a = [x,y]; else if (!b && Math.abs(x-a[0])+Math.abs(y-a[1]) > 4) b = [x,y]; } }
    G.player.graves = [{ id:'gA', x:a[0], y:a[1], items:[], gold:20, place:'a meadow', cause:'a rat', when:1 }, { id:'gB', x:b[0], y:b[1], items:[], gold:30, place:'a wood', cause:'a wolf', when:2 }]; graveSync();
    toggleOwZoom(); for (let i=0;i<6;i++){ renderGame(); await new Promise(r=>setTimeout(r, 60)); }
    const hid = sel=>{ const el = document.querySelector(sel); return !el || getComputedStyle(el).display==='none'; };
    out.wmap = document.body.classList.contains('wmap'); out.legend = mapF('legend'); out.hidden = ['#qtrack','#logPanel','.dh-plate'].every(hid);
    const bar = document.querySelector('#mapTools .mt-bar'); out.row = bar && getComputedStyle(bar).flexWrap; const br = bar && bar.getBoundingClientRect(); out.barH = br && Math.round(br.height);
    // tap the gravestone at a
    const cv = canvas.getBoundingClientRect(), cp = canvas.width / cv.width, g = G.player.graves[0];
    const px = ((g.x-owZoomLastCam.x)*owZoomLastCellPx + owZoomLastCellPx/2)/cp + cv.left, py = ((g.y-owZoomLastCam.y)*owZoomLastCellPx + owZoomLastCellPx/2)/cp + cv.top;
    owMapClick({ clientX:px, clientY:py }); out.popup = !!(G.pinEdit && G.pinEdit.grave==='gA') && /Forget it/.test(document.getElementById('pinEdit').textContent);
    // forget asks once more, then lets it go; the other still waits
    graveOpen('gA', px, py, true); out.armed = /Forget\? Its things are lost/.test(document.getElementById('pinEdit').textContent);
    graveForget('gA'); out.left = G.player.graves.map(q=>q.id).join(','); out.target = G.player.grave && G.player.grave.id;
    // walk here from the map
    toggleOwZoom(); toggleOwZoom(); graveOpen('gB', 100, 100); graveWalkTo('gB'); out.walk = graveWalking() && !G.owZoomedOut;
    toggleOwZoom(); toggleOwZoom(); G.owZoomedOut = false; mapToolsSync(); out.cleared = !document.body.classList.contains('wmap');
    return out; });
  console.log(JSON.stringify(r));
  A(r.wmap && r.hidden, 'on a phone the map clears the screen of the other panels');
  A(!r.legend, 'no legend box over the map by default on a phone');
  A(r.row==='nowrap' && r.barH < 60, 'the map tools are one row along the top: '+r.barH);
  A(r.popup, 'tapping a gravestone on the map opens its card');
  A(r.armed && r.left==='gB' && r.target==='gB', 'forgetting asks once more, then the other grave is the one to head for');
  A(r.walk, 'walk here closes the map and walks to that grave');
  A(r.cleared, 'closing the map brings the panels back');
};
module.exports.mobile = true;
