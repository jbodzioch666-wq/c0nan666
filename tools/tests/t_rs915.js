// RS-915: a picture hangs on the wall over a working piece (the bed), and a small piece sits on top of one; still nothing set on the floor
// where a working piece stands. Shot: shots/rs915-bed.png
const path = require('path');
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const A = (c, msg, r)=>{ if (!c) throw new Error('assert: ' + msg + ' ' + JSON.stringify(r || {})); };
  const r = await page.evaluate(async ()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; townClosedCheck = ()=>false;
    const p = G.player, out = {}; p.clock = p.turnCount = 60; G.owPos = { x:G.ow.spawnPos.x, y:G.ow.spawnPos.y }; enterVillage(); setUi('playing');
    const fr = async n=>{ for (let i=0;i<n;i++){ renderGame(); await new Promise(q=>setTimeout(q, 30)); } };
    p.gold = 3e6; skGainXP('construction', 6e7); houseBuy(2); const h = houseP(); h.built.bed = 1; enterHouse(); await fr(10);
    try{
    const bt = Object.keys(G.houseWork).find(t=>G.houseWork[t].key==='bed'), [bx, by] = bt.split(',').map(Number); h.furn.painting = 1; h.furn.candle = 1; h.furn.vase = 1;
    heditStart(); heditTake('painting'); const S = G.hedit.sel; S.x = bx + 0.5; S.z = by + 0.01; S.r = 0; S.y = S.base = 1.5; out.wall = heditOk(S); out.placed = heditPlace();
    heditTake('candle'); const C = G.hedit.sel; C.x = bx + 0.5; C.z = by + 0.5; C.y = 0.6; out.onTop = heditOk(C); C.y = 0; out.onFloor = heditOk(C); heditCancel();
    heditTake('vase'); const V = G.hedit.sel; V.x = bx + 0.5; V.z = by + 0.5; V.y = 0; out.vaseFloor = heditOk(V); heditCancel(); heditEnd(); await fr(5);
    out.hung = h.decor.some(d=>d.k==='painting'); p.x = bx; p.y = by + 2; if (G.map[p.x][p.y]!==T_FLOOR) houseUnstick(); await fr(30);
    }catch(e){ out.err = String(e.stack).slice(0, 400); }
    return out; });
  await page.screenshot({ path:path.join(__dirname, 'shots', 'rs915-bed.png') });
  console.log(JSON.stringify(r));
  A(!r.err, 'ran through', r);
  A(r.wall && r.placed && r.hung, 'a picture hung over the bed', r);
  A(r.onTop && !r.onFloor && !r.vaseFloor, 'a candle on top of it, but nothing on the floor where it stands', r);
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
