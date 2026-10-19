// RS-551: cloud shadows that drift on the wind and fall on everything. One shared shadow term (GFX_CLOUD_GLSL) in the ground, the
// water, the roads and the swaying growth - a tree stood lit in the middle of a cloud's shadow before; the clouds drift where the
// wind blows (gfxCloudDrift), faster in a storm, instead of sliding one fixed way; denser and darker in rain and storm
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{ const out = {}; goToCharCreate(); ccBegin(); wgRegenerate(12345); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); o3Pref = true; G.gameMode = 0; weatherSync = ()=>{};
    G.owPos = { x:24, y:54 }; G.player.clock = G.player.turnCount = DAY_LENGTH/2; G.weather = 'clear'; O3.win = null; O3.ppos = null;
    for (let i=0;i<12;i++){ renderGame(); await new Promise(r=>setTimeout(r, 40)); }
    const has = m=>{ const sh = { uniforms:{}, vertexShader:'void main(){\n#include <begin_vertex>\n#include <project_vertex>\n}', fragmentShader:'void main(){\n#include <map_fragment>\n#include <color_fragment>\n#include <output_fragment>\n}' }; m.onBeforeCompile(sh); return /cshade/.test(sh.fragmentShader) && !!sh.uniforms.uCloudOff && !!sh.uniforms.uCloudK; };
    out.land = has(O3.land.material); out.water = has(O3.water.material);
    let road = null, leaf = null, grass = null; O3.scene.traverse(o=>{ if (!o.isMesh) return; for (const mm of [].concat(o.material)){ if (!mm || !mm.customProgramCacheKey) continue; const k = mm.customProgramCacheKey(); if (k==='gfxroadc') road = mm; else if (/^gfxsway0\.05/.test(k)) leaf = mm; else if (/^gfxsway0\.35/.test(k)) grass = mm; } });
    out.road = !!road && has(road); out.leaf = !!leaf && has(leaf); out.grass = !!grass && has(grass);
    /* the drift: with the wind, and faster in a storm */
    const U = GFX.u, o0 = U.uCloudOff.value.clone(); for (let i=0;i<10;i++){ renderGame(); await new Promise(r=>setTimeout(r, 30)); } const o1 = U.uCloudOff.value.clone(); out.calm = +o1.distanceTo(o0).toFixed(5);
    G.weather = 'storm'; for (let i=0;i<10;i++){ renderGame(); await new Promise(r=>setTimeout(r, 30)); } const o2 = U.uCloudOff.value.clone(); out.storm = +o2.distanceTo(o1).toFixed(5);
    out.ampStorm = +U.uCloudAmt.value.toFixed(3); out.kStorm = U.uCloudK.value; G.weather = 'clear'; renderGame(); out.ampClear = +U.uCloudAmt.value.toFixed(3); out.kClear = U.uCloudK.value;
    const w = m3dClothWind(U.uT.value), d = o2.clone().sub(o1).normalize(); out.withWind = +((w[0]*d.x + w[1]*d.y)/Math.hypot(w[0], w[1])).toFixed(3);
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.land && r.water && r.road, 'the clouds shade the ground, the water and the roads');
  A(r.leaf && r.grass, 'and the leaves and the grass');
  A(r.calm > 0 && r.storm > r.calm*1.8, 'the clouds drift, faster in a storm: ' + r.calm + ' / ' + r.storm);
  A(r.withWind > 0.9, 'they drift with the wind');
  A(r.ampStorm > r.ampClear && r.kStorm > r.kClear, 'denser and darker cover in a storm');
};
