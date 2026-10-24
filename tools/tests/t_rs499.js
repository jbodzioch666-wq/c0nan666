// RS-499: entering a dungeon or a town no longer freezes the page while the graphics driver builds every shader at once - the
// scene's first compile is sliced, a batch of children at a time with a frame to the browser between batches, under the loading
// card. Here the slicer is on (tests otherwise keep the old one-call compile), a fresh character enters a dungeon, and the
// longest main-thread task during entry must be far below the 7-13s freeze the one-call compile measured (a slice is bounded by
// the one shader it compiles, about 1.7s for the heaviest here); the floor still draws
module.exports = async page=>{
  await page.evaluate(()=>{ window.__noWarmSlice = 0; });
  const r = await page.evaluate(async ()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    const lt = []; new PerformanceObserver(l=>{ for (const e of l.getEntries()) lt.push([Math.round(e.duration), Math.round(e.startTime)]); }).observe({ entryTypes:['longtask'] });
    let dx=-1, dy=-1; for (let x=0;x<OW_COLS && dx<0;x++) for (let y=0;y<OW_ROWS;y++) if (G.ow.map[x][y]===OW_DUNGEON){ dx=x; dy=y; break; }
    G.gameMode = 0; G.owPos = { x:dx, y:dy }; G.pendingDungeon = { x:dx, y:dy }; enterDungeonConfirm(); setUi('playing');
    const t0 = performance.now(); renderGame();
    /* keep frames coming, as the browser would, until the sliced compile is done and a real frame has drawn */
    let waited = 0; while (FPD.warmWait && waited < 30000){ await new Promise(r2=>requestAnimationFrame(r2)); renderGame(); waited = performance.now() - t0; }
    for (let i=0;i<6;i++){ renderGame(); await new Promise(r2=>setTimeout(r2, 40)); }
    await new Promise(r2=>setTimeout(r2, 100));
    const cv = document.getElementById('dungeonGL');
    let drew = 0; FPD.scene.traverse(o=>{ if (o.isMesh) drew++; });
    const slicing = lt.filter(e=>e[1] > t0 + 50).map(e=>e[0]);   /* (tasks after the build's own: the compile slices) */
    return { fpd:!!FPD.ok, sliced:waited > 0 && !FPD.warmWait, waited:Math.round(waited), buildTask:Math.max(0, ...lt.filter(e=>e[1] <= t0 + 50).map(e=>e[0])), worstSlice:Math.max(0, ...slicing), shown:cv ? cv.style.display!=='none' : null, meshes:drew, progs:(FPD.r.info.programs||[]).length }; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.fpd && r.sliced, 'the dungeon compiled through the slicer');
  A(r.worstSlice < 2600, 'no compile slice froze the page longer than one shader costs (the one-call compile froze it for 7-13s)');
  A(r.shown && r.meshes > 50 && r.progs > 10, 'and the floor is back together and drawn, its shaders built');
};
