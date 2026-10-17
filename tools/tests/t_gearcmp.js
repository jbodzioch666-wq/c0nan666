// RS-239: upgrade or downgrade is judged against what you fight with - plate is no "upgrade" over the robes of someone
// fighting with a staff (it's a different style, and isn't swept up as junk), better robes are; and the other way round
module.exports = async page=>{
  const ev = (f, a)=>page.evaluate(f, a), A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
  const R = await ev(()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); o3Pref = false; try{ v3Pref = false; }catch(e){}
    for (const k of ['attack','strength','defence','ranged','magic']) G.player.skills[k] = SK_XP[80]; rsSync();
    const tip = it=>{ const h = itemCompareTooltipHtml(it); return /different style/.test(h) ? 'style' : />upgrade</.test(h) ? 'up' : />downgrade</.test(h) ? 'down' : 'side'; };
    const out = {};
    // a mage: staff and robes
    G.gear.weapon = rsMakeStaff(1); G.gear.chest = rsMakeArmour('cloth', 2, 'chest');
    const plate = rsMakeArmour('metal', 6, 'chest'), robeHi = rsMakeArmour('cloth', 4, 'chest'), robeLo = rsMakeArmour('cloth', 0, 'chest');
    out.mage = { plate:[lootArrow(plate), tip(plate)], robeHi:[lootArrow(robeHi), tip(robeHi)], robeLo:[lootArrow(robeLo), tip(robeLo)], style:playerGearStyle(G.gear.chest) };
    // a fighter: sword and plate
    G.gear.weapon = rsMakeWeapon(3, 3); G.gear.chest = rsMakeArmour('metal', 2, 'chest');
    const robe = rsMakeArmour('cloth', 4, 'chest'), plateHi = rsMakeArmour('metal', 5, 'chest'), staff = rsMakeStaff(1);
    out.fighter = { robe:[lootArrow(robe), tip(robe)], plateHi:[lootArrow(plateHi), tip(plateHi)], staff:[lootArrow(staff), tip(staff)], style:playerGearStyle(G.gear.chest) };
    return out; });
  const M = R.mage, F = R.fighter;
  A(M.style==='magic' && M.plate[0]==='' && M.plate[1]==='style', 'plate is no upgrade over a mage\'s robes: '+JSON.stringify(R));
  A(M.robeHi[0]==='up' && M.robeHi[1]==='up' && M.robeLo[0]==='down', 'better robes are, worse ones are not: '+JSON.stringify(M));
  A(F.style==='melee' && F.robe[0]==='' && F.robe[1]==='style' && F.staff[1]==='style', 'robes and a staff are a different style to a fighter: '+JSON.stringify(F));
  A(F.plateHi[0]==='up' && F.plateHi[1]==='up', 'better plate is an upgrade to a fighter: '+JSON.stringify(F));
};
