// RS-202: a better craft always has better stats - Fine beats the plain piece, Exceptional beats Fine, and a higher level beats
// both, even on small numbers like a pair of boots; and every step of the smith's reinforcing adds something
module.exports = async page=>{
  const r = await page.evaluate(()=>{
    const A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); }, out = {};
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing');
    for (const [fam, t, sl] of [['cloth',1,'feet'],['cloth',1,'head'],['hide',2,'arms'],['metal',1,'feet'],['metal',4,'chest']]){
      const base = rsMakeArmour(fam, t, sl), lvl = 20, mk = L=>rsForgeQuality(rsMakeArmour(fam, t, sl), L, lvl);
      const fine = mk(lvl), exc = mk(lvl + 10), top = mk(lvl + 40);
      A(/^Fine/.test(fine.nm) && /^Exceptional/.test(exc.nm), 'names');
      for (const k of ['ac','magAcc','rngAcc']) if ((base[k]||0) > 0){ out[fam+t+sl+k] = [base[k], fine[k], exc[k], top[k]];
        A(fine[k] > base[k] && exc[k] > fine[k] && top[k] > exc[k], `${fam} ${t} ${sl} ${k}: ${base[k]} < ${fine[k]} < ${exc[k]} < ${top[k]}`); } }
    // reinforcing small armour: every step adds
    G.player.gold = 1e7; G.gear.feet = rsMakeArmour('metal', 0, 'feet'); const acs = [G.gear.feet.ac];
    for (let i=0;i<5;i++){ const before = G.gear.feet.reinf||0; let tries = 0; while ((G.gear.feet.reinf||0)===before && tries++ < 40) smithReinforce('feet'); acs.push(G.gear.feet.ac); }
    out.reinf = acs; for (let i=1;i<acs.length;i++) A(acs[i] > acs[i-1], 'reinforce step '+i+': '+acs);
    return out;
  });
  console.log(JSON.stringify(r));
};
