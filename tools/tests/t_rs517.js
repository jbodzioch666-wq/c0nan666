// RS-517: weapons, staves, bows and jewellery are drawn for what they are - every melee kind its own shape (a halberd no longer a
// spear), in its own metal, finer each tier (polish, gilding, a wired grip, a gem pommel, dragon's spine); bows by their wood and the
// famous ones their own; crossbows as crossbows; staves by grade with the orb in their element; darts, knives and chinchompas as
// themselves; every ring and amulet its own gem and setting
module.exports = async page=>{
  const r = await page.evaluate(()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing');
    const sig = it=>{ const e = obItemEntry(it), img = fpUndeadSprite(e, false).img, x = img.getContext('2d'), d = x.getImageData(0, 0, img.width, img.height).data; let h = 0, a = 0;
      for (let i=0;i<d.length;i+=16){ h = (h*31 + d[i] + d[i+1]*3 + d[i+2]*7) | 0; if (d[i+3] > 20) a++; } return { arms:e.paint===obPaintArms, h, a, k:e.o.k }; };
    const out = { notArms:[], bad:[], sameTier:[], sameKind:[] };
    const kinds = new Map();
    RS_WEAPONS.forEach((w, wi)=>{ const hs = []; for (let t=0;t<7;t++){ const s = sig(rsMakeWeapon(t, wi)); if (!s.arms) out.notArms.push(w[0] + t); if (!(s.a > 30)) out.bad.push(w[0] + t); hs.push(s.h); if (t===2) kinds.set(w[0], s.k); }
      if (new Set(hs).size!==hs.length) out.sameTier.push(w[0]); });
    out.kindsDistinct = new Set(kinds.values()).size===RS_WEAPONS.length;
    const each = (lbl, list)=>{ const hs = list.map(it=>{ const s = sig(it); if (!s.arms) out.notArms.push(lbl); if (!(s.a > 30)) out.bad.push(lbl); return s.h; }); if (new Set(hs).size!==hs.length) out.sameKind.push(lbl); };
    each('shortbows', [0,1,2,3,4,5].map(t=>rsMakeBow(t, false)));
    each('famous', ['dark', 'crystal', 'twisted', 'seercull'].map(rsMakeFamousBow));
    each('crossbows', [0,1,2,3,4,5,6].map(rsMakeCrossbow));
    each('staves', [rsMakeStaffOf(0, 'fire'), rsMakeStaffOf(1, 'fire'), rsMakeStaffOf(2, 'fire'), rsMakeStaffOf(3, 'fire'), rsMakeStaffOf(0, 'water'), rsMakeStaffOf(3, null)]);
    each('thrown', [rsMakeThrown('dart', 2), rsMakeThrown('knife', 2), rsMakeThrown('chin', 0)]);
    each('rings', RS_RINGS.map((j, i)=>rsMakeJewel('ring', i)));
    each('amulets', RS_AMULETS.map((j, i)=>rsMakeJewel('necklace', i)));
    out.halberdNotSpear = kinds.get('Halberd')!==kinds.get('Spear');
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(!r.bad.length && !r.notArms.length, 'every weapon, bow, staff, thrown weapon and jewel has its own icon, and paints');
  A(r.kindsDistinct && r.halberdNotSpear, 'every melee kind has its own shape');
  A(!r.sameTier.length, 'every metal of every weapon looks different');
  A(!r.sameKind.length, 'every bow, crossbow, staff grade, thrown kind, ring and amulet looks different');
};
