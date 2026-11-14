// RS-317: a dragged window follows the pointer exactly and stays where it's dropped - the quest tracker used to ease after the
// pointer and be tugged back toward its default spot every frame
module.exports = async page=>{
  await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); G.gameMode = 0; saveCurrentGame = ()=>{};
    for (const q of G.questBoard.slice(0, 2)) acceptQuest(q.id); setUi('playing'); G.player.qtRolled = false;
    for (let i=0;i<6;i++){ renderGame(); await new Promise(r=>setTimeout(r, 40)); } });
  const h = await page.evaluate(()=>{ const r = document.querySelector('#qtrack .qt-h').getBoundingClientRect(), t = document.getElementById('qtrack').getBoundingClientRect(); return { x:r.left + 20, y:r.top + r.height/2, ox:t.left, oy:t.top }; });
  await page.mouse.move(h.x, h.y); await page.mouse.down();
  const lag = [];
  for (let i=1;i<=8;i++){ const tx = h.x - i*40, ty = h.y + i*25; await page.mouse.move(tx, ty);
    lag.push(await page.evaluate(([dx, dy])=>{ renderGame(); const t = document.getElementById('qtrack').getBoundingClientRect(); return Math.round(Math.abs(t.left - dx) + Math.abs(t.top - dy)); }, [h.ox - i*40, h.oy + i*25])); }
  await page.mouse.up();
  const after = await page.evaluate(async ([dx, dy])=>{ const tr = getComputedStyle(document.getElementById('qtrack')).transitionDuration; const s = [];
    for (let i=0;i<10;i++){ renderGame(); await new Promise(r=>setTimeout(r, 40)); const t = document.getElementById('qtrack').getBoundingClientRect(); s.push(Math.round(Math.abs(t.left - dx) + Math.abs(t.top - dy))); } return { tr, s }; }, [h.ox - 320, h.oy + 200]);
  console.log(JSON.stringify({ lag, after }));
  if (lag.some(d=>d > 2)) throw new Error('the window follows the pointer exactly while dragged: '+lag.join(','));
  if (after.s.some(d=>d > 2)) throw new Error('the window stays where it was dropped, frame after frame: '+after.s.join(','));
  if (!/^0s(, 0s)*$/.test(after.tr)) throw new Error('a placed window has no easing: '+after.tr);
};
