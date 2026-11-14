// RS-716: Unique rings and amulets have their own jewel and stats. Each (UNIQUE_JEWEL) is the same jewel every time, its stats only
// those its kit leans to, to the level's budget, and none of a random jewel's own bonus; a piece reforged in RS-715 keeps its bonuses
// and only its jewel's stats change; any other Unique from then is left as it is
module.exports = async page=>{
  const ev = (f, a)=>page.evaluate(f, a), A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
  const R = await ev(()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); o3Pref = false; try{ v3Pref = false; }catch(e){}
    const out = { bad:[], tab:[] }, RSK = ['acc','dmgB','ac','rngAcc','magAcc','magDmg','magDmgPct','prayB'];
    for (const id of [10, 11, 12, 14, 15]) for (const L of [30, 90, 126]){
      const J = UNIQUE_JEWEL[id], seen = new Set();
      for (let i=0;i<6;i++){ const u = buildUnique(id, L), keys = RSK.filter(k=>u[k]);
        seen.add(keys.map(k=>k + u[k]).join(' '));
        if (u.baseMat!==J[0]) out.bad.push(`${u.nm}@${L} base ${u.baseMat}`);
        if (keys.some(k=>!J[1][k]) || Object.keys(J[1]).some(k=>!u[k])) out.bad.push(`${u.nm}@${L} stats ${keys}`);
        if (u.aff.some(a=>a.imp) || u.aff.filter(a=>a.u).length!==5 || u.recoil || u.wealth) out.bad.push(`${u.nm}@${L} aff`);
        if (i===0 && L===126) out.tab.push(`${u.nm}: ${keys.map(k=>k + ' ' + u[k]).join(', ')} - melee ${itemScoreFor(u, 'melee').toFixed(1)}`); }
      if (seen.size!==1) out.bad.push(`${id}@${L} varies: ${[...seen].join(' / ')}`);
    }
    /* a ring reforged in RS-715 on a random jewel: its bonuses stay, its jewel's stats are set */
    const o = buildUnique(11, 126); o.uqV = 1; o.magAcc = 79; delete o.ac; delete o.acc; delete o.dmgB; o.baseMat = 'Sapphire Ring'; const kit = JSON.stringify(o.aff);
    afMigrate(o); out.mig = { kit:JSON.stringify(o.aff)===kit, base:o.baseMat, ac:o.ac||0, mag:o.magAcc||0, v:o.uqV };
    const w = buildUnique(1, 126); w.uqV = 1; const snap = x=>JSON.stringify([x.aff, x.baseMat, ...RSK.map(k=>x[k])]), wk = snap(w); afMigrate(w); out.weap = { same:snap(w)===wk, v:w.uqV };
    return out; });
  console.log(JSON.stringify(R));
  A(!R.bad.length, 'each Unique jewel: its own jewel, its own stats, five bonuses, the same every time: ' + R.bad.slice(0, 6).join(' | '));
  A(R.tab.length===5 && R.tab.every(t=>!/melee 0\.0/.test(t)), 'every Unique jewel gives a fighter something: ' + R.tab.join(' | '));
  A(R.mig.kit && R.mig.base==='Diamond Ring' && R.mig.ac > 0 && !R.mig.mag && R.mig.v===UQ_V_OF(), 'a ring from RS-715 keeps its bonuses, takes its jewel: ' + JSON.stringify(R.mig));
  A(R.weap.same && R.weap.v===2, 'a Unique weapon from RS-715 is left as it is');
};
function UQ_V_OF(){ return 2; }
