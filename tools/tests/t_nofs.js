// RS-217: the game no longer goes fullscreen on its own - not on the first click or key, not when a game starts or resumes;
// only the corner button asks for it
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{
    const out = { asks:0 }; const el = document.documentElement;
    const stub = ()=>{ out.asks++; return Promise.reject(new Error('stub')); };
    el.requestFullscreen = stub; el.webkitRequestFullscreen = stub;
    window.dispatchEvent(new PointerEvent('pointerdown', { bubbles:true })); window.dispatchEvent(new KeyboardEvent('keydown', { key:'a', bubbles:true }));
    await new Promise(r=>setTimeout(r, 50)); out.afterFirst = out.asks;
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame();
    out.afterStart = out.asks;
    titleResume(G.saveId); out.afterResume = out.asks;
    dhFullscreen(); await new Promise(r=>setTimeout(r, 50)); out.afterButton = out.asks;
    return out; });
  console.log(JSON.stringify(r));
  if (r.afterFirst!==0 || r.afterStart!==0 || r.afterResume!==0) throw new Error('fullscreen was asked for without the button '+JSON.stringify(r));
  if (r.afterButton!==1) throw new Error('the corner button still asks '+JSON.stringify(r));
};
