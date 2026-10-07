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
    const hp0 = P.hp, mhp0 = m.hp;
    tryMove(1, 0);
    out.afterBlow = { mon:m.hp < mhp0 || true, playerHit:P.hp < hp0, pending:foePending() };
    // pressing again before their answer does nothing
    const mh1 = m.hp; tryMove(1, 0); out.blocked = m.hp===mh1 && foePending();
    await wait(400); out.stillWaiting = foePending() && P.hp===hp0;
    await wait(500); out.playerHitAfter = P.hp < hp0; out.pendingAfter = foePending();
    // with the 3D view off, it all happens at once, as before
    G.foeInstant = true; const hp1 = P.hp; tryMove(1, 0); out.instant = { pending:foePending(), hit:P.hp < hp1 }; G.foeInstant = false;
    return out; });
  console.log(JSON.stringify(r));
  if (!r.defer) throw new Error('deferral is on in a 3D fight');
  if (r.afterBlow.playerHit || !r.afterBlow.pending) throw new Error('their answer waits after your blow '+JSON.stringify(r));
  if (!r.blocked) throw new Error('you cannot strike again before it lands');
  if (!r.stillWaiting || !r.playerHitAfter || r.pendingAfter) throw new Error('it lands about 0.7s later, not before 0.4s '+JSON.stringify(r));
  if (r.instant.pending || !r.instant.hit) throw new Error('instant when deferral is off');
};
