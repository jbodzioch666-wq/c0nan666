// RS-574: three.js r159, set up to draw as r149 did - its colour management off (the game makes its colours linear itself), every
// renderer on the old light units, the custom shaders hooked on the chunks' new names (opaque_fragment, colorspace_fragment), an
// instanced or skinned mesh culled by its own geometry's sphere - and the shaders started at once with three's own compile, each
// saying when it's ready
module.exports = async page=>{
  page.setDefaultTimeout(0);
  const r = await page.evaluate(async ()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); o3Pref = true; G.gameMode = 0;
    for (let i=0;i<8;i++){ renderGame(); await new Promise(r=>setTimeout(r, 30)); }
    const T = THREE, out = { rev:T.REVISION, cm:T.ColorManagement.enabled, setup:!!T.__dcSetup };
    out.legacy = [O3.renderer, typeof FPD!=='undefined' && FPD.r].filter(Boolean).map(R=>R.useLegacyLights);
    // the custom shaders: a rimmed figure's material hooks the opaque chunk
    { const m = m3dMat ? null : null; let hooked = 0, tried = 0; O3.scene.traverse(o=>{ for (const mm of [].concat(o.material||[])){ if (!mm.onBeforeCompile || tried > 400) continue; const src = mm.onBeforeCompile.toString(); if (!/opaque_fragment|colorspace_fragment|output_fragment|encodings_fragment/.test(src)) continue; tried++;
        const sh = { uniforms:{}, defines:{}, vertexShader:'#include <begin_vertex>\n#include <project_vertex>\n#include <beginnormal_vertex>\n#include <uv_vertex>', fragmentShader:'void main(){\n#include <map_fragment>\n#include <color_fragment>\n#include <opaque_fragment>\n#include <colorspace_fragment>\n}' };
        try{ mm.onBeforeCompile(sh, O3.renderer); }catch(e){} if (sh.fragmentShader.split('\n').length > 7) hooked++; } }); out.hooks = { tried, hooked }; }
    out.oldNames = /output_fragment|encodings_fragment/.test(document.documentElement.innerHTML.replace(/RS-5\d\d[^\n]*/g, ''));
    // three's own compile: it returns at once, and says when each program is ready
    { const cv = document.createElement('canvas'); cv.width = cv.height = 32; const rr = gfxThreeR(new T.WebGLRenderer({ canvas:cv })); const sc = new T.Scene(), cam = new T.PerspectiveCamera(50, 1, 0.1, 50); sc.add(new T.PointLight(0xffffff, 1, 5));
      for (let i=0;i<5;i++){ const tag = 'r574' + i + Math.floor(Math.random()*1e9), m = new T.MeshStandardMaterial(); m.customProgramCacheKey = ()=>tag; m.onBeforeCompile = sh=>{ sh.fragmentShader = sh.fragmentShader.replace('void main() {', 'void main() { float ' + tag + ' = 0.0;'); }; sc.add(new T.Mesh(new T.BoxGeometry(), m)); }
      const V = {}, t0 = performance.now(); const started = gfxPrelink(V, rr, sc, cam), call = performance.now() - t0; let done = false; while (!done && performance.now() - t0 < 20000){ done = gfxPrelinkDone(V); if (!done) await new Promise(r=>setTimeout(r, 10)); }
      out.compile = { started, call:+call.toFixed(0), done, progs:rr.info.programs.length }; rr.dispose(); }
    // an instanced mesh whose instances stand far from its geometry's own sphere is culled by that sphere, as in r149
    { const im = new T.InstancedMesh(new T.BoxGeometry(), new T.MeshBasicMaterial(), 2), M = new T.Matrix4(); M.makeTranslation(500, 0, 0); im.setMatrixAt(0, M); im.setMatrixAt(1, M); im.updateMatrixWorld(true);
      const cam = new T.PerspectiveCamera(50, 1, 0.1, 100); cam.position.set(0, 0, 10); cam.lookAt(0, 0, 0); cam.updateMatrixWorld(); const F = new T.Frustum().setFromProjectionMatrix(new T.Matrix4().multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse));
      out.instCull = F.intersectsObject(im); }
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.rev==='159' && r.setup && r.cm===false, 'three r159, its colour management off');
  A(r.legacy.length >= 1 && r.legacy.every(v=>v===true), 'every renderer on the old light units');
  A(!r.oldNames, 'no shader still hooks the old chunk names');
  A(r.hooks.tried===0 || r.hooks.hooked===r.hooks.tried, 'the custom shaders hook the new chunks: ' + JSON.stringify(r.hooks));
  A(r.compile.started && r.compile.call < 100 && r.compile.done, 'the shaders start at once and say when they are ready: ' + JSON.stringify(r.compile));
  A(r.instCull===true, 'an instanced mesh is culled by its own geometry\'s sphere, as before');
};
