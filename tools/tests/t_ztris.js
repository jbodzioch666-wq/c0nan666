// (probe, not in ALL) the open land's heaviest meshes by triangles (ZSAVE): geometry triangles times instances, and what each is
const fs = require('fs');
module.exports = async page=>{
  const txt = fs.readFileSync(process.env.ZSAVE, 'utf8');
  const r = await page.evaluate(async ([txt, nvc])=>{ window.__noWarmSlice = false; window.__noVegCull = nvc; const d = JSON.parse(txt).data; importSaveText(txt); loadGame(d.id); G.interior = null; G.gameMode = 0; const t = G.ow.spawnPos; G.owPos = { x:t.x, y:t.y + 3 }; setUi('playing');
    for (let i=0;i<150;i++){ renderGame(); await new Promise(r=>setTimeout(r, 25)); }
    const refs = new Map(); for (const k in O3){ const v = O3[k]; if (v && v.isObject3D) refs.set(v, 'O3.' + k); } for (const k in GFX){ const v = GFX[k]; if (v && v.isObject3D) refs.set(v, 'GFX.' + k); }
    const rows = []; let total = 0;
    O3.scene.traverseVisible(o=>{ if (!o.isMesh || !o.geometry) return; const g = o.geometry, tri = (g.index ? g.index.count : g.attributes.position.count)/3, n = o.isInstancedMesh ? o.count : 1, t = tri*n; total += t;
      let p = o, nm = ''; for (let i=0;i<3 && p && p!==O3.scene;i++){ nm = (refs.get(p) || p.name || p.type) + '>' + nm; p = p.parent; } rows.push([Math.round(t), Math.round(tri), n, nm + (o.material && o.material.type), o.castShadow ? 'C' : '']); });
    rows.sort((a,b)=>b[0]-a[0]); return { total:Math.round(total), top:rows.slice(0, 6) }; }, [txt, !!process.env.ZNOVC]);
  console.log(JSON.stringify(r));
};
