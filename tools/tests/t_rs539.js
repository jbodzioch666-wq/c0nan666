// RS-539: hair, finished. The scalp under the cards follows the hairline and lies beneath them (it was a dome above them: a flat
// fringe on the brow, a bare crown); long hair parts and is combed aside to the temples, goes over the ears, and falls from
// the head's widest point; swept hair keeps its back half; a ponytail is combed back to its tie (no fringe); long hair and a
// ponytail fall from under a helmet (but not a great helm or a hood); and a figure in the world keeps the hair's shine
module.exports = async page=>{
  const r = await page.evaluate(()=>{ M3D_SKIN = false; if (M3D.tpl) M3D.tpl.clear(); goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); const out = {};
    const build = (lk, helm)=>{ const L = Object.assign(lookDefault('Human'), { body:0, beard:0 }, lk), pt = rsPlayerLook({ race:'Human', look:L, bare:true }); if (helm) pt.o.helm = helm; const root = m3dBuilders().get(pt.paint)(pt.o); return { pt, head:M3D.meta.get(root).rig.head }; };
    const verts = m=>{ const a = [], p = m.geometry.attributes.position; for (let i=0;i<p.count;i++) a.push([p.getX(i), p.getY(i), p.getZ(i)]); return a; };
    const nr = q=>Math.hypot(q[0]/0.064, (q[1] - 0.088)/0.072, (q[2] + 0.008)/0.076);
    { const { head } = build({ hair:2 }), hair = head.getObjectByName('hair'), sc = head.getObjectByName('scalp'), V = verts(hair);
      out.scalpUnder = !!sc && sc.scale.y < 0.072*1.04;
      out.topOut = Math.min(...V.filter(q=>q[1] > 0.12).map(nr));
      out.fringe = V.filter(q=>Math.abs(q[0]) < 0.02 && q[2] > 0.03 && q[1] < 0.112 && q[1] > 0.06).length;
      out.ears = Math.min(...V.filter(q=>q[1] > 0.06 && q[1] < 0.09 && Math.abs(q[0]) > 0.055 && Math.abs(q[2] + 0.008) < 0.02).map(q=>Math.hypot(q[0]/0.064, (q[2] + 0.008)/0.076)));
      out.longDown = Math.min(...V.map(q=>q[1])); }
    { const { head } = build({ hair:9 }), V = verts(head.getObjectByName('hair')); out.sweptBack = V.filter(q=>q[2] < -0.04).length; }
    { const { head } = build({ hair:3 }), V = verts(head.getObjectByName('hair')); out.tailFringe = V.filter(q=>q[2] > 0.03 && q[1] < 0.112 && q[1] > 0.04).length; out.tailTie = !!head.getObjectByName('hairTail'); }
    for (const hm of ['kettle', 'great', 'cowl']){ const { head } = build({ hair:2 }, hm), h = head.getObjectByName('hair'); out['helm_' + hm] = h ? Math.min(...verts(h).map(q=>q[1])) : null; }
    { const { head } = build({ hair:3 }, 'horned'); out.helmTail = !!head.getObjectByName('hairTail'); }
    /* a figure in the world: its own copy of the materials, the hair shader with them */
    M3D_SKIN = true; if (M3D.tpl) M3D.tpl.clear();
    { const L = Object.assign(lookDefault('Human'), { body:0, hair:2 }), pt = rsPlayerLook({ race:'Human', look:L, bare:true }), e = m3dInstance({}, pt); let mat = null; e.root.traverse(o=>{ if (o.name==='hair') mat = o.material; });
      const sh = { uniforms:{}, vertexShader:'void main(){\n#include <begin_vertex>\n}', fragmentShader:'void main(){\n#include <output_fragment>\n}' }; if (mat) mat.onBeforeCompile.call(mat, sh, null); out.instShine = !!mat && /hairTan/.test(sh.vertexShader) && /pow\(sqrt/.test(sh.fragmentShader); }
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.scalpUnder, 'the scalp lies close to the head');
  A(r.topOut > 1.03, 'the cards lie over the scalp, not under it');
  A(r.fringe === 0, 'long hair parts: no fringe over the brow');
  A(r.ears > 1.12, 'long hair goes over the ears');
  A(r.longDown < -0.03, 'long hair falls to the shoulders');
  A(r.sweptBack > 200, 'swept hair covers the back of the head');
  A(r.tailFringe === 0 && r.tailTie, 'a ponytail is combed back to its tie');
  A(r.helm_kettle !== null && r.helm_kettle < -0.03, 'long hair falls from under a kettle hat');
  A(r.helm_great === null && r.helm_cowl === null, 'none under a great helm or a hood');
  A(r.helmTail, 'a ponytail under a helmet');
  A(r.instShine, 'a figure in the world keeps the hair shader');
};
