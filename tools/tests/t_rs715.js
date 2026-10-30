// RS-715: Uniques and Barrows weapons roll their own bonuses. Every Unique carries five from its own families (UNIQUE_KIT) at the best
// tier its item level opens (level + 15; from 90 the top level), and its base is the best its level gives (a level-126 weapon is rune,
// not bronze); a Barrows weapon carries four (BARROWS_KIT), found again by name when masterworked; an old save's Unique is reforged once,
// its masterwork's quarter growth put back; a level-126 Unique weapon outscores a middling rare
module.exports = async page=>{
  const ev = (f, a)=>page.evaluate(f, a), A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
  const R = await ev(()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); o3Pref = false; try{ v3Pref = false; }catch(e){}
    const out = { bad:[] };
    for (const L of [40, 75, 126]) for (let id=1; id<=UNIQUES.length; id++){
      const u = buildUnique(id, L), kit = UNIQUE_KIT[id - 1], R = u.aff.filter(a=>a.u), LL = uqLvl(L);
      if (R.length!==5 || !kit.every(k=>R.some(a=>a.fam===k))) out.bad.push(`${u.nm}@${L}: ${R.map(a=>a.fam)}`);
      for (const a of R){ const F = AFFIX_FAM[a.fam]; if (a.t !== F.tiers.length - mx(0, afTierMax(F, LL))) out.bad.push(`${u.nm}@${L} ${a.fam} T${a.t}`); }
      if (!u.uqV) out.bad.push(u.nm + ' no uqV');
    }
    out.lvl = [uqLvl(40), uqLvl(75), uqLvl(90), uqLvl(126)];
    const fb = buildUnique(13, 126); out.frost = { mat:fb.baseMat, tier:fb.rsTier, price:itemPrice(fb) };
    const cs = buildUnique(6, 126); out.cara = { mat:cs.baseMat, fam:cs.rsFam };
    /* a level-126 Unique weapon against middling rares */
    const sc = []; for (let i=0;i<30;i++){ const x = genItem(126, 'weapon', 3); if (itemStyleOf(x)!=='melee') continue; afDress(x, 126, 2); sc.push(itemScoreFor(x, 'melee')); } sc.sort((a, b)=>a - b);
    out.score = { u:itemScoreFor(buildUnique(3, 126), 'melee'), med:sc[sc.length>>1] };
    /* the tooltip shows each bonus's tier */
    const tip = itemCompareTooltipHtml(buildUnique(1, 126)); out.tip = /T1/.test(tip) && /BONUSES/.test(tip);
    /* Barrows */
    const b = crBarrows(0); out.bar = { n:b.aff.filter(a=>a.u).length, fams:b.aff.filter(a=>a.u).map(a=>a.fam).join(','), uqV:b.uqV };
    b.reinf = 3; b.reinfBase = { nm:b.nm }; b.nm += ' +3'; out.barKit = !!uqKit(b);
    /* an old Unique: its old fixed numbers, masterworked to +4 - reforged once on load */
    const o = buildUnique(11, 100); o.aff = o.aff.filter(a=>a.imp).concat([{ kind:'life', i1:15, i2:0, f:0 }]); delete o.uqV; o.reinf = 4;
    afMigrate(o); out.mig = { n:o.aff.filter(a=>a.u).length, mw:o.aff.filter(a=>a.mw).length, uqV:o.uqV, old:o.aff.some(a=>a.kind==='life' && !a.u && !a.imp) };
    const before = JSON.stringify(o.aff); afMigrate(o); out.once = before===JSON.stringify(o.aff);
    return out; });
  console.log(JSON.stringify(R));
  A(!R.bad.length, 'every Unique: its five families at the best tier its level opens: ' + R.bad.slice(0, 6).join(' | '));
  A(R.lvl[0]===55 && R.lvl[1]===90 && R.lvl[2]===CB_HI_OF(R) && R.lvl[3]===126, 'item level: its level + 15, from 90 the top');
  A(R.frost.mat==='Rune' && R.frost.price >= 10000, 'a level-126 Frostbite is rune, priced as one: ' + JSON.stringify(R.frost));
  A(R.cara.mat==='Dragon' || R.cara.mat==="Ahrim's" || R.cara.mat==="Black D'hide", 'a level-126 Carapace is of the best: ' + JSON.stringify(R.cara));
  A(R.score.u > R.score.med * 1.5, 'a level-126 Widowmaker well above a middling rare: ' + JSON.stringify(R.score));
  A(R.tip, 'the tooltip lists its bonuses with their tiers');
  A(R.bar.n===4 && R.bar.fams==='str,edmg,life,dead' && R.bar.uqV && R.barKit, "Dharok's Greataxe: four of its own, found again when masterworked: " + JSON.stringify(R.bar));
  A(R.mig.n===5 && R.mig.mw===1 && R.mig.uqV && !R.mig.old && R.once, 'an old Unique is reforged once, its +4 growth put back: ' + JSON.stringify(R.mig));
};
function CB_HI_OF(){ return 126; }
