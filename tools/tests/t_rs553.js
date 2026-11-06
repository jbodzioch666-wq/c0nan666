// RS-553: the wind on the plants. The sway shader takes the wind as it blows (uWindV: direction, and strength with the gusts, from
// m3dClothWind - the same wind as the cloaks, clouds and fallen leaves): each plant leans downwind by the gust, with waves rolling
// across the grass in the wind's direction. Every plant used to swing on a fixed rhythm of its own, in no direction
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{ const out = {}; goToCharCreate(); ccBegin(); wgRegenerate(12345); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); o3Pref = true; G.gameMode = 0; weatherSync = ()=>{};
    G.owPos = { x:24, y:54 }; G.player.clock = G.player.turnCount = DAY_LENGTH/2; G.weather = 'clear'; O3.win = null; O3.ppos = null;
    for (let i=0;i<12;i++){ renderGame(); await new Promise(r=>setTimeout(r, 40)); }
    let grass = null, leaf = null; O3.scene.traverse(o=>{ if (!o.isMesh) return; for (const mm of [].concat(o.material)){ if (!mm || !mm.customProgramCacheKey) continue; const k = mm.customProgramCacheKey(); if (/^gfxsway0\.35/.test(k)) grass = mm; else if (/^gfxsway0\.05/.test(k)) leaf = mm; } });
    const has = m=>{ const sh = { uniforms:{}, vertexShader:'void main(){\n#include <begin_vertex>\n#include <project_vertex>\n}', fragmentShader:'void main(){\n#include <color_fragment>\n}' }; m.onBeforeCompile(sh); return /uWindV\.xy\*lean/.test(sh.vertexShader) && sh.uniforms.uWindV===GFX.u.uWindV && /along/.test(sh.vertexShader); };
    out.grass = !!grass && has(grass); out.leaf = !!leaf && has(leaf);
    const U = GFX.u; let calmK = 0, stormK = 0; for (let i=0;i<60;i++){ renderGame(); await new Promise(r=>setTimeout(r, 16)); calmK = Math.max(calmK, U.uWindV.value.z); } const w = m3dClothWind(U.uT.value), v = U.uWindV.value, s = Math.hypot(w[0], w[1]);
    out.dir = +((w[0]*v.x + w[1]*v.y)/s).toFixed(3); out.calmK = +calmK.toFixed(3);
    G.weather = 'storm'; for (let i=0;i<150;i++){ renderGame(); await new Promise(r=>setTimeout(r, 16)); stormK = Math.max(stormK, U.uWindV.value.z); } out.stormK = +stormK.toFixed(3); G.weather = 'clear';   /* (the peak of the gusts in each, not one moment that may be a lull) */
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.grass && r.leaf, 'the grass and the leaves take the wind');
  A(r.dir > 0.95, 'the plants lean the way the wind blows');
  A(r.stormK > r.calmK*2, 'a storm bends them further: ' + r.calmK + ' / ' + r.stormK);
};
