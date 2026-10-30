// RS-708: a blow carried by a spell or an arrow shows when it lands, not when it leaves. Sampled every frame through a real cast at a foe
// three tiles off: its life bar and the target plate keep their life till the bolt lands, the log's "hits" line and the xp drop come with
// it, and a foe the bolt kills keeps its plate till then; an arrow's hit likewise; off the scene (no 3D) everything is at once
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const r = await page.evaluate(async ()=>{ const wait = ms=>new Promise(res=>setTimeout(res, ms)), fr = ()=>new Promise(res=>requestAnimationFrame(res));
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    G.gameMode = 0; randomEncounter(false); setUi('playing'); window.__corpseTime = true;
    const P = G.player, out = {}; P.hp = P.maxHp = 9999; G.mon = G.mon.filter((m, i)=>i===0); const m = G.mon[0]; m.hp = m.maxHp = 500; m.atkBonus = -99;
    m.x = P.x + 3; m.y = P.y; for (let x=P.x+1; x<=P.x+3; x++) if (G.map[x][P.y]===T_WALL) G.map[x][P.y] = T_FLOOR;
    G.gear.weapon = rsMakeStaff(1); P.rsSpell = RS_SPELLS.find(s=>rsSpellCombat(s))[0]; skP().skills.magic = SK_XP[99]; for (const k of ['air','mind','water','earth','fire','chaos','death','blood']) skAdd('r_'+k, 500); rsSync && rsSync();
    G.foeInstant = false; for (let i=0;i<40;i++){ renderGame(); await wait(30); }
    const plate = ()=>{ const el = document.querySelector('.dh-tsub'); return el ? +(el.textContent.match(/^(\d+)\//)||[0, -1])[1] : null; };
    const shot = async (fire, pick)=>{ while (FP.cast > 0) await fr(); const hp0 = m.hp, n0 = G.log.length, x0 = (P.skills||skP().skills).magic, t0 = performance.now(), rows = []; const had = new Set(ISO.shots||[]), rr = Math.random; Math.random = ()=>0.97; try{ fire(); } finally { Math.random = rr; }
      const s = (ISO.shots||[]).find(q=>!had.has(q));   /* (the shot this fired: a bolt, an arrow) */
      while (performance.now() - t0 < 1700){ await fr(); rows.push({ ms:performance.now() - t0, live:!!(s && ISO.shots.includes(s)), go:!!(s && s.go), shown:monHpShown(m), plate:plate(), log:G.log.slice(n0).some(l=>/hits|for \d+/.test(l.msg)) }); }
      const land = rows.find(q=>q.go && !q.live), before = rows.filter(q=>land && q.ms < land.ms - 25), after = rows.filter(q=>land && q.ms > land.ms + 40);
      return { dmg:hp0 - m.hp, landMs:land && Math.round(land.ms), barBefore:before.every(q=>q.shown===hp0), plateBefore:before.every(q=>q.plate===null || q.plate===hp0), logBefore:before.some(q=>q.log),
        barAfter:after.length > 0 && after.every(q=>q.shown===m.hp), plateAfter:after.some(q=>q.plate===m.hp), logAfter:after.some(q=>q.log) }; };
    noteFoe(0); out.spell = await shot(()=>rsCastAt(0, P.rsSpell), 'spell'); await wait(800);
    /* an arrow */
    G.gear.weapon = newItem(); G.gear.ranged = rsMakeBow(3, true); P.arrows = 200; try{ loadAmmo(0, true); }catch(e){} rsSync && rsSync();
    out.arrow = await shot(()=>{ try{ rangedAttack0(0); }catch(e){ out.arrowErr = String(e); } }, 'arrow'); await wait(800);
    /* a kill: the plate stays till the bolt lands */
    G.gear.weapon = rsMakeStaff(1); G.gear.ranged = newItem(); m.hp = 1; let gone = null, landed = null; { const rr = Math.random; Math.random = ()=>0.97; try{ rsCastAt(0, P.rsSpell); } finally { Math.random = rr; } }
      const s = (ISO.shots||[]).find(q=>q.kind==='spell'), t0 = performance.now(); while (performance.now() - t0 < 1500){ await fr(); const live = s && ISO.shots.includes(s); if (plate()===null && gone===null) gone = performance.now() - t0; if (s && s.go && !live && landed===null) landed = performance.now() - t0; }
      out.kill = { gone:gone && Math.round(gone), landed:landed && Math.round(landed), dead:!m.alive };
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: ' + m + ' ' + JSON.stringify(r)); };
  for (const k of ['spell', 'arrow']){ const x = r[k];
    A(x.dmg > 0 && x.landMs > 200, k + ': it hit, and flew a while');
    A(x.barBefore && x.plateBefore && !x.logBefore, k + ': the life bar, the target plate and the log keep still till it lands');
    A(x.barAfter && x.plateAfter && x.logAfter, k + ': then all of them show the hit'); }
  A(r.kill.dead && r.kill.landed && r.kill.gone >= r.kill.landed - 30, 'a foe the bolt kills keeps its plate till the bolt lands');
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
