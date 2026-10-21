// RS-601: a body below ground lies a few seconds, then fades and goes - it waited on the land's step count, which never moves in a
// dungeon, so every body killed on a floor stayed in the scene until you left (a long fight: hundreds of figures, frames of half a second);
// and past a dozen bodies the oldest go early. A real fight, your own blows, more of them coming in
module.exports = async page=>{
  page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 200)));
  await page.evaluate(async ()=>{ window.__corpseTime = true; goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.player.hp = G.player.maxHp = 99999;
    const s = questNearbySites(G.owPos.x, G.owPos.y, 1, 60, ['dungeon'])[0]; G.gameMode = 0; G.pendingDungeon = { x:s.x, y:s.y }; enterDungeonConfirm(); setUi('playing');
    window.__band = G.mon.filter(m=>m.alive).map(m=>Object.assign({}, m, { maxHp:3, hp:3 })); for (const m of G.mon) if (m.alive){ m.maxHp = m.hp = 3; }
    window.__play = true; window.__last = 0; window.__maxDying = 0; window.__turn0 = G.player.turnCount||0;
    const loop = ()=>{ if (!window.__play) return; try{ const p = G.player, now = performance.now(); if (G.ui!=='playing') setUi('playing'); p.hp = p.maxHp;
      window.__frames = (window.__frames||0) + 1; window.__maxDying = Math.max(window.__maxDying, [...M3D.live].filter(e=>e.dying >= 0).length);
      if (now - window.__last > 150 && !ISO.path.length){ window.__last = now; let best = null, bd = 1e9; for (const m of G.mon) if (m.alive){ const d = Math.max(Math.abs(m.x - p.x), Math.abs(m.y - p.y)); if (d < bd){ bd = d; best = m; } }
        if (best && bd <= 1) moveDir(Math.sign(best.x - p.x), Math.sign(best.y - p.y)); else if (best){ ISO.path = isoFindPath(best.x, best.y, true) || []; ISO.nextStep = 0; }
        else for (const t of window.__band){ const m = Object.assign({}, t); m.alive = true; m.hp = m.maxHp; G.mon.push(m); } } }catch(e){ console.error(e); } requestAnimationFrame(loop); };
    requestAnimationFrame(loop); });
  await page.waitForTimeout(30000);
  const r = await page.evaluate(async ()=>{ window.__play = false; const kills = (G.player.stats||{}).kills||0, during = window.__maxDying;
    for (const m of G.mon) if (m.alive){ m.alive = false; } await new Promise(r=>setTimeout(r, 200)); const dying = ()=>[...M3D.live].filter(e=>e.dying >= 0).length; const now = dying();
    await new Promise(r=>setTimeout(r, 7000)); for (let i=0;i<10;i++) await new Promise(r=>requestAnimationFrame(r));
    return { frames:window.__frames, alive:G.mon.filter(m=>m.alive).length, pos:[G.player.x, G.player.y], path:ISO.path.length, kills, maxDying:during, atStop:now, after7s:dying(), turn:(G.player.turnCount||0) - window.__turn0 }; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.kills >= 2, 'a fight, some killed: ' + r.kills);
  A(r.maxDying <= 14, 'never more than a dozen or so bodies about at once: ' + r.maxDying);
  A(r.after7s===0 && r.turn===0, 'a few seconds after the last, all gone - with no turn of the land passing: ' + JSON.stringify(r));
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
