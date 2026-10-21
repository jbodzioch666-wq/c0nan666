// RS-547: a robe goes down over the hips as they are before it flares - on a slim body (a dancer dragonborn) it stood out in
// front below the belt like a pot belly; its waist meets the bodice front and back; a robe has no pinched waist (a wood elf's
// stood on a stalk); a pot belly under cloth is the garment's own shade; dreadlocks are ropes of three strands, clear of the
// face; and a mohawk's crest ends at the crown's back instead of lying flat down the head
module.exports = async page=>{
  const r = await page.evaluate(()=>{ M3D_SKIN = false; if (M3D.tpl) M3D.tpl.clear(); goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); const out = {};
    const robe = (race, fem, bd)=>{ const L = Object.assign(lookDefault(race), { body:fem }); L.bd = Object.assign(lookBodyDefault(L), bd || {}); const pt = rsPlayerLook({ race, look:L, bare:true }); pt.o.outfit = 'robe'; pt.o.cloth = '#3040a0'; pt.o.legWear = null; pt.o.cape = null;
      return M3D.meta.get(m3dBuilders().get(pt.paint)(pt.o)).rig; };
    /* the skirt's front, just below the belt, against the bodice's front at the belt */
    const front = (rig, y)=>{ const sk = rig.skirt, p = sk.geometry.attributes.position; let z = -1; for (let i=0;i<p.count;i++){ const yy = p.getY(i)*sk.scale.y + sk.position.y; if (Math.abs(yy - y) < 0.012 && Math.abs(p.getX(i)) < 0.012) z = Math.max(z, p.getZ(i)*sk.scale.z); } return z; };
    { const rig = robe('Dragonborn', 1, { frame:0.3, fat:0.15, muscle:0.45, waist:0.2, hips:0.55, legs:0.7, neck:0.7 }), rg = m3dRingAt([rig.chestMesh, rig.pelvisMesh], 0.014, 0.01);
      out.dancer = { bodice:+rg.zf.toFixed(4), below:+front(rig, -0.03).toFixed(4), lower:+front(rig, -0.12).toFixed(4) }; }
    { const rig = robe('Wood Elf', 1), p = rig.chestMesh.geometry.attributes.position; const w = y=>{ let x = 0; for (let i=0;i<p.count;i++) if (Math.abs(p.getY(i) - y) < 0.006) x = Math.max(x, Math.abs(p.getX(i))); return x; };
      out.elf = { waist:+w(0.11).toFixed(4), hem:+w(0.03).toFixed(4) }; }
    { const rig = robe('Gnome', 1); let pb = null; rig.torso.traverse(o=>{ if (o.isMesh && o.geometry.type==='SphereGeometry' && Math.abs(o.position.y - 0.1) < 0.001) pb = o; }); out.belly = pb ? { tint:pb.material.color.getHexString(), plain:rig.chestMesh.material.color.getHexString(), robe:rig.skirt && rig.chestMesh.material===rig.skirt.material } : null; }
    const head = hair=>{ const L = Object.assign(lookDefault('Human'), { body:0, beard:0, hair }), pt = rsPlayerLook({ race:'Human', look:L, bare:true }); return M3D.meta.get(m3dBuilders().get(pt.paint)(pt.o)).rig.head; };
    { const p = head(7).getObjectByName('hair').geometry.attributes.position; let face = 0; for (let i=0;i<p.count;i++) if (p.getZ(i) > 0.05 && Math.abs(p.getX(i)) < 0.035 && p.getY(i) < 0.11 && p.getY(i) > 0.02) face++; out.dreadsFace = face; }
    { const p = head(5).getObjectByName('hair').geometry.attributes.position; let low = 1; for (let i=0;i<p.count;i++) if (p.getZ(i) < -0.04) low = Math.min(low, p.getY(i)); out.crestLow = +low.toFixed(3); }
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.dancer.below < r.dancer.bodice + 0.012, 'a slim robe falls from the belt - no bulge in front below it');
  A(r.dancer.lower >= r.dancer.below - 0.002, 'and widens toward the hem from there');
  A(r.elf.waist >= r.elf.hem - 0.012, 'a robe has no pinched waist');
  A(r.belly && (r.belly.tint !== r.belly.plain || r.belly.robe), 'a pot belly under cloth takes the garment shade (RS-606: the bodice is the robe cloth now)');
  A(r.dreadsFace === 0, 'dreadlocks hang clear of the face');
  A(r.crestLow > 0.07, 'the mohawk ends at the back of the crown, not lying down the head');
};
