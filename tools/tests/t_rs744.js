// RS-744: the arena waits for the last of a wave to fall before it's won, and you choose on the sand: the next wave comes on in the
// same arena (from the far side), or you take your winnings and walk out to the arena master. A death: you fall where you stand,
// the world greys, and "Oh dear, you are dead!" with a Release button - the death screen only after it; beaten in the arena, Release
// and you're dragged out.
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const ev = (f, a)=>page.evaluate(f, a), A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
  const r0 = await ev(async ()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    const p = G.player; p.gold = 1e6; p.wildWarned = 1; p.clock = p.turnCount = 60*12; G.weather = 'clear';
    const city = townList().find(t=>townInfo(t.x, t.y).tier===2); G.owPos = { x:city.x, y:city.y }; trackVisitedTown(city.x, city.y); setUi('playing'); enterVillage(); setUi('playing');
    arenaFight(); setUi('playing'); p.hp = p.maxHp = 99999;
    for (let i=0;i<40;i++){ renderGame(); await new Promise(r=>setTimeout(r, 30)); }
    /* the last beast, beside you, killed by a real blow */
    const m = G.mon[0]; G.mon = [m]; m.x = p.x; m.y = p.y - 1; m.hp = 1; m.ac = -50; const map0 = G.map;
    for (let i=0;i<20;i++){ renderGame(); await new Promise(r=>setTimeout(r, 30)); }
    const t0 = performance.now(); const rr = Math.random; Math.random = ()=>0.99; try{ fight(0); } finally { Math.random = rr; }
    const out = { dead:!m.alive, wonAt:-1 };
    for (let i=0;i<200 && G.ui!=='wevent';i++){ renderGame(); await new Promise(r=>setTimeout(r, 25)); if (i===4) out.early = { won:G.fieldWon, ui:G.ui }; }
    out.wonAt = Math.round(performance.now() - t0); const e = M3D.inst.get(m); out.fell = e ? e.dying : null;
    out.dlg = { mode:G.gameMode, theme:G.arenaTheme, ui:G.ui, title:G.wevDlg && G.wevDlg.title, opts:G.wevDlg && G.wevDlg.opts.map(o=>o[0]) };
    /* the next wave, on the same sand */
    wevChoose(0); out.next = { mode:G.gameMode, same:G.map===map0, theme:G.arenaTheme, n:G.mon.filter(o=>o.alive).length, far:G.mon.every(o=>Math.max(Math.abs(o.x - p.x), Math.abs(o.y - p.y)) >= 5), wave:G.wevFight && G.wevFight.id, won:G.fieldWon };
    /* won again: take the winnings */
    for (const o of G.mon){ o.alive = 0; o.hp = 0; } G.arenaClearAt = performance.now() - 6000;
    for (let i=0;i<40 && G.ui!=='wevent';i++){ renderGame(); await new Promise(r=>setTimeout(r, 25)); }
    out.dlg2 = { mode:G.gameMode, ui:G.ui }; wevChoose(1); const n = G.villageNpcs.find(o=>o.service==='arena');
    out.left = { mode:G.gameMode, run:G.arenaRun, near:Math.max(Math.abs(p.x - n.x), Math.abs(p.y - n.y)) };
    return out; });
  console.log(JSON.stringify(r0));
  A(r0.dead && r0.early && !r0.early.won && r0.early.ui==='playing', 'not won the instant its life runs out: ' + JSON.stringify(r0));
  A(r0.wonAt >= 700 && (r0.fell===null || r0.fell >= 1.15), 'won once it has fallen: ' + JSON.stringify(r0));
  A(r0.dlg.mode===2 && r0.dlg.theme==='colosseum' && r0.dlg.ui==='wevent' && /cleared/.test(r0.dlg.title), 'the choice is made in the arena: ' + JSON.stringify(r0.dlg));
  A(r0.next.mode===2 && r0.next.same && r0.next.n >= 1 && r0.next.far && r0.next.wave===2 && !r0.next.won, 'the next wave comes on in the same arena, from the far side: ' + JSON.stringify(r0.next));
  A(r0.dlg2.mode===2 && r0.dlg2.ui==='wevent' && r0.left.mode===3 && !r0.left.run && r0.left.near===1, 'the winnings: out to the arena master: ' + JSON.stringify(r0));
  /* a death in a dungeon: the fall, then Release */
  const r1 = await ev(async ()=>{ setUi('playing'); let dx=-1, dy=-1; for (let x=0;x<OW_COLS && dx<0;x++) for (let y=0;y<OW_ROWS;y++) if (G.ow.map[x][y]===OW_DUNGEON){ dx=x; dy=y; break; }
    G.gameMode = 0; G.pendingDungeon = { x:dx, y:dy }; enterDungeonConfirm(); setUi('playing'); for (const m of G.mon) m.alive = 0;
    for (let i=0;i<30;i++){ renderGame(); await new Promise(r=>setTimeout(r, 30)); }
    const p = G.player; p.hp = 0; playerDies('a goblin'); const out = { ui:G.ui, down:!!G.playerDown, box:!!document.getElementById('downBox') };
    for (let i=0;i<50;i++){ renderGame(); await new Promise(r=>setTimeout(r, 30)); }
    const el = document.getElementById('downBox'); out.ready = !!(el && el.classList.contains('ready')); out.text = el ? el.textContent : ''; out.ui2 = G.ui;
    out.rot = ISO.player ? ISO.player.root.rotation.x : null; out.grey = document.body.classList.contains('downed');
    if (ISO.player){ const T = THREE, R = FPD.r, sz = R.getSize(new T.Vector2()), h = ISO.player.holder.position, c = new T.PerspectiveCamera(40, sz.x/sz.y, 0.05, 100); c.position.set(h.x + 1.6, 1.3, h.z + 1.6); c.lookAt(h.x, 0.2, h.z); c.updateProjectionMatrix(); R.render(FPD.scene, c); out.shot = R.domElement.toDataURL('image/jpeg', 0.88); }
    return out; });
  if (r1.shot){ require('fs').writeFileSync(SHOTS + '/rs744_fallen.jpg', Buffer.from(r1.shot.split(',')[1], 'base64')); delete r1.shot; }
  await page.screenshot({ path:SHOTS + '/rs744_dead.png' });
  const r2 = await ev(()=>{ playerRelease(); const out = { ui:G.ui, down:!!G.playerDown, box:!!document.getElementById('downBox') }; continueAfterDeath(); out.after = { over:G.gameOver, down:!!G.playerDown, grey:document.body.classList.contains('downed') }; return out; });
  console.log(JSON.stringify(r1), JSON.stringify(r2));
  A(r1.ui==='playing' && r1.down && r1.ui2==='playing', 'a death waits for Release: ' + JSON.stringify(r1));
  A(r1.ready && /dead/.test(r1.text) && /Release/.test(r1.text) && r1.grey, 'Oh dear, you are dead! and a Release button: ' + JSON.stringify(r1));
  A(r1.rot===null || r1.rot < -1.2, 'you fall: ' + JSON.stringify(r1));
  A(r2.ui==='death' && !r2.down && !r2.box && !r2.after.over && !r2.after.down && !r2.after.grey, 'Release opens the death screen: ' + JSON.stringify(r2));
  /* beaten in the arena: down, then Release - dragged out */
  const r3 = await ev(async ()=>{ setUi('playing'); const city = townList().find(t=>townInfo(t.x, t.y).tier===2); G.owPos = { x:city.x, y:city.y }; G.gameMode = 0; enterVillage(); setUi('playing');
    arenaFight(); setUi('playing'); const p = G.player; p.hp = 0; playerDies('a goblin'); const out = { over:G.gameOver, mode:G.gameMode, down:!!(G.playerDown && G.playerDown.arena) };
    for (let i=0;i<50;i++){ renderGame(); await new Promise(r=>setTimeout(r, 30)); } const el = document.getElementById('downBox'); out.text = el ? el.textContent : '';
    playerRelease(); out.after = { mode:G.gameMode, ui:G.ui, title:G.wevDlg && G.wevDlg.title, over:G.gameOver, hp:p.hp }; return out; });
  console.log(JSON.stringify(r3));
  A(r3.over===3 && r3.mode===2 && r3.down && /beaten/.test(r3.text), 'beaten in the arena, you go down: ' + JSON.stringify(r3));
  A(r3.after.mode===3 && r3.after.ui==='wevent' && r3.after.title==='Beaten!' && !r3.after.over && r3.after.hp >= 1, 'Release: dragged out: ' + JSON.stringify(r3));
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
