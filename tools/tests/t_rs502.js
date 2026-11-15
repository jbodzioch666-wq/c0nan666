// RS-502: going deeper no longer rebuilds the world's shaders. The first floor of a session pays the driver once; after it,
// (a) materials already warm-drawn are never warmed again, (b) the number of point lights is padded to the most the view has
// seen (with dark, dim stand-ins), so a floor with one more portal or brazier no longer changes every shader's light count -
// that one change was recompiling all ~40 programs, 13s a floor. Entering the next floor must cost a small fraction of the first
module.exports = async page=>{
  await page.evaluate(()=>{ window.__noWarmSlice = 0; });
  const r = await page.evaluate(async ()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    let dx=-1, dy=-1; for (let x=0;x<OW_COLS && dx<0;x++) for (let y=0;y<OW_ROWS;y++) if (G.ow.map[x][y]===OW_DUNGEON){ dx=x; dy=y; break; }
    const lt = [], tasks = []; new PerformanceObserver(l=>{ for (const e of l.getEntries()) lt.push([Math.round(e.duration), e.startTime]); }).observe({ entryTypes:['longtask'] });
    const enter = async ()=>{ const t0 = performance.now(); renderGame(); let n = 0; while ((FPD.warmWait || FPD.prep || FPD.prelink) && n++ < 4000){ await new Promise(r3=>requestAnimationFrame(r3)); renderGame(); }
      for (let i=0;i<4;i++){ renderGame(); await new Promise(r3=>setTimeout(r3, 30)); } const task = Math.max(0, ...lt.filter(e=>e[1] >= t0 - 5).map(e=>e[0])); tasks.push(task); return Math.round(performance.now() - t0); };
    const plCount = ()=>{ let n = 0; FPD.scene.traverse(o=>{ if (o.isPointLight && o.visible) n++; }); return n; };
    G.gameMode = 0; G.owPos = { x:dx, y:dy }; G.pendingDungeon = { x:dx, y:dy }; enterDungeonConfirm(); setUi('playing');
    const t1 = await enter(), pl1 = plCount(), progs1 = (FPD.r.info.programs||[]).length;
    const floors = [], pls = [], fresh = [];
    for (let f=0;f<3;f++){ saveLevelCache(G.depth); loadLevel(G.depth+1, false); setUi('playing');
      const k0 = (FPD.r.info.programs||[]).length; floors.push(await enter()); pls.push(plCount()); fresh.push((FPD.r.info.programs||[]).length - k0); }
    return { t1, pl1, progs1, floors, pls, fresh, tasks }; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.t1 > 0 && r.progs1 > 10, 'the first floor compiled its shaders');
  A(r.pls.every(n=>n===Math.max(r.pl1, ...r.pls)), 'the point lights hold at the ceiling from floor to floor');
  const worst = Math.max(...r.floors);
  A(worst < Math.max(1200, r.t1*0.45), 'the floors below cost a fraction of the first (they used to recompile everything)');
  A(r.fresh.reduce((a,b)=>a+b,0) <= 4*r.floors.length, 'almost no new programs below the first floor (the new creature kinds of a floor bring a few variants; every one of ~40 used to be rebuilt)');
  A(Math.max(...r.tasks.slice(1)) < 250, 'no freeze on the floors below: the creatures sculpted in slices on the coarse grid (RS-656), not all at once in the warm-up (' + r.tasks.slice(1) + 'ms)');
};
