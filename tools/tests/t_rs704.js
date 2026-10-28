// RS-704: loot with prefixes and suffixes in tiers. A drop is plain, magic (one or two rolled bonuses, named for them), rare (three to
// six, a name of its own, its base kept) or a set piece (sets drop again); every bonus is a tier of its family (T1 the best), opened
// by the drop's level; the bonuses feed the real numbers (attack, strength, defence, ranged); the tooltip tags each line's tier and,
// under Alt, its range; a plain rune piece is white now (old saves recoloured on load); a magic or rare piece is worth more
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const r = await page.evaluate(()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    const out = {}, p = G.player, tierOf = (a)=>{ const F = AFFIX_FAM[a.fam]; return F ? F.tiers[F.tiers.length - a.t] : null; };
    /* the shares at level 60, cap 3 */
    { const c = [0,0,0,0,0], bad = []; for (let i=0;i<600;i++){ const it = genItem(60, lootKind(), 3); c[it.quality||0]++;
        const rolled = it.aff.filter(a=>!a.imp);   /* (a ring's or amulet's own bonus isn't a roll) */
        if (it.quality===1 && !(rolled.length>=1 && rolled.length<=2)) bad.push('magic ' + rolled.length);
        if (it.quality===2){ const np = rolled.filter(a=>AFFIX_FAM[a.fam] && AFFIX_FAM[a.fam].pre).length, ns = rolled.filter(a=>AFFIX_FAM[a.fam] && !AFFIX_FAM[a.fam].pre).length, kinds = rolled.map(a=>a.kind);
          if (rolled.length < 3 || rolled.length > 6 || np > 3 || ns > 3 || new Set(kinds).size!==kinds.length || !RARE_PRE.some(w=>it.nm.startsWith(w)) || !it.baseNm) bad.push('rare ' + it.nm + ' ' + it.aff.length); }
        if (it.quality===3 && !(it.setId > 0 && it.baseNm)) bad.push('set ' + it.nm);
        if ((it.quality===1 || it.quality===2) && it.aff.some(a=>!a.imp && (!a.fam || !a.t || tierOf(a)[0] > 60))) bad.push('tier ' + it.nm);
        if (it.quality===0 && it.aff.some(a=>!a.imp)) bad.push('plain with a roll ' + it.nm); }
      out.share = c.map(x=>+(x/6).toFixed(1)); out.bad = bad.slice(0, 5); }
    /* a magic piece is named for its bonuses */
    { let it; for (let i=0;i<300 && !(it && it.quality===1 && it.aff.length===2);i++) it = genItem(60, 'chest', 3);
      const [a, b] = it.aff, Fa = AFFIX_FAM[a.fam], Fb = AFFIX_FAM[b.fam], pre = Fa.pre ? Fa : Fb, suf = Fa.pre ? Fb : Fa;
      out.magic = { nm:it.nm, base:it.baseNm, ok:it.nm===`${pre.nm[pre.tiers.length - (pre===Fa ? a : b).t]} ${it.baseNm} ${suf.nm[suf.tiers.length - (suf===Fa ? a : b).t]}`, sub:itemSubName(it) }; }
    /* the tiers open by level: none above the level, and the top tier at 126 */
    { let over = 0, t1 = 0, n = 0, famless = []; for (let i=0;i<300;i++){ const it = genItem(10, 'weapon', 3); for (const a of it.aff){ n++; const tr = tierOf(a); if (!tr){ famless.push(it.nm + ':' + a.kind); continue; } if (tr[0] > 10) over++; } }
      for (let i=0;i<300;i++){ const it = genItem(126, 'weapon', 3, false, 2); for (const a of it.aff) if (a.t===1) t1++; } out.tiers = { over, t1, n, famless:famless.slice(0, 4) }; }
    /* the numbers: a rolled bonus counts as the base's would */
    { const w0 = G.gear.weapon, c0 = G.gear.chest; G.gear.weapon = rsMakeWeapon(2, 3); G.gear.chest = rsMakeArmour('metal', 2, 'chest'); const h0 = rsAtkBonus('melee'), ac0 = playerACExact();
      const w = rsMakeWeapon(2, 3); afAdd(w, 'acc', 30, 0, 0); G.gear.weapon = w; const h1 = rsAtkBonus('melee');
      const c = rsMakeArmour('metal', 2, 'chest'); afAdd(c, 'ac', 40, 0, 0); G.gear.chest = c; const ac1 = playerACExact();
      G.gear.weapon = rsMakeWeapon(2, 3); G.gear.chest = c0; const h2 = rsAtkBonus('melee'), c2 = rsMakeArmour('metal', 2, 'chest'); afAdd(c2, 'ac', 40, 0, 0); G.gear.weapon = w0;
      out.feed = { hit:+(h1 - h0).toFixed(2), ac:+(ac1 - ac0).toFixed(2), back:h2===h0, score:itemScoreFor(c2, 'melee') > itemScoreFor(rsMakeArmour('metal', 2, 'chest'), 'melee'), has:lootfHas(c2, 'ac') && !lootfHas(rsMakeArmour('hide', 0, 'feet'), 'acc') };
      const b = rsMakeBow(3, false); afAdd(b, 'rngAcc', 20, 0, 0); const r0 = G.gear.ranged; G.gear.ranged = b; G.gear.weapon = newItem(); const rb = rsAtkBonus('ranged'); G.gear.ranged = rsMakeBow(3, false); out.feed.bow = +(rb - rsAtkBonus('ranged')).toFixed(2); G.gear.ranged = r0; G.gear.weapon = w0; }
    /* the tooltip: a tier tag on each line, its range under Alt */
    { const it = rsMakeArmour('metal', 3, 'chest'); afDress(it, 80, 2); const plain = itemCompareTooltipHtml(it); TT_ALT = true; const alt = itemCompareTooltipHtml(it); TT_ALT = false;
      out.tip = { tags:(plain.match(/class="afft/g)||[]).length, n:it.aff.length, range:!/affr/.test(plain) && /affr/.test(alt) && /\[\d+&ndash;\d+\]/.test(alt), hint:/hold Alt/.test(plain) && !/hold Alt/.test(alt), sub:/rare Mithril Platebody/.test(plain), examine:examineItem(it) };
      const R = afRange(it.aff[0], it); out.tip.q = !!(R && R.q >= 0 && R.q <= 1 && R.lo <= R.hi); }
    /* colour and worth */
    { const rune = rsMakeArmour('metal', 5, 'chest'), it = newItem(); rsFillBase(it, 60, 'chest'); const m = rsMakeArmour('metal', 5, 'chest'); afDress(m, 60, 1); const rr = rsMakeArmour('metal', 5, 'chest'); afDress(rr, 60, 2);
      out.colour = { rune:rsQualityOf(rune), filled:it.quality, magic:m.quality, rare:rr.quality, price:itemPrice(rune) < itemPrice(m) && itemPrice(m) < itemPrice(rr) }; }
    /* an old save: a rune piece coloured for its metal goes white, one with bonuses keeps a colour, a crafted one keeps its own, a Ring of
       Recoil's recoil is its own (built in, the ring plain) */
    { const a = rsMakeArmour('metal', 5, 'chest'); a.quality = 2; const b = rsMakeWeapon(5, 3); b.quality = 2; afAdd(b, 'edmg', 20, 0, 0); const c = rsForgeQuality(rsMakeArmour('metal', 2, 'legs'), 40, 10); const cq = c.quality;
      const rc = rsMakeJewel('ring', RS_RINGS.findIndex(x=>x[2].recoil)); rc.quality = 1; for (const q of rc.aff) delete q.imp;
      G.inv = [a, b, c, rc]; rsMigrateAll(); out.old = { a:a.quality, b:b.quality, c:c.quality===cq, tip:!!itemModListHtml(b), recoil:rc.quality, recoilImp:rc.aff.every(q=>q.imp) }; }
    /* sets drop */
    { let set = null; for (let i=0;i<4000 && !set;i++){ const it = genItem(90, 'chest', 3); if (it.setId) set = it; } out.set = set ? { q:set.quality, base:set.baseNm, nm:set.nm, n:set.aff.length } : null; }
    /* an awakening weapon still grows a real bonus, from the table */
    { const sw = rsMakeWeapon(5, 3); sw.kills = 49; G.gear.weapon = sw; itemSentienceOnKill(sw); out.awaken = { n:sw.aff.length, fam:sw.aff[0] && sw.aff[0].fam, q:sw.quality }; G.gear.weapon = newItem(); }
    /* a boss drop is rare at the least; a champion's magic at the least */
    { let lo = 0; for (let i=0;i<60;i++){ const it = genBossLoot('chest', 80); if (!it.uniqueId && (it.quality||0) < 2 && !/Fire Cape/.test(it.nm)) lo++; } for (let i=0;i<60;i++){ const it = genItem(60, 'chest', 3, false, 1); if ((it.quality||0) < 1) lo++; } out.bossLow = lo; }
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: ' + m + ' ' + JSON.stringify(r)); };
  A(r.share[0] > 45 && r.share[0] < 75 && r.share[1] > 20 && r.share[1] < 45 && r.share[2] > 2 && r.share[2] < 14 && r.share[3] < 5 && r.share[4]===0, 'most drops plain, a third magic, a few rare, the odd set piece, never a Unique at cap 3');
  A(!r.bad.length, 'every magic piece has one or two bonuses, every rare three to six (three a side at most, no kind twice) and a name of its own over its base, every tier opened by the level: ' + r.bad.join(' | '));
  A(r.magic.ok && r.magic.sub==='magic ' + r.magic.base, 'a magic piece is named for its prefix and suffix, its base under it');
  A(r.tiers.over===0 && r.tiers.t1 > 20, 'at level 10 nothing above its level; at 126 the top tier rolls');
  A(Math.abs(r.feed.hit - 3) < 0.01 && Math.abs(r.feed.ac - 2) < 0.01 && r.feed.back && Math.abs(r.feed.bow - 2) < 0.01 && r.feed.score && r.feed.has, 'a rolled +30 attack is +3 to hit, +40 defence +2 armour, +20 ranged on a bow +2 to hit; the arrows and the loot filter count them');
  A(r.tip.tags===r.tip.n && r.tip.range && r.tip.hint && r.tip.sub && r.tip.q && /Mithril armour/.test(r.tip.examine), 'the tooltip tags each bonus with its tier, shows the ranges under Alt (and says so), names the base, and examines the metal');
  A(r.colour.rune===0 && r.colour.filled===0 && r.colour.magic===1 && r.colour.rare===2 && r.colour.price, 'a plain rune piece is white; magic blue, rare yellow, and worth more');
  A(r.old.a===0 && r.old.b===1 && r.old.c && r.old.tip && r.old.recoil===0 && r.old.recoilImp, 'an old save: the metal colour goes, a piece with bonuses keeps one, a crafted piece keeps its own, the recoil a ring of its own; old bonuses without a tier still show');
  A(r.set && r.set.q===3 && r.set.base && r.set.n >= 3, 'set pieces drop again, their base kept');
  A(r.awaken.n===1 && r.awaken.fam && r.awaken.q===1, 'an awakening weapon grows a tiered bonus and turns magic');
  A(r.bossLow===0, 'a boss drops rare at the least, a champion magic');
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
