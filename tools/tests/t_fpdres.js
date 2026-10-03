// RS-107: the dungeon view's adaptive resolution only steps between a few fixed sizes and doesn't see-saw (each change is a hitch)
module.exports = async page=>{
  await page.evaluate(()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); G.player.wildWarned = 1;
    let dx=-1, dy=-1; for (let x=0;x<OW_COLS && dx<0;x++) for (let y=0;y<OW_ROWS;y++) if (G.ow.map[x][y]===OW_DUNGEON){ dx=x; dy=y; break; }
    G.pendingDungeon = {x:dx, y:dy}; enterDungeonConfirm(); setUi('playing'); G.mon = []; renderGame(); });
  await page.waitForTimeout(2000);
  const r = await page.evaluate(async ()=>{
    const A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
    let sizes = new Set(), resizes = 0, last = FPD.cv.width+'x'+FPD.cv.height, maxStep = 0;
    const dirs = [[1,0],[0,1],[-1,0],[0,-1]];
    for (let i=0;i<30;i++){ G.player.hp = effMaxHp(); G.ui = 'playing';
      for (const [a,b] of dirs){ const x0 = G.player.x, y0 = G.player.y, t0 = performance.now(); moveDir(a,b); const t = performance.now()-t0; if (G.player.x!==x0 || G.player.y!==y0){ maxStep = Math.max(maxStep, t); break; } }
      await new Promise(r=>setTimeout(r, 150)); const sz = FPD.cv.width+'x'+FPD.cv.height; sizes.add(sz); if (sz!==last){ resizes++; last = sz; } }
    A(FPD_SCALES.includes(FPD.scale), 'the scale is one of the fixed steps: '+FPD.scale);
    A(resizes <= 3, 'the view resized '+resizes+' times in 30 steps');
    A(maxStep < 1000, 'a step took '+maxStep.toFixed(0)+'ms');
    return { sizes:[...sizes], resizes, maxStep:+maxStep.toFixed(1), lvl:FPD.lvl };
  });
  console.log(JSON.stringify(r));
};
