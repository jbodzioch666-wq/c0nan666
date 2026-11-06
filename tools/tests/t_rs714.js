// RS-714: the compare tooltip shows prayer, and says what its verdict left out. A magic ring with HP on Kill against the Ring of Saint
// Aurel (prayer +8, defence +3): the swap lists prayer -8; to a fighter it's a downgrade and says magic doesn't help a melee fighter and
// HP on Kill isn't weighed; to a mage the magic counts, so no such line about it
module.exports = async page=>{
  const ev = (f, a)=>page.evaluate(f, a), A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
  const R = await ev(()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); o3Pref = false; try{ v3Pref = false; }catch(e){}
    for (const k of ['attack','strength','defence','ranged','magic','prayer']) G.player.skills[k] = SK_XP[80]; rsSync();
    const aurel = rsItem('ring'); Object.assign(aurel, { nm:'Ring of Saint Aurel', basis:'Ring', prayB:8, ac:3 }); G.gear.ring1 = aurel; G.gear.ring2 = Object.assign(rsItem('ring'), { nm:'Ring of Saint Aurel', basis:'Ring', prayB:8, ac:3 });
    const ring = rsItem('ring'); Object.assign(ring, { nm:'Sapphire Ring of Feasting', basis:'Sapphire Ring', magAcc:6, aff:[{ kind:'magAcc', i1:6, i2:0, f:0, t:7 }, { kind:'healkill', i1:5, i2:0, f:0, t:3 }] });
    const txt = h=>{ const d = document.createElement('div'); d.innerHTML = h; return d.textContent.replace(/\s+/g, ' '); };
    const slot = /Saint Aurel/.test((curEquipFor(ring)||{}).nm||'');
    G.gear.weapon = rsMakeWeapon(3, 3); const fighter = txt(itemCompareTooltipHtml(ring));
    G.gear.weapon = rsMakeStaff(1); const mage = txt(itemCompareTooltipHtml(ring));
    return { slot, fighter, mage }; });
  console.log(JSON.stringify(R));
  A(R.slot, 'the ring is compared with the worn Ring of Saint Aurel');
  A(/prayer\s*\S?8/.test(R.fighter) && /downgrade/.test(R.fighter), 'the swap lists the prayer it loses, and the verdict: ' + R.fighter);
  A(/judged for melee - magic doesn't help a melee fighter\. Not weighed/.test(R.fighter) && /Not weighed: \+5 HP on Kill - judge that yourself/.test(R.fighter), "a fighter is told magic doesn't help, and HP on Kill isn't weighed");
  A(/judged for magic\. Not weighed/.test(R.mage) && !/magic doesn't help/.test(R.mage) && /HP on Kill/.test(R.mage), 'a mage: the magic counts, HP on Kill still noted');
};
