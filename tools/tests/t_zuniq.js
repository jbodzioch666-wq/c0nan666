// (probe, not in ALL) every unique item: whether it can be dyed and whether it has a trim to dye, with its slot, family and tier
module.exports = async page=>{
  const r = await page.evaluate(()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); const out = [];
    for (let id=1; id<=UNIQUES.length; id++){ let it = null; try{ it = buildUnique(id, 40); }catch(e){} if (!it) { out.push([id, UNIQUES[id-1][0], 'no maker']); continue; }
      try{ rsMigrateItem2 && rsMigrateItem2(it); }catch(e){} try{ rsUniqueify && rsUniqueify(it); }catch(e){}
      out.push([id, it.nm, it.slot, it.rsFam||'', it.rsTier||0, it.basis||'', dyeable(it) ? 'dye' : '-', trimmable(it) ? 'trim' : '-', it.offWeapon ? 'offW' : '']); }
    return out; });
  for (const q of r) console.log(q.join(' | '));
};
