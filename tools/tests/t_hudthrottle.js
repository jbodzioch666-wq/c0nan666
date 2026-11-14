// RS-399: the game loop rebuilds the HTML HUD ten times a second, not every frame; a renderGame() after something you did
// still rebuilds it at once, and a change that happens on its own (regen, the clock) shows within a tenth of a second
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    const t = townList()[0]; G.gameMode = 0; G.owPos = { x:t.x, y:t.y }; enterVillage(); setUi('playing');
    for (let i=0;i<6;i++){ renderGame(); await new Promise(r=>setTimeout(r, 60)); }
    const C = {}, orig = {}, names = ['renderHud', 'renderImmersiveHud', 'renderStatusChips', 'hudLayout', 'renderBuffBar', 'clockBarSync', 'renderMiniMap'];
    for (const n of names){ const f = window[n]; orig[n] = f; C[n] = 0; window[n] = function(...a){ const a0 = f.at; try{ return f.apply(this, a); } finally { if (n!=='clockBarSync' || f.at!==a0) C[n]++; } }; }   /* (the clock bar is called each frame and leaves early: count the runs that got past its own clock) */
    const frames = async n=>{ for (let i=0;i<n;i++) await new Promise(r=>requestAnimationFrame(r)); };
    /* (a software-rendered frame here takes seconds, so the clock is held: with the window still open, the loop's frames must
       leave the HUD alone; with it shut, the next frame rebuilds) */
    HUDT.ms = 1e9; HUDT.at = performance.now(); orig.clockBarSync.at = performance.now() + 1e9; for (const n of names) C[n] = 0;
    await frames(8); const held = {}; for (const n of names) held[n] = C[n];
    // what you do shows at once, window or no window
    const c0 = C.renderImmersiveHud; renderGame(); await new Promise(r=>setTimeout(r, 0)); const atOnce = C.renderImmersiveHud===c0+1 && C.hudLayout>=1;   /* (the layout pass is a microtask after the render) */
    // what happens on its own shows on the next frame once the window has passed
    HUDT.ms = 100; HUDT.at = 0; orig.clockBarSync.at = 0; const p = G.player, hp0 = p.hp; p.hp = Math.max(1, hp0 - 7); let shown = -1;
    for (let i=0;i<4;i++){ await frames(1); if ((document.getElementById('dhud').textContent||'').includes(String(p.hp))){ shown = i + 1; break; } }
    p.hp = hp0; for (const n of names) window[n] = orig[n];
    return { held, atOnce, shown, inFrame:HUDT.inFrame===false };
  });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  for (const n of ['renderHud', 'renderImmersiveHud', 'renderStatusChips', 'hudLayout', 'renderBuffBar', 'clockBarSync']) A(r.held[n]===0, n+' is left alone by the loop\'s frames inside the window');
  A(r.held.renderMiniMap===8, 'the minimap is still asked every frame (it keeps its own clock)');
  A(r.atOnce, 'a renderGame() after an action rebuilds the HUD at once');
  A(r.shown >= 1 && r.shown <= 2, 'a change on its own shows on the next frame past the window');
  A(r.inFrame, 'the frame flag is cleared after the loop\'s render');
};
