// RS-174: a robe top is a tunic (no skirt of its own), a robe bottom is a long skirt (not trousers), and the robe bottom's
// icon is a skirt
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing');
    const out = {};
    const top = Object.assign(rsMakeArmour('cloth', 1, 'chest'), { used:true }), bot = Object.assign(rsMakeArmour('cloth', 1, 'legs'), { used:true }), plateL = Object.assign(rsMakeArmour('metal', 1, 'legs'), { used:true });
    const skirts = (chest, legs)=>{ G.gear.chest = chest || newItem(); G.gear.legs = legs || newItem(); const e = m3dInstance({}, rsPlayerLook()); const hs = []; e.rig.hips.children.forEach(o=>{ if (o.isMesh && o.geometry.type==='CylinderGeometry') hs.push(+o.geometry.parameters.height.toFixed(2)); }); return hs.sort(); };
    out.topOverPlate = skirts(top, plateL); out.bottomAlone = skirts(null, bot); out.both = skirts(top, bot); out.plateOnly = skirts(null, plateL);
    G.gear.chest = newItem(); G.gear.legs = newItem();
    // the icon: a skirt fills the middle, where a pair of trousers has a gap between the legs
    out.kind = { robe:obItemEntry(bot).o ? obItemEntry(bot).o.kind : null, plate:obItemEntry(plateL).o ? obItemEntry(plateL).o.kind : null };
    const mid = it=>{ const img = fpUndeadSprite(obItemEntry(it), false).img, x = img.getContext('2d'), W = img.width, H = img.height; const d = x.getImageData(Math.floor(W/2) - 1, Math.floor(H*0.62), 3, Math.floor(H*0.2)).data; let a = 0; for (let i=3;i<d.length;i+=4) a += d[i] > 40 ? 1 : 0; return a/(d.length/4); };
    out.iconMid = { robe:+mid(bot).toFixed(2), plate:+mid(plateL).toFixed(2) };
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(!r.topOverPlate.includes(0.48), 'a robe top over plate legs has no long skirt of its own');
  A(r.bottomAlone.includes(0.48), 'a robe bottom is a long skirt, even with no top');
  A(r.both.includes(0.48) && r.both.some(h=>h < 0.3), 'top and bottom together: the long skirt with the tunic hem over it');
  A(!r.plateOnly.includes(0.48), 'plate legs are still legs');
  A(r.kind.robe==='robelegs' && r.kind.plate==='legs', 'the robe bottom has its own icon');
  A(r.iconMid.robe > 0.8 && r.iconMid.plate < 0.3, 'the robe bottom icon is a skirt, not two trouser legs');
};
