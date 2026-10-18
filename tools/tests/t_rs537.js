// RS-537: hair as modern games draw it - cards (ribbons) laid in combed rows from the crown, each a clump of fine strands cut out by
// alpha, drawn twice (a solid core and a soft see-through fringe), with a shine that runs across the strands (Kajiya-Kay); beards
// and moustaches the same. The cards carry the strand texture, a tangent along the hair for the shine, and don't cast hard shadows
module.exports = async page=>{
  const r = await page.evaluate(()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); const out = {};
    for (const [nm, lk] of [['crop', { hair:1, beard:3 }], ['long', { hair:2, beard:0 }], ['swept', { hair:9, beard:0 }], ['tail', { hair:3, beard:0 }]]){
      const L = Object.assign(lookDefault('Human'), { body:0 }, lk), pt = rsPlayerLook({ race:'Human', look:L, bare:true }), root = m3dBuilders().get(pt.paint)(pt.o), head = M3D.meta.get(root).rig.head;
      const hair = head.getObjectByName('hair'), soft = hair && hair.getObjectByName('hairSoft'), beard = head.getObjectByName('beard');
      const g = hair && hair.geometry, mat = hair && hair.material;
      out[nm] = { cards:!!g && !!g.attributes.hairTan && !!g.attributes.uv, verts:g ? g.attributes.position.count : 0, alpha:mat && mat.alphaTest >= 0.4 && !!mat.map, soft:!!(soft && soft.material.transparent && !soft.material.depthWrite && soft.geometry===g),
        shadow:hair ? hair.castShadow : null, beard:!!(beard && beard.geometry.attributes.hairTan), tail:!!head.getObjectByName('hairTail') };
      /* a compiled card shader has the shine */
      if (mat && nm==='crop'){ const sh = { uniforms:{}, vertexShader:'void main(){\n#include <begin_vertex>\n}', fragmentShader:'void main(){\n#include <output_fragment>\n}' }; mat.onBeforeCompile(sh); out.shine = /hairTan/.test(sh.vertexShader) && /pow\(sqrt/.test(sh.fragmentShader); } }
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  for (const k of ['crop', 'long', 'swept', 'tail']) A(r[k].cards && r[k].alpha && r[k].soft && r[k].shadow===false && r[k].verts > 600, k + ': hair cards, cut out by alpha, a soft pass over them, no hard shadow');
  A(r.crop.beard, 'the beard is cards too');
  A(r.tail.tail, 'a ponytail\'s tail is cards');
  A(r.shine, 'the cards shine across the strands');
};
