// (probe, not in ALL) the open land's matrix walk (ZSAVE): the whole scene's updateMatrixWorld, and each top-level group's share,
// with how many of its objects recompute their matrices
const fs = require('fs');
module.exports = async page=>{
  const txt = fs.readFileSync(process.env.ZSAVE, 'utf8');
  const r = await page.evaluate(async txt=>{ window.__noWarmSlice = false; const d = JSON.parse(txt).data; importSaveText(txt); loadGame(d.id); G.interior = null; G.gameMode = 0; const t = G.ow.spawnPos; G.owPos = { x:t.x, y:t.y + 3 }; setUi('playing');
    for (let i=0;i<150;i++){ renderGame(); await new Promise(r=>setTimeout(r, 25)); }
    const refs = new Map(); for (const k in O3){ const v = O3[k]; if (v && v.isObject3D) refs.set(v, k); }
    const tm = (f, n)=>{ const t0 = performance.now(); for (let i=0;i<n;i++) f(); return +((performance.now() - t0)/n).toFixed(3); };
    const out = { all:tm(()=>O3.scene.updateMatrixWorld(), 40), kids:[] };
    const walk = (g, path, depth)=>{ for (const c of g.children){ let n = 0, a = 0; c.traverse(o=>{ n++; if (o.matrixAutoUpdate) a++; }); if (n < 20) continue; const nm = path + '/' + (refs.get(c) || c.name || c.type); out.kids.push([nm, n, a, tm(()=>c.updateMatrixWorld(true), 20)]); if (depth < 1 && n > 300) walk(c, nm, depth + 1); } };
    const unf = ()=>{ const a = []; for (let i=0;i<40;i++){ renderGame(); const t0 = performance.now(); O3.scene.updateMatrixWorld(); a.push(performance.now() - t0); } a.sort((x,y)=>x-y); return +a[20].toFixed(3); };
    out.frameWalk = unf(); O3.nodeGrp.matrixWorldAutoUpdate = false; out.noNodes = unf(); if (O3.lmGrp) O3.lmGrp.matrixWorldAutoUpdate = false; out.noNodesLm = unf(); O3.nodeGrp.matrixWorldAutoUpdate = true; if (O3.lmGrp) O3.lmGrp.matrixWorldAutoUpdate = true;
    walk(O3.scene, '', 0); out.kids.sort((a,b)=>b[3]-a[3]); out.kids = out.kids.slice(0, 20);
    return out; }, txt);
  console.log(JSON.stringify(r));
};
