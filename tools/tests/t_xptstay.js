// RS-412: the XP tracker stays put while you gain xp - where you've dragged it, and in its own place under the buff bar
// (the buff bar pulled it up to the top-left at every xp drop, and the next layout put it back, so it jumped as you worked)
module.exports = async page=>{
  const ev = (f, a)=>page.evaluate(f, a), A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
  await ev(()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; skGainXP('foraging', 5); renderXpTracker(); });
  await page.waitForTimeout(1500);
  const watch = async ()=>{ const seen = new Set();
    for (let i=0;i<4;i++){ await ev(()=>skGainXP('foraging', 20)); const t1 = Date.now();
      while (Date.now() - t1 < 900){ seen.add(await ev(()=>{ const x = document.getElementById('xpTracker'); if (!x) return 'none'; const r = x.getBoundingClientRect(); return Math.round(r.left)+','+Math.round(r.top); })); await page.waitForTimeout(15); } }
    return [...seen]; };
  const home = await watch();
  await ev(()=>{ LAYOUT.xp = { x:700, y:400 }; applyMoved('xp'); hudLayout(); }); await page.waitForTimeout(500);
  const moved = await watch();
  await ev(()=>{ delete LAYOUT.xp; saveLayout(); });
  console.log('home', JSON.stringify(home), 'moved', JSON.stringify(moved));
  A(home.length===1, 'in its own place it holds still: '+JSON.stringify(home));
  A(moved.length===1 && moved[0]==='700,400', 'dragged, it stays where you put it: '+JSON.stringify(moved));
};
