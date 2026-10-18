// RS-542: the character creator shows you in your underclothes - no cloak, collar, tunic, hat or boots, the race's own costume
// too - so the build and hair show; linen briefs, and a band round a woman's breasts, cut from the body's own surface so they fit
// any build (and bend with a wood elf's stoop); bare feet with toes. Out of the creator you are dressed as before
const shotlib = require('./shotlib');
module.exports = async page=>{
  const r = await page.evaluate(()=>{ goToCharCreate(); const out = {};
    const spec = lpSpec(); out.undress = !!(spec && spec.undress);
    for (const [race, fem] of [['Human', 0], ['Human', 1], ['Wood Elf', 1], ['Gnome', 0], ['Tiefling', 1]]){
      const L = Object.assign(lookDefault(race), { body:fem }), pt = rsPlayerLook({ race, look:L, bare:true, undress:true }), o = pt.o;
      M3D_SKIN = false; const root = m3dBuilders().get(pt.paint)(o), rig = M3D.meta.get(root).rig; let chestU = 0, pelvU = 0, thighU = 0;
      root.traverse(x=>{ if (x.name!=='under') return; if (x.parent===rig.chestMesh) chestU++; else if (x.parent===rig.pelvisMesh) pelvU++; else thighU++; });
      out[race + fem] = { worn:RS_COSTUME_KEYS.filter(k=>o[k]!=null && o[k]!==false), outfit:o.outfit, feet:o.feet, chestU, pelvU, thighU, cape:!!rig.cape }; }
    { const pt = rsPlayerLook({ race:'Human', look:lookDefault('Human'), bare:true }); out.dressed = { outfit:pt.o.outfit, cape:!!pt.o.cape }; }
    M3D_SKIN = true; if (M3D.tpl) M3D.tpl.clear();
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.undress, 'the creator asks for you undressed');
  for (const k of ['Human0', 'Human1', 'Wood Elf1', 'Gnome0', 'Tiefling1']){ const q = r[k];
    A(q.worn.length === 0 && q.outfit === 'none' && !q.cape, k + ': nothing worn - ' + q.worn.join(','));
    A(q.pelvU === 1 && q.thighU === 2, k + ': briefs over the hips and the tops of the thighs');
    A(q.chestU === (k.endsWith('1') ? 1 : 0), k + ': a band round her breasts (and none on a man)'); }
  A(r.dressed.outfit !== 'none' && r.dressed.cape, 'out of the creator, dressed as before');
  /* the creator itself, as it draws */
  await page.waitForTimeout(2500);
  const cv = await page.$('canvas'); if (cv){ const f = require('path').join(global.SHOTS, 'rs542_creator.png'); await page.screenshot({ path:f }); }
};
