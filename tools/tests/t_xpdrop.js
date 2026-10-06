// RS-176: the xp numbers from any skill rise over your head - on the overworld, in town and in a dungeon
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); G.gameMode = 0; G.interior = null;
    const frames = async n=>{ for (let i=0;i<n;i++){ renderGame(); try{ if (G.gameMode===0) o3Render(); }catch(e){} await new Promise(r=>setTimeout(r, 60)); } };
    const check = async ()=>{ skGainXP('woodcutting', 50); skGainXP('attack', 20); xpDropsFollow();   // (measured at once: a slow test frame outlasts the drop)
      const box = document.getElementById('xpDrops'), h = heroHeadXY(1.2), b = box.getBoundingClientRect(), d = box.querySelector('.xpd');
      const dr = d ? d.getBoundingClientRect() : null;
      return { over:box.classList.contains('overhead'), h:h && [Math.round(h.x), Math.round(h.y)], box:[Math.round(b.left), Math.round(b.top)], drop:dr && [Math.round(dr.left + dr.width/2), Math.round(dr.bottom)], n:box.querySelectorAll('.xpd').length }; };
    const out = {};
    await frames(6); out.ow = await check();
    const t = townList()[0]; G.owPos = { x:t.x, y:t.y }; enterVillage(); setUi('playing'); await frames(6); out.town = await check();
    G.gameMode = 0; let dx=-1, dy=-1; for (let x=0;x<OW_COLS && dx<0;x++) for (let y=0;y<OW_ROWS;y++) if (G.ow.map[x][y]===OW_DUNGEON){ dx=x; dy=y; break; }
    G.pendingDungeon = { x:dx, y:dy }; enterDungeonConfirm(); setUi('playing'); await frames(6); out.dungeon = await check();
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  for (const k of ['ow','town','dungeon']){ const v = r[k];
    A(v.over && v.h && v.n >= 2, k+': the xp drops show over your head');
    A(Math.abs(v.drop[0] - v.h[0]) < 40 && v.drop[1] < v.h[1] + 30 && v.drop[1] > v.h[1] - 140, k+': centred above your head'); }
};
