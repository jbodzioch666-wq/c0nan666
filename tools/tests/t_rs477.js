// RS-477: the phone's back gesture closes the open menu (or opens the pause menu in play) instead of leaving the game
module.exports = async page=>{
  const back = async ()=>{ await page.evaluate(()=>history.back()); await page.waitForTimeout(400); };
  await page.evaluate(()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; window.__alive = 1; });
  const out = {};
  await page.evaluate(()=>setUi('inventory')); await back(); out.inv = await page.evaluate(()=>[G.ui, window.__alive]);
  await back(); out.play = await page.evaluate(()=>[G.ui, window.__alive]);
  await back(); out.pause = await page.evaluate(()=>[G.ui, window.__alive]);
  for (let i=0;i<4;i++) await back(); out.many = await page.evaluate(()=>[G.ui, window.__alive, location.href.length > 0]);
  console.log(JSON.stringify(out));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(out)); };
  A(out.inv[0]==='playing' && out.inv[1]===1, 'back closes the inventory, the game still running');
  A(out.play[0]==='pause' && out.play[1]===1, 'back in play opens the pause menu');
  A(out.pause[0]==='playing' && out.pause[1]===1, 'back again closes it');
  A(out.many[1]===1, 'however many times, the game never leaves');
};
