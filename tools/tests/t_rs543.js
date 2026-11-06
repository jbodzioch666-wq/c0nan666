// RS-543: every hairstyle is hair cards - braids plaited from three strands, dreadlocks twisted ropes, curls coiled loops, a
// mohawk a standing crest over a shaved head, a topknot combed up to a wound bun - with none of the old tubes, cylinders, cones
// and balls of hair; braids and dreadlocks still fall from under a helmet; swept hair ends softly at the nape
module.exports = async page=>{
  const r = await page.evaluate(()=>{ M3D_SKIN = false; if (M3D.tpl) M3D.tpl.clear(); goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); const out = {};
    const build = (hair, helm)=>{ const L = Object.assign(lookDefault('Human'), { body:0, beard:0, hair }), pt = rsPlayerLook({ race:'Human', look:L, bare:true }); if (helm) pt.o.helm = helm; const root = m3dBuilders().get(pt.paint)(pt.o); return M3D.meta.get(root).rig.head; };
    const info = h=>{ let cards = 0, old = 0, scalpW = 0; h.traverse(o=>{ if (!o.isMesh) return; const g = o.geometry, k = o.material && o.material.userData.kind;
        if (g.attributes.hairTan && !/Soft$/.test(o.name)) cards += g.attributes.position.count;
        if (k==='hair' && /Tube|Cylinder|Cone/.test(g.type)) old++;
        if (o.name==='scalp'){ const p = g.attributes.position; for (let i=0;i<p.count;i++) if (p.getY(i) > 0.3 && Math.hypot(p.getX(i), p.getY(i), p.getZ(i)) > 0.99) scalpW = Math.max(scalpW, Math.abs(p.getX(i))); } });
      return { cards, old, scalpW:+scalpW.toFixed(2), bun:!!h.getObjectByName('hairTail') }; };
    for (const [nm, i] of [['braids', 4], ['mohawk', 5], ['topknot', 6], ['dreads', 7], ['curly', 8], ['swept', 9]]) out[nm] = info(build(i));
    out.braidsHelm = info(build(4, 'kettle')); out.dreadsHelm = info(build(7, 'horned'));
    { const h = build(9), p = h.getObjectByName('hair').geometry.attributes.position; let low = 1; for (let i=0;i<p.count;i++) if (p.getZ(i) < -0.05) low = Math.min(low, p.getY(i)); out.sweptNape = low; }
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  for (const k of ['braids', 'mohawk', 'topknot', 'dreads', 'curly']) A(r[k].cards > (k==='mohawk' ? 800 : 1500) && r[k].old === 0, k + ': hair cards, none of the old shapes');
  A(r.mohawk.scalpW < 0.35, 'a mohawk grows from a strip, the sides shaved');
  A(r.topknot.bun, 'a topknot has its bun');
  A(r.curly.cards > 4000, 'curls all over');
  A(r.braidsHelm.cards > 500 && r.dreadsHelm.cards > 1000, 'braids and dreadlocks fall from under a helmet');
  A(r.sweptNape < 0.05, 'swept hair ends softly at the nape');
};
