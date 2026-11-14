// RS-327: a starlily patch is always there - by day it shows on the map and the land with its buds closed (and can't be
// picked), at night it opens and can be; before, it vanished by day, so the map search found patches the map didn't draw
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); G.gameMode = 0; saveCurrentGame = ()=>{};
    let at = null; for (let x=1;x<OW_COLS-1 && !at;x++) for (let y=1;y<OW_ROWS-1 && !at;y++){ const s = skNodeStatic(x, y); if (s && s.type==='starlily') at = { x, y }; }
    if (!at) return { none:true };
    const p = G.player; G.owPos.x = at.x; G.owPos.y = at.y;
    p.clock = DAY_LENGTH*0.5; const day = skNodeAt(at.x, at.y), dayNear = skNodesNear().some(n=>n.type==='starlily'), tip = day ? skNodeTipHtml(day) : '';
    p.clock = 0; const night = skNodeAt(at.x, at.y), nightNear = skNodesNear().some(n=>n.type==='starlily');
    return { day:!!day, shut:!!(day && day.shut), dayNear, closedTip:/closed/.test(tip), night:!!night, nightOpen:!!(night && !night.shut && night.left > 0), nightNear };
  });
  const A = (c, m)=>{ if (!c) throw new Error(m+' :: '+JSON.stringify(r)); };
  A(!r.none, 'the world has a starlily patch');
  A(r.day && r.shut && r.closedTip, 'by day the patch is still there, closed');
  A(!r.dayNear, 'by day it cannot be picked');
  A(r.night && r.nightOpen && r.nightNear, 'at night it opens and can be picked');
  console.log('starlily ok', JSON.stringify(r));
};
