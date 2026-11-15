// (art probe, not in ALL; RS-760) the way down walked: in the Lost City (the pyramid's foot) and a plain dungeon, shots beside the flight
// and as you walk down into its doorway. Shots: shots/zsd_<site>_<n>.png
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const ev = (f, a)=>page.evaluate(f, a);
  await ev(()=>{ goToCharCreate(); ccBegin(); wgRegenerate(12345); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; weatherSync = ()=>{}; G.player.wildWarned = 1; G.player.hp = G.player.maxHp = 99999; G.player.clock = DAY_LENGTH*0.45; });
  for (const site of ['city', 'dungeon']){
    const r = await ev(async site=>{ const m = G.ow.map; let c = null; const want = site==='city' ? OW_TEMPLE : OW_DUNGEON;
      for (let x=0;x<OW_COLS && !c;x++) for (let y=0;y<OW_ROWS;y++) if (m[x][y]===want && !owSeaSite(x, y)){ c = { x, y }; break; }
      G.gameMode = 0; G.pendingDungeon = { x:c.x, y:c.y }; enterDungeonConfirm(); setUi('playing'); G.mon.forEach(mo=>mo.alive = false);
      let s = null; for (let x=0;x<COLS && !s;x++) for (let y=0;y<ROWS;y++) if (G.map[x][y]===T_STAIRSD){ s = { x, y }; break; }
      const [ex, ey] = fpStairDir(s.x, s.y); G.player.x = s.x + ex; G.player.y = s.y + ey; ISO.rot = 0;
      for (let i=0;i<50;i++){ renderGame(); await new Promise(r=>setTimeout(r, 30)); } return { s, e:[ex, ey], kind:G.siteKind, theme:fpTheme().key, beyond:tileAt(s.x - ex, s.y - ey)===T_WALL }; }, site);
    console.log(JSON.stringify(r));
    await page.screenshot({ path:SHOTS + '/zsd_' + site + '_0.png' });
    await ev(e=>{ window.__trans = true; moveDir(-e[0], -e[1]); }, r.e);
    for (const [i, at] of [[1, 0.45], [2, 0.75], [3, 0.95]]){ await ev(async at=>{ const t0 = performance.now(); while (FPD.stair && FPD.stair.t < at*1.3 && performance.now() - t0 < 3000){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); } }, at);
      await page.screenshot({ path:SHOTS + '/zsd_' + site + '_' + i + '.png' }); }
    await ev(async ()=>{ for (let i=0;i<40;i++){ renderGame(); await new Promise(r=>setTimeout(r, 30)); } G.gameMode = 0; setUi('playing'); });
  }
  if (errs.length) console.log('errors: ' + errs.join(' | '));
};
