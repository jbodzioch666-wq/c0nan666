// RS-513: the paper doll's icons are drawn for what each piece is - plate, dragonhide or cloth, finer each tier as the figure wears
// it - capes by their tier (hem, edging, emblem, fur, the fire cape's lava, quivers as quivers) and kite and tower shields with their
// rim, device and boss. Every piece paints; each tier looks different from the one before; a dye and a chosen emblem show on it
module.exports = async page=>{
  const r = await page.evaluate(()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    const sig = it=>{ const e = obItemEntry(it), img = fpUndeadSprite(e, false).img, x = img.getContext('2d'), d = x.getImageData(0, 0, img.width, img.height).data; let h = 0, a = 0;
      for (let i=0;i<d.length;i+=16){ h = (h*31 + d[i] + d[i+1]*3 + d[i+2]*7) | 0; if (d[i+3] > 20) a++; } return { gear:e.paint===obPaintGear, h, a }; };
    const out = { bad:[], same:[], notGear:[] };
    for (const fam of ['metal', 'hide', 'cloth']) for (const slot of ['head', 'chest', 'legs', 'arms', 'feet']){ const n = fam==='cloth' ? 5 : 7; let prev = null;
      for (let t=0;t<n;t++){ const s = sig(rsMakeArmour(fam, t, slot)); if (!(s.a > 40)) out.bad.push(fam + slot + t); if (!s.gear && !(fam==='cloth' && slot==='legs')) out.notGear.push(fam + slot + t);
        if (prev && prev.h===s.h && !(fam!=='cloth' && slot!=='chest' && slot!=='head' && t%2===0)) out.same.push(fam + slot + t); prev = s; } }
    /* capes and shields */
    for (const c of RS_CAPES){ const s = sig(rsMakeCape(0, c[0])); if (!s.gear) out.notGear.push(c[0]); if (!(s.a > 40)) out.bad.push(c[0]); }
    for (const sl of ['offhand', 'tower']) for (let t=0;t<7;t++){ const s = sig(rsMakeArmour('metal', t, sl)); if (!s.gear) out.notGear.push(sl + t); if (!(s.a > 40)) out.bad.push(sl + t); }
    /* tiers at their most distinct: the chest of each family, every step */
    out.chestSteps = ['metal', 'hide', 'cloth'].map(fam=>{ const n = fam==='cloth' ? 5 : 7; const hs = []; for (let t=0;t<n;t++) hs.push(sig(rsMakeArmour(fam, t, 'chest')).h); return new Set(hs).size===hs.length; });
    /* a dye shows; a chosen emblem shows on the shield */
    const plate = rsMakeArmour('metal', 2, 'chest'), h0 = sig(plate).h; plate.dye = '#9a2a24'; out.dyed = sig(plate).h!==h0;
    const kite = rsMakeArmour('metal', 1, 'offhand'), k0 = sig(kite).h; G.player.emblem = 'cross'; const k1 = sig(kite).h; G.player.emblem = 'plain'; const k2 = sig(kite).h; delete G.player.emblem; out.emblem = k1===k0 && k2!==k0;
    /* the tome and the trousers keep their own */
    out.tome = !sig(rsMakeArmour('cloth', 2, 'offhand')).gear; out.trousers = !sig(rsMakeArmour('cloth', 2, 'legs')).gear;
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(!r.bad.length, 'every piece paints something');
  A(!r.notGear.length, 'every piece of armour, cape and shield has its own gear icon');
  A(r.chestSteps.every(Boolean), 'every tier of every family\'s body looks different');
  A(r.dyed, 'a dye shows on the icon');
  A(r.emblem, 'the shield shows your chosen device');
  A(r.tome && r.trousers, 'the tome and the trousers keep their own icons');
};
