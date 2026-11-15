// RS-430: a rune robe's hem runes are stitched into the skirt - a gold layer sharing the skirt's own shape, so they sway with it - not
// little glowing blocks round the hips that the skirt swung away from (they hung under the hem as yellow dots)
module.exports = async page=>{
  const r = await page.evaluate(()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); const out = {};
    for (const [nm, top, legs] of [['infinity both', 3, 3], ['mystic both', 2, 2], ['infinity bottom', null, 3]]){
      G.gear.chest = top===null ? newItem() : rsMakeArmour('cloth', top, 'chest'); G.gear.legs = rsMakeArmour('cloth', legs, 'legs'); rsSync && rsSync();
      const e = m3dInstance({}, rsPlayerLook()), r = e.rig; for (let i=0;i<4;i++) m3dPoseHumanoid(r, 0.4 + i*0.1, 1, 0, 0, 0, e);
      const ov = r.skirt && r.skirt.children.find(c=>c.name==='runeHem');
      let blocks = 0; r.hips.traverse(o=>{ if (o.isMesh && o.geometry && o.geometry.type==='BoxGeometry' && o.position.y < -0.3 && o.material && o.material.emissive && o.material.emissiveIntensity > 0.5) blocks++; });
      out[nm] = { runes:!!(rsPlayerLook().o.robeRunes), overlay:!!ov, follows:!!(ov && ov.geometry===r.skirt.geometry), blocks }; }
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  for (const k of Object.keys(r)){ if (!r[k].runes) continue; A(r[k].overlay && r[k].follows, k + ': the hem runes are a layer on the skirt that moves with it');
    A(r[k].blocks===0, k + ': no loose glowing blocks round the hem'); }
  A(r['infinity both'].runes, 'infinity robes have runes');
};
