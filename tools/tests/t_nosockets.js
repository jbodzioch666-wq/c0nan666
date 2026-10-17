// RS-198: the old socket runes and runewords are gone. An old save's runes are cashed in, sockets come off its gear (a runeword's
// bonuses stay), a quest still asking for those runes asks for a potion, and the quest board never asks for them again.
module.exports = async page=>{
  const r = await page.evaluate(()=>{
    const A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); }, out = {};
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); o3Pref = false; try{ v3Pref = false; }catch(e){}
    for (const nm of ['RUNES','RUNEWORDS','runeColor','socketRuneOnSlot','rollSockets','forgeAddSocket','showRuneTooltip','csSocketHtml']) A(typeof window[nm]==='undefined', nm+' is gone');
    A(!('sockets' in newItem()) && !('runewordName' in newItem()) && !('runes' in G.player), 'new items and players carry no sockets or runes');
    // an old save
    const p = G.player; p.runes = { Ash:2, Void:1 }; const g0 = p.gold;
    const w = rsMakeWeapon(3, 3); w.sockets = ['Ash', null]; w.runewordName = 'Ashen Fang'; w.runewordAffCount = 1; w.aff = [{ k:'dmg', i1:3 }]; w.naff = 1; G.gear.weapon = w;
    const a = rsMakeArmour('metal', 2, 'head'); a.sockets = [null]; G.inv.push(a);
    p.quests = [{ id:'q1', kind:'supply', itemKind:'rune', runeType:'Bone', target:2, progress:0, text:'bring 2 Bone Runes' }];
    rsMigrateAll();
    out.gold = p.gold - g0; A(out.gold===750 && !p.runes, 'runes cashed in: '+out.gold);
    A(!('sockets' in w) && !('runewordName' in w) && w.aff.length===1 && !('sockets' in a), 'sockets gone, the runeword bonus stays');
    const q = p.quests[0]; A(q.itemKind==='potion' && q.potionName===POTIONS[0][0] && !/Rune/.test(q.text), 'the quest asks for a potion now');
    // the board never asks for runes
    let runeQ = 0; for (let i=0;i<400;i++){ const o = legacyQuestOffer('t'+i, 5); if (o.itemKind==='rune' || /Rune/.test(o.text||'')) runeQ++; } A(runeQ===0, 'no rune quests: '+runeQ);
    // the sheet shows no sockets
    setUi('charsheet'); renderOverlay(); A(!document.querySelector('#overlay .socket-pip, #overlay .cs-sock, #overlay .doll-pip-row'), 'no socket marks on the sheet'); setUi('playing');
    return out;
  });
  console.log(JSON.stringify(r));
};
