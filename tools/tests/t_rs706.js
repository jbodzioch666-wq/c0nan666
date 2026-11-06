// RS-706: a base's own bonus, and the skilling suffixes. Every weapon, bow, staff and most armour carries one built-in bonus for what it
// is (a dagger crits on 19, a platebody cuts damage, a wizard hat draws luck): marked built in, shown above the rolled bonuses, it
// neither colours the piece nor raises its price as a roll does; old pieces get theirs once. Hats, gloves, boots, capes and jewellery can
// roll a skilling suffix (of the Lumberjack): more xp in that skill, and for a gathering skill a chance at a double haul
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const r = await page.evaluate(()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    const out = {}, p = G.player, bi = it=>it.aff.filter(a=>a.bi);
    /* every base has its bonus, built in, once */
    { const bases = RS_WEAPONS.map((w, i)=>rsMakeWeapon(2, i)).concat([rsMakeBow(2, false), rsMakeBow(2, true), rsMakeCrossbow(2), rsMakeStaff(1), rsMakeArmour('metal', 3, 'head'), rsMakeArmour('metal', 3, 'chest'), rsMakeArmour('metal', 3, 'offhand'), rsMakeArmour('hide', 2, 'chest'), rsMakeArmour('cloth', 2, 'head'), rsMakeArmour('cloth', 2, 'chest')]);
      out.bases = bases.map(it=>{ const b = bi(it); return b.length===1 && b[0].imp ? b[0].kind : 'BAD:' + it.nm + ':' + b.length; });
      out.plain = bases.every(it=>(it.quality||0)===0 && rsQualityOf(it)===0);
      out.price = bases.every(it=>itemPrice(it)===mx(3, roundH(it.price)));
      const it = rsMakeWeapon(2, 0); afBaseImplicit(it); afBaseImplicit(it); out.once = bi(it).length; }
    /* the bonuses work */
    { const w0 = G.gear.weapon, c0 = G.gear.chest, h0 = G.gear.head; G.gear.weapon = newItem(); const c1 = weaponCritThreshold(); G.gear.weapon = rsMakeWeapon(2, 0); const c2 = weaponCritThreshold();
      G.gear.chest = newItem(); const r1 = gearStatI('resist'); G.gear.chest = rsMakeArmour('metal', 3, 'chest'); const r2 = gearStatI('resist');
      G.gear.head = rsMakeArmour('cloth', 2, 'head'); const mf = gearStatI('magicfind'); G.gear.weapon = w0; G.gear.chest = c0; G.gear.head = h0;
      out.work = { crit:[c1, c2], resist:r2 - r1, mf }; }
    /* the tooltip: the built-in line above the box, tagged; a plain base has no box */
    { const pl = rsMakeArmour('metal', 3, 'chest'), h = itemModListHtml(pl); const mg = rsMakeArmour('metal', 3, 'chest'); afDress(mg, 60, 1); const h2 = itemModListHtml(mg);
      out.tip = { plainImp:/class="affimp"/.test(h) && /built in/.test(h) && !/affbox/.test(h), magic:/affimp[\s\S]*affbox/.test(h2) && (h2.split('affbox')[1].match(/built in/g)||[]).length===0, text:affixText(pl, 0) }; }
    /* an old piece gets its base's bonus once, keeps its colour rules */
    { const a = rsMakeArmour('metal', 5, 'chest'); a.aff = []; a.naff = 0; a.rsLootV = 1; a.quality = 0; const b = rsMakeWeapon(3, 3); b.aff = []; b.naff = 0; delete b.rsLootV; b.quality = 2;
      G.inv = [a, b]; rsMigrateAll(); rsMigrateAll(); out.old = { a:bi(a).length, b:bi(b).length, bq:b.quality, v:[a.rsLootV, b.rsLootV] }; }
    /* skilling suffixes: on hats, gloves, boots, capes and jewellery only; named; worth xp, not a fight's score */
    { let on = 0, off = 0, named = null; const famSx = AFFIX_FAMS.filter(F=>F.sk);
      for (let i=0;i<3000;i++){ const it = rsMakeArmour('hide', 2, ['arms','feet','head'][i%3]); afDress(it, 90, 1); const sx = it.aff.find(a=>/^sx_/.test(a.kind)); if (sx){ on++; if (!named) named = { nm:it.nm, word:AFFIX_FAM[sx.fam].nm[AFFIX_FAM[sx.fam].tiers.length - sx.t] }; } }
      for (let i=0;i<1500;i++){ const it = i%2 ? rsMakeArmour('metal', 3, 'chest') : rsMakeWeapon(3, i%10); afDress(it, 90, 2); if (it.aff.some(a=>/^sx_/.test(a.kind))) off++; }
      out.sx = { fams:famSx.length, on, off, named:named && named.nm.endsWith(named.word) && /^of the /.test(named.word) };
      const g = rsMakeArmour('hide', 2, 'arms'), sc0 = itemScore(g); afAdd(g, 'sx_woodcutting', 0, 0, 0.1); const ai = g.aff.length - 1; Object.assign(g.aff[ai], { fam:'sxwood', t:2 });
      out.sx.score = itemScore(g)===sc0; out.sx.text = affixText(g, ai); out.sx.explain = rsAffixExplain(g.aff[ai]); out.sx.fish = sxText('sx_cooking', 0.1);
      const a0 = G.gear.arms, m0 = skXpMult('woodcutting'), mk0 = skXpMult('mining'); G.gear.arms = g; const m1 = skXpMult('woodcutting'), mk1 = skXpMult('mining');
      const x0 = p.skills.woodcutting||0; skGainXP('woodcutting', 1000); const x1 = p.skills.woodcutting - x0; G.gear.arms = a0; const x2 = p.skills.woodcutting; skGainXP('woodcutting', 1000); const x3 = p.skills.woodcutting - x2;
      out.sx.mult = +((m1 - m0)/XP_RATE).toFixed(3); out.sx.other = mk1===mk0; out.sx.gain = +(x1/x3).toFixed(2); }
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: ' + m + ' ' + JSON.stringify(r)); };
  A(r.bases.every(k=>!/^BAD/.test(k)) && r.bases.slice(0, 10).join()==='crit,flatdmg,healkill,deadly,flatac,edmg,flatdmg,deadly,flatac,edmg', 'every base has one built-in bonus for what it is: ' + r.bases);
  A(r.plain && r.price && r.once===1, 'a base stays plain (white), its price unchanged, its bonus added once');
  A(r.work.crit[0]===20 && r.work.crit[1]===19 && r.work.resist >= 1 && r.work.mf >= 1, 'a dagger crits on 19, a platebody cuts damage, a wizard hat draws luck');
  A(r.tip.plainImp && r.tip.magic && /Damage Reduction/.test(r.tip.text), 'the built-in bonus shows above the rolled ones, tagged built in');
  A(r.old.a===1 && r.old.b===1 && r.old.bq===0 && r.old.v.join()==='2,2', 'an old piece gets its base\'s bonus once; a pre-RS-704 one is recoloured too');
  A(r.sx.fams===13 && r.sx.on > 30 && r.sx.off===0 && r.sx.named, 'thirteen skilling suffixes, on what you wear to work and never on a weapon or body, named for their tier');
  A(r.sx.score && /Woodcutting Experience, 5% Double Logs/.test(r.sx.text) && /more Woodcutting experience, and 5% of your logs come in pairs/.test(r.sx.explain) && !/Double/.test(r.sx.fish), 'the line and its explanation; a fight\'s score ignores it; no double haul for cooking: ' + r.sx.text);
  A(r.sx.mult===0.1 && r.sx.other && r.sx.gain >= 1.05, '+10% woodcutting xp worn, nothing else: ' + r.sx.gain);
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
