// RS-709: the Ancestral tier. From combat level 90 a magic or rare drop may be Ancestral (more often off a boss): item level 126, every
// bonus from the top tiers of its family, and each bonus a chance to be greater - half again its tier's roll, marked in the tooltip.
// The anvil keeps a greater bonus greater, Chaos rerolls an Ancestral piece as Ancestral, the loot filter never salvages one with a
// greater bonus, and the drop's label on the ground says Ancestral
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const r = await page.evaluate(()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    const out = {}, p = G.player, R = it=>it.aff.filter(a=>!a.imp);
    out.chance = [89, 90, 126].map(L=>+ancChance(L).toFixed(3)).concat([+ancChance(126, 2.5).toFixed(3)]);
    /* drops at 126: some Ancestral, all of their rolls from the top tiers, some greater; none below 90 */
    { let n = 0, anc = 0, rolls = 0, top = 0, gr = 0, inR = 0, ilvl = 0, low = 0;
      for (let i=0;i<3000;i++){ const it = genItem(126, lootKind(), 2); if (it.quality!==1 && it.quality!==2) continue; n++; if (!it.anc) continue; anc++; if (it.ilvl===CB_HI) ilvl++;
        for (const a of R(it)){ if (!a.fam) continue; const F = AFFIX_FAM[a.fam]; rolls++; if (a.t <= afTopTiers(F)) top++; if (a.g) gr++; const Rg = afRange(a, it); if (Rg && Rg.q >= 0 && Rg.q <= 1 && (Rg.dice || (a.f ? a.f >= Rg.lo - 1e-9 && a.f <= Rg.hi + 1e-9 : a.i1 >= Rg.lo && a.i1 <= Rg.hi))) inR++; } }
      for (let i=0;i<1500;i++){ const it = genItem(80, lootKind(), 2); if (it.anc) low++; }
      out.drops = { share:+(anc/n).toFixed(3), ilvl:ilvl===anc, top:top===rolls, gshare:+(gr/Math.max(1, rolls)).toFixed(3), inRange:inR===rolls, low }; }
    /* a greater bonus is half again its tier */
    { const mk = g=>{ const it = rsMakeArmour('metal', 6, 'chest'); it.anc = 1; it.ilvl = CB_HI; const a = { kind:'life', i1:0, i2:0, f:0, fam:'life', t:1 }; it.aff.push(a); it.naff = it.aff.length; afRollTier(it, a, AFFIX_FAM.life, AFFIX_FAM.life.tiers.length - 1); if (g){ a.g = 1; afRollTier(it, a, AFFIX_FAM.life, AFFIX_FAM.life.tiers.length - 1); } return [it, a]; };
      const [it0, a0] = mk(0), [it1, a1] = mk(1), r0 = afRange(a0, it0), r1 = afRange(a1, it1);
      out.greater = { lo:r1.lo, hi:r1.hi, baseHi:r0.hi, val:a1.i1, above:r1.lo > r0.lo && r1.hi > r0.hi && a1.i1 >= r1.lo && a1.i1 <= r1.hi };
      const tip = itemModListHtml(it1); out.tip = { mark:/afgr/.test(tip), hint:/Ancestral: its bonuses rolled from the best tiers/.test(tip), sub:/^ancestral /.test(itemSubName(it1)) };
      out.price = itemPrice(it1) > itemPrice(it0) && itemPrice(it0) > (()=>{ const x = rsMakeArmour('metal', 6, 'chest'); x.aff.push(Object.assign({}, a0)); return itemPrice(x); })(); }
    /* the anvil: Change and Law keep a greater bonus greater; Chaos rerolls an Ancestral piece at the top tiers */
    { for (const e of ESSENCES) skAdd(e[0], 60); let it, i = -1;
      for (let k=0;k<400 && i < 0;k++){ it = rsMakeArmour('metal', 6, 'chest'); it.anc = 1; it.ilvl = CB_HI; afDress(it, 126, 2); i = it.aff.findIndex(a=>a.g && enchCanChange(it, a)); }
      const a = it.aff[i]; for (let k=0;k<6;k++) enchChange(it, i); const Rg = afRange(a, it); out.change = { g:!!a.g, inRange:a.f ? a.f >= Rg.lo - 1e-9 && a.f <= Rg.hi + 1e-9 : a.i1 >= Rg.lo && a.i1 <= Rg.hi };
      let tops = true, gs = 0; for (let k=0;k<20;k++){ enchChaos(it); for (const b of R(it)){ if (b.t > afTopTiers(AFFIX_FAM[b.fam])) tops = false; if (b.g) gs++; } } out.chaos = { anc:!!it.anc, tops, gs };
      out.brk = enchBreakYield(it).filter(y=>y[0]==='es_law').length===2; }
    /* the loot filter keeps one with a greater bonus */
    { let it; for (let k=0;k<400;k++){ it = rsMakeArmour('metal', 6, 'chest'); it.anc = 1; it.ilvl = CB_HI; afDress(it, 126, 1); if (it.aff.some(a=>a.g)) break; }
      const F = Object.assign({}, lootfP(), { on:true, tiers:[0,1,2,3,4,5,6,7,8,9], rar:[0,1,2], keepT:0, stats:[], safeUp:false });
      out.filter = lootfWhy(it, F); const pl = rsMakeArmour('metal', 6, 'chest'); afDress(pl, 126, 1); pl.aff.forEach(a=>delete a.g); out.filterPlain = lootfWhy(pl, F);
      /* its label on the ground */
      const gm = G.gameMode; G.gameMode = 1; G.dropAt = { x:p.x, y:p.y }; ISO.beams = []; lootBeamFor(it); const b = ISO.beams[0] || {};
      out.beam = { nm:/^Ancestral /.test(b.nm||''), anc:!!b.anc, gr:b.gr >= 1, plate:!!(b.t = 0.5, lootLabelPlate(b)) }; G.gameMode = gm; ISO.beams = []; }
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: ' + m + ' ' + JSON.stringify(r)); };
  A(r.chance[0]===0 && r.chance[1] >= 0.03 && r.chance[1] <= 0.05 && r.chance[2] >= 0.15 && r.chance[2] <= 0.17 && r.chance[3] >= 0.39, 'Ancestral from 90, likelier deeper and off a boss: ' + r.chance);
  A(r.drops.share > 0.1 && r.drops.share < 0.23 && r.drops.ilvl && r.drops.top && r.drops.inRange && r.drops.gshare > 0.12 && r.drops.gshare < 0.25 && r.drops.low===0, 'Ancestral drops: item level 126, top tiers, about one bonus in six greater, never below 90');
  A(r.greater.above, 'a greater bonus rolls half again its tier');
  A(r.tip.mark && r.tip.hint && r.tip.sub && r.price, 'the tooltip marks it and says Ancestral; it is worth more');
  A(r.change.g && r.change.inRange && r.chaos.anc && r.chaos.tops && r.chaos.gs > 0 && r.brk, 'the anvil keeps a greater bonus greater, Chaos rolls it Ancestral again, it breaks down to more Law');
  A(r.filter==='protected' && r.filterPlain!=='protected', 'the loot filter keeps an Ancestral piece with a greater bonus: ' + r.filter);
  A(r.beam.nm && r.beam.anc && r.beam.gr && r.beam.plate, 'its label on the ground says Ancestral');
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
