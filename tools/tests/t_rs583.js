// RS-583: the creatures' eleven finish textures are made at boot in workers beside the page and kept in the sculpt cache, so the
// first townsperson of a session no longer makes them on the spot. The workers' pixels are the generator's own to the byte; a
// second visit finds them in the cache with no worker to run; and the first town's people are sculpted over frames after the
// town shows (part two)
module.exports = async page=>{
  page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 200)));
  const r = await page.evaluate(async ()=>{ const out = {}, wait = ms=>new Promise(r=>setTimeout(r, ms));
    const t0 = performance.now(); while (!(M3D.patWork && M3D.patWork.done) && performance.now() - t0 < 20000) await wait(50);
    const W = M3D.patWork; out.work = { done:!!(W && W.done), made:W && W.made, ms:Math.round(performance.now() - t0), raw:Object.keys(M3D.patRaw||{}).length, pat:Object.keys(M3D.pat||{}).length, kinds:M3D_PAT_KINDS.length };
    /* the worker's pixels against the generator's, for one finish: the same to the byte */
    const raw = M3D.patRaw && M3D.patRaw.fur; if (raw){ const N = 256, h = new Float32Array(N*N), tone = new Float32Array(N*N), md = new Uint8ClampedArray(N*N*4), nd = new Uint8ClampedArray(N*N*4);
      m3dPatRows('fur', N, 0, N, h, tone); m3dPatBake('fur', N, h, tone, md, nd, 0, N); let diff = 0; for (let i=0;i<md.length;i++){ if (md[i]!==raw.md[i]) diff++; if (nd[i]!==raw.nd[i]) diff++; } out.diff = diff; }
    /* a finish wanted now comes from those pixels in a moment */
    const t1 = performance.now(); const pt = m3dPattern('fur'); out.furMs = +(performance.now() - t1).toFixed(1); out.furOk = !!(pt && pt.map && pt.map.image && pt.map.image.width===256);
    /* the cache: the pixels stored, so the next session has them without a worker */
    { const t2 = performance.now(); while (SCULPT_DB.dirty.length && performance.now() - t2 < 12000) await wait(100); await wait(300); out.stored = SCULPT_DB.dirty.length===0 && !!SCULPT_DB.db; out.storeMs = Math.round(performance.now() - t2); }   /* (a megabyte a beat) */
    return out; });
  /* part two: the first town's people step out over the frames after the town shows, the town itself in one frame */
  const r3 = await page.evaluate(async ()=>{ window.__noWarmSlice = false; goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1;
    const t = G.ow.spawnPos; G.owPos = { x:t.x, y:t.y }; const t1 = performance.now(); enterVillage(); setUi('playing');
    const f = []; let last = performance.now(), firstPeople = null, allAt = null; const want = (G.villageNpcs||[]).length + (G.villagers||[]).length;
    for (let i=0;i<900 && allAt===null;i++){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); const now = performance.now(); f.push(now - last); last = now; const have = (V3.npcs||[]).length + (V3.villagers||[]).length;
      if (firstPeople===null && have > 0) firstPeople = Math.round(now - t1); if (!V3.peopleQ && have >= want) allAt = Math.round(now - t1); }
    const late = f.slice(8).sort((a, b)=>b - a); return { want, npcs:V3.npcs.length, villagers:V3.villagers.length, firstPeople, allAt, firstFrame:Math.round(f[0]), worstLater:late.slice(0, 3).map(Math.round), plates:V3.labels.querySelectorAll('.v3plate').length, platesListed:V3.plates.length, hits:V3.hits.filter(h=>h.userData.act && h.userData.act.kind==='tile' && h.userData.act.label).length, marker:!!V3.marker, queueGone:!V3.peopleQ };
  });
  await page.reload(); await page.waitForTimeout(1500);
  const r2 = await page.evaluate(async ()=>{ const wait = ms=>new Promise(r=>setTimeout(r, ms)); const t0 = performance.now(); while (!(M3D.patWork && M3D.patWork.done) && performance.now() - t0 < 20000) await wait(50);
    const W = M3D.patWork; return { done:!!(W && W.done), made:W ? W.made : null, fromCache:Object.keys(M3D.patRaw||{}).length, ms:Math.round(performance.now() - t0) }; });
  console.log(JSON.stringify({ r, r3, r2, errs }));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify({ r, r3, r2 })); };
  A(r.work.done && r.work.raw + r.work.pat >= r.work.kinds, 'the workers made every finish at boot: ' + JSON.stringify(r.work));
  A(r.diff===0, 'to the byte what the generator makes: ' + r.diff + ' bytes differ');
  A(r.furOk && r.furMs < 25, 'a finish wanted now is a texture in a moment: ' + r.furMs + 'ms');
  A(r.stored, 'and stored in the cache');
  A(r2.done && r2.made===0 && r2.fromCache >= r.work.kinds, 'a second session has them from the cache, no worker run: ' + JSON.stringify(r2));
  A(r3.allAt!==null && r3.npcs + r3.villagers===r3.want && r3.queueGone, 'every townsperson arrives: ' + JSON.stringify(r3));
  A(r3.plates===r3.platesListed && r3.plates >= r3.npcs + r3.villagers + 1 && r3.hits >= r3.npcs, 'with their plates and their clicks');
  A(r3.worstLater[0] < 400 && r3.worstLater[2] < 150, 'and no frame to speak of while they do: ' + r3.worstLater);
  A(!errs.length, 'no page errors: ' + errs.join(' | '));
};
