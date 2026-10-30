// RS-373: menus are framed panels over the game, sized to what they hold, not sheets across the screen; the title screen,
// making a character, the end of a run and the equipment page keep the whole screen. A menu keeps its scroll when it redraws
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{
    const el = document.getElementById('overlay'), vw = innerWidth, vh = innerHeight, box = ()=>{ const b = el.getBoundingClientRect(); return { w:Math.round(b.width), h:Math.round(b.height), cx:Math.round(b.left + b.width/2), cy:Math.round(b.top + b.height/2), panel:el.classList.contains('ovpanel') }; };
    const out = { vw, vh, title:box() };
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    for (const u of ['pause', 'lootfilter', 'settings']){ setUi(u); await new Promise(r=>setTimeout(r, 300)); out[u] = box(); }
    /* (RS-373) a menu redrawn after you act in it keeps its lists where you scrolled them: banking an item doesn't jump back to the top */
    G.inv = []; for (let i=0;i<MAXINV-1;i++) G.inv.push(genItem(10, 'weapon')); setUi('bank'); await new Promise(r=>setTimeout(r, 200));
    { const L = ()=>document.querySelector('#overlay .invlist'); L().scrollTop = 160; out.sc0 = L().scrollTop; bankDeposit(20); await new Promise(r=>setTimeout(r, 50)); out.sc1 = L().scrollTop; setUi('playing'); }
    setUi('inventory'); await new Promise(r=>setTimeout(r, 200)); out.inv = el.classList.contains('ovpanel');
    setUi('playing'); return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(!r.title.panel, 'the title screen keeps the whole screen');
  for (const u of ['pause', 'lootfilter', 'settings']) A(r[u].panel && r[u].w < r.vw - 100 && r[u].h <= r.vh - 20 && Math.abs(r[u].cx - r.vw/2) < 4, `${u} is a centred panel, narrower than the screen`);
  A(r.pause.w < r.lootfilter.w + 1 && r.pause.h < r.vh*0.8, 'a short menu is a small panel');
  A(!r.inv, 'the equipment page keeps its own layout');
  A(r.sc0 > 100 && Math.abs(r.sc1 - r.sc0) < 2, 'banking an item keeps the list where it was scrolled');
};
