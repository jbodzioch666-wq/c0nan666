// RS-767: a site's way out looks like a way in. Indoors it is a flight of stairs up, lit by the day at its top (FPD.exitStairs), and
// you walk up it as up any stairs; out under the sky (a graveyard, the Lost City) it is a stone archway, its doors standing open on
// the day (FPD.exitDoors), and you walk out through it. A fallen master's way out on a lower floor is stairs too. No blue portal
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
  const r = await page.evaluate(async ()=>{ const out = {}, fr = async n=>{ for (let i=0;i<n;i++){ renderGame(); await new Promise(r=>setTimeout(r, 30)); } };
    goToCharCreate(); ccBegin(); wgRegenerate(12345); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; weatherSync = ()=>{};
    G.player.wildWarned = 1; G.player.hp = G.player.maxHp = 99999; G.player.clock = DAY_LENGTH*0.45;
    for (const [site, want] of [['dungeon', OW_DUNGEON], ['graveyard', OW_GRAVEYARD], ['mine', OW_MINE]]){ const m = G.ow.map; let c = null;
      for (let x=0;x<OW_COLS && !c;x++) for (let y=0;y<OW_ROWS;y++) if (m[x][y]===want && !owSeaSite(x, y)){ c = { x, y }; break; }
      G.gameMode = 0; setUi('playing'); G.pendingDungeon = { x:c.x, y:c.y }; enterDungeonConfirm(); setUi('playing'); G.mon.forEach(mo=>mo.alive = false); await fr(20);
      const e = G.genStart, o = { look:exitLook(e.x, e.y), stairs:FPD.exitStairs, doors:FPD.exitDoors, portal:(FPD.portals||[]).some(p=>p.x===e.x && p.y===e.y) };
      /* walked out */
      const [fx, fy] = fpStairDir(e.x, e.y); G.player.x = e.x + fx; G.player.y = e.y + fy; await fr(10); window.__trans = true; moveDir(-fx, -fy); o.walk = FPD.stair ? (FPD.stair.flat ? 'flat' : FPD.stair.up ? 'up' : 'down') : FPD.portal ? 'portal' : 'none';
      const t0 = performance.now(); let hi = 0; while ((FPD.stair || G.gameMode===1) && performance.now() - t0 < 4000){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); if (ISO.player && ISO.player.holder) hi = Math.max(hi, ISO.player.holder.position.y); }
      window.__trans = false; await fr(5); o.out = G.gameMode===0; o.hi = +hi.toFixed(2); out[site] = o; }
    /* a fallen master's way out, a floor down */
    { const m = G.ow.map; let c = null; for (let x=0;x<OW_COLS && !c;x++) for (let y=0;y<OW_ROWS;y++) if (m[x][y]===OW_DUNGEON && !owSeaSite(x, y)){ c = { x, y }; break; }
      G.gameMode = 0; setUi('playing'); G.pendingDungeon = { x:c.x, y:c.y }; enterDungeonConfirm(); setUi('playing'); saveLevelCache(1); loadLevel(2, false); setUi('playing'); G.mon.forEach(mo=>mo.alive = false); await fr(10);
      dgOpenExit(); await fr(15); let s = null; for (let x=0;x<COLS && !s;x++) for (let y=0;y<ROWS;y++) if (G.map[x][y]===T_EXIT) s = { x, y };
      out.boss = { at:!!s, look:s && exitLook(s.x, s.y), stairs:FPD.exitStairs, portals:(FPD.portals||[]).length }; G.gameMode = 0; setUi('playing'); }
    return out; });
  console.log(JSON.stringify(r));
  for (const k of ['dungeon', 'mine']) A(r[k].look==='stair' && r[k].stairs >= 1 && !r[k].portal && r[k].walk==='up' && r[k].out && r[k].hi > 0.3, k + ': its way out a flight up, walked up and out: ' + JSON.stringify(r[k]));
  A(r.graveyard.look==='door' && r.graveyard.doors >= 1 && !r.graveyard.portal && r.graveyard.walk==='flat' && r.graveyard.out, 'a graveyard\'s way out an open doorway, walked through: ' + JSON.stringify(r.graveyard));
  A(r.boss.at && r.boss.look==='stair' && r.boss.stairs >= 1, 'a fallen master\'s way out is stairs up: ' + JSON.stringify(r.boss));
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
