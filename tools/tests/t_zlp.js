// (probe, not in ALL) the look preview's figure build, timed piece by piece: the atlas tile draws, the skinning merge, each render
module.exports = async page=>{
  page.setDefaultTimeout(0);
  const r = await page.evaluate(async ()=>{ goToCharCreate(); const out = { draws:[], skins:[], renders:[], frames:[] }, T = THREE;
    const wrap = (name, fn, store)=>function(){ const t0 = performance.now(); try{ return fn.apply(this, arguments); } finally { store.push(+(performance.now() - t0).toFixed(1)); } };
    const d0 = m3dAtlasDraw, s0 = m3dSkinRoot; m3dAtlasDraw = wrap('draw', d0, out.draws); m3dSkinRoot = wrap('skin', s0, out.skins); out.tries = []; out.insts = []; out.bakes = []; out.tplskins = []; const t0f = m3dTemplateTry, i0f = m3dInstance, b0f = m3dAtlasBake, k0f = m3dTemplateSkin; m3dTemplateTry = wrap('try', t0f, out.tries); m3dInstance = wrap('inst', i0f, out.insts); m3dAtlasBake = wrap('bake', b0f, out.bakes); m3dTemplateSkin = wrap('tplskin', k0f, out.tplskins);
    const wait = ms=>new Promise(r=>setTimeout(r, ms)); await wait(300);
    if (!LP.r) return { noLP:true }; const R0 = LP.r.render.bind(LP.r); LP.r.render = function(a, b){ const t0 = performance.now(); R0(a, b); const dt = performance.now() - t0; out.renders.push(+dt.toFixed(1)); };
    out.progs0 = LP.r.info.programs.length; out.atlasDrawn0 = M3D.atlas ? [...M3D.atlas.drawn] : null;
    /* a new look: a slider dragged */
    lookBodySet('fat', 0.5); await wait(300); { let n = 0; while (LP.pend && n++ < 600) await new Promise(res=>requestAnimationFrame(res)); }
    out.first = { draws:out.draws.slice(), skins:out.skins.slice(), renders:out.renders.filter(f=>f > 5), progs:LP.r.info.programs.length, tries:out.tries.filter(f=>f>5), insts:out.insts.slice(), bakes:out.bakes.slice(), tplskins:out.tplskins.slice() }; out.draws.length = out.skins.length = out.renders.length = out.tries.length = out.insts.length = out.bakes.length = out.tplskins.length = 0;
    lookBodySet('fat', 1); lookBodySet('muscle', 1); await new Promise(res=>requestAnimationFrame(res));
    let frames = 0, last = performance.now(); while ((LP.pend || frames < 5) && frames++ < 600){ await new Promise(res=>requestAnimationFrame(res)); const now = performance.now(); out.frames.push(+(now - last).toFixed(1)); last = now; }
    out.progs1 = LP.r.info.programs.length; out.atlasDrawn1 = M3D.atlas ? [...M3D.atlas.drawn] : null; out.worstFrame = Math.max(...out.frames); out.nFrames = out.frames.length;
    out.frames = out.frames.filter(f=>f > 40); out.renders = out.renders.filter(f=>f > 5); out.tries = out.tries.filter(f=>f > 5);
    return out; });
  console.log(JSON.stringify(r));
};
