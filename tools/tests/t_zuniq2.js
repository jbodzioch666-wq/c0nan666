// probe (RS-715, zuniq2): every Unique at levels 30, 60, 90, 126 against rares of its slot and level: the verdict score (itemScoreFor, its style),
// its RuneScape bonuses and its bonuses, and a middling and best-of-30 rare (and Ancestral at 90+)
module.exports = async page=>{
  const r = await page.evaluate(()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); o3Pref = false;
    const out = [];
    for (const L of [30, 60, 90, 126]) for (let id=1; id<=UNIQUES.length; id++){
      const u = buildUnique(id, L); const st = itemStyleOf(u) || 'melee';
      const sc = it=>+(itemScoreFor(it, st) + ((it.slot==='weapon'||it.slot==='ranged') ? 0 : 0)).toFixed(2);
      const rs = it=>['acc','dmgB','ac','rngAcc','magAcc','magDmg','prayB'].filter(k=>afF(it,k)).map(k=>k+':'+afF(it,k)).join(' ');
      const rares = [], ancs = [];
      for (let i=0;i<30;i++){ const x = genItem(L, u.slot, 3); if (x.slot!==u.slot) continue; if ((itemStyleOf(x)||'melee')!==st) continue; afDress(x, L, 2); rares.push(sc(x)); if (L>=90){ const y = genItem(L, u.slot, 3); y.anc = 1; y.ilvl = 126; afDress(y, 126, 2); if ((itemStyleOf(y)||'melee')===st) ancs.push(sc(y)); } }
      rares.sort((a,b)=>a-b); ancs.sort((a,b)=>a-b);
      out.push({ L, nm:u.nm, slot:u.slot, st, base:u.baseMat, s:sc(u), rs:rs(u), aff:u.aff.map((a,j)=>affixText(u,j)).join(' | '), rMed:rares[rares.length>>1], rBest:rares[rares.length-1], n:rares.length, aMed:ancs[ancs.length>>1], aBest:ancs[ancs.length-1], price:itemPrice(u) });
    }
    return out;
  });
  for (const o of r) console.log('U ' + JSON.stringify(o));
};
