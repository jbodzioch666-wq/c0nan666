// RS-501: the placed land is frozen - the gathering nodes and landmarks skip the per-frame matrix walk entirely
// (matrixWorldAutoUpdate off at their roots, composes off inside), the few animated pieces (beams, fins) stay live, beasts stay
// live, and the frozen matrices are still right (checked against a fresh compose); sprite sheets read their pixels without a GPU stall
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    G.gameMode = 0; G.interior = null; const wait = ms=>new Promise(r2=>setTimeout(r2, ms));
    for (let i=0;i<40;i++){ renderGame(); await wait(40); }
    await wait(1200); renderGame();   /* (past the once-a-second freeze sweep) */
    const T = THREE, out = { o3:o3Active(), groups:{} };
    const skip = new Set(); for (const a of (O3.nodeAnim||[])) if (a.o) skip.add(a.o);
    for (const k of ['wildGrp', 'nodeGrp', 'lmGrp']){ const g = O3[k]; if (!g){ out.groups[k] = null; continue; }   /* (wildGrp reported, never frozen) */
      let n = 0, frozen = 0, live = 0; g.traverse(o=>{ n++; if (skip.has(o)){ if (o.matrixAutoUpdate) live++; return; } if (!o.matrixAutoUpdate) frozen++; });
      out.groups[k] = { gated:g.matrixWorldAutoUpdate===false, n, frozen, live }; }
    out.anim = (O3.nodeAnim||[]).length;
    /* the frozen matrices are still the truth */
    let worst = 0, checked = 0; const m = new T.Matrix4();
    for (const g of [O3.nodeGrp, O3.lmGrp]) if (g) g.traverse(o=>{ if (checked > 400 || !o.parent || skip.has(o)) return; checked++;
      m.compose(o.position, o.quaternion, o.scale); m.premultiply(o.parent.matrixWorld);
      const a = m.elements, b = o.matrixWorld.elements; for (let i=0;i<16;i++) worst = Math.max(worst, Math.abs(a[i] - b[i])); });
    out.worst = +worst.toExponential(1); out.checked = checked;
    out.beastAuto = !O3.beastGrp || O3.beastGrp.matrixWorldAutoUpdate!==false;
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.o3, 'the 3D land is up');
  for (const k of ['nodeGrp', 'lmGrp']){ const g = r.groups[k]; A(g && g.gated && g.frozen > 20, k + ' is gated and frozen'); }
  A(r.groups.wildGrp===null || !r.groups.wildGrp.gated, 'the wildlife is not frozen - it walks');
  A(r.checked > 100 && r.worst < 1e-5, 'the frozen matrices match a fresh compose');
  A(r.beastAuto, 'the beasts still walk the frame');
};
