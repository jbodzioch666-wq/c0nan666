// RS-250: the half-orc after Bakshi's orcs - broad, hunched shoulders and long arms, a heavy brow, a flat nose, a jutting
// underbite with tusks, swept-back ears, amber eyes, shaggy black hair and dark rags; the orcish townsfolk match
module.exports = async page=>{
  const r = await page.evaluate(()=>{
    const out = {};
    const mk = nm=>{ goToCharCreate(); G.ccLookTouched = false; ccSelectRace(RACES.findIndex(r=>r[0]===nm)); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); o3Pref = false; try{ v3Pref = false; }catch(e){} };
    const build = ()=>{ for (const sl of ['head','chest','legs','arms','feet']) G.gear[sl] = newItem(); const pt = rsPlayerLook(), e = m3dInstance({}, pt), [R] = e.rig.arms; return { o:pt.o, shX:Math.abs(R.sh.position.x), stoop:e.rig.stoop||0, neckZ:e.rig.neck.position.z }; };
    mk('Human'); const hu = build();
    mk('Half-Orc'); const ho = build();
    out.ho = { head:ho.o.head, outfit:ho.o.outfit, brow:ho.o.heavyBrow, nose:ho.o.flatNose, jaw:ho.o.underbite, ears:ho.o.orcEars, tusks:ho.o.tusks, iris:ho.o.iris, hair:ho.o.hairStyle, broad:ho.o.broad, arms:ho.o.limbLen, legs:ho.o.legLen, shX:ho.shX, stoop:ho.stoop, neckZ:ho.neckZ };
    out.hu = { shX:hu.shX, stoop:hu.stoop, neckZ:hu.neckZ };
    G.villageRace = 'orc'; const f = v3RaceDress(v3VillagerLook(2), 2); out.folk = { jaw:!!f.o.underbite, broad:f.o.broad, outfit:f.o.outfit };
    return out; });
  const A = (c, m)=>{ if (!c) throw new Error(m+' :: '+JSON.stringify(r)); };
  A(r.ho.head==='orc' && r.ho.brow && r.ho.nose && r.ho.jaw && r.ho.ears && r.ho.tusks >= 1 && r.ho.iris==='#c8901a' && r.ho.hair, 'the half-orc face');
  A(r.ho.outfit==='rags', 'out of armour, ragged clothes');
  A(r.ho.broad > 1.05 && r.ho.arms > r.ho.legs && r.ho.shX > r.hu.shX && r.ho.stoop > 0 && r.ho.neckZ > r.hu.neckZ, 'broad, hunched, long in the arm');
  A(r.folk.jaw && r.folk.broad > 1.05 && r.folk.outfit!=='shirt', 'the orcish townsfolk match');
  console.log('halforc ok');
};
