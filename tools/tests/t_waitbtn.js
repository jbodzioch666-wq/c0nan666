// RS-320: on a phone the d-pad's middle is an hourglass that waits a turn (what Space does) in dungeons and fights; out on
// the land it's dimmed
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); G.gameMode = 0; saveCurrentGame = ()=>{};
    const frames = async n=>{ for (let i=0;i<n;i++){ renderGame(); await new Promise(r=>setTimeout(r, 40)); } };
    await frames(4); const w = document.getElementById('btnWait'), out = { here:!!w, offOutside:w && w.classList.contains('off') };
    let dx=-1, dy=-1; for (let x=0;x<OW_COLS && dx<0;x++) for (let y=0;y<OW_ROWS;y++) if (G.ow.map[x][y]===OW_DUNGEON){ dx=x; dy=y; break; }
    G.pendingDungeon = { x:dx, y:dy }; enterDungeonConfirm(); setUi('playing'); G.mon = []; await frames(4);
    out.onInside = !w.classList.contains('off'); const b = w.getBoundingClientRect(); out.box = { x:b.left + b.width/2, y:b.top + b.height/2, w:b.width };
    out.t0 = G.dgTurn||0; out.pos = [G.player.x, G.player.y];
    return out; });
  if (r.box) await page.mouse.click(r.box.x, r.box.y);
  const after = await page.evaluate(async ()=>{ while (foePending()) foeFlush(); for (let i=0;i<3;i++){ renderGame(); await new Promise(r=>setTimeout(r, 40)); } return { t:G.dgTurn||0, pos:[G.player.x, G.player.y], logged:G.log.slice(-5).some(l=>/you wait/.test(l.msg)) }; });
  await page.screenshot({ path:'/tmp/claude-0/-home-user-c0nan666/3bb54428-39f0-502a-8d60-2c5df0a710a2/scratchpad/waitbtn.png' });
  console.log(JSON.stringify({ r, after }));
  if (!r.here || !r.box || r.box.w < 20) throw new Error('the d-pad has a wait button '+JSON.stringify(r));
  if (!r.offOutside || !r.onInside) throw new Error('it is dimmed on the land and lit in a dungeon');
  if (after.t !== r.t0 + 1 || !after.logged || after.pos.join()!==r.pos.join()) throw new Error('tapping it waits a turn where you stand '+JSON.stringify({ r, after }));
};
module.exports.mobile = true;
