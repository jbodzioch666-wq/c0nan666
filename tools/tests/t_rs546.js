// RS-546: you wear what you wear and nothing else - out of armour, underclothes in the world as in the creator (no default
// shirt, race costume, cloak, hat, boots or trousers), and the shirt and trouser pickers are gone; the robe is one garment -
// its skirt in the same cloth as its bodice (the weave as fine, the shade the same) with a cord between, not a broad band -
// and its bodice drapes over a heavy body instead of clinging to every roll
module.exports = async page=>{
  const r = await page.evaluate(()=>{ M3D_SKIN = false; if (M3D.tpl) M3D.tpl.clear(); goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); const out = {};
    for (const sl of Object.keys(G.gear)) G.gear[sl] = newItem();
    const o0 = rsPlayerLook().o; out.bare = { outfit:o0.outfit, under:!!o0.under, cape:!!o0.cape, legs:o0.legWear, feet:o0.feet, hat:!!(o0.gnomeHat || o0.leafCap || o0.circlet) };
    G.gear.chest = rsMakeArmour('cloth', 1, 'chest'); const o1 = rsPlayerLook().o; out.robed = { outfit:o1.outfit, cape:!!o1.cape };
    out.rows = LOOK_PARTS ? LOOK_PARTS.filter(w=>w.k==='shirt' || w.k==='trousers').map(w=>w.opts('Human')) : null;
    const robe = bd=>{ const L = Object.assign(lookDefault('Human'), { body:1 }); L.bd = Object.assign(lookBodyDefault(L), bd); const pt = rsPlayerLook({ race:'Human', look:L, bare:true }); pt.o.outfit = 'robe'; pt.o.cloth = '#3040a0'; pt.o.legWear = null; pt.o.cape = null;
      const root = m3dBuilders().get(pt.paint)(pt.o), rig = M3D.meta.get(root).rig; return rig; };
    { const rig = robe({}), sk = rig.skirt.material, bo = rig.chestMesh.material; out.cloth = { rep:sk.map ? sk.map.repeat.toArray() : null, skC:sk.color.getHexString(), boC:bo.color.getHexString() };
      let cord = 0; rig.torsoIn.traverse(c=>{ if (c.name==='robeCord') cord++; }); out.cord = cord; }   /* (RS-548: a cord round the waist, over the robe's one cloth) */
    { const rig = robe({ frame:0.8, fat:0.8, hips:0.9 }), p = rig.chestMesh.geometry.attributes.position; const w = y=>{ let x = 0; for (let i=0;i<p.count;i++) if (Math.abs(p.getY(i) - y) < 0.005) x = Math.max(x, Math.abs(p.getX(i))); return x; };
      out.drape = { hem:+(m3dRingAt([rig.chestMesh, rig.pelvisMesh], 0.014, 0.008) || { x:0 }).x.toFixed(4), belly:+w(0.07).toFixed(4) }; }
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.bare.outfit === 'none' && r.bare.under && !r.bare.cape && r.bare.legs === 'skin' && r.bare.feet === 'bare' && !r.bare.hat, 'out of armour in the world: underclothes, bare legs and feet, no cloak or hat');
  A(r.robed.outfit === 'robe', 'a robe when you wear one');
  A(r.rows && r.rows.every(x=>x === null), 'no shirt or trouser pickers');
  A(r.cloth.rep && r.cloth.rep[0] > 5 && r.cloth.rep[1] > 4, 'the skirt\'s weave as fine as the bodice\'s');
  A(r.cloth.skC !== r.cloth.boC, 'and its shade matched to the bodice\'s shading');
  A(r.cord === 1, 'a cord round the robe, not a broad band');
  A(r.drape.hem >= r.drape.belly - 0.004, 'a heavy body\'s robe drapes to its hem - no roll standing out above it: '+JSON.stringify(r.drape));
};
