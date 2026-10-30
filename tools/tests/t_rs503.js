// RS-503: shader warm-ups that happen mid-play (a land chunk swapping in while you walk) sip 10ms a frame, never hold a frame and
// never show the loading card - only real loads do; the once-a-second land freeze sweep skips groups that haven't changed; and the
// sculpt cache writes about a megabyte a beat instead of everything at once
module.exports = async page=>{
  await page.evaluate(()=>{ window.__noWarmSlice = 0; });
  const r = await page.evaluate(async ()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    G.gameMode = 0; G.interior = null; const wait = ms=>new Promise(r2=>setTimeout(r2, ms));
    for (let i=0;i<30;i++){ renderGame(); await wait(40); }
    let n0 = 0; while ((O3.warmWait || V3.warmWait) && n0++ < 600){ await new Promise(r2=>requestAnimationFrame(r2)); renderGame(); } await wait(600);
    const T = THREE, out = {};
    /* a live warm: fresh materials appear mid-walk */
    const grp = new T.Group(); for (let i=0;i<6;i++){ const m = new T.Mesh(new T.BoxGeometry(0.4, 0.4, 0.4), new T.MeshStandardMaterial({ color:0x406080 + i*40, roughness:0.4 + i*0.05 })); m.position.set(O3.cam.position.x + i, 1, O3.cam.position.z); grp.add(m); }
    O3.scene.add(grp); O3.compileDue = true; O3.compileLive = true;
    let card = 0, live = null, ticks = 0, worstGap = 0, warmFrames = 0, last = performance.now();
    const lc = ()=>{ const el = document.getElementById('loadCard'); return el && el.classList.contains('show'); };
    while (ticks++ < 400){ await new Promise(r2=>requestAnimationFrame(r2)); const now = performance.now();
      if (O3.warmWait){ warmFrames++; worstGap = Math.max(worstGap, now - last); if (live===null) live = O3.warmWait.live; if (lc()) card++; }
      last = now; renderGame();
      if (!O3.warmWait && live!==null) break; }
    out.live = live; out.card = card; out.warmFrames = warmFrames; out.worstGap = Math.round(worstGap); out.done = !O3.warmWait;
    out.shown = grp.children.every(m=>m.material.visible && m.material.__warmVis===undefined);
    O3.scene.remove(grp);
    /* the freeze sweep skips unchanged groups */
    o3FreezeStatic(true); const g = O3.nodeGrp, kid = g && g.children.find(c=>c.children.length || c.isMesh);
    if (g){ const sig0 = g.userData.frzSig, kid2 = new T.Object3D(); kid2.position.set(2, 5, 3); g.add(kid2);
      o3FreezeStatic();   /* (children count changed: the sweep runs without force) */
      const fresh = Math.abs(kid2.matrixWorld.elements[13] - (g.matrixWorld.elements[13] + 5)) < 0.01 && kid2.matrixAutoUpdate===false;
      g.remove(kid2); o3FreezeStatic();
      const skipped = (()=>{ const before = g.userData.frzSig; o3FreezeStatic(); return g.userData.frzSig===before; })();
      out.sweep = { fresh, skipped, sig0:sig0!==undefined }; }
    /* the cache flush takes about a megabyte a beat */
    if (SCULPT_DB.db){ SCULPT_DB.dirty = []; for (let i=0;i<5;i++) SCULPT_DB.dirty.push(['t503|' + i, { ver:-1, bytes:1e6, p:new Float32Array(3), n:new Float32Array(3), c:null, u:null, i:new Uint16Array(3) }]);
      sculptDbFlush(); out.flushLeft = SCULPT_DB.dirty.length; clearTimeout(sculptDbPut.tm); sculptDbPut.tm = 0; SCULPT_DB.dirty = [];
      try{ const tx = SCULPT_DB.db.transaction(['g', 'm'], 'readwrite'); for (let i=0;i<5;i++){ tx.objectStore('g').delete('t503|' + i); tx.objectStore('m').delete('t503|' + i); } }catch(e){} }
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.live===true && r.done && r.shown, 'the mid-play warm ran live and finished, and the new things are shown');
  A(r.card===0, 'no loading card mid-play');
  A(r.warmFrames > 0 && r.worstGap < 400, 'the game kept its frames while it warmed - no held, no multi-second gap');
  A(!r.sweep || (r.sweep.fresh && r.sweep.skipped && r.sweep.sig0), 'a new child is composed and frozen by the sweep, and unchanged groups are skipped');
  A(r.flushLeft===undefined || r.flushLeft >= 3, 'the cache flush takes about a megabyte a beat');
};
