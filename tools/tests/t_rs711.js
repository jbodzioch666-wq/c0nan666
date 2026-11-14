// RS-711: what you make rolls bonuses as loot does. A Fine piece one, an Exceptional piece two (a prefix and a suffix), at the item level
// its material and your skill give it (craftLvl); it keeps its own name and a colour of its own (crafted). Now and then a craft is
// Inspired (it was "Masterwork", the smith's word now): one bonus more, at the best tier open. Superior (99) pieces are Ancestral. At the
// anvil a made piece keeps its name, Chaos rerolls as many as it had, and it can't be broken down; old crafted pieces get their bonuses once
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const r = await page.evaluate(()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    const out = {}, p = G.player, R = it=>it.aff.filter(a=>!a.imp), pre = it=>R(it).filter(a=>AFFIX_FAM[a.fam] && AFFIX_FAM[a.fam].pre).length;
    /* a real forge at the anvil: Exceptional rune at 99 */
    { skP().skills.smithing = SK_XP[99]; const b = SK_BAR.find(x=>x.tier===5 && !x.jewel); skAdd(b.id, 50); G.inv = []; const rr = Math.random; let it;
      for (let k=0;k<20;k++){ G.inv = []; skForge(b.id, 'chest'); it = G.inv[0]; if (it && !it.inspired) break; }
      out.forge = { nm:it.nm, made:!!it.made, n:R(it).length, sides:pre(it)===1, q:it.quality, cls:rarityColorClass(it), sub:itemSubName(it), ilvl:it.ilvl, want:craftLvl(b.lvl, 99), fams:R(it).every(a=>a.fam && a.t) }; }
    /* Fine: one bonus; low level, low tiers - high level, better ones */
    { const fine = rsForgeQuality(rsMakeArmour('metal', 0, 'legs'), 1, 1); out.fine = { nm:fine.nm, n:R(fine).length, ilvl:fine.ilvl };
      const avgT = (lvl, L)=>{ let t = 0, n = 0; for (let i=0;i<300;i++){ const it = rsForgeQuality(rsMakeArmour('metal', 5, 'chest'), L, lvl); for (const a of R(it)){ const F = AFFIX_FAM[a.fam]; t += (F.tiers.length - a.t)/(F.tiers.length - 1); n++; } } return +(t/n).toFixed(2); };
      out.tierLo = avgT(1, 1); out.tierHi = avgT(85, 99); }
    /* Inspired: one more, at the best tier open */
    { const it = rsForgeQuality(rsMakeArmour('metal', 5, 'chest'), 99, 85), rr = Math.random; let ok;
      Math.random = ()=>0.001; try{ ok = crMaybeMasterwork(it, 99, 85, 'smithing'); } finally { Math.random = rr; }
      const a = R(it)[R(it).length - 1], F = AFFIX_FAM[a.fam]; out.inspired = { ok, nm:it.nm, n:R(it).length, top:a.t===F.tiers.length - afTierMax(F, it.ilvl), cls:rarityColorClass(it), mwName:/Masterwork/.test(it.nm) }; }
    /* Superior: Ancestral */
    { let anyG = 0, tops = true, it; for (let k=0;k<30;k++){ it = rsCraftQuality(crSuperior(rsMakeArmour('hide', 6, 'chest')), 99, 99); for (const a of R(it)){ if (a.g) anyG++; if (a.t > afTopTiers(AFFIX_FAM[a.fam])) tops = false; } }
      out.sup = { anc:!!it.anc, ilvl:it.ilvl, n:R(it).length, tops, anyG, sub:itemSubName(it), nm:it.nm }; }
    /* the price is what a made piece was worth */
    { const it = rsForgeQuality(rsMakeArmour('metal', 5, 'chest'), 99, 85), base = rsMakeArmour('metal', 5, 'chest'); out.price = +(itemPrice(it)/itemPrice(base)).toFixed(2); }
    /* the anvil */
    { for (const e of ESSENCES) skAdd(e[0], 20); const it = rsForgeQuality(rsMakeArmour('metal', 5, 'chest'), 99, 85), nm = it.nm, n0 = R(it).length; G.inv = [it];
      enchChaos(it); out.chaos = { nm:it.nm===nm, n:R(it).length===n0, made:!!it.made };
      enchBlood(it); out.blood = { nm:it.nm===nm, n:R(it).length===n0 + 1, cls:rarityColorClass(it) };
      enchBreak(it); out.brk = G.inv.length===1;
      ENCH.sel = it; setUi('blacksmith'); out.brkBtn = /break down/.test(document.getElementById('overlay').textContent); setUi('playing'); }
    /* an old crafted piece: Masterwork -> Inspired, its bonuses rolled once */
    { const mk = (nm, pct, mw)=>{ const it = rsMakeArmour('metal', 4, 'chest'); it.nm = nm; it.forgedPct = pct; it.forgedBy = 'you'; it.quality = 2; if (mw) it.masterwork = '+8 attack'; it.rsLootV = 2; return it; };
      const a = mk('Masterwork Adamant Platebody', 30, 1), b = mk('Fine Adamant Platebody', 18), c = mk('Exceptional Adamant Platebody', 30);
      G.inv = [a, b, c]; rsMigrateAll(); out.old = { a:[a.nm, R(a).length, a.quality, !!a.made], b:[R(b).length, b.quality], c:[R(c).length, c.quality] };
      const n = R(a).length; rsMigrateAll(); out.oldOnce = R(a).length===n; }
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: ' + m + ' ' + JSON.stringify(r)); };
  A(/^Exceptional /.test(r.forge.nm) && r.forge.made && r.forge.n===2 && r.forge.sides && r.forge.fams && r.forge.q===1, 'an Exceptional forge rolls two bonuses, a prefix and a suffix');
  A(r.forge.cls==='qCraft' && /^crafted /.test(r.forge.sub) && r.forge.ilvl >= r.forge.want && r.forge.ilvl <= r.forge.want + 12, 'a made piece: its own colour, crafted under its name, its level from its bar and your skill (and the smithing perk)');
  A(/^Fine /.test(r.fine.nm) && r.fine.n===1, 'a Fine piece rolls one');
  A(r.tierHi > r.tierLo + 0.25, 'a better smith on a better bar rolls better tiers: ' + r.tierLo + ' -> ' + r.tierHi);
  A(r.inspired.ok && /^Inspired /.test(r.inspired.nm) && !r.inspired.mwName && r.inspired.n===3 && r.inspired.top && r.inspired.cls==='qCraft', 'Inspired: one bonus more, at the best tier');
  A(r.sup.anc && r.sup.ilvl===126 && r.sup.n===2 && r.sup.tops && r.sup.anyG > 0 && /^ancestral crafted/.test(r.sup.sub), 'Superior pieces are Ancestral');
  A(r.price >= 2.4 && r.price <= 3.6, 'priced as a made piece was: ' + r.price);
  A(r.chaos.nm && r.chaos.n && r.chaos.made && r.blood.nm && r.blood.n && r.blood.cls==='qCraft' && r.brk && !r.brkBtn, 'the anvil: keeps its name and count, Blood adds one, no breaking down');
  A(r.old.a[0]==='Inspired Adamant Platebody' && r.old.a[1]===3 && r.old.a[3] && r.old.b[0]===1 && r.old.c[0]===2 && r.oldOnce, 'old crafted pieces get their bonuses, once: ' + JSON.stringify(r.old));
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
