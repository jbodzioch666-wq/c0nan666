// RS-710: a blow is felt as the weapon connects. Sampled every frame through a real melee swing at a foe beside you: your swing starts at
// once, but its life bar, the target plate, the log line and the hit sound wait till the blade meets it (BLOW_CONTACT of the swing), and a
// foe it kills keeps its plate till then; a monster's blow at you likewise - your life on the HUD, the log and the sound wait for its swing
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const r = await page.evaluate(async ()=>{ const wait = ms=>new Promise(res=>setTimeout(res, ms)), fr = ()=>new Promise(res=>requestAnimationFrame(res));
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    G.gameMode = 0; randomEncounter(false); setUi('playing'); window.__corpseTime = true;
    const P = G.player, out = {}; G.mon = G.mon.filter((m, i)=>i===0); const m = G.mon[0]; m.hp = m.maxHp = 500; m.atkBonus = -99;
    m.x = P.x + 1; m.y = P.y; if (G.map[m.x][m.y]===T_WALL) G.map[m.x][m.y] = T_FLOOR;
    G.gear.weapon = rsMakeWeapon(3, 3); G.gear.ranged = newItem(); P.rsStyle = 0; for (const k of ['attack','strength']) skP().skills[k] = SK_XP[99]; rsSync && rsSync();
    P.hp = effMaxHp();
    const snd = []; for (const k of ['hit','crit','miss']){ const f = SFX[k]; SFX[k] = ()=>{ snd.push({ k, t:performance.now() }); try{ f(); }catch(e){} }; }
    G.foeInstant = false; for (let i=0;i<40;i++){ renderGame(); await wait(30); }
    out.contactMs = meleeContactMs(); out.monMs = monContactMs();
    const plate = ()=>{ const el = document.querySelector('.dh-tsub'); return el ? +(el.textContent.match(/^(\d+)\//)||[0, -1])[1] : null; };
    /* your swing */
    { while (FP.swing > 0) await fr(); noteFoe(0); const hp0 = m.hp, n0 = G.log.length, s0 = snd.length, t0 = performance.now(), rows = []; const rr = Math.random; Math.random = ()=>0.97; try{ fight(0); } finally { Math.random = rr; }
      while (performance.now() - t0 < 900){ await fr(); rows.push({ ms:performance.now() - t0, sw:FP.swing, shown:monHpShown(m), plate:plate(), log:G.log.slice(n0).some(l=>/you |hit|for \d+/i.test(l.msg)), snd:snd.length > s0 }); }
      const C = out.contactMs, before = rows.filter(q=>q.ms < C - 30), after = rows.filter(q=>q.ms > C + 60);
      out.melee = { dmg:hp0 - m.hp, swingNow:rows.slice(0, 3).some(q=>q.sw > 0.6), barBefore:before.every(q=>q.shown===hp0), plateBefore:before.every(q=>q.plate===null || q.plate===hp0), logBefore:before.some(q=>q.log), sndBefore:before.some(q=>q.snd),
        barAfter:after.length > 0 && after.every(q=>q.shown===m.hp), plateAfter:after.some(q=>q.plate===m.hp), logAfter:after.some(q=>q.log), sndAfter:after.some(q=>q.snd), nb:before.length }; }
    await wait(1500); if (typeof foeFlush==='function') foeFlush(); await wait(300);
    /* a monster's blow at you */
    { m.atkBonus = 99; m.dmg1 = 3; m.dmg2 = 3; P.hp = effMaxHp(); for (let i=0;i<10;i++) await fr(); const php0 = P.hp, n0 = G.log.length, s0 = snd.length, t0 = performance.now(), rows = [];
      monsterStrikesPlayer(0, 'attacks', 'hits');
      while (performance.now() - t0 < 600){ await fr(); const orb = document.querySelector('.dh-orb.hp, .dh-hp'); rows.push({ ms:performance.now() - t0, shown:playerHpShown(), log:G.log.slice(n0).some(l=>/hits|attacks/.test(l.msg)), snd:snd.length > s0 }); }
      const C = out.monMs, before = rows.filter(q=>q.ms < C - 30), after = rows.filter(q=>q.ms > C + 60);
      out.mon = { dmg:php0 - P.hp, barBefore:before.every(q=>q.shown===php0), logBefore:before.some(q=>q.log), sndBefore:before.some(q=>q.snd), barAfter:after.length > 0 && after.every(q=>q.shown===P.hp), logAfter:after.some(q=>q.log), nb:before.length }; m.atkBonus = -99; }
    await wait(500);
    /* a kill: the plate stays till the blade connects */
    { while (FP.swing > 0) await fr(); m.hp = 1; noteFoe(0); let gone = null; const t0 = performance.now(); { const rr = Math.random; Math.random = ()=>0.97; try{ fight(0); } finally { Math.random = rr; } }
      while (performance.now() - t0 < 900){ await fr(); if (plate()===null && gone===null) gone = performance.now() - t0; }
      out.kill = { gone:gone && Math.round(gone), dead:!m.alive }; }
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: ' + m + ' ' + JSON.stringify(r)); };
  A(r.contactMs > 200 && r.monMs > 90, 'the swings take their time to connect');
  A(r.melee.dmg > 0 && r.melee.swingNow && r.melee.nb >= 3, 'your swing started at once and hit');
  A(r.melee.barBefore && r.melee.plateBefore && !r.melee.logBefore && !r.melee.sndBefore, 'its life bar, the plate, the log and the sound wait for the blade');
  A(r.melee.barAfter && r.melee.plateAfter && r.melee.logAfter && r.melee.sndAfter, 'then all of them show the hit');
  A(r.mon.dmg > 0 && r.mon.barBefore && !r.mon.logBefore && !r.mon.sndBefore && r.mon.barAfter && r.mon.logAfter, 'a monster\'s blow: your life, the log and the sound wait for its swing');
  A(r.kill.dead && r.kill.gone >= r.contactMs - 30, 'a foe the blade kills keeps its plate till the blade connects');
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
