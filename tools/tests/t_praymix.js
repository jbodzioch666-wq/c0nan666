// RS-306/307: which prayers go together. A ranged or magic prayer only clashes with the melee boosts (attack, strength) and with each
// other; it used to switch off everything else - Rock Skin, Rapid Heal, Protect Item, the protections - when it went on
module.exports = async page=>{
  const r = await page.evaluate(()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing');
    const p = G.player; p.skills.prayer = SK_XP[99]; rsSync(); renderGame = ()=>{}; renderOverlay = ()=>{}; saveCurrentGame = ()=>{}; sfx = ()=>{};   /* (quicker without a redraw and a save on every toggle) */
    const both = (a, b)=>{ p.prayers = []; p.prayPts = rsLvl('prayer'); rsTogglePrayer(a); rsTogglePrayer(b); return p.prayers.includes(a) && p.prayers.includes(b); };
    const ok = [['will','rock'],['rock','will'],['will','thick'],['will','steel'],['will','heal'],['will','protitem'],['will','pmag'],['sharp','rock'],['hawk','prng'],['might','redemp'],
      ['cot','bos'],['impr','sup'],['rock','bos'],['rock','cot'],['steel','incr'],['pmel','ult'],['piety','heal'],['piety','pmel'],['augury','protitem'],['rigour','prng']];
    const clash = [['will','sharp'],['will','cot'],['will','bos'],['sharp','impr'],['sharp','ult'],['rock','thick'],['steel','rock'],['pmag','pmel'],['piety','rock'],['piety','cot'],
      ['augury','will'],['rigour','hawk'],['will','lore']];
    const out = { okBad:ok.filter(([a,b])=>!both(a,b)), clashBad:clash.filter(([a,b])=>both(a,b)) };
    /* (RS-307) the Ancient Curses, as in RuneScape: the Saps all together, the Leeches all together, but a Leech switches off the Saps and
       Turmoil switches off both; a Deflect replaces another; Soul Split and Protect Item go with anything */
    p.prayBook = 'curses';
    const cOk = [['sapw','sapr'],['sapr','sapm'],['latt','lrng'],['lmag','lstr'],['ldef','latt'],['soul','dmel'],['soul','latt'],['cprotitem','turmoil'],['turmoil','dmag'],['turmoil','soul'],['sapw','dmel'],['ldef','drng']];
    const cClash = [['sapw','latt'],['ldef','sapr'],['sapm','lmag'],['turmoil','sapw'],['sapr','turmoil'],['turmoil','latt'],['lstr','turmoil'],['dmag','dmel'],['drng','dmag']];
    out.cOkBad = cOk.filter(([a,b])=>!both(a,b)); out.cClashBad = cClash.filter(([a,b])=>both(a,b));
    /* a prayer from the other book - on a quick-bar slot from before the change - won't turn on */
    p.prayers = []; p.prayPts = rsLvl('prayer'); rsTogglePrayer('latt'); qbSlots(0)[0] = { t:'prayer', id:'will' }; qbUse(0, 0); out.mixed = p.prayers.slice();
    return out; });
  const A = (c, m)=>{ if (!c) throw new Error(m+' :: '+JSON.stringify(r)); };
  A(!r.okBad.length, 'these prayers go together');
  A(!r.clashBad.length, 'these prayers still replace each other');
  A(!r.cOkBad.length, 'these curses go together'); A(!r.cClashBad.length, 'these curses replace each other');
  A(r.mixed.join()==='latt', 'a prayer from the other book stays off: '+r.mixed);
  console.log(JSON.stringify(r));
};
