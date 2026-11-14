// RS-827: the sea is as dangerous whichever boat you take. Pirates and monsters go by the best boat you've built, not the one you chose, and a rowboat is attacked too: her hull shows, she can be patched and sunk, she has no guns to answer with. Shot: rs827_row.png.
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const A = (c, m, d)=>{ if (!c) throw new Error(m + ' :: ' + JSON.stringify(d)); };
  const r = await page.evaluate(async ()=>{ const w = ms=>new Promise(res=>setTimeout(res, ms)), until = async (fn, ms)=>{ const t0 = performance.now(); while (!fn() && performance.now() - t0 < ms) await w(20); return !!fn(); };
    window.__noLock = true; goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; weatherSync = ()=>{}; const p = G.player, o = {}; p.hasBoat = 1; p.boatTier = 4; p.boatUse = 1; p.clock = DAY_LENGTH*0.4; G.gameMode = 0; p.gold = 1000; moveOverworldEncounters = ()=>{}; checkOverworldEncounterTrigger = ()=>{}; wevStep = ()=>false; wgStep = ()=>false; sqWorldStep = ()=>false; questOverworldTurn = ()=>false; checkMythicBeastTrigger = ()=>false; iceAt = ()=>false; cbLvl = ()=>60;
    let sp = null; seaOpenWater = ()=>true; for (let x=10;x<OW_COLS-10 && !sp;x++) for (let y=10;y<OW_ROWS-10 && !sp;y++){ let all = true; for (let i=-8;i<=8 && all;i++) for (let j=-8;j<=8;j++) if (G.ow.map[x + i][y + j]!==OW_WATER || owFresh(x + i, y + j) || o3YardNudge(x + i, y + j)){ all = false; break; } if (all) sp = { x, y }; } if (!sp) return { nosea:true }; G.owPos = sp; owReveal(sp.x, sp.y, 8); O3.ppos = null; window.__noPirates = true; await until(()=>seaOn() && O3.ship && O3.ship.t===1, 20000); await w(400); const clearF = ()=>{ seaFightClear(); };
    /* what the sea picks, by the best boat */ const mr = Math.random; Math.random = ()=>0; o.pick = seaBeastPick(); Math.random = mr; const tiers = new Set(); for (let i=0;i<30;i++){ const f = seaPirateSpawn(null, [O3.ppos.x + 30, O3.ppos.z + 30], true); if (f){ tiers.add(f.t); } clearF(); } o.tiers = [...tiers];
    const hp = async tier=>{ p.boatUse = tier; const f = seaBeastSpawn('serpent', [O3.ppos.x + 30, O3.ppos.z], true); const k = f && f.max/((0.7 + f.L/126)); clearF(); return Math.round(k); }; o.hpRow = await hp(1); o.hpGal = await hp(4); p.boatUse = 1;
    /* a rowboat's own: she's attacked on the way */ window.__noPirates = false; const chn0 = chn; chn = ()=>true; p.seaSince = 9999; p.beastSince = 0; p.whaleSince = 0; seaSailedTile(); o.pirateCame = seaF().foes.filter(f=>!f.dead).length; o.whale = !!seaF().wh; clearF(); p.seaSince = 0; p.beastSince = 9999; seaSailedTile(); o.beastCame = seaF().foes.filter(f=>!f.dead).length; clearF(); chn = chn0; window.__noPirates = true;
    /* the panel */ await w(300); seaHudSync(); const E = document.getElementById('seaHudF'), vis = id=>{ const q = document.getElementById(id); return !!q && q.style.display!=='none' && q.offsetParent!==null; }; o.hud = { f:E.style.display, hull:vis('seaHudHull'), L:vis('seaFireL'), R:vis('seaFireR'), rep:vis('seaRepBtn'), info:document.getElementById('seaHudI').textContent };
    /* patching her */ skAdd('plank', 10); p.hull = 10; o.keyO = seaKey('o'); o.rep0 = seaF().rep; await w(1700); o.hullPatched = p.hull; const F = seaF(); F.rep = false; o.keyQ = seaKey('q'); p.hull = hullMax();
    return o; });
  console.log(JSON.stringify(r)); if (r.nosea) return console.log('no open sea in this world');
  /* a real pirate comes, and she's sunk */
  await page.evaluate(()=>{ const pp = O3.ppos; G.player.crew = 0; seaPirateSpawn(3, [pp.x + 4, pp.z + 2]); }); await page.waitForTimeout(1200); await page.screenshot({ path:SHOTS + '/rs827_row.png' });
  const r2 = await page.evaluate(async ()=>{ const w = ms=>new Promise(res=>setTimeout(res, ms)), until = async (fn, ms)=>{ const t0 = performance.now(); while (!fn() && performance.now() - t0 < ms) await w(20); return !!fn(); }, p = G.player, o = {}; const tPir = performance.now(); o.hit = await until(()=>p.hull < hullMax(), 40000); o.pirHit = Math.round((performance.now() - tPir)/100)/10; o.hullHit = p.hull; const gold0 = p.gold; o.sunk = await until(()=>seaF().sinking, 60000); o.sinkS = Math.round((performance.now() - tPir)/100)/10; o.washed = await until(()=>!seaF().sinking, 8000); await w(300); o.gold = [gold0, p.gold]; o.ashore = G.ow.map[G.owPos.x][G.owPos.y]!==OW_WATER; o.hullAfter = p.hull; o.max = hullMax();
    return o; });
  console.log(JSON.stringify(r2)); Object.assign(r, r2);
  A(r.pick==='kraken', 'with a galleon built, the Kraken comes for you in a rowboat too', r);
  A(r.tiers.every(t=>t >= 3) && r.tiers.length >= 1, "pirates go by your best boat, not the one you chose", r.tiers);
  A(Math.abs(r.hpRow - r.hpGal) <= 2, 'a monster is as tough whichever boat you sail', [r.hpRow, r.hpGal]);
  A(r.pirateCame >= 1 && r.beastCame >= 1 && !r.whale, 'a rowboat is attacked; whales still need a bigger boat', r);
  A(r.hud.f!=='none' && r.hud.hull && !r.hud.L && !r.hud.R && r.hud.rep && !/shot/.test(r.hud.info), 'the panel shows her hull and repair, and no guns', r.hud);
  A(r.keyO && r.rep0 && r.hullPatched > 10 && !r.keyQ, 'planks patch her; there is nothing to fire', r);
  A(r.hit && r.sunk && r.washed && r.ashore && r.gold[1] < r.gold[0], 'a pirate can sink her, and you wash ashore poorer', r);
  /* best boat a rowboat: the smallest pirates, no Kraken */
  const b = await page.evaluate(()=>{ const p = G.player; p.boatTier = 1; p.boatUse = null; const mr = Math.random; Math.random = ()=>0; const pick = seaBeastPick(); Math.random = mr; return { pick }; });
  A(b.pick!=='kraken', 'someone who has only built a rowboat meets no Kraken', b);
  A(!errs.length, 'page errors', errs);
};
