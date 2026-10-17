// RS-500: finished sculpts (bodies, gear, the skeleton's bones) are kept in IndexedDB keyed by their sculpt key, so later sessions
// skip the distance-field fill and the meshing. A fresh page with the cache warm rebuilds every sculpt it has seen before byte
// for byte without calling the sculpting kit (figures roll their proportions, so genuinely new keys still sculpt)
module.exports = async page=>{
  await page.evaluate(()=>new Promise(res=>{ const rq = indexedDB.deleteDatabase('dc-sculpt'); rq.onsuccess = rq.onerror = rq.onblocked = ()=>res(); }));
  await page.reload(); await page.waitForTimeout(2000);
  const cold = await page.evaluate(async ()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    m3dInstance({}, rsPlayerLook()); m3dInstance({}, m3dPortrait({ nm:'goblin archer' }));
    const keys = [...M3D.sculpt.keys()], snap = {}; localStorage.setItem('t500k', JSON.stringify(keys)); for (const k of keys.slice(0, 40)){ const a = M3D.sculpt.get(k).attributes.position.array; snap[k] = [a.length, a[0], a[1], a[Math.floor(a.length/2)], a[a.length-1]]; }
    localStorage.setItem('t500', JSON.stringify(snap));
    await new Promise(r2=>setTimeout(r2, 1600));   /* (the write-behind flushes) */
    return { sculpts:keys.length }; });
  console.log('COLD', JSON.stringify(cold));
  await page.waitForTimeout(800); await page.reload(); await page.waitForTimeout(1500);
  const warm = await page.evaluate(async ()=>{
    for (let i=0;i<100 && !SCULPT_DB.map.size;i++) await new Promise(r2=>setTimeout(r2, 100));   /* (hydration) */
    const n0 = SCULPT_DB.map.size; await new Promise(r2=>setTimeout(r2, 800));
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    let parts = 0; const op = SDF.part; SDF.part = (...a)=>{ parts++; return op(...a); };
    m3dInstance({}, rsPlayerLook()); m3dInstance({}, m3dPortrait({ nm:'goblin archer' })); SDF.part = op;
    const snap = JSON.parse(localStorage.getItem('t500')), oldKeys = new Set(JSON.parse(localStorage.getItem('t500k'))), out = { hydrated:n0, parts, match:0, miss:0 };
    out.newKeys = [...M3D.sculpt.keys()].filter(k=>!oldKeys.has(k)).length;   /* (figures roll their build, so some sculpts are genuinely new) */
    for (const k in snap){ const g = M3D.sculpt.get(k); if (!g){ out.miss++; continue; } const a = g.attributes.position.array, s = snap[k];
      if (a.length===s[0] && a[0]===s[1] && a[1]===s[2] && a[Math.floor(a.length/2)]===s[3] && a[a.length-1]===s[4]) out.match++; else out.miss++; }
    out.meta = await new Promise(res=>{ try{ SCULPT_DB.db.transaction('m', 'readonly').objectStore('m').count().onsuccess = e=>res(e.target.result); }catch(e){ res(-1); } });
    return out; });
  console.log('WARM', JSON.stringify(warm));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' COLD '+JSON.stringify(cold)+' WARM '+JSON.stringify(warm)); };
  A(cold.sculpts > 12, 'the figures sculpted on the cold run');
  A(warm.hydrated > 12 && warm.meta > 12, 'the cache came back on reload, with its size ledger');
  A(warm.parts===warm.newKeys, 'every sculpt seen before came from the cache - the kit ran only for genuinely new keys');
  A(warm.match >= 12 && warm.miss===0, 'every cached sculpt matches the cold one byte for byte');
};
