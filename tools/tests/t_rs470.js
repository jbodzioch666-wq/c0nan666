// RS-470: you choose the emblem painted on your metal shields, at the dye works - and each metal you learn (to wear it, or to forge it)
// teaches you another: plain, a cross and a bend from the start (bronze and iron both need Defence 1), then a chevron, a saltire, a sun, a star and a double chevron
module.exports = async page=>{
  const r = await page.evaluate(()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    const p = G.player, out = {}, em = ()=>{ rsSync && rsSync(); const s = rsPlayerLook().o.shield; return s ? s.em || null : null; };
    G.gear.offhand = rsMakeArmour('metal', 2, 'offhand');
    out.start = { tier:emblemTier(), cross:emblemKnown('cross'), bend:emblemKnown('bend'), chevron:emblemKnown('chevron') };
    emblemPick('sun'); out.lockedPick = p.emblem || null;
    emblemPick('cross'); out.cross = em();
    emblemPick('plain'); out.plain = em();
    { const bar = SK_BAR.find(b=>b.tier===2); while (skLvl('smithing') < bar.lvl) skGainXP('smithing', 500); } out.smithSteel = { L:skLvl('smithing'), chevron:emblemKnown('chevron'), saltire:emblemKnown('saltire') };
    skGainXP('defence', 2e5); out.def = { L:rsLvl('defence'), tier:emblemTier(), sun:emblemKnown('sun') };
    emblemPick('sun'); out.sun = em(); G.gear.offhand = rsMakeArmour('metal', 0, 'tower'); out.towerSun = em();
    emblemPick(null); G.gear.offhand = rsMakeArmour('metal', 2, 'offhand'); out.own = em();
    skGainXP('smithing', 1e7); out.smith = { tier:emblemTier(), star:emblemKnown('star'), chev2:emblemKnown('chevron2') };
    setUi('dyeworks'); const html = document.body.innerHTML; out.picker = /SHIELD EMBLEM/.test(html) && /emblemPick\('star'\)/.test(html); setUi('playing');
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.start.tier===1 && r.start.cross && r.start.bend && !r.start.chevron, 'a new character, who can wear iron, knows plain, the cross and the bend');
  A(r.smithSteel.chevron && !r.smithSteel.saltire, 'learning to forge steel teaches the chevron');
  A(r.lockedPick===null, 'an emblem not yet learned cannot be chosen');
  A(r.cross==='cross' && r.plain==='none', 'the chosen emblem is painted on the shield; plain leaves it bare');
  A(r.def.sun && r.sun==='sun' && r.towerSun==='sun', 'learning to wear adamant teaches the sun, on kite and tower alike');
  A(r.own==='cross', "unchosen, a steel shield bears the smith's own cross");
  A(r.smith.star && r.smith.chev2, 'learning to forge rune and dragon teaches the rest');
  A(r.picker, 'the dye works has the picker');
};
