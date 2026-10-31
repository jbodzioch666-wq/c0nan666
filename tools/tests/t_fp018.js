// FP-018: a fight through your eyes runs in real time. A goblin comes for you on its own clock, gliding without a halt, while you
// stand still; its blow winds up first and lands only if you're still within its reach - step away and it finds air; your actions
// give the monsters no turn, and the world's upkeep (poison) ticks on a clock of its own; your blow lands at its contact on the foe
// you struck at, or on whatever has come within reach before you by then; a potion takes a moment; from above the fight stays turn-based
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
  const ev = (f, a)=>page.evaluate(f, a), wait = ms=>ev(async ms=>{ const t = performance.now() + ms; while (performance.now() < t){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); } }, ms);
  await ev(()=>{ window.__noLock = true; goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.player.hp = G.player.maxHp = 99999;
    const s = questNearbySites(G.owPos.x, G.owPos.y, 1, 80, ['dungeon'])[0]; G.gameMode = 0; G.pendingDungeon = { x:s.x, y:s.y }; enterDungeonConfirm(); setUi('playing'); G.mon.length = 0;
    window.__fights = 0; const f0 = fight; window.fight = (...a)=>{ window.__fights++; return f0(...a); }; window.__rolls = 0; const r0 = singleAttackRoll; window.singleAttackRoll = (...a)=>{ window.__rolls++; return r0(...a); };
    window.__ticks = 0; const t0 = tickMonsters; window.tickMonsters = (...a)=>{ if (!G.rtWorld) window.__ticks++; return t0(...a); }; });
  await wait(1200);
  /* a corridor: plain floor five tiles ahead */
  const place = k=>ev(k=>{ const p = G.player, ok = (x, y)=>tileAt(x, y)===T_FLOOR && isoPassable(x, y) && !(G.dungeonDeco && G.dungeonDeco[x] && G.dungeonDeco[x][y]); let best = null, bd = 1e9;
    for (let x=1; x<COLS-1; x++) for (let y=1; y<ROWS-1; y++) for (let f=0; f<4; f++){ const F = FACING_VECT[f]; let good = true; for (let kk=-1; kk<=5 && good; kk++) good = ok(x+F[0]*kk, y+F[1]*kk);
      const d = Math.hypot(x - p.x, y - p.y); if (good && d < bd){ bd = d; best = [x, y, f]; } }
    p.x = best[0]; p.y = best[1]; p.facing = best[2]; p.faceDiag = null; FP.lookYaw = null; FP.pitch = 0; FP.turnTo = null; G.mon.forEach(m=>{ m.alive = 0; }); FPM.key = null;
    const F = FACING_VECT[p.facing], m = newMonster(); G.mon.push(m); Object.assign(m, { alive:1, x:p.x + F[0]*k, y:p.y + F[1]*k, hp:9999, maxHp:9999, ac:5, atkBonus:30, dmg1:1, dmg2:2, xp:5, sym:'g', nm:'goblin', col:'#8f8', art:null, abilities:[], speed:0, engaged:true, rtAt:0 });
    return { m:[m.x, m.y], p:[p.x, p.y], F }; }, k);
  const mon = ()=>ev(()=>{ const m = G.mon.find(m=>m.alive), q = m && FP.monPos.get(m); return m ? { x:m.x, y:m.y, gx:q ? +q.x.toFixed(2) : null, gy:q ? +q.y.toFixed(2) : null, ms:q && q.ms, strike:!!m.rtStrike, rtAt:m.rtAt } : null; });

  /* ---- from above: turn-based, as ever - a goblin four tiles off stands while you stand ---- */
  await ev(()=>{ if (SET.fpView) fpvToggle(); }); const t0 = await place(4); await wait(1800); const i1 = await mon();
  A(i1.x===t0.m[0] && i1.y===t0.m[1], 'from above, nothing moves until you do: ' + JSON.stringify([t0, i1]));
  A(await ev(()=>!rtOn()), 'the real-time fight is for your own eyes only');

  /* ---- through your eyes: it comes for you on its own clock, gliding on without a halt ---- */
  await ev(()=>{ fpvToggle(); }); await wait(600); const t1 = await place(5); await wait(300);
  A(await ev(()=>rtOn()), 'real time through your eyes');
  const trail = []; for (let i=0;i<16;i++){ await wait(100); const m = await mon(); trail.push(m); if (Math.hypot(m.gx - t1.p[0] - 0.5, m.gy - t1.p[1] - 0.5) < 1.2) break; }   /* (until it's beside you) */
  const d0 = Math.abs(t1.m[0] - t1.p[0]) + Math.abs(t1.m[1] - t1.p[1]), last = trail[trail.length - 1], d1 = Math.abs(last.x - t1.p[0]) + Math.abs(last.y - t1.p[1]);
  A(d1 < d0 - 1, 'it came two tiles or more nearer in 1.6 s while you stood: ' + JSON.stringify([t1, last]));
  { let moving = 0; for (let i=1;i<trail.length;i++){ const a = trail[i-1], b = trail[i]; if (Math.hypot(b.gx - a.gx, b.gy - a.gy) > 0.05) moving++; } A(trail.length >= 5 && moving >= (trail.length - 1)*0.8, 'gliding on between steps, not halting: moved in ' + moving + ' of ' + (trail.length - 1) + ' samples ' + JSON.stringify(trail.map(t=>[t.gx, t.gy, t.ms]))); }
  A(await ev(()=>window.__ticks)===0, 'no player turn was spent: ' + await ev(()=>window.__ticks));

  /* ---- beside you: its blow winds up, then lands ---- */
  const t2 = await place(1); await ev(()=>{ window.__rolls = 0; G.player.hp = 99999; }); let wind = null; for (let i=0;i<30 && !wind;i++){ await wait(60); const m = await mon(); if (m && m.strike) wind = await ev(()=>{ const m = G.mon.find(m=>m.alive), e = M3D.inst.get(m); return { rolls:window.__rolls, at:m.rtStrike.at - performance.now(), atk:e && e.atk, hp:G.player.hp }; }); }
  A(wind && wind.rolls===0 && wind.at > 150 && wind.atk > 0, 'it winds up first - no blow rolled yet, its figure swinging: ' + JSON.stringify(wind));
  await wait(wind.at + 250); const landed = await ev(()=>({ rolls:window.__rolls, strike:!!G.mon.find(m=>m.alive).rtStrike }));
  A(landed.rolls===1 && !landed.strike, 'then the blow lands: ' + JSON.stringify(landed));

  /* ---- step back out of its reach while it winds up: it finds air ---- */
  const t3 = await place(1); await ev(()=>{ window.__rolls = 0; window.__logs = []; const l0 = logMsg; window.logMsg = (t, k)=>{ window.__logs.push(String(t)); return l0(t, k); }; });
  let w2 = null; for (let i=0;i<30 && !w2;i++){ await wait(60); const m = await mon(); if (m && m.strike) w2 = await ev(()=>G.mon.find(m=>m.alive).rtStrike.at - performance.now()); }
  A(w2 > 100, 'winding up: ' + w2);
  await ev(t=>{ const p = G.player, F = t.F; p.x = t.p[0] - F[0]*2; p.y = t.p[1] - F[1]*2; FPM.x = p.x + 0.5; FPM.y = p.y + 0.5; }, t3);   /* (two tiles back) */
  await wait(w2 + 300); const air = await ev(()=>({ rolls:window.__rolls, air:window.__logs.some(t=>/finds only air/.test(t)) }));
  A(air.rolls===0 && air.air, 'out of its reach, the blow finds air: ' + JSON.stringify(air));

  /* ---- your blow lands at its contact on the foe you struck at ---- */
  const t4 = await place(1); await wait(400); await ev(()=>{ window.__fights = 0; });
  const aim = await ev(()=>{ const m = G.mon.find(m=>m.alive), e = M3D.inst.get(m), r = canvas.getBoundingClientRect(); const v = e.holder.position.clone(); v.y += e.H*0.7; v.project(FPD.cam); return { x:r.left + (v.x*0.5+0.5)*r.width, y:r.top + (-v.y*0.5+0.5)*r.height }; });
  await page.mouse.click(aim.x, aim.y); const c0 = await ev(()=>({ fights:window.__fights, blow:!!RT.blow, swing:FP.swing }));
  A(c0.fights===0 && c0.blow && c0.swing > 0.9, 'the click swings, the blow still in the air: ' + JSON.stringify(c0));
  await wait(450); const c1 = await ev(()=>({ fights:window.__fights, blow:!!RT.blow }));
  A(c1.fights===1 && !c1.blow, 'landed at its contact: ' + JSON.stringify(c1));

  /* ---- a swing at nothing lands on what has come within reach by its contact ---- */
  const t5 = await place(3); await ev(()=>{ window.__fights = 0; G.mon.forEach(m=>{ m.stunTurns = 99; }); }); await wait(900);   /* (held fast, and past the beat) */
  const air2 = await ev(()=>{ const r = canvas.getBoundingClientRect(); return { x:r.left + r.width*0.5, y:r.top + r.height*0.15 }; });
  await page.mouse.click(air2.x, air2.y); await ev(t=>{ const m = G.mon.find(m=>m.alive); m.x = t.p[0] + t.F[0]; m.y = t.p[1] + t.F[1]; const q = FP.monPos.get(m); if (q){ q.x = m.x + 0.5; q.y = m.y + 0.5; } }, t5);
  await wait(450); A(await ev(()=>window.__fights)===1, 'the goblin that stepped into reach is struck by the swing at the air');

  /* ---- the world's own clock: poison bites while you stand ---- */
  await ev(()=>{ G.mon.forEach(m=>{ m.alive = 0; }); G.player.poisonTurns = 5; G.player.poisonDmg = 3; G.player.hp = effMaxHp(); G.regenTick = -100; window.__hp0 = G.player.hp; }); await wait(2600);   /* (the HUD's rsSync keeps the life to its proper most; no regeneration) */
  { const [hp, hp0] = await ev(()=>[G.player.hp, window.__hp0]); A(hp <= hp0 - 3 && hp >= hp0 - 9, 'poison ticked on the world\'s clock: ' + [hp0, hp]); }
  /* ---- a potion takes a moment ---- */
  A(await ev(()=>{ RT.actAt = 0; const a = rtAct(), b = rtAct(); return a && !b; }), 'a second potion straight after the first waits');
  A(!errs.length, 'page errors: ' + errs.join(' | '));
};
