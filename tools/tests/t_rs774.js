// RS-774: a fallen master's way out is a portal again. Since RS-767 it took the look of the site's own way out (stairs up indoors, an open
// doorway under the sky); now the portal its fall opens shimmers blue in a dungeon and a graveyard alike, you're drawn into it, and it's
// still a portal after a save and a reload. The site's own way out stays stairs
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
  const r = await page.evaluate(async ()=>{ const out = {}, fr = async n=>{ for (let i=0;i<n;i++){ renderGame(); await new Promise(r=>setTimeout(r, 30)); } };
    goToCharCreate(); ccBegin(); wgRegenerate(12345); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; weatherSync = ()=>{};
    G.player.wildWarned = 1; G.player.hp = G.player.maxHp = 99999; G.player.clock = DAY_LENGTH*0.45;
    const logs = []; const ol = logMsg; logMsg = (t, k)=>{ logs.push(String(t)); return ol(t, k); };
    for (const [site, want] of [['dungeon', OW_DUNGEON], ['graveyard', OW_GRAVEYARD]]){ const m = G.ow.map; let c = null;
      for (let x=0;x<OW_COLS && !c;x++) for (let y=0;y<OW_ROWS;y++) if (m[x][y]===want && !owSeaSite(x, y)){ c = { x, y }; break; }
      G.gameMode = 0; setUi('playing'); G.pendingDungeon = { x:c.x, y:c.y }; enterDungeonConfirm(); setUi('playing'); G.mon.forEach(mo=>mo.alive = false); await fr(15);
      const e = G.genStart, own = exitLook(e.x, e.y); logs.length = 0;
      dgOpenExit(); await fr(15); const b = G.dgBossExit, o = { own, b:!!b, said:logs.some(t=>/portal shimmers open/.test(t)) };
      if (b){ o.look = exitLook(b.x, b.y); o.portal = (FPD.portals||[]).some(p=>p.x===b.x && p.y===b.y);
        G.dgBossExit = null; o.without = exitLook(b.x, b.y); G.dgBossExit = b;   /* (what it would have looked like) */
        if (site==='dungeon'){ const d = serializeGame(); localStorage.setItem(SAVE_PREFIX + d.id, JSON.stringify(d)); loadGame(d.id); setUi('playing'); saveCurrentGame = ()=>{}; await fr(15);
          o.reload = { mode:G.gameMode, tile:G.map[b.x][b.y]===T_EXIT, look:exitLook(b.x, b.y), portal:(FPD.portals||[]).some(p=>p.x===b.x && p.y===b.y) }; }
        /* walked into */
        let st = null; for (const [dx, dy] of FACING_VECT) if (G.map[b.x + dx] && G.map[b.x + dx][b.y + dy]===T_FLOOR){ st = [dx, dy]; break; }
        G.player.x = b.x + st[0]; G.player.y = b.y + st[1]; await fr(8); logs.length = 0; window.__trans = true; moveDir(-st[0], -st[1]); o.walk = FPD.portal ? 'portal' : FPD.stair ? 'stair' : 'none';
        const t0 = performance.now(); while (G.gameMode===1 && performance.now() - t0 < 5000){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); }
        window.__trans = false; await fr(3); o.out = G.gameMode===0; o.step = logs.some(t=>/step through the portal/.test(t)); o.cleared = G.dgBossExit===null; }
      out[site] = o; }
    logMsg = ol; return out; });
  console.log(JSON.stringify(r));
  A(r.dungeon.own==='stair', 'a dungeon\'s own way out is still stairs up: ' + r.dungeon.own);
  for (const k of ['dungeon', 'graveyard']){ const o = r[k];
    A(o.b && o.look==='portal' && o.portal && o.said, k + ': its master\'s fall opens a portal, seen and told: ' + JSON.stringify(o));
    A(o.walk==='portal' && o.out && o.step && o.cleared, k + ': drawn into it and out: ' + JSON.stringify(o)); }
  A(r.dungeon.without==='stair' || r.graveyard.without==='door', 'it stands where the old look would have been stairs or a doorway: ' + r.dungeon.without + ' ' + r.graveyard.without);
  A(r.dungeon.reload && r.dungeon.reload.mode===1 && r.dungeon.reload.tile && r.dungeon.reload.look==='portal' && r.dungeon.reload.portal, 'still a portal after a reload: ' + JSON.stringify(r.dungeon.reload));
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
