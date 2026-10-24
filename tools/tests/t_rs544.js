// RS-544: armour on the arms and the body's sides across builds - a hauberk has mail sleeves to the elbow (the arms were bare
// cloth); a jerkin's or hauberk's skirt is as wide as a heavy body's hips and thighs (they came through it); and the arms hang
// clear of a heavy body or wide hips (they sank into them)
module.exports = async page=>{
  const r = await page.evaluate(()=>{ M3D_SKIN = false; if (M3D.tpl) M3D.tpl.clear(); goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); const out = {};
    const fig = (bd, fem, outfit)=>{ const L = Object.assign(lookDefault('Human'), { body:fem, beard:0 }); L.bd = Object.assign(lookBodyDefault(L), bd); const pt = rsPlayerLook({ race:'Human', look:L, bare:true }); pt.o.outfit = outfit; pt.o.cape = null; const root = m3dBuilders().get(pt.paint)(pt.o); return M3D.meta.get(root).rig; };
    { const rig = fig({}, 0, 'chain'); out.sleeve = rig.arms[0].sh.children[0].children[0].material.userData.kind; }
    const half = (g, y)=>{ const p = g.attributes.position; let x = 0; for (let i=0;i<p.count;i++) if (Math.abs(p.getY(i) - y) < 0.006) x = Math.max(x, Math.abs(p.getX(i))); return x; };
    { const Bh = m3dBodySpec({ bulk:1.1, bodyFat:0.9, bodyMus:0.8, fem:true }), B0 = m3dBodySpec({ bulk:1.1, bodyFat:0.3, bodyMus:0.35, fem:true });
      out.skirt = +(half(m3dWearGeo(Bh, 'jerkin', 'bot'), -0.06)/half(m3dWearGeo(B0, 'jerkin', 'bot'), -0.06)).toFixed(3); }
    const zr = rig=>{ m3dPoseHumanoid(rig, 1, 0, 0, 0, 0, null); return [rig.arms[0].sh.rotation.z, rig.arms[1].sh.rotation.z]; };
    out.armsAvg = zr(fig({}, 1, 'leather')); out.armsHeavy = zr(fig({ frame:1, fat:0.9, muscle:0.9, hips:1 }, 1, 'leather'));
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.sleeve === 'chain', 'a hauberk has mail sleeves');
  A(r.skirt > 1.08, 'a jerkin\'s skirt is cut wider for a heavy body');
  A(r.armsHeavy[0] < r.armsAvg[0] - 0.15 && r.armsHeavy[1] > r.armsAvg[1] + 0.15, 'the arms hang clear of a heavy body');
};
