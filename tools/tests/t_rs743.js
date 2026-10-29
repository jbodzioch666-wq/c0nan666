// RS-743: a town's arena fight is fought in its colosseum: an oval of sand walled round, its open gate the only way out, the stands
// all round filled with a crowd (one instanced mesh) that roars when a beast falls. Walking out through the gate is yielding (back to
// the town, the run over); beaten there you're dragged out, not killed; a won wave puts you beside the arena master.
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const ev = (f, a)=>page.evaluate(f, a), A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); }, fs = require('fs');
  const frames = n=>ev(async n=>{ for (let i=0;i<n;i++){ renderGame(); await new Promise(r=>setTimeout(r, 40)); } }, n);
  const r0 = await ev(()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    const p = G.player; p.gold = 1e6; p.wildWarned = 1; p.clock = p.turnCount = 60*12; p.hp = p.maxHp = 500; G.weather = 'clear';
    const city = townList().find(t=>townInfo(t.x, t.y).tier===2); G.owPos = { x:city.x, y:city.y }; trackVisitedTown(city.x, city.y); setUi('playing'); enterVillage(); setUi('playing');
    arenaFight(); setUi('playing'); G.weather = 'clear';
    let flee = 0, gates = 0, floor = 0; for (let x=0;x<COLS;x++) for (let y=0;y<ROWS;y++){ if (G.map[x][y]===T_FLEE) flee++; if (G.arenaDeco[x][y]==='gate') gates++; if (G.map[x][y]===T_FLOOR) floor++; }
    return { theme:G.arenaTheme, cols:COLS, flee, gates, floor, inside:arenaEll(p.x, p.y) < 1, monIn:G.mon.every(m=>arenaEll(m.x, m.y) <= 1 && G.map[m.x][m.y]===T_FLOOR) }; });
  console.log(JSON.stringify(r0));
  A(r0.theme==='colosseum' && r0.cols===24, 'the fight is in the colosseum: ' + JSON.stringify(r0));
  A(r0.flee===2 && r0.gates===2 && r0.floor > 150 && r0.inside && r0.monIn, 'an oval of sand, walled, its gate the only way out: ' + JSON.stringify(r0));
  await frames(50); await page.screenshot({ path:SHOTS + '/rs743_arena.png' });
  const r1 = await ev(()=>{ const T = THREE, R = FPD.r, sz = R.getSize(new T.Vector2()), C = ARENA_C, out = { crowd:FPD.crowd ? FPD.crowd.count : 0, inScene:!!(FPD.crowd && FPD.crowd.parent) };
    const c = new T.PerspectiveCamera(45, sz.x/sz.y, 0.05, 200); c.position.set(C.cx + 3, 2.2, C.cy); c.lookAt(C.cx + 1, 2.6, C.cy - C.ry - 3); c.updateProjectionMatrix();
    const d0 = FPD.cutU.uCutD.value.clone(); FPD.cutU.uCutD.value.set(0, 1); R.render(FPD.scene, c); out.shot = R.domElement.toDataURL('image/jpeg', 0.88); FPD.cutU.uCutD.value.copy(d0);
    /* a kill: the crowd roars */
    const m = G.mon[0]; m.hp = 1; monsterDies(0); m.alive = 0; out.roar = arenaRoarNow(); return out; });
  fs.writeFileSync(SHOTS + '/rs743_crowd.jpg', Buffer.from(r1.shot.split(',')[1], 'base64')); delete r1.shot;
  console.log(JSON.stringify(r1));
  A(r1.crowd > 200 && r1.inScene, 'the stands are full: ' + JSON.stringify(r1));
  A(r1.roar > 0.5, 'the crowd roars at a kill: ' + JSON.stringify(r1));
  /* beaten: dragged out, not killed */
  const r2 = await ev(async ()=>{ setUi('playing'); G.arenaRun = null; arenaFight(); setUi('playing'); const p = G.player; G.arenaRun.wave = 3; p.hp = 0; playerDies('a goblin'); const was = { over:!!G.gameOver, hp:p.hp };
    await new Promise(r=>setTimeout(r, 50)); const n = G.villageNpcs.find(o=>o.service==='arena');
    return { was, mode:G.gameMode, ui:G.ui, title:G.wevDlg && G.wevDlg.title, run:G.arenaRun, hp:p.hp, max:p.maxHp, near:Math.max(Math.abs(p.x - n.x), Math.abs(p.y - n.y)), over:!!G.gameOver }; });
  console.log(JSON.stringify(r2));
  A(!r2.was.over && r2.mode===3 && r2.ui==='wevent' && r2.title==='Beaten!' && !r2.run && !r2.over && r2.hp >= Math.ceil(r2.max*0.25) && r2.near===1, 'beaten, you are dragged out alive: ' + JSON.stringify(r2));
  /* yield: out through the gate */
  const r3 = await ev(async ()=>{ wevChoose(0); setUi('playing'); arenaFight(); setUi('playing'); const p = G.player; let gx = -1, gy = -1;
    for (let x=0;x<COLS;x++) for (let y=0;y<ROWS;y++) if (G.map[x][y]===T_FLEE){ gx = x; gy = y; }
    p.x = gx; p.y = gy - 1; for (const m of G.mon) m.x = Math.min(m.x, COLS - 4), m.y = 4;
    moveDir(0, 1); for (let i=0;i<120 && G.gameMode===2;i++){ renderGame(); await new Promise(r=>setTimeout(r, 40)); }
    const n = G.villageNpcs.find(o=>o.service==='arena'); return { mode:G.gameMode, run:G.arenaRun, near:G.gameMode===3 ? Math.max(Math.abs(p.x - n.x), Math.abs(p.y - n.y)) : -1, log:G.log.slice(-2).map(l=>l.msg).join(' | ') }; });
  console.log(JSON.stringify(r3));
  A(r3.mode===3 && !r3.run && r3.near===1 && /yield/.test(r3.log), 'out through the gate you yield, back in the town: ' + JSON.stringify(r3));
  /* a won wave: beside the arena master */
  const r4 = await ev(()=>{ setUi('playing'); arenaFight(); setUi('playing'); for (const m of G.mon){ m.alive = 0; m.hp = 0; } const won = wevArenaWon(); const p = G.player, n = G.villageNpcs.find(o=>o.service==='arena');
    return { won, mode:G.gameMode, near:Math.max(Math.abs(p.x - n.x), Math.abs(p.y - n.y)), floor:G.map[p.x][p.y]===T_FLOOR, best:arenaRec().best }; });
  console.log(JSON.stringify(r4));
  A(r4.won && r4.mode===3 && r4.near===1 && r4.floor && r4.best >= 1, 'a won wave: back beside the arena master: ' + JSON.stringify(r4));
  /* the town's arena: its whole ring drawn */
  await ev(()=>{ setUi('playing'); const p = G.player, n = G.villageNpcs.find(o=>o.service==='arena'); p.x = n.x; p.y = n.y + 7; if (G.map[p.x][p.y]!==T_FLOOR) p.y = n.y - 1; });
  await frames(40); await page.screenshot({ path:SHOTS + '/rs743_town.png' });
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
