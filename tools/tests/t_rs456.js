// RS-456: a unique piece of armour is made of what its name or strongest stat says - magic is cloth, ranged hide, the rest metal - so the
// Visage of the Sage is a wizard's hat (it came out a steel full helm), with its own look; and an old one in a save is put right as it loads
module.exports = async page=>{
  const r = await page.evaluate(()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing');
    const out = {}, ids = {}; UNIQUES.forEach((u, i)=>ids[u[0]] = i + 1);
    const v = buildUnique(ids['Visage of the Sage'], 40); out.visage = [v.rsFam, v.basis, !!v.reqMag, !v.reqDef];
    const g = buildUnique(ids['Grasp of the Ogre'], 40); out.grasp = g.rsFam;
    const old = buildUnique(ids['Visage of the Sage'], 40); Object.assign(old, { rsFam:'metal', basis:'Full Helm', reqDef:old.reqMag }); delete old.reqMag; G.inv = [old]; rsMigrateAll(); out.migrated = [old.rsFam, old.basis, !!old.reqMag];
    G.gear.head = v; rsSync && rsSync(); const o = rsPlayerLook().o; out.look = [o.helm, !!o.sageHat];
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.visage[0]==='cloth' && r.visage[1]==='Hat' && r.visage[2] && r.visage[3], 'the Visage of the Sage is a cloth hat that asks for Magic');
  A(r.grasp==='metal', 'a strength piece stays metal');
  A(r.migrated[0]==='cloth' && r.migrated[1]==='Hat' && r.migrated[2], 'an old metal Visage becomes a hat as it loads');
  A(r.look[0]==='wizard' && r.look[1], 'worn, it\'s a wizard\'s hat with the sage\'s own look');
};
