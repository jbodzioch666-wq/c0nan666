// RS-160: a resource node's tooltip follows the node while it's open - take from it and the "left" count drops
module.exports = async page=>{
  const r = await page.evaluate(()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); G.gameMode = 0;
    let n = null; for (let x=1; x<OW_COLS-1 && !n; x++) for (let y=1; y<OW_ROWS-1; y++){ const c = skNodeAt(x, y); if (c && !c.rich && !c.gone && c.left >= 3 && c.k!=='fishing'){ n = c; break; } }
    if (!n) return { none:true };
    ttNodeShow({ clientX:200, clientY:200 }, n); const el = document.getElementById('itemTooltip'), num = ()=>{ const m = el.textContent.match(/(\d+) \w+ left/); return m ? +m[1] : null; };
    const before = num(); skNodeTake(n); ttNodeRefresh(); const after = num(), shown = el.style.display!=='none';
    hideItemTooltip(); skNodeTake(skNodeAt(n.x, n.y)); ttNodeRefresh();
    return { k:n.k, before, after, shown, idle:document.getElementById('itemTooltip').style.display==='none' };
  });
  console.log(JSON.stringify(r));
  if (r.none) throw new Error('assert: no resource node found');
  if (!(r.before >= 3 && r.after===r.before - 1 && r.shown && r.idle)) throw new Error('assert: the node tooltip counts down as you gather: '+JSON.stringify(r));
};
