// probe: through your eyes in a dungeon with a sword and a kite shield: out of a fight (put away), then in one (drawn). Screenshots
// tools/tests/out/zfpaway-<tag>.png; ZA_MOBILE=1 for the phone; ZA_OFF='[x,y,z,rx,ry,rz]' overrides the shield's place
module.exports = async page=>{ page.setDefaultTimeout(0); page.on('pageerror', e=>console.log('PAGEERR', String(e).slice(0, 300)));
  const ev = (f, a)=>page.evaluate(f, a), wait = ms=>ev(async ms=>{ const t = performance.now() + ms; while (performance.now() < t){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); } }, ms);
  if (process.env.ZA_LAND) await ev(()=>{ window.__zaLand = 1; });
  await ev(()=>{ window.__noLock = true; goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.player.hp = G.player.maxHp = 99999;
    if (window.__zaLand){ G.player.clock = DAY_LENGTH*0.4; const t = townList()[0]; G.interior = null; G.gameMode = 0; G.mon = []; for (const [dx, dy] of [[0,6],[6,0],[0,-6],[-6,0],[7,7],[-7,-7]]){ const x = t.x+dx, y = t.y+dy; if (G.ow.map[x] && G.ow.map[x][y]!==OW_WATER && o3Passable(x, y) && !owSiteKindAt(x, y)){ G.owPos = { x, y }; break; } } setUi('playing'); return; }
    const s = questNearbySites(G.owPos.x, G.owPos.y, 1, 80, ['dungeon'])[0]; G.gameMode = 0; G.pendingDungeon = { x:s.x, y:s.y }; enterDungeonConfirm(); setUi('playing'); G.mon.length = 0; });
  await wait(1200);
  await ev(()=>{ if (window.__zaLand){ G.gear.weapon = rsMakeWeapon(3, 2); G.gear.weapon.used = true; G.gear.offhand = rsMakeArmour('metal', 3, 'offhand'); G.gear.offhand.used = true; FPW.wkey = ''; if (!SET.fpView) fpvToggle(); return; } const p = G.player, ok = (x, y)=>tileAt(x, y)===T_FLOOR && isoPassable(x, y); let best = null, bd = 1e9;
    for (let x=1; x<COLS-1; x++) for (let y=1; y<ROWS-1; y++) for (let f=0; f<4; f++){ const F = FACING_VECT[f]; let good = true; for (let k=0; k<=4 && good; k++) good = ok(x+F[0]*k, y+F[1]*k);
      const d = Math.hypot(x - p.x, y - p.y); if (good && d < bd){ bd = d; best = [x, y, f]; } }
    p.x = best[0]; p.y = best[1]; p.facing = best[2]; G.mon.forEach(m=>{ m.alive = 0; });
    G.gear.weapon = rsMakeWeapon(3, 2); G.gear.weapon.used = true; G.gear.offhand = rsMakeArmour('metal', 3, 'offhand'); G.gear.offhand.used = true; FPW.wkey = ''; if (!SET.fpView) fpvToggle(); });
  if (process.env.ZA_OFF) await ev(o=>{ FPW_OFF.shield.at = o.slice(0, 3); FPW_OFF.shield.rot = o.slice(3, 6); FPW.wkey = ''; }, JSON.parse(process.env.ZA_OFF));
  await wait(1500);
  const st = tag=>ev(tag=>({ tag, away:FPW.away, rigVis:FPW.rig.visible, offVis:FPW.offG && FPW.offG.visible, shK:fpwWorker().rig.shK, fight:rsFightNow() }), tag);
  console.log(JSON.stringify(await st('peace'))); await page.screenshot({ path:'tools/tests/out/zfpaway-peace.png' });
  await ev(()=>{ window.__realFight = rsFightNow; rsFightNow = ()=>G.ui==='playing'; }); await wait(250); console.log(JSON.stringify(await st('drawing')));
  await wait(1000); console.log(JSON.stringify(await st('fight'))); await page.screenshot({ path:'tools/tests/out/zfpaway-fight.png' });
  await ev(()=>{ rsFightNow = window.__realFight; }); await wait(250); console.log(JSON.stringify(await st('putting away')));
  await wait(1200); console.log(JSON.stringify(await st('away')));
};
if (process.env.ZA_MOBILE) module.exports.mobile = true;
