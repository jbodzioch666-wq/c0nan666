// (probe, not in ALL) going into a dungeon, out, into another, and into a roadside fight: for each, how long until the new place is drawn
// (the frames the old one stays on the canvas, the creature-sculpting frames, the warm-up), and whether a loading card covers them
module.exports = async page=>{
  page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300))); page.on('console', m=>{ if (m.type()==='error') errs.push(m.text().slice(0, 300)); });
  const r = await page.evaluate(async ()=>{ window.__noWarmSlice = false; goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.player.hp = G.player.maxHp = 99999;
    const run = async n=>{ for (let i=0;i<n;i++) await new Promise(r=>requestAnimationFrame(r)); };
    await run(120);
    const watch = async nm=>{ const t0 = performance.now(), M = G.map; let first = null, prep = 0, cardF = 0, frames = 0, worst = 0, last = t0;
      for (let i=0;i<900;i++){ await new Promise(r=>requestAnimationFrame(r)); frames++; const t = performance.now(); worst = Math.max(worst, t - last); last = t;
        if (FPD.prep) prep++; const card = document.querySelector('#loadCard, .loadcard, #warmCard, .warmcard'); if (card && card.offsetParent!==null && getComputedStyle(card).opacity > 0.3) cardF++;
        if (first===null && FPD.mapRef===G.map && !FPD.prep && !FPD.warmWait){ first = t - t0; break; } }
      const why = { pl:FPD.prelink ? { n:FPD.prelink.progs.length, notReady:FPD.prelink.progs.filter(p=>p.isReady && !p.isReady()).map(p=>(p.name||'') + ' ' + String(p.cacheKey||'').slice(0, 80)).slice(0, 5), age:Math.round(performance.now() - FPD.prelink.t0) } : null, same:FPD.mapRef===G.map, prep:!!FPD.prep, warm:FPD.warmWait ? { i:FPD.warmWait.i, n:(FPD.warmWait.mats||[]).length, keys:Object.keys(FPD.warmWait).join(',') } : null };
      return { why, nm, ms:first===null ? null : Math.round(first), frames, prepFrames:prep, cardFrames:cardF, worst:Math.round(worst), mons:(G.mon||[]).filter(m=>m.alive).length, kinds:[...new Set((G.mon||[]).filter(m=>m.alive).map(m=>m.nm))].length }; };
    const out = [], sites = questNearbySites(G.owPos.x, G.owPos.y, 1, 80, ['dungeon']);
    const enter = s=>{ G.gameMode = 0; setUi('playing'); G.pendingDungeon = { x:s.x, y:s.y }; enterDungeonConfirm(); setUi('playing'); };
    enter(sites[0]); out.push(await watch('first dungeon')); await run(60);
    dgFinish(true); G.gameMode = 0; setUi('playing'); await run(90);
    enter(sites[1] || sites[0]); out.push(await watch('second dungeon')); await run(60);
    dgFinish(true); G.gameMode = 0; setUi('playing'); await run(90);
    /* a roadside fight */
    try{ const e = { x:G.owPos.x, y:G.owPos.y, merchant:false }; G.ow.encounters.push(e); encParty(e); const keep = Math.random; Math.random = ()=>0.99; try{ checkOverworldEncounterTrigger(); } finally { Math.random = keep; } setUi('playing'); out.push(await watch('roadside fight')); }catch(err){ out.push({ nm:'fight', err:String(err) }); }
    return { out, cards:SET.loadCards }; });
  for (const x of r.out) console.log(JSON.stringify(x)); console.log('loadCards', r.cards); console.log('errors', [...new Set(errs)].slice(0, 5).join(String.fromCharCode(10)));
};
