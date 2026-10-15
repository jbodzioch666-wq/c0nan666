// RS-403: every view draws at the screen's own resolution (its device pixel ratio, whatever the quality setting - the dungeon was held
// to 1,280 pixels across), and one scaler steps it down only while the frame rate stays under 60, and back up at a steady 60
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; o3Pref = true; G.gameMode = 0; G.interior = null;
    const fr = async n=>{ for (let i=0;i<n;i++){ renderGame(); await new Promise(r=>setTimeout(r, 40)); } };
    const dpr = window.devicePixelRatio || 1; RES.lvl = 0; await fr(4);
    const out = { dpr };
    out.land = +(O3.renderer.getPixelRatio()/dpr).toFixed(3);
    /* (on a sharper screen too: pretend to be a 2x one - the low and medium settings used to hold it to 1 and 1.5) */
    Object.defineProperty(window, 'devicePixelRatio', { configurable:true, get:()=>2 });
    for (const q of ['low', 'medium', 'high']){ SET.gfx = q; out['pr_'+q] = +(gfxPR()/2).toFixed(3); } SET.gfx = 'high'; delete window.devicePixelRatio;
    // the scaler: steady 60 holds; a run under 57 steps down; ten seconds back at 60 steps up again
    const feed = (fps, n)=>{ for (let i=0;i<n;i++) resTick(1/fps); };
    RES.lvl = 0; RES.avg = 1/60; RES.n = 0; RES.downAt = RES.upAt = RES.lockUntil = 0; feed(60, 400); out.at60 = RES.lvl;
    feed(48, 400); out.under = RES.lvl;
    feed(58.5, 400); out.at58 = RES.lvl;
    RES.downAt = performance.now() - 11000; feed(60, 200); out.backUp = RES.lvl;
    // a menu or a hitch doesn't count
    const lv = RES.lvl; G.ui = 'inventory'; feed(20, 400); out.menu = RES.lvl===lv; G.ui = 'playing'; feed(2, 400); out.hitch = RES.lvl===lv;
    RES.lvl = 0;
    // the dungeon: no 1,280 cap - its canvas is the screen's own size
    let dx=-1, dy=-1; for (let x=0;x<OW_COLS && dx<0;x++) for (let y=0;y<OW_ROWS;y++) if (G.ow.map[x][y]===OW_DUNGEON){ dx=x; dy=y; break; }
    G.pendingDungeon = { x:dx, y:dy }; enterDungeonConfirm(); setUi('playing'); await fr(4);
    out.dungeon = { w:FPD.cv.width, want:Math.round(canvas.clientWidth*dpr), scale:FPD.scale };
    return out;
  });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.land===1 && r.pr_low===1 && r.pr_medium===1 && r.pr_high===1, 'the land draws at the screen\'s own resolution, whatever the quality');
  A(r.at60===0 && r.under >= 1 && r.at58===r.under, 'a steady 60 holds full resolution, under 57 steps down, 58 holds');
  A(r.backUp===r.under - 1, 'ten seconds back at 60 steps up again');
  A(r.menu && r.hitch, 'menus and one-off hitches don\'t count');
  A(Math.abs(r.dungeon.w - r.dungeon.want) <= 2 && r.dungeon.scale===1, 'the dungeon draws at the screen\'s own size, no 1,280 cap');
};
