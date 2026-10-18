// RS-528: skin that isn't plastic - its shader carries light a little way in, so lit edges glow warm and the shadowed side is lifted
// ruddy; the faces of flesh (human, orc, goblin, hag) have a flush of warmth in the cheeks, nose, ears and lips, painted into the
// sculpt's colours without changing its shape; stone and other heads stay as they were
module.exports = async page=>{
  const r = await page.evaluate(()=>{ const out = { ver:M3D_SCULPT_VER };
    const mats = {}, skin = m3dMat(mats, '#c9a07c', 'skin', true), cloth = m3dMat(mats, '#c9a07c', 'cloth', true);
    const fake = ()=>({ uniforms:{}, fragmentShader:'void main(){\n#include <output_fragment>\n}', vertexShader:'' });
    const a = fake(), b = fake(); skin.onBeforeCompile(a); cloth.onBeforeCompile(b);
    out.skinSss = /sssF/.test(a.fragmentShader) && /indirectDiffuse/.test(a.fragmentShader); out.clothPlain = !/sssF/.test(b.fragmentShader);
    out.keys = [skin.customProgramCacheKey(), cloth.customProgramCacheKey()]; out.rough = skin.roughness;
    /* the flush: the cheeks redder than the brow, the shape the same as before it */
    const red = (g, c, rad)=>{ const p = g.attributes.position, col = g.attributes.color; let s = 0, n = 0; for (let i=0;i<p.count;i++){ if (Math.hypot(p.getX(i) - c[0], p.getY(i) - c[1], p.getZ(i) - c[2]) > rad) continue; s += col.getX(i)/(col.getY(i) + 1e-4); n++; } return n ? s/n : 0; };
    const hg = m3dHeadGeo('human', false); out.cheek = +red(hg, [0.04, 0.062, 0.068], 0.012).toFixed(3); out.brow = +red(hg, [0, 0.12, 0.07], 0.015).toFixed(3); out.lips = +red(hg, [0, 0.038, 0.08], 0.008).toFixed(3);
    const gg = m3dHeadGeo('golem', false); out.golem = +(red(gg, [0.04, 0.062, 0.068], 0.02) / Math.max(1e-3, red(gg, [0, 0.12, 0.07], 0.03))).toFixed(3);
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.ver >= 3, 'the sculpt cache turns over for the new colours');
  A(r.skinSss && r.clothPlain && r.keys[0]!==r.keys[1], 'skin has its own warm shader; cloth keeps the plain one');
  A(r.rough >= 0.6, 'skin is less glossy');
  A(r.cheek > r.brow*1.12 && r.lips > r.brow*1.12, 'the cheeks and lips are rosier than the brow');
  A(Math.abs(r.golem - 1) < 0.06, 'a golem\'s stone face has no flush');
};
