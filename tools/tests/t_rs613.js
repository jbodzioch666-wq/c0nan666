// RS-613: the Serpentskin Shroud is a robe of snake's skin - overlapping scales with a chain of dark-edged diamonds over them, across
// the skirt, the chest and the sleeves alike, a little glossier than wool, edged in green unless its trim is dyed. Other robes keep their weave
module.exports = async page=>{
  page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 200)));
  const r = await page.evaluate(async ()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); const out = {};
    const id = UNIQUES.findIndex(u=>u[0]==='Serpentskin Shroud') + 1; const it = buildUnique(id, 40); it.used = true; it.dye = '#e8e4d8'; G.gear.chest = it;
    const L = rsPlayerLook(); out.pat = L.o.robePat; out.outfit = L.o.outfit; out.trim = L.o.robeTrim;
    const e = m3dInstance({}, L), sk = e.rig.skirt, m = sk.material, sp = m3dPattern('serpent'); out.skirt = !!(m.map && m.map.image===sp.map.image); out.nrm = !!(m.normalMap && m.normalMap.image===sp.nrm.image); out.rough = m.roughness; out.chest = e.rig.chestMesh.material===m;
    it.trimDye = '#101010'; out.trimDyed = rsPlayerLook().o.robeTrim;
    G.gear.chest = rsMakeArmour('cloth', 2, 'chest'); G.gear.chest.used = true; const L2 = rsPlayerLook(); out.plain = L2.o.robePat || null; const e2 = m3dInstance({}, L2); out.plainMap = !!(e2.rig.skirt.material.map && e2.rig.skirt.material.map.image===sp.map.image);
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.outfit==='robe' && r.pat==='serpent', 'the Shroud a robe of snake\'s skin');
  A(r.skirt && r.nrm && r.chest, 'its scales on the skirt and the chest in one cloth');
  A(r.rough < 0.7, 'a little glossier than wool');
  A(r.trim==='#3c6a38' && r.trimDyed==='#101010', 'edged in green, or the trim you dyed it');
  A(!r.plain && !r.plainMap, 'other robes keep their weave');
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
