// (probe, not in ALL) three looks at once: the dye works' figure build timed, the skinning merge profiled, the tomb scarab's culling sphere
module.exports = async page=>{
  page.setDefaultTimeout(0);
  const r = await page.evaluate(async ()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; const T = THREE, out = {}, wait = ms=>new Promise(r=>setTimeout(r, ms));
    /* 1: the skin merge, profiled by wrapping what it calls */
    const prof = {}, wrap = (name, fn)=>function(){ const t0 = performance.now(); try{ return fn.apply(this, arguments); } finally { prof[name] = (prof[name]||0) + performance.now() - t0; } };
    m3dAtlasBake = wrap('bake', m3dAtlasBake); m3dAtlasOk = wrap('ok', m3dAtlasOk); m3dAtlasKey = wrap('key', m3dAtlasKey); m3dMergeKey = wrap('mkey', m3dMergeKey); m3dRimify = wrap('rim', m3dRimify); m3dAtlasify = wrap('atlasify', m3dAtlasify);
    const cbs = T.BufferGeometry.prototype.computeBoundingSphere, cbb = T.BufferGeometry.prototype.computeBoundingBox; T.BufferGeometry.prototype.computeBoundingSphere = wrap('sphere', cbs); T.BufferGeometry.prototype.computeBoundingBox = wrap('bbox', cbb);
    const bind = T.SkinnedMesh.prototype.bind; T.SkinnedMesh.prototype.bind = wrap('bind', bind);
    { const pt = rsPlayerLook(); const key = m3dTplKey(pt); M3D.tpl.delete(key); let tpl = null; const t0 = performance.now(); while (!tpl){ tpl = m3dTemplateTry(pt, performance.now() + 1e9); } out.build = +(performance.now() - t0).toFixed(0);
      const t1 = performance.now(); M3D.tpl.delete(key); const raw = tpl; let n = 0; raw.traverse(o=>{ if (o.isMesh) n++; }); out.meshesAfter = n; }
    { const pt = rsPlayerLook(); pt.o = Object.assign({}, pt.o, { probe:1 }); const key = m3dTplKey(pt); const t0 = performance.now(); let tpl = null; while (!tpl) tpl = m3dTemplateTry(pt, performance.now() + 1e9); out.build2 = +(performance.now() - t0).toFixed(0); }
    const m0 = m3dSkinRoot; let skinT = 0; m3dSkinRoot = function(){ const t0 = performance.now(); for (const k in prof) prof[k] = 0; try{ return m0.apply(this, arguments); } finally { skinT = performance.now() - t0; } };
    { const pt = rsPlayerLook(); pt.o = Object.assign({}, pt.o, { probe:2 }); let tpl = null; while (!tpl) tpl = m3dTemplateTry(pt, performance.now() + 1e9); out.skinT = +skinT.toFixed(1); out.prof = {}; for (const k in prof) out.prof[k] = +prof[k].toFixed(1); }
    /* 2: the dye works */
    { openDyeWorks(); const t0 = performance.now(); let n = 0; while (!LP.e && n++ < 400) await wait(25); out.dye = { ms:+(performance.now() - t0).toFixed(0), figure:!!LP.e, pend:!!LP.pend, key:(LP.key||'').slice(0, 80) }; }
    return out; });
  console.log(JSON.stringify(r));
};
