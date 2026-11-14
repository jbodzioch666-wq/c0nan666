// RS-475: cloth armour finer each tier, like metal: the wizard's hat gains a band, then a glowing gem, then a gold band and stars, and at
// the top a moon and a tip crooked back; the hem runes shine at the top tiers; and a tome's cover is inlaid with your chosen emblem
module.exports = async page=>{
  const r = await page.evaluate(()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    const T = THREE, out = { tiers:[] }, tris = o=>{ let n = 0; o.traverse(x=>{ if (x.isMesh && x.geometry) n += (x.geometry.index ? x.geometry.index.count : x.geometry.attributes.position.count)/3; }); return Math.round(n); };
    for (let t=0;t<5;t++){ for (const s of ['head','chest','legs','offhand']) G.gear[s] = rsMakeArmour('cloth', t, s); rsSync && rsSync(); const L = rsPlayerLook(), e = m3dInstance({}, L);
      let glow = 0, inlay = 0, gem = 0; e.root.traverse(o=>{ if (o.name==='runeGlow') glow++; if (o.isMesh && o.material && o.material.map && o.material.alphaTest===0.25) inlay++; if (o.isMesh && o.material && o.material.emissiveIntensity===1.4) gem++; });
      out.tiers.push({ hatTier:L.o.hatTier, all:tris(e.holder), gem, glow, inlay, tomeEm:L.o.tomeEm || null }); }
    skGainXP('defence', 2e5); emblemPick('vampire'); rsSync && rsSync(); out.chosen = rsPlayerLook().o.tomeEm; emblemPick('plain'); out.plain = rsPlayerLook().o.tomeEm || null;
    G.gear.head = Object.assign(rsMakeArmour('cloth', 0, 'head'), { nm:'Visage of the Sage' }); rsSync && rsSync(); out.sage = !!rsPlayerLook().o.sageHat;
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  const t = r.tiers;
  A(t.every((x, i)=>x.hatTier===i), 'each hat knows its tier');
  for (let i=1;i<5;i++) A(t[i].all > t[i-1].all, 'finer each tier, tier '+i);
  A(!t[0].gem && !t[1].gem && t[2].gem && t[4].gem, 'a glowing gem on the hat from tier 2');
  A(t[0].glow===0 && t[2].glow===0 && t[3].glow===1 && t[4].glow===1, 'the hem runes shine from tier 3');
  A(!t[0].tomeEm && t[3].tomeEm==='star' && t[3].inlay >= 2, 'a fine tome has a star inlaid, on both covers');
  A(r.chosen==='vampire' && r.plain===null, 'your chosen emblem goes on the tome; plain leaves it bare');
  A(r.sage, "the Visage of the Sage keeps its own hat");
};
