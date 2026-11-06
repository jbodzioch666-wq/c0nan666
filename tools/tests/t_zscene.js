// (probe, not in ALL) what the open land's scene holds (ZSAVE a save): objects, meshes, what updates its matrix each frame, what's culled,
// by top-level group
const fs = require('fs');
module.exports = async page=>{
  const txt = fs.readFileSync(process.env.ZSAVE, 'utf8');
  const r = await page.evaluate(async txt=>{ window.__noWarmSlice = false; const d = JSON.parse(txt).data; importSaveText(txt); loadGame(d.id); G.interior = null; G.gameMode = 0; const t = G.ow.spawnPos; G.owPos = { x:t.x, y:t.y + 3 }; setUi('playing');
    for (let i=0;i<120;i++){ renderGame(); await new Promise(r=>setTimeout(r, 30)); }
    const sc = O3.scene, out = { all:0, meshes:0, visMeshes:0, auto:0, autoW:0, culled:0, groups:{} };
    const name = o=>{ let p = o; while (p.parent && p.parent!==sc && p.parent!==O3.world) p = p.parent; return (p.parent===O3.world ? 'world/' : '') + (p.name || p.type) + (p.userData && p.userData.kind ? ':' + p.userData.kind : ''); };
    sc.traverse(o=>{ out.all++; if (o.matrixAutoUpdate) out.auto++; if (o.matrixWorldAutoUpdate!==false) out.autoW++; const k = name(o), G0 = out.groups[k] || (out.groups[k] = { n:0, mesh:0, vis:0, auto:0 }); G0.n++; if (o.matrixAutoUpdate) G0.auto++; if (o.isMesh || o.isSprite || o.isPoints || o.isLine){ out.meshes++; G0.mesh++; let v = true; for (let p = o; p; p = p.parent) if (!p.visible){ v = false; break; } if (v){ out.visMeshes++; G0.vis++; } if (o.frustumCulled) out.culled++; } });
    const big = sc.children.filter(c=>c.isGroup).sort((a,b)=>{ let na = 0, nb = 0; a.traverse(()=>na++); b.traverse(()=>nb++); return nb - na; })[0];
    const refs = new Map(); for (const k in O3){ const v = O3[k]; if (v && v.isObject3D) refs.set(v, 'O3.' + k); else if (v instanceof Map) for (const [kk, vv] of v) if (vv && vv.isObject3D) refs.set(vv, 'O3.' + k + '[map]'); }
    out.bigName = refs.get(big) || big.name; out.kids = big.children.map(c=>{ let n = 0, m = 0, a = 0; c.traverse(o=>{ n++; if (o.isMesh) m++; if (o.matrixAutoUpdate) a++; }); return [refs.get(c) || c.name || c.type, n, m, a, c.children.length]; }).sort((a,b)=>b[1]-a[1]).slice(0, 25);
    out.groups = Object.fromEntries(Object.entries(out.groups).sort((a,b)=>b[1].n - a[1].n).slice(0, 18));
    return out; }, txt);
  console.log(JSON.stringify(r, null, 0));
};
