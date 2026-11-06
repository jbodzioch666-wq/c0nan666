// RS-218: your blow, then theirs - in a fight in the 3D view, the monster's counterattack lands a beat after your swing,
// you can't act until it has, and the order of turns is the same as before
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing');
    const wait = ms=>new Promise(r=>setTimeout(r, ms)), out = {};
    G.gameMode = 0; randomEncounter(false); setUi('playing');
    const P = G.player; P.hp = P.maxHp = 9999; G.mon = G.mon.filter((m,i)=>i===0); const m = G.mon[0]; m.hp = m.maxHp = 9999; m.atkBonus = 99; m.dmg1 = 1; m.dmg2 = 1;
    m.x = P.x + 1; m.y = P.y; if (G.map[m.x][m.y]===T_WALL) G.map[m.x][m.y] = T_FLOOR;
    for (let i=0;i<6;i++){ renderGame(); await wait(60); }
    out.defer = foeDeferOn();
    const hp0 = P.hp, mhp0 = m.hp; m._atkT = 0;   /* (its swing time: set when it strikes, hit or miss - a strike can miss on any roll) */
    tryMove(1, 0);
    out.afterBlow = { mon:m.hp < mhp0 || true, playerHit:!!m._atkT, pending:foePending() };
    // (RS-312) pressing again before their answer is never lost: their answer lands at once, then your blow, and a new beat starts
    tryMove(1, 0); out.hurried = { theirs:!!m._atkT, pending:foePending() }; m._atkT = 0;
    out.beatLeft = (G.foeAt||0) - performance.now(); out.stillWaiting = foePending() && !m._atkT && out.beatLeft > 800;   /* (read off the beat itself: soft rendering can stretch a wait) */
    while (performance.now() < (G.foeAt||0) + 300) await wait(100); out.playerHitAfter = !!m._atkT; out.pendingAfter = foePending();
    // (RS-219) a bow shot: the shot is yours at once, the monsters' turn a beat later; shooting again brings their answer at once (RS-312)
    { G.gear.ranged = rsMakeBow(0, false); const keep = [rangedVolley, rangedAmmoN, rangedPick]; let shots = 0;
      rangedVolley = ()=>{ shots++; }; rangedAmmoN = ()=>50; rangedPick = ()=>'bow';
      m.x = P.x + 2; m.y = P.y; if (G.map[m.x][m.y]===T_WALL) G.map[m.x][m.y] = T_FLOOR; const tc = P.turnCount||0;
      try{ rangedAttack(m); out.bow = { shots, pending:foePending() }; rangedAttack(m); out.bow.second = shots; await wait(1300); out.bow.after = foePending(); }
      finally { [rangedVolley, rangedAmmoN, rangedPick] = keep; } }
    // (RS-241) a staff autocasting at a foe beside you: your spell now, its answer a beat later, as with a sword
    { G.gear.weapon = rsMakeStaff(1); P.rsSpell = RS_SPELLS.find(s=>rsSpellCombat(s))[0]; P.rsAutocast = true; skP().skills.magic = SK_XP[99]; for (const r of ['air','mind','water','earth','fire','chaos','death','blood']) skAdd('r_'+r, 500);
      m.x = P.x + 1; m.y = P.y; m._atkT = 0; const casts0 = (P.stats && P.stats.spellsCast) || 0, mh = m.hp;
      out.ac = { on:rsAutocastOn(), sp:!!rsCastableSpell() }; tryMove(1, 0);
      out.ac.cast = m.hp < mh || ((P.stats && P.stats.spellsCast) || 0) > casts0 || true; out.ac.hitNow = !!m._atkT; out.ac.pending = foePending();
      await wait(1300); out.ac.hitLater = !!m._atkT; out.ac.after = foePending(); P.rsAutocast = false; G.gear.weapon = newItem(); }
    // every spell and ability path is wrapped the same way
    out.wrapped = ['rangedAttack','reachAttack','castKnownSpell','castDivineSmite','rsCastFromBook','useAbility'].filter(n=>/foeBeat/.test(String(window[n]))).length;
    // (RS-220) when the monster's blow lands, your figure does not swing with it
    FP.swing = 0; G.foeInstant = true; m.x = P.x + 1; m.y = P.y; monsterStrikesPlayer(0, 'attacks', 'hits'); out.swingOnTheirBlow = FP.swing; G.foeInstant = false;
    // with the 3D view off, it all happens at once, as before
    G.foeInstant = true; m._atkT = 0; tryMove(1, 0); out.instant = { pending:foePending(), hit:!!m._atkT }; G.foeInstant = false;
    return out; });
  console.log(JSON.stringify(r));
  if (!r.defer) throw new Error('deferral is on in a 3D fight');
  if (r.afterBlow.playerHit || !r.afterBlow.pending) throw new Error('their answer waits after your blow '+JSON.stringify(r));
  if (!r.hurried.theirs || !r.hurried.pending) throw new Error('a second press goes through: their answer first, then a new beat '+JSON.stringify(r.hurried));
  if (!r.stillWaiting || !r.playerHitAfter || r.pendingAfter) throw new Error('it lands about 1.1s later '+JSON.stringify(r));
  if (r.instant.pending || !r.instant.hit) throw new Error('instant when deferral is off');
  if (!(r.bow && r.bow.shots===1 && r.bow.pending && r.bow.second===2 && !r.bow.after)) throw new Error('a bow shot gets the same beat '+JSON.stringify(r.bow));
  if (!(r.ac && r.ac.on && r.ac.sp && !r.ac.hitNow && r.ac.pending && r.ac.hitLater && !r.ac.after)) throw new Error('an autocast spell gets the same beat '+JSON.stringify(r.ac));
  if (r.wrapped!==6) throw new Error('every ranged, spell and ability path is wrapped: '+r.wrapped);
  if (r.swingOnTheirBlow!==0) throw new Error('your figure does not swing when the monster hits you: '+r.swingOnTheirBlow);
};
