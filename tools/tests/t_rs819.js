// RS-819: a quiver is worn without a cape behind it, a slung bow rides up between the shoulders, and arrows and bolts obey their Ranged level: too high for you they wait in the quiver. Shots: zbowback probe.
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const A = (c, m, d)=>{ if (!c) throw new Error(m + ' :: ' + JSON.stringify(d)); };
  const r = await page.evaluate(async ()=>{ const ms = t=>new Promise(res=>setTimeout(res, t)); window.__noLock = true; window.__noPirates = true; goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.gameMode = 0; moveOverworldEncounters = ()=>{}; checkOverworldEncounterTrigger = ()=>{}; wevStep = ()=>false; wgStep = ()=>false; sqWorldStep = ()=>false; questOverworldTurn = ()=>false; checkMythicBeastTrigger = ()=>false; const p = G.player;
    /* the figure */ G.gear.ranged = rsMakeBow(2, false); G.gear.weapon = rsItem('weapon'); G.gear.weapon.used = false; const rigOf = async cape=>{ G.gear.cape = rsMakeCape(cape==='Fire Cape' ? 113 : 0, cape); rsSync(); renderGame(); await ms(1500); const g = O3.player.e.rig, it = g.shd && g.shd.items.find(i=>i.o===g.weapon); return { cape:!!g.cape, quiver:!!g.quiver, wk:g.wk, y:it ? it.pos.y : null, wy:g.waistY||0.07 }; }; const qv = await rigOf('Leather Quiver'), cp = await rigOf('Fire Cape');
    /* the ammo */ const real = rsLvl; let L = 1; rsLvl = k=>k==='ranged' ? L : real(k); G.gear.ammo = rsItem('ammo'); G.gear.ammo.used = false; p.arrows = 0; p.ammoStacks = {}; const w = G.gear.ranged, DR = RS_AMMO.findIndex(a=>a[0]==='Dragon Arrows'), BR = 0; const out = {};
    addArrows(30, DR); out.notLoaded = ammoType()===-1 && (p.ammoStacks[DR]===30); out.cannotLoad = loadAmmo(DR)===false && ammoType()===-1; out.notReady = !bowReady(); out.tip = quiverTipHtml(DR).includes('needs Ranged 60');
    addArrows(20, BR); out.bronzeLoaded = ammoType()===BR && p.arrows===20; out.count = rangedAmmoN(w)===20;
    p.arrows = 0; out.emptyPicksLow = !ammoAutoLoad() && ammoType()===BR; p.ammoStacks[1] = 5; out.reloads = ammoAutoLoad() && ammoType()===1 && p.arrows===5 && p.ammoStacks[DR]===30;
    /* an old save with them already loaded */ p.ammoStacks = { [BR]:9 }; const it = rsMakeAmmo(DR); it.qty = 0; G.gear.ammo = it; p.arrows = 40; out.oldUnused = !ammoInUse(w) && rangedAmmoN(w)===0; out.oldSwaps = ammoAutoLoad() && ammoType()===BR && p.arrows===9 && p.ammoStacks[DR]===40; 
    /* at the level they work */ L = 60; out.levelLoad = loadAmmo(DR, true)!==false && ammoType()===DR && p.arrows===40 && ammoInUse(w) && rangedAmmoN(w)===40; L = 1; rsLvl = real; return { qv, cp, out, by:BOW_BACK_Y }; });
  console.log(JSON.stringify(r));
  A(r.qv.quiver && !r.qv.cape, 'a quiver alone: no cape', r.qv);
  A(r.cp.cape && !r.cp.quiver, 'a real cape is still a cape', r.cp);
  A(r.qv.wk==='bow' && r.by >= 0.24 && Math.abs(r.qv.y - (r.by - r.qv.wy)) < 0.12, 'the bow rides high', r.qv);
  for (const k in r.out) A(r.out[k], 'ammo level rule: ' + k, r.out);
  A(!errs.length, 'page errors', errs);
};
