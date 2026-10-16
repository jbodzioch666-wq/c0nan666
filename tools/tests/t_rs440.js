// RS-440: the XP tracker shows while you cook (and work any batch at a bench) - the panel stays open as you work and the tracker hid with
// it - sitting clear of the cooking card in the corner; and it goes again with the panel when you stop
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1;
    const t = townList()[0]; G.owPos = { x:t.x, y:t.y }; trackVisitedTown(t.x, t.y); setUi('playing'); enterVillage(); setUi('playing'); enterInterior('tavern'); setUi('playing');
    skP().skills.cooking = SK_XP[60]; skAdd('trout', 20); G.cookAt = 'hearth';   /* (no burns: a burnt fish gives no xp to track) */ setUi('cook'); cqAdd('cook', 'trout', '', 20);
    for (let i=0;i<3;i++){ cqTick(CQ.next + 1); await new Promise(r=>setTimeout(r, 160)); }
    renderGame(); await new Promise(r=>setTimeout(r, 200));
    const xt = document.getElementById('xpTracker'), card = document.querySelector('#overlay.ovcook');
    const a = xt && xt.getBoundingClientRect(), b = card && card.getBoundingClientRect();
    const out = { shown:!!xt && xt.style.display!=='none', cooking:/Cooking/i.test(xt ? xt.innerHTML : ''), cls:xt && xt.classList.contains('xpcook'), card:!!card, overlap:!!(a && b && a.top < b.bottom && a.bottom > b.top && a.left < b.right && a.right > b.left) };
    cqStop(); setUi('playing'); await new Promise(r=>setTimeout(r, 200)); out.after = xt.style.display!=='none' && !xt.classList.contains('xpcook');
    setUi('inventory'); renderXpTracker(); out.menu = xt.style.display==='none'; setUi('playing');
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.shown && r.cooking, 'the XP tracker shows your cooking xp while you cook');
  A(r.cls && r.card && !r.overlap, 'clear of the cooking card');
  A(r.after && r.menu, 'back in its place after, and hidden in other menus as before');
};
