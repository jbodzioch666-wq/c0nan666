// RS-462: the D&D ability scores are gone - no STR to CHA on the character sheet or in your save, no score bonuses rolled on gear (an
// awakening weapon rolls a real bonus), and an old piece's score bonus becomes the RuneScape bonus it was worth, as it loads
module.exports = async page=>{
  const r = await page.evaluate(()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    const p = G.player, out = {};
    out.noScores = ['str','dex','con','intel','wis','cha'].every(k=>!(k in p));
    out.table = AFFIXES.filter(a=>DND_STAT_KINDS[a[2]]).length;
    // an old piece in your pack, with Strength, Dexterity, Wisdom and Charisma on it
    const it = rsMakeArmour('metal', 3, 'chest'); const b0 = { dmgB:it.dmgB||0, rngAcc:it.rngAcc||0, acc:it.acc||0, magAcc:it.magAcc||0 };
    it.aff = (it.aff||[]).concat([{kind:'str', i1:2, i2:0, f:0}, {kind:'dex', i1:1, i2:0, f:0}, {kind:'wis', i1:3, i2:0, f:0}, {kind:'cha', i1:4, i2:0, f:0}, {kind:'life', i1:10, i2:0, f:0}]); it.naff = it.aff.length;
    G.inv = [it]; p.str = 14; p.wis = 9; rsMigrateAll();
    out.folded = { dmgB:it.dmgB - b0.dmgB, rngAcc:it.rngAcc - b0.rngAcc, acc:it.acc - b0.acc, magAcc:it.magAcc - b0.magAcc, kinds:it.aff.filter(a=>!a.bi).map(a=>a.kind).join(','), naff:it.aff.filter(a=>!a.bi).length };   /* (RS-706: not its base's own bonus) */
    out.savedGone = !('str' in p) && !('wis' in p);
    // an awakening weapon never rolls one
    let bad = 0; const sw = newItem(); rsFillBase(sw, 60, 'weapon'); for (let i=0;i<200;i++){ sw.aff = []; sw.naff = 0; rollOneAffix(sw, 90, 'w', i%2, []); if (sw.aff.some(a=>DND_STAT_KINDS[a.kind])) bad++; } out.awakenBad = bad;
    // the character sheet
    setUi('charsheet'); const txt = document.body.innerText; out.sheet = /\b(STR|DEX|CON|INT|WIS|CHA)\b/.test(txt); setUi('playing');
    out.snap = Object.keys(fullStatSnapshot()).filter(k=>['str','dex','con','int','wis','cha'].includes(k)).length;
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.noScores, 'a new character has no ability scores');
  A(r.table===0, 'the affix table has no score bonuses');
  A(r.folded.dmgB===8 && r.folded.rngAcc===5 && r.folded.acc===2 && r.folded.magAcc===15, 'an old piece: Strength to strength, Dexterity to ranged and attack, Wisdom to magic');
  A(r.folded.kinds==='life' && r.folded.naff===1, 'its other bonuses kept, the scores (and Charisma) gone');
  A(r.savedGone, 'an old save loses its scores');
  A(r.awakenBad===0, 'an awakening weapon rolls a real bonus');
  A(!r.sheet && r.snap===0, 'the character sheet shows no scores');
};
