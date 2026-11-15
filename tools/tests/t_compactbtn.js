// RS-318: on a phone the hotbar has a button for what Y does - compact mode on, and back off - and it stays on the bar in
// compact mode so you can always get the full HUD back
module.exports = async page=>{
  await page.evaluate(async ()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); G.gameMode = 0; saveCurrentGame = ()=>{}; SET.compact = false;
    for (let i=0;i<6;i++){ renderGame(); await new Promise(r=>setTimeout(r, 40)); } });
  const tapY = async ()=>{ const b = await page.evaluate(()=>{ const e = document.querySelector('.dh-slot[data-k="Y"]'); if (!e) return null; e.scrollIntoView({ inline:'center', block:'nearest' }); const r = e.getBoundingClientRect(); return r.width ? { x:r.left + r.width/2, y:r.top + r.height/2 } : null; });
    if (!b) return false; await page.mouse.click(b.x, b.y); await page.evaluate(async ()=>{ for (let i=0;i<4;i++){ renderGame(); await new Promise(r=>setTimeout(r, 40)); } }); return true; };
  const r = {};
  await page.screenshot({ path:'/tmp/claude-0/-home-user-c0nan666/3bb54428-39f0-502a-8d60-2c5df0a710a2/scratchpad/compact-off.png' });
  r.first = await tapY(); r.on = await page.evaluate(()=>SET.compact);
  await page.screenshot({ path:'/tmp/claude-0/-home-user-c0nan666/3bb54428-39f0-502a-8d60-2c5df0a710a2/scratchpad/compact-on.png' });
  r.second = await tapY(); r.off = await page.evaluate(()=>!SET.compact);
  console.log(JSON.stringify(r));
  if (!r.first) throw new Error('the hotbar has a Y button on a phone');
  if (!r.on) throw new Error('tapping it turns compact mode on');
  if (!r.second) throw new Error('the button is still there in compact mode');
  if (!r.off) throw new Error('tapping it again brings the full HUD back');
};
module.exports.mobile = true;
