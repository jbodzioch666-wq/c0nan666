// (probe, not in ALL; RS-767) the way out of each kind of site, depth 1 (and a boss's exit with ZBOSS=1): shots/zexit_<kind>.png
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const ev = (f, a)=>page.evaluate(f, a);
  await ev(()=>{ goToCharCreate(); ccBegin(); wgRegenerate(12345); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; weatherSync = ()=>{}; G.player.wildWarned = 1; G.player.hp = G.player.maxHp = 99999; G.player.clock = DAY_LENGTH*0.45; });
  const kinds = (process.env.ZKINDS || 'OW_DUNGEON,OW_GRAVEYARD,OW_MINE,OW_TEMPLE,OW_CASTLE,OW_PYRAMID,OW_LAIR,OW_NECROTOWER').split(',');
  for (const kn of kinds){
    const r = await ev(async ([kn, boss])=>{ const m = G.ow.map, want = window[kn] ?? eval(kn); let c = null;
      for (let x=0;x<OW_COLS && !c;x++) for (let y=0;y<OW_ROWS;y++) if (m[x][y]===want && !owSeaSite(x, y)){ c = { x, y }; break; }
      if (!c) return null; G.gameMode = 0; setUi('playing'); G.pendingDungeon = { x:c.x, y:c.y }; enterDungeonConfirm(); setUi('playing'); G.mon.forEach(mo=>mo.alive = false);
      if (boss){ G.player.x = Math.min(COLS-3, G.player.x + 4); dgOpenExit(); }
      let s = null; for (let x=0;x<COLS && !s;x++) for (let y=0;y<ROWS;y++) if (G.map[x][y]===T_EXIT && (!boss || x!==G.genStart.x || y!==G.genStart.y)){ s = { x, y }; break; }
      if (!s) return { kn, none:true };
      const w = stairWallDir(s.x, s.y) || portalWallDir(s.x, s.y); const f = w ? [-w[0], -w[1]] : fpStairDir(s.x, s.y);
      let px = s.x + f[0]*2, py = s.y + f[1]*2; if (tileAt(px, py)===T_WALL){ px = s.x + f[0]; py = s.y + f[1]; } G.player.x = px; G.player.y = py; ISO.rot = 0; FPD.mapRef = null;
      for (let i=0;i<40;i++){ renderGame(); await new Promise(r=>setTimeout(r, 30)); } await new Promise(r=>setTimeout(r, 3500)); renderGame();
      return { kn, s, f, theme:fpTheme().key, out:fpTheme().outdoor, depth:G.depth }; }, [kn, !!process.env.ZBOSS]);
    console.log(JSON.stringify(r));
    if (r && !r.none) await page.screenshot({ path:SHOTS + '/zexit_' + kn.slice(3).toLowerCase() + (process.env.ZBOSS ? '_boss' : '') + '.png' });
    await ev(()=>{ G.gameMode = 0; setUi('playing'); });
  }
  if (errs.length) console.log('errors: ' + errs.join(' | '));
};
