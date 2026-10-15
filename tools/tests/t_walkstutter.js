// RS-403: a long walk doesn't stutter as the land moves on - the new land's shaders are compiled a few a frame before it's swapped in
// (no whole-scene compile at the swap), its woods are built in slices, and the animals still in reach are kept, the new ones built a
// couple a frame
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; o3Pref = true; G.gameMode = 0; G.interior = null; G.player.wildWarned = 1;
    const fr = async n=>{ for (let i=0;i<n;i++){ renderGame(); await new Promise(r=>setTimeout(r, 20)); } };
    await fr(10);
    const out = {};
    // the woods are a generator now: building them yields more than once
    { const g = new THREE.Group(); let n = 0; const it = o3VegetationGen(g, O3.win.cx - O3_W/2, O3.win.cy - O3_W/2, O3_W); while (!it.next().done) n++; out.vegYields = n; }
    // the creatures' finishes are made a few rows at a time: a warm-up call keeps to its budget (give or take a few rows)
    { M3D.pat = {}; M3D.patGen = {}; M3D.patDone = false; let worst = 0, calls = 0, done = false;
      while (!done && calls < 5000){ const t0 = performance.now(); done = m3dPatternWarm(3); worst = Math.max(worst, performance.now() - t0); calls++; }
      out.patCalls = calls; out.patWorst = +worst.toFixed(1); out.patAll = M3D_PAT_KINDS.every(k=>M3D.pat[k] && M3D.pat[k].map); }
    // the animals: move the window by a few tiles and the ones still in reach are the same objects
    o3Wildlife(0.016); const before = new Set((O3.wild||[]).map(w=>w.id)), objs = new Map((O3.wild||[]).map(w=>[w.id, w]));
    O3.win = { cx:O3.win.cx + 3, cy:O3.win.cy }; o3Wildlife(0.016);
    const kept = (O3.wild||[]).filter(w=>before.has(w.id)); out.kept = kept.length; out.same = kept.every(w=>objs.get(w.id)===w);
    out.pendAfter = (O3.wild||[]).filter(w=>w.pend && w.k!=='bird').length; out.wildN = (O3.wild||[]).length;
    O3.win = { cx:O3.win.cx - 3, cy:O3.win.cy };
    // a land build at walking budgets: it compiles over slices, and the swap leaves no whole-scene compile due
    o3BuildStart(O3.win.cx, O3.win.cy); let slices = 0, compSlices = 0, dueAtSwap = null;
    while (O3.pend && slices < 2000){ const P = O3.pend; const done = o3BuildSlice(6); slices++; if (P.built) compSlices++; if (done){ dueAtSwap = !!O3.compileDue; } }
    out.slices = slices; out.compSlices = compSlices; out.dueAtSwap = dueAtSwap;
    await fr(3);
    return out;
  });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.vegYields >= 3, 'the woods are built in slices');
  A(r.patAll && r.patCalls > 10 && r.patWorst < 80, 'the finishes are made in slices, not all at once');
  A(r.wildN === 0 || (r.kept > 0 && r.same), 'animals still in reach are kept across a window move');
  A(r.slices > 3 && r.compSlices >= 1, 'a land build at walking pace takes several slices, with its compile among them');
  A(r.dueAtSwap === false, 'no whole-scene compile is left for the frame the new land appears');
};
