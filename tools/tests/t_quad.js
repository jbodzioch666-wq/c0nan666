// RS-277: the four-legged beasts rebuilt in high detail on one sculpted builder - bears, the owlbear, boars, elk, great cats
// (panther, displacer beast, sphinx, manticore) and rats; each stands on four legs on the ground, opens its jaw to bite, and
// wears its kind's features (antlers, tusks, a mane, tentacles, wings); the wild deer, boar and rabbit of the open land and
// the town cat build too
module.exports = async page=>{
  const r = await page.evaluate(()=>{
    const out = {};
    for (const nm of ['bear','brown bear','dire bear','polar bear','owlbear','giant boar','giant elk','panther','displacer beast','sphinx','manticore','giant rat','giant mole']){
      const e = m3dInstance({ nm }, m3dPortrait({ nm })), rig = e.rig; e.anim(rig, 0.7, 0, 0, 0, 0, e); e.holder.updateMatrixWorld(true);
      const box = new THREE.Box3().setFromObject(e.holder), j0 = rig.jaw.rotation.x; e.anim(rig, 0.7, 0, 0, 1, 0, e); const bite = rig.jaw.rotation.x - j0;
      let verts = 0; e.holder.traverse(x=>{ if (x.isMesh) verts += x.geometry.attributes.position.count; });
      out[nm] = { quad:rig.quad, legs:rig.legs.length, verts, bite:+bite.toFixed(2), minY:+(box.min.y/(box.max.y - box.min.y)).toFixed(3), wings:(rig.wings||[]).length, tents:(rig.tents||[]).length };
    }
    for (const k of Object.keys(WG_WILD)) if (WG_WILD[k].o){ const e = m3dInstance({ nm:WG_WILD[k].nm }, { paint:mpBeast, o:WG_WILD[k].o, h:1 }); out['wild '+k] = !!(e.rig.legs && e.rig.legs.length===4 && e.rig.neck); }
    const cat = m3dInstance({}, MP(mpBeast, { head:'cat', fur:'#d08a40', tail:'cat', legs:'short', len:0.6 }, 1)); out.townCat = cat.rig.quad==='cat';
    return out; });
  const A = (c, m)=>{ if (!c) throw new Error(m+' :: '+JSON.stringify(r)); };
  for (const nm of ['bear','brown bear','dire bear','polar bear','owlbear','giant boar','giant elk','panther','displacer beast','sphinx','manticore','giant rat','giant mole']){ const d = r[nm];
    A(d.quad && d.legs===4 && d.verts > 25000, nm+': the high-detail beast');
    A(Math.abs(d.minY) < 0.03, nm+': on its feet');
    if (nm!=='giant elk') A(d.bite > 0.3, nm+': it opens its jaw to bite'); }
  A(r.manticore.wings===2 && r['displacer beast'].tents===2, "the manticore's wings and the displacer's tentacles");
  A(r['wild deer'] && r['wild boar'] && r['wild rabbit'] && r.townCat, 'the wild animals and the town cat build');
  console.log('quad ok', JSON.stringify(r));
};
