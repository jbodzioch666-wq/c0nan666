// RS-509: the robe is one piece to the ankles - its skirt, hem runes and trim its own, over any legs (plate too) - and what was the
// robe bottom is trousers. Old saves' pieces are renamed where they lie: "Mystic Robe Top" is a "Mystic Robe", "Mystic Robe
// Bottom" is "Mystic Trousers", a monk's and a holy vestment's likewise; stats untouched
module.exports = async page=>{
  const r = await page.evaluate(()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    const out = {}, lk = ()=>rsPlayerLook().o;
    out.names = [rsMakeArmour('cloth', 2, 'chest').nm, rsMakeArmour('cloth', 2, 'legs').nm, rsMakeHolyRobe('chest', 10).nm, rsMakeHolyRobe('legs', 70).nm];
    /* an old save's pieces */
    const oldTop = Object.assign(rsMakeArmour('cloth', 2, 'chest'), { nm:'Mystic Robe Top', basis:'Robe Top' }), oldBot = Object.assign(rsMakeArmour('cloth', 2, 'legs'), { nm:'Mystic Robe Bottom', basis:'Robe Bottom' });
    const monkB = Object.assign(rsMakeHolyRobe('legs', 10), { nm:"Monk's Robe Bottom", basis:'Robe Bottom' }), holyT = Object.assign(rsMakeHolyRobe('chest', 70), { nm:'Holy Vestment Top', basis:'Robe Top' });
    const ac0 = oldTop.ac; G.gear.chest = oldTop; G.inv = [oldBot, monkB, holyT]; rsMigrateAll();
    out.renamed = [G.gear.chest.nm, G.inv[0].nm, G.inv[1].nm, G.inv[2].nm]; out.statsKept = G.gear.chest.ac===ac0;
    /* the robe, its hem and runes, over plate legs */
    G.gear.chest = rsMakeArmour('cloth', 3, 'chest'); G.gear.legs = rsMakeArmour('metal', 3, 'legs');
    const e = m3dInstance({}, rsPlayerLook()); out.skirtOverPlate = !!e.rig.skirt; out.hemRunes = !!e.rig.skirt && e.rig.skirt.children.some(c=>c.userData && c.userData.hemLayer); out.robe = !!e.rig.robe;
    G.gear.chest = newItem(); G.gear.legs = rsMakeArmour('cloth', 3, 'legs'); out.trousersSkirt = !!m3dInstance({}, rsPlayerLook()).rig.skirt;
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.names[0]==='Mystic Robe' && r.names[1]==='Mystic Trousers' && r.names[2]==="Monk's Robe" && r.names[3]==='Holy Vestment Trousers', 'the pieces are a robe and trousers');
  A(r.renamed[0]==='Mystic Robe' && r.renamed[1]==='Mystic Trousers' && r.renamed[2]==="Monk's Trousers" && r.renamed[3]==='Holy Vestment' && r.statsKept, "an old save's pieces renamed, stats kept");
  A(r.robe && r.skirtOverPlate && r.hemRunes, 'the robe reaches the ankles over plate legs, its hem runes with it');
  A(!r.trousersSkirt, 'trousers alone have no skirt');
};
