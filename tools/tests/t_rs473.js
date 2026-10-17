// RS-473: the vampire skull - a fanged skull on a crimson collar in a silver occult ring - a reward emblem for shields and capes once you
// can wear dragon armour (Defence 60), painted on the shield's face and on the cape's back
module.exports = async page=>{
  const r = await page.evaluate(()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    const p = G.player, out = {};
    while (rsLvl('defence') < 59) skGainXP('defence', 1000); out.at59 = [rsLvl('defence'), emblemKnown('vampire')]; emblemPick('vampire'); out.pick59 = p.emblem || null;
    while (rsLvl('defence') < 60) skGainXP('defence', 1000); out.at60 = emblemKnown('vampire'); emblemPick('vampire'); out.pick60 = p.emblem;
    G.gear.offhand = rsMakeArmour('metal', 4, 'tower'); G.gear.cape = rsMakeCape(130, 'Legends Cape'); rsSync && rsSync(); const L = rsPlayerLook();
    out.shieldEm = L.o.shield.em; out.capeEm = L.o.capeEm;
    const e = m3dInstance({}, L); let decal = 0; e.rig.shield.traverse(o=>{ if (o.isMesh && o.material && o.material.map && o.material.transparent) decal++; }); out.decal = decal;
    setUi('dyeworks'); out.picker = /emblemPick\('vampire'\)/.test(document.body.innerHTML); setUi('playing');
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.at59[1]===false && r.pick59===null, 'locked below Defence 60');
  A(r.at60 && r.pick60==='vampire', 'yours at Defence 60');
  A(r.shieldEm==='vampire' && r.decal >= 1, 'painted on the shield');
  A(r.capeEm==='vampire', 'and on the cape');
  A(r.picker, 'offered at the dye works');
};
