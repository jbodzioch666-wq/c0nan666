// RS-748: monsters for the loot system's gear. By the old tier a monster gains life, damage, accuracy and xp (monLootK, MON_LOOT): none
// at the bottom, most in the middle levels (+80% life at tier 7), less at the top (+25% life, no extra damage at tier 20). Every
// monster built from the bestiary (monEntryExtras) takes it once; a boss (built from your own damage) doesn't.
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const ev = (f, a)=>page.evaluate(f, a), A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
  const r = await ev(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; o3Pref = false; try{ v3Pref = false; }catch(e){}
    const k = t=>{ const o = monLootK(t); return [+o.hp.toFixed(2), +o.dmg.toFixed(2), o.acc, +o.xp.toFixed(2)]; };
    const out = { k3:k(3), k7:k(7), k10:k(10), k20:k(20) };
    /* the same monster built with and without the scale */
    const build = (cb, on)=>{ const keep = MON_LOOT; if (!on) MON_LOOT = { hp:[], dmg:[], acc:[], xp:[] }; const rr = Math.random; Math.random = ()=>0.5;
      try{ const entry = pickMonsterEntry(cb, 0), m = newMonster(); m.alive = 1; m.hp = m.maxHp = rollDice(entry.hd, 8) + entry.hd; m.ac = entry.ac; m.atkBonus = entry.atk;
        m.dmg1 = entry.dmg1; m.dmg2 = entry.dmg2; m.xp = entry.xp; m.nm = entry.nm; m.mlevel = entry.lvl; m.abilities = entry.abilities.slice(); monEntryExtras(m, entry);
        return { hp:m.maxHp, dmg:m.dmg2, acc:m.atkBonus, xp:m.xp, lk:!!m._lk }; } finally { Math.random = rr; MON_LOOT = keep; } };
    for (const cb of [10, 50, 120]){ const a = build(cb, false), b = build(cb, true); out['cb' + cb] = { off:a, on:b, hpX:+(b.hp/a.hp).toFixed(2), xpX:+(b.xp/a.xp).toFixed(2) }; }
    /* applied once only */
    { const m = { cb:50, maxHp:100, hp:100, dmg2:10, atkBonus:5, xp:10 }; monLootScale(m); const h1 = m.maxHp; monLootScale(m); out.once = h1===m.maxHp && h1 > 100; }
    /* the monsters of a real fight carry it */
    G.gameMode = 2; generateArena(); out.arena = G.mon.length && G.mon.every(m=>m._lk);
    return out; });
  console.log(JSON.stringify(r));
  A(r.k3.join()==='1,1,0,1', 'nothing at the bottom: ' + JSON.stringify(r.k3));
  A(r.k7[0]===1.8 && r.k7[1]===1.25 && r.k7[2]===2 && r.k7[3]===1.6, 'most in the middle: ' + JSON.stringify(r.k7));
  A(r.k20[0]===1.25 && r.k20[1]===1 && r.k20[2]===0, 'less at the top: ' + JSON.stringify(r.k20));
  A(r.cb10.hpX===1 && r.cb50.hpX >= 1.6 && r.cb50.on.lk && r.cb120.hpX >= 1.15 && r.cb120.hpX <= 1.35, 'monsters built from the bestiary take it: ' + JSON.stringify(r));
  A(r.cb50.xpX > 1.3 && r.cb50.on.dmg >= r.cb50.off.dmg && r.cb50.on.acc > r.cb50.off.acc, 'xp, damage and aim with it: ' + JSON.stringify(r.cb50));
  A(r.once, 'applied once only: ' + JSON.stringify(r));
  A(r.arena, "a fight's monsters carry it: " + JSON.stringify(r));
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
