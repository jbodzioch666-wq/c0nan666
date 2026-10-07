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
    // pressing again before their answer does nothing
    const mh1 = m.hp; tryMove(1, 0); out.blocked = m.hp===mh1 && foePending();
    await wait(400); out.stillWaiting = foePending() && !m._atkT;
    await wait(500); out.playerHitAfter = !!m._atkT; out.pendingAfter = foePending();
    // (RS-219) a bow shot: the shot is yours at once, the monsters' turn a beat later; you can't shoot again meanwhile
    { G.gear.ranged = rsMakeBow(0, false); const keep = [rangedVolley, rangedAmmoN, rangedPick]; let shots = 0;
      rangedVolley = ()=>{ shots++; }; rangedAmmoN = ()=>50; rangedPick = ()=>'bow';
      m.x = P.x + 2; m.y = P.y; if (G.map[m.x][m.y]===T_WALL) G.map[m.x][m.y] = T_FLOOR; const tc = P.turnCount||0;
      try{ rangedAttack(m); out.bow = { shots, pending:foePending() }; rangedAttack(m); out.bow.second = shots; await wait(900); out.bow.after = foePending(); }
      finally { [rangedVolley, rangedAmmoN, rangedPick] = keep; } }
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
  if (!r.blocked) throw new Error('you cannot strike again before it lands');
  if (!r.stillWaiting || !r.playerHitAfter || r.pendingAfter) throw new Error('it lands about 0.7s later, not before 0.4s '+JSON.stringify(r));
  if (r.instant.pending || !r.instant.hit) throw new Error('instant when deferral is off');
  if (!(r.bow && r.bow.shots===1 && r.bow.pending && r.bow.second===1 && !r.bow.after)) throw new Error('a bow shot gets the same beat '+JSON.stringify(r.bow));
  if (r.wrapped!==6) throw new Error('every ranged, spell and ability path is wrapped: '+r.wrapped);
  if (r.swingOnTheirBlow!==0) throw new Error('your figure does not swing when the monster hits you: '+r.swingOnTheirBlow);
};
