// (probe) a player's own save (env ZI_SAVE; never commit a save): why won't the bow fire where they stand? Prints mode, bow, ammo and each monster's reach, then shoots
const fs = require('fs');
module.exports = async page=>{ page.setDefaultTimeout(0); page.on('pageerror', e=>console.log('PERR', String(e).slice(0, 300)));
  const txt = fs.readFileSync(process.env.ZI_SAVE, 'utf8');
  const r = await page.evaluate(async txt=>{ const wait = ms=>new Promise(res=>setTimeout(res, ms)); window.__noLock = true; const out = { ok:importSaveText(txt) }; const sv = JSON.parse(txt).data; loadGame(sv.id); setUi('playing'); await wait(4000); saveCurrentGame = ()=>{}; const p = G.player; const logs = []; const lm = logMsg; logMsg = function(t, k){ logs.push(String(t).slice(0, 90)); return lm.apply(this, arguments); };
    const snap = ()=>({ pref:rangedPref(), pick:rangedPick(), bowReady:bowReady(), arrows:p.arrows, ammoT:ammoType(), inUse:ammoInUse(G.gear.ranged), kind:rngKind(G.gear.ranged), n:rangedAmmoN(G.gear.ranged), spell:rsCastableSpell() && rsCastableSpell()[0], auto:rsAutocastOn(), range:rangedRange(G.gear.ranged), atk:rsAttackType() });
    Object.assign(out, { mode:G.gameMode, site:G.siteKind, depth:G.depth, p:[p.x, p.y], hp:p.hp, ui:G.ui, down:!!G.playerDown, s0:snap() }); toggleRangedMode(); out.s1 = snap(); out.quiv = quiverList().slice(0, 6);
    out.mons = (G.mon||[]).filter(m=>m.alive).map(m=>({ nm:m.nm, x:m.x, y:m.y, d:Math.abs(m.x-p.x)+Math.abs(m.y-p.y), reach:rangedReachIdx(m), clear:shotClear(p.x, p.y, m.x, m.y) })).sort((a,b)=>a.d-b.d).slice(0, 10);
    const a0 = p.arrows; const m = (G.mon||[]).filter(m=>m.alive).sort((a,b)=>(Math.abs(a.x-p.x)+Math.abs(a.y-p.y))-(Math.abs(b.x-p.x)+Math.abs(b.y-p.y)))[0];
    if (m){ for (const f of [m]){ const reach = rangedReachIdx(f); out.first = { nm:f.nm, reach }; rangedAttack0(f); await wait(500); } } out.arrowsAfter = p.arrows; out.spent = a0 - p.arrows; out.logs = logs.slice(-12); return out; }, txt);
  console.log(JSON.stringify(r, null, 0)); };
