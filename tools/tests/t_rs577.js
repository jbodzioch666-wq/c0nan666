// RS-577: lighter land. What stands still stops recomputing its matrix (gfxAutoFreeze) and is unfrozen when it moves; the land's
// plants are drawn only within sight (o3VegCull) - fewer drawn, none in view missing; the cloth steps at most sixty times a second
module.exports = async page=>{
  page.setDefaultTimeout(0);
  const r = await page.evaluate(async ()=>{ goToCharCreate(); ccBegin(); wgRegenerate(12345); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); o3Pref = true; G.gameMode = 0; weatherSync = ()=>{}; saveCurrentGame = ()=>{};
    G.owPos = { x:98, y:116 }; O3.win = null; O3.ppos = null; for (let i=0;i<60;i++){ renderGame(); await new Promise(r=>setTimeout(r, 25)); }
    const out = {}, T = THREE;
    // the freeze: a still marker frozen, then moved and unfrozen, its matrix where it now stands
    { const mk = new T.Mesh(new T.BoxGeometry(0.1, 0.1, 0.1), new T.MeshBasicMaterial()); mk.position.set(G.owPos.x + 0.5, 1, G.owPos.y + 0.5); O3.scene.add(mk);
      for (let i=0;i<80;i++){ renderGame(); await new Promise(r=>setTimeout(r, 5)); } out.frozen = !mk.matrixAutoUpdate;
      mk.position.x += 2; for (let i=0;i<10;i++){ renderGame(); await new Promise(r=>setTimeout(r, 5)); } out.unfrozen = mk.matrixAutoUpdate; out.at = +(new T.Vector3().setFromMatrixPosition(mk.matrixWorld).x - mk.position.x).toFixed(3);
      let fr = 0, all = 0; O3.scene.traverse(o=>{ if (o.__afs){ all++; if (o.__afz) fr++; } }); out.frozenShare = +(fr/Math.max(1, all)).toFixed(2); O3.scene.remove(mk); }
    // the plants: fewer drawn than made, and every one in view drawn
    { const L = O3.vcList || []; let made = 0, drawn = 0, inView = 0, missing = 0; const S = new T.Sphere(), F = O3.fr;
      for (const im of L){ const U = im.userData.icull; made += U.n; drawn += im.count; const A = im.instanceMatrix.array, have = new Set(); for (let i=0;i<im.count;i++) have.add(A[i*16+12].toFixed(3) + ',' + A[i*16+14].toFixed(3));
        for (let i=0;i<U.n;i++){ S.center.set(U.m[i*16+12], U.m[i*16+13], U.m[i*16+14]); S.radius = U.r; if (!F.intersectsSphere(S)) continue; inView++; if (!have.has(U.m[i*16+12].toFixed(3) + ',' + U.m[i*16+14].toFixed(3))) missing++; } }
      out.veg = { kinds:L.length, made, drawn, inView, missing }; }
    // the cloth: two steps asked for a few ms apart - the second waits
    { const e = m3dInstance({}, Object.assign({}, rsPlayerLook(), { o:Object.assign({}, rsPlayerLook().o, { cape:'#6a2a2a' }) })); const c = e.rig && e.rig.cape; let steps = null;
      if (c){ m3dCapeCloth(c, e.rig); const u = m3dCapeOwn(c); u.manual = false; let n = 0, calls = 0, last = u.t; const t0 = performance.now();
        while (performance.now() - t0 < 120){ m3dCapeCloth(c, e.rig); calls++; if (u.t!==last){ n++; last = u.t; } } steps = { calls, solved:n }; }   /* (called as fast as it goes for 120ms) */
      out.cloth = steps; out.step = M3D_CLOTH_STEP; }
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.frozen && Math.abs(r.at) < 0.001, 'a still thing is frozen, and drawn where it moved to once moved');
  A(r.frozenShare > 0.2, 'a good share of the land stands still');
  A(r.veg.kinds > 3 && r.veg.drawn < r.veg.made*0.85 && r.veg.missing===0, 'fewer plants drawn than made, none in view missing: ' + JSON.stringify(r.veg));
  A(r.step <= 1/60 && (!r.cloth || (r.cloth.calls > 50 && r.cloth.solved >= 1 && r.cloth.solved <= 8)), 'the cloth steps at most sixty times a second: ' + JSON.stringify(r.cloth));
};
