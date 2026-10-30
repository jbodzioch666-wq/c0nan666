// (probe, not in ALL) after a shop round trip: which of the town's materials the warm-up hasn't seen, and whose geometry got disposed
module.exports = async page=>{
  page.setDefaultTimeout(0);
  const r = await page.evaluate(async ()=>{ window.__noWarmSlice = false; goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1;
    const fr = async n=>{ for (let i=0;i<n;i++){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); } };
    const t = G.ow.spawnPos; G.owPos = { x:t.x, y:t.y }; enterVillage(); setUi('playing'); await fr(90); townClosedCheck = ()=>false; const out = {}, seen = gfxWarmSeen(V3.renderer);
    const own = o=>{ const path = []; let q = o; while (q && q!==V3.world && path.length < 4){ path.unshift((q.name||q.type) + (q.visible ? '' : '(hid)')); q = q.parent; } return path.join('/'); };
    const unseen = ()=>{ const k = new Map(); V3.world.traverse(o=>{ if (o.material) for (const m of [].concat(o.material)) if (!seen.has(m)){ const key = own(o) + ':' + m.type + (m.visible ? '' : '(mhid)'); k.set(key, (k.get(key)||0) + 1); } }); return [...k].slice(0, 12); };
    out.unseenBefore = unseen(); out.warmWaitBefore = !!V3.warmWait; out.cardBefore = !!document.querySelector('#loadCard.show, .loadcard.show');
    const w0 = V3.world; const D = THREE.BufferGeometry.prototype.dispose; const gone = new Map(); THREE.BufferGeometry.prototype.dispose = function(){ this.__gone = 1; return D.call(this); };
    const key = (G.townVendors||[]).map(v=>v.key).find(k=>ROOM_LAYOUT[k]); enterInterior(key); await fr(60);
    let cardSeen = false; const C0 = gfxWarmCard; gfxWarmCard = function(){ cardSeen = true; return C0.apply(this, arguments); };
    const cs0 = gfxCompileSliced; let calls = []; gfxCompileSliced = function(V, r, scene, cam, grp, live){ const t0 = performance.now(); const res = cs0.apply(this, arguments); calls.push({ live:!!live, ms:Math.round(performance.now() - t0), wait:V.warmWait ? V.warmWait.mats.length : 0 }); return res; };
    exitInterior(); await fr(3); out.after3 = { warmWait:!!V3.warmWait, calls, cardSeen }; await fr(60);
    out.after60 = { warmWait:!!V3.warmWait, calls, cardSeen, unseen:unseen() };
    w0.traverse(o=>{ if (o.geometry && o.geometry.__gone){ const k = own(o); gone.set(k, (gone.get(k)||0) + 1); } }); out.disposedOwners = [...gone].slice(0, 12);
    THREE.BufferGeometry.prototype.dispose = D; return out; });
  console.log(JSON.stringify(r, null, 1));
};
