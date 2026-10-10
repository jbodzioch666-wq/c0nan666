// RS-306: which prayers go together. A ranged or magic prayer only clashes with the melee boosts (attack, strength) and with each
// other; it used to switch off everything else - Rock Skin, Rapid Heal, Protect Item, the protections - when it went on
module.exports = async page=>{
  const r = await page.evaluate(()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing');
    const p = G.player; p.skills.prayer = SK_XP[99]; rsSync();
    const both = (a, b)=>{ p.prayers = []; p.prayPts = rsLvl('prayer'); rsTogglePrayer(a); rsTogglePrayer(b); return p.prayers.includes(a) && p.prayers.includes(b); };
    const ok = [['will','rock'],['rock','will'],['will','thick'],['will','steel'],['will','heal'],['will','protitem'],['will','pmag'],['sharp','rock'],['hawk','prng'],['might','redemp'],
      ['cot','bos'],['impr','sup'],['rock','bos'],['rock','cot'],['steel','incr'],['pmel','ult'],['piety','heal'],['piety','pmel'],['augury','protitem'],['rigour','prng']];
    const clash = [['will','sharp'],['will','cot'],['will','bos'],['sharp','impr'],['sharp','ult'],['rock','thick'],['steel','rock'],['pmag','pmel'],['piety','rock'],['piety','cot'],
      ['augury','will'],['rigour','hawk'],['will','lore']];
    const out = { okBad:ok.filter(([a,b])=>!both(a,b)), clashBad:clash.filter(([a,b])=>both(a,b)) };
    return out; });
  const A = (c, m)=>{ if (!c) throw new Error(m+' :: '+JSON.stringify(r)); };
  A(!r.okBad.length, 'these prayers go together');
  A(!r.clashBad.length, 'these prayers still replace each other');
  console.log(JSON.stringify(r));
};
