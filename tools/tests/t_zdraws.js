// (probe, not in ALL) draw calls and triangles of a view's frame (ZSAVE; ZVIEW town|land|dungeon), with and without the shadow pass, and
// the meshes drawn by kind: the town's people, buildings, props
const fs = require('fs');
module.exports = async page=>{
  const txt = fs.readFileSync(process.env.ZSAVE, 'utf8'), view = process.env.ZVIEW || 'town';
  const r = await page.evaluate(async ([txt, view])=>{ window.__noWarmSlice = false; const d = JSON.parse(txt).data; importSaveText(txt); loadGame(d.id); G.interior = null; G.gameMode = 0; const t = G.ow.spawnPos; saveCurrentGame = ()=>{};
    if (view==='town'){ G.owPos = { x:t.x, y:t.y }; enterVillage(); setUi('playing'); G.player.x = tX(10); G.player.y = tY(13); } else { G.owPos = { x:t.x, y:t.y + 3 }; setUi('playing'); }
    for (let i=0;i<150;i++){ if (i===20){ setUi('playing'); } renderGame(); await new Promise(r=>setTimeout(r, 25)); }
    const R = view==='town' ? V3.renderer : O3.renderer, sc = view==='town' ? V3.scene : O3.scene;
    const count = ()=>{ R.info.autoReset = false; R.info.reset(); renderGame(); const o = { calls:R.info.render.calls, tris:R.info.render.triangles }; R.info.autoReset = true; return o; };
    const out = { a:count(), b:count(), c:count() };
    const sm = R.shadowMap.enabled; R.shadowMap.enabled = false; out.noShadow = count(); R.shadowMap.enabled = sm;
    // what's in view: meshes by their top group
    const kinds = {}; const top = o=>{ let p = o; while (p.parent && p.parent!==sc && p.parent!==V3.world) p = p.parent; return (p.userData && (p.userData.kind || (p.userData.person ? 'person' : ''))) || p.name || p.type; };
    sc.traverseVisible(o=>{ if (!(o.isMesh || o.isSprite || o.isPoints || o.isLine)) return; const k = top(o); const K = kinds[k] || (kinds[k] = { n:0, cast:0 }); K.n++; if (o.castShadow) K.cast++; });
    out.kinds = Object.fromEntries(Object.entries(kinds).sort((a,b)=>b[1].n - a[1].n).slice(0, 14));
    { const sz = { tiny:0, small:0, mid:0, big:0 }, ex = {}, v = new THREE.Vector3(); sc.traverseVisible(o=>{ if (!o.isMesh || !o.castShadow || !o.geometry) return; const g = o.geometry; if (!g.boundingSphere) g.computeBoundingSphere(); o.getWorldScale(v); const rr = g.boundingSphere.radius*Math.max(v.x, v.y, v.z);
        const b = rr < 0.08 ? 'tiny' : rr < 0.2 ? 'small' : rr < 0.6 ? 'mid' : 'big'; sz[b]++; if (b==='tiny' || b==='small'){ let p = o, nm = ''; for (let i=0;i<3 && p;i++){ nm = (p.name || p.geometry && p.geometry.type || p.type) + '>' + nm; p = p.parent; } ex[nm] = (ex[nm]||0) + 1; } });
      out.casters = sz; out.smallEx = Object.entries(ex).sort((a,b)=>b[1]-a[1]).slice(0, 12); }
    { const figs = []; sc.traverse(o=>{ if (o.userData && o.userData.m3d && o.isObject3D){} }); const holders = new Set(); for (const e of (M3D.instAll || [])) holders.add(e.holder);
      // a figure: a group holding a SkinnedMesh; count the drawn meshes under each one's root
      const roots = new Set(); sc.traverse(o=>{ if (o.isSkinnedMesh){ let p = o; while (p.parent && p.parent!==sc && p.parent!==V3.world && !(p.userData && p.userData.figRoot)) p = p.parent; roots.add(p); } });
      const per = []; for (const rt of roots){ let m = 0, sk = 0, cast = 0; rt.traverse(o=>{ if (o.isMesh && o.visible){ m++; if (o.isSkinnedMesh) sk++; if (o.castShadow) cast++; } }); per.push([m, sk, cast]); }
      let groups = 0, singles = 0, skinnedM = 0; const mats = new Map(); for (const rt of roots){ const by = new Map(); rt.traverse(o=>{ if (!o.isMesh || !o.visible) return; if (o.isSkinnedMesh){ skinnedM++; return; } const k = o.parent.uuid + '|' + o.material.uuid; by.set(k, (by.get(k)||0) + 1); const mk = o.material.type + (o.material.map ? '+map' : '') + (o.material.transparent ? '+T' : ''); mats.set(mk, (mats.get(mk)||0) + 1); }); groups += by.size; for (const v of by.values()) if (v===1) singles++; }
      const why = {}; const plain = THREE.Material.prototype.onBeforeCompile;
      for (const rt of roots){ rt.traverse(o=>{ if (!o.isMesh || !o.visible || o.isSkinnedMesh) return; const m = o.material; let r = 'other';
        if (Array.isArray(m)) r = 'multiMat'; else if (m.transparent) r = 'transparent'; else if (m.userData.special) r = 'special:' + m.userData.special; else if (m.userData.bend) r = 'bend'; else if (m.onBeforeCompile!==plain && !m.userData.rim) r = 'ownShader';
        else if (Object.keys(o.userData).length) r = 'userData:' + Object.keys(o.userData).slice(0, 2).join(','); else if (o.geometry.morphAttributes && Object.keys(o.geometry.morphAttributes).length) r = 'morph'; else if (o.isInstancedMesh) r = 'instanced'; else r = 'rigOrProp(' + (o.name || o.geometry.type) + ')';
        why[r] = (why[r]||0) + 1; }); }
      out.why = Object.entries(why).sort((a,b)=>b[1]-a[1]).slice(0, 20);
      out.merge = { rigid:per.reduce((a,b)=>a+b[0]-b[1],0), byBoneMat:groups, singles, skinnedM, mats:[...mats.entries()].sort((a,b)=>b[1]-a[1]).slice(0, 8) };
      per.sort((a,b)=>b[0]-a[0]); out.figs = { n:per.length, meshes:per.reduce((a,b)=>a+b[0],0), casters:per.reduce((a,b)=>a+b[2],0), top:per.slice(0, 6) }; }
    { const tm = (sh)=>{ const a = []; for (let i=0;i<40;i++){ if (sh) R.shadowMap.needsUpdate = true; const sm0 = R.shadowMap.autoUpdate; R.shadowMap.autoUpdate = false; if (!sh) R.shadowMap.needsUpdate = false; const t0 = performance.now(); renderGame(); a.push(performance.now() - t0); R.shadowMap.autoUpdate = sm0; } a.sort((x,y)=>x-y); return +a[20].toFixed(2); };
      out.msShadow = tm(true); out.msNoShadow = tm(false);
      const far = []; const pp = V3.player && V3.player.g ? V3.player.g.position : null; }
    out.people = (V3.people||[]).length; let pm = 0; for (const p of V3.people||[]) if (p.g) p.g.traverse(o=>{ if (o.isMesh) pm++; }); out.peopleMeshes = pm;
    return out; }, [txt, view]);
  console.log(JSON.stringify(r));
};
