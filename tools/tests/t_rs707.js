// RS-707: essences and the smith's anvil. Four essences (Change, Chaos, Blood, Law) are bag resources of their own; a kill leaves one now
// and then, a boss a few, and the old Scrolls of Reforging turn into Essences of Change. At the smith: Change rerolls one bonus within its
// tier, Law raises one a tier (as far as the piece's level allows), Chaos rerolls them all (a rare stays rare and keeps its name), Blood
// adds one (plain to magic, magic to rare, up to six); a Unique can't be enchanted; magic and rare pieces break down into essences.
// Masterworking replaces reinforcing: +1 to +8 for gold, never failing, +4 and +8 taking Law and growing a bonus (starred)
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const r = await page.evaluate(()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    const out = {}, p = G.player, R = it=>it.aff.filter(a=>!a.imp), give = n=>{ for (const e of ESSENCES) skAdd(e[0], n); };
    out.cat = (resCats().find(c=>c[0]==='Essences')||[0, []])[1].join(); out.names = ESSENCES.map(e=>resName(e[0])).join('|');
    { const c = {}; for (let i=0;i<4000;i++){ const e = esRoll(); c[e[0]] = (c[e[0]]||0) + 1; } out.share = ESSENCES.map(e=>Math.round(c[e[0]]/40)); }
    /* old scrolls */
    { G.inv = [mkReforgeScroll(), mkReforgeScroll()]; const e0 = skHave('es_change'); esFromScrolls(); out.scrolls = { left:G.inv.length, got:skHave('es_change') - e0 }; }
    give(50);
    const rare = ()=>{ const it = rsMakeArmour('metal', 3, 'chest'); it.ilvl = 126; afDress(it, 60, 2); return it; };
    /* Change: one bonus rerolled within its tier */
    { const it = rare(); G.inv = [it]; let i = it.aff.findIndex(a=>!a.imp && enchCanChange(it, a)); const a = it.aff[i], t0 = a.t, n0 = skHave('es_change'), nm0 = it.nm; let vals = new Set();
      for (let k=0;k<12;k++){ enchChange(it, i); vals.add(a.i1 + a.f); } const Rg = afRange(a, it);
      out.change = { sameTier:a.t===t0, spent:n0 - skHave('es_change'), varied:vals.size > 1, inRange:Rg.q >= 0 && Rg.q <= 1 && (a.f ? a.f >= Rg.lo - 1e-9 && a.f <= Rg.hi + 1e-9 : a.i1 >= Rg.lo && a.i1 <= Rg.hi), name:it.nm===nm0 }; }
    /* Law: a tier up, as far as the level goes */
    { const it = rare(); let i = it.aff.findIndex(a=>!a.imp && enchCanLaw(it, a)); const a = it.aff[i], t0 = a.t; enchLaw(it, i); out.law = { up:a.t===t0 - 1 };
      const lo = rsMakeArmour('metal', 3, 'chest'); lo.ilvl = 10; afDress(lo, 10, 1); out.law.capped = R(lo).every(a=>!enchCanLaw(lo, a)); }
    /* a magic piece renamed for its new word */
    { let it; for (let k=0;k<200;k++){ it = rsMakeArmour('metal', 3, 'chest'); it.ilvl = 126; afDress(it, 20, 1); if (R(it).length===1 && enchCanLaw(it, R(it)[0])) break; }
      const i = it.aff.indexOf(R(it)[0]), F = AFFIX_FAM[it.aff[i].fam]; enchLaw(it, i); const w = F.nm[F.tiers.length - it.aff[i].t]; out.magicName = it.nm.includes(w) && it.nm.includes(it.baseNm); }
    /* Chaos: all rerolled; a rare stays rare with its name */
    { const it = rare(), nm0 = it.nm, k0 = JSON.stringify(R(it)); enchChaos(it); out.chaos = { rare:it.quality===2 && R(it).length >= 3, name:it.nm===nm0, changed:JSON.stringify(R(it))!==k0, imp:it.aff.filter(a=>a.imp).length===1 };
      const pl = rsMakeArmour('metal', 3, 'chest'), c0 = skHave('es_chaos'); enchChaos(pl); out.chaos.plainRefused = skHave('es_chaos')===c0 && R(pl).length===0; }
    /* Blood: plain -> magic -> two -> rare, up to six, never seven */
    { const it = rsMakeArmour('metal', 3, 'chest'); it.ilvl = 90; const steps = []; for (let k=0;k<7;k++){ const b0 = skHave('es_blood'); enchBlood(it); steps.push([R(it).length, it.quality, b0 - skHave('es_blood')]); }
      out.blood = steps.map(x=>x.join('/')).join(' '); out.bloodRare = RARE_PRE.some(w=>it.nm.startsWith(w)) && it.baseNm===rsMakeArmour('metal', 3, 'chest').nm;
      const pre = R(it).filter(a=>AFFIX_FAM[a.fam].pre).length; out.bloodSides = pre <= 3 && R(it).length - pre <= 3; }
    /* a Unique can't be enchanted */
    { const u = rsMakeWeapon(3, 3); u.uniqueId = 99; afAdd(u, 'life', 10, 0, 0); const b0 = skHave('es_blood'); enchBlood(u); enchChaos(u); out.unique = skHave('es_blood')===b0 && u.aff.length===2; }
    /* break down */
    { const m = rsMakeArmour('metal', 3, 'chest'); afDress(m, 60, 1); const rr = rare(); G.inv = [m, rr]; const c0 = skHave('es_change'); enchBreak(m); const c1 = skHave('es_change'); enchBreak(rr);
      out.brk = { gone:G.inv.length===0, magic:c1 - c0, rare:skHave('es_change') - c1 }; const lk = rare(); lk.locked = true; G.inv = [lk]; enchBreak(lk); out.brk.locked = G.inv.length===1; }
    /* masterwork: to +8 for gold, Law at +4 and +8, a bonus starred */
    { p.gold = 1e7; for (const e of ESSENCES) skAdd(e[0], -skHave(e[0])); const w = rsMakeWeapon(5, 3); afDress(w, 80, 2); G.gear.weapon = w; const acc0 = w.acc, accs = [];
      for (let k=0;k<3;k++){ smithReinforce('weapon'); accs.push(w.acc); } const g0 = p.gold; smithMasterwork(w); out.mw = { stopAt4:w.reinf===3 && p.gold===g0 };
      skAdd('es_law', 3); for (let k=0;k<5;k++){ smithMasterwork(w); accs.push(w.acc); }
      out.mw.rank = w.reinf; out.mw.law = skHave('es_law'); out.mw.grows = accs.every((v, k)=>v > (k ? accs[k-1] : acc0)); out.mw.top = +(w.acc/acc0).toFixed(2);
      out.mw.stars = w.aff.reduce((t, a)=>t + (a.mw||0), 0); out.mw.name = /\+8$/.test(w.nm) && !/\+\d+ \+/.test(w.nm);
      const tip = itemModListHtml(w); out.mw.tip = /masterworked \+8 of 8/.test(tip) && /afmw/.test(tip);
      /* enchanting a masterworked piece keeps its +n */
      skAdd('es_chaos', 1); enchChaos(w); out.mw.keepsName = /\+8$/.test(w.nm) && w.reinf===8;
      /* a piece reinforced before RS-707 carries on */
      const o = rsMakeArmour('metal', 3, 'chest'); o.reinfBase = { acc:0, dmgB:0, ac:o.ac, nm:o.nm }; o.reinf = 2; o.ac = Math.round(o.reinfBase.ac*1.12) + 0; o.nm += ' +2'; G.gear.chest = o; smithReinforce('chest'); out.mw.old = o.reinf===3 && /\+3$/.test(o.nm) && !/\+2/.test(o.nm); }
    /* the smith's screen */
    { give(5); const it = rare(); G.inv = [it]; setUi('blacksmith'); const ov = document.getElementById('overlay'), txt = ov.textContent;   /* (RS-712: the work is done at the anvil now) */
      out.ui = { panel:/Work a piece at the anvil/.test(txt), reinforce:/REINFORCE/.test(txt) }; anvilOpen(it, 'blacksmith');
      out.ui.ess = ov.querySelectorAll('.anv-es').length; out.ui.rows = ov.querySelectorAll('.anv-ln').length;
      const nm0 = it.nm; document.querySelector('.anv-stage').remove(); anvUse('es_chaos'); out.ui.clicked = it.nm===nm0 && skHave('es_chaos')===4;
      setUi('playing'); }
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: ' + m + ' ' + JSON.stringify(r)); };
  A(r.cat==='es_blood,es_change,es_chaos,es_law' && /Essence of Change/.test(r.names), 'the essences, a resource of their own');
  A(Math.abs(r.share[0] - 50) < 5 && Math.abs(r.share[3] - 10) < 4, 'Change the common one, Law the rare one: ' + r.share);
  A(r.scrolls.left===0 && r.scrolls.got===2, 'old Scrolls of Reforging become Essences of Change');
  A(r.change.sameTier && r.change.spent===12 && r.change.varied && r.change.inRange && r.change.name, 'Change rerolls a bonus within its tier');
  A(r.law.up && r.law.capped && r.magicName, 'Law raises a bonus a tier, never past the piece\'s level; a magic piece takes the new word');
  A(r.chaos.rare && r.chaos.name && r.chaos.changed && r.chaos.imp && r.chaos.plainRefused, 'Chaos rerolls every bonus, a rare stays rare and keeps its name and its built-in bonus; not on a plain piece');
  A(/^1\/1\/1 2\/1\/1 3\/2\/1 4\/2\/1 5\/2\/1 (6\/2\/1 6\/2\/0|5\/2\/0 5\/2\/0)$/.test(r.blood) && r.bloodRare && r.bloodSides, 'Blood: plain to magic, two, then rare, up to six (five when the strength suffix took the kind of the strength prefix), three a side, never a wasted essence: ' + r.blood);
  A(r.unique, 'a Unique is not enchanted');
  A(r.brk.gone && r.brk.magic===1 && r.brk.rare===2 && r.brk.locked, 'a magic piece breaks into an Essence of Change, a rare two; a locked one never');
  A(r.mw.stopAt4 && r.mw.rank===8 && r.mw.law===0 && r.mw.grows && r.mw.top >= 1.39 && r.mw.stars===2 && r.mw.name && r.mw.tip && r.mw.keepsName && r.mw.old, 'masterworking to +8, Law at +4 and +8, every step up, two bonuses starred, an old reinforced piece carries on');
  A(r.ui.panel && r.ui.ess===4 && r.ui.rows >= 4 && !r.ui.reinforce && r.ui.clicked, 'the smith\'s screen: essences, the piece\'s bonuses with their buttons, the Chaos button works');
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
