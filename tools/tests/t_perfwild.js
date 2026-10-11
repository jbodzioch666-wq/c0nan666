// RS-333: the open land draws far less - each gathering spot's still parts are baked into one mesh per material (a herb
// patch was 21 draws, the spots in view some 3,000), and the deer, rabbits and boar are sculpted coarse (each was up to
// 176,000 triangles, and a forest has up to 28 of them)
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); G.gameMode = 0; saveCurrentGame = ()=>{};
    for (let i=0;i<12;i++){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); }
    const out = {}; let n = 0; for (let i=-20;i<=20;i++) for (let j=-20;j<=20;j++) if (skNodeAt(G.owPos.x+i, G.owPos.y+j)) n++;
    let drawn = 0, merged = 0; O3.nodeGrp.traverse(o=>{ if (o.isMesh && o.material && o.material.visible!==false){ drawn++; if (o.userData.merged) merged++; } });
    out.nodes = n; out.drawn = drawn; out.merged = merged; out.hits = O3.nodeHits.length;
    const tris = e=>{ let t = 0; e.holder.traverse(o=>{ if (o.isMesh){ const g = o.geometry; t += g.index ? g.index.count/3 : g.attributes.position.count/3; } }); return Math.round(t); };
    const spec = WG_WILD.deer; out.fine = tris(m3dInstance({ nm:spec.nm }, { paint:mpBeast, o:spec.o, h:1 }));
    M3D_COARSE = 2.6; try{ out.coarse = tris(m3dInstance({ nm:spec.nm }, { paint:mpBeast, o:spec.o, h:1 })); } finally { M3D_COARSE = 1; }
    out.wild = (O3.wild||[]).filter(w=>w.e && w.e.holder && w.k!=='bird').map(w=>tris(w.e));
    return out; });
  const A = (c, m)=>{ if (!c) throw new Error(m+' :: '+JSON.stringify(r)); };
  A(r.nodes > 20 && r.merged > 0, 'the gathering spots are baked together');
  A(r.drawn < r.nodes*2.5, 'about two draws a spot or fewer, not nine: '+r.drawn+' for '+r.nodes);
  A(r.coarse < r.fine/4, 'a coarse deer is a quarter of the triangles or fewer');
  A(r.wild.every(t=>t < 60000), 'the animals on the land are the coarse ones');
  console.log('perfwild ok', JSON.stringify(r));
};
