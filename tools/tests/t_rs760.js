// RS-760: the way down. The Lost City's pyramid stands centred on its way down (it stood a tile aside on an even-width floor), and every
// flight down whose head meets a wall goes on under it through a low, stone-framed doorway into the dark - you walk down into it and out
// of sight (you used to sink through the wall). Old city floors (lay 'city1') are made afresh
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
  const r = await page.evaluate(async ()=>{ const out = {}, fr = async n=>{ for (let i=0;i<n;i++){ renderGame(); await new Promise(r=>setTimeout(r, 30)); } };
    goToCharCreate(); ccBegin(); wgRegenerate(12345); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; weatherSync = ()=>{};
    G.player.wildWarned = 1; G.player.hp = G.player.maxHp = 99999; G.player.clock = DAY_LENGTH*0.45;
    /* centred for any width */
    const c0 = COLS; out.centred = [40, 41, 44, 47].every(w=>{ COLS = w; const P = cityPyr(); return (P.x0 + P.x1)/2===(w >> 1) + 0.5 && P.x1 - P.x0===CITY_PYR.w; }); COLS = c0;
    for (const site of ['city', 'dungeon']){ const m = G.ow.map, want = site==='city' ? OW_TEMPLE : OW_DUNGEON; let c = null;
      for (let x=0;x<OW_COLS && !c;x++) for (let y=0;y<OW_ROWS;y++) if (m[x][y]===want && !owSeaSite(x, y)){ c = { x, y }; break; }
      G.gameMode = 0; G.pendingDungeon = { x:c.x, y:c.y }; enterDungeonConfirm(); setUi('playing'); G.mon.forEach(mo=>mo.alive = false); await fr(30);
      let s = null; for (let x=0;x<COLS && !s;x++) for (let y=0;y<ROWS;y++) if (G.map[x][y]===T_STAIRSD){ s = { x, y }; break; }
      const [ex, ey] = fpStairDir(s.x, s.y), o = { kind:G.siteKind, wall:tileAt(s.x - ex, s.y - ey)===T_WALL, doors:FPD.stairDoors };
      if (site==='city'){ const P = cityPyr(); o.atDoor = (P.x0 + P.x1)/2===s.x + 0.5 && s.y===P.y1 && ex===0 && ey===1; o.lay = G.dgCache[cacheKey(G.dungeonSlot, 1)] ? 1 : 0; saveLevelCache(1); o.lay = G.dgCache[cacheKey(G.dungeonSlot, 1)].lay; }
      /* walked down: past the doorway, under the ground, the picture dark */
      G.player.x = s.x + ex; G.player.y = s.y + ey; await fr(10); window.__trans = true; let lowest = 0, beyond = false; const d0 = G.depth; moveDir(-ex, -ey);
      const t0 = performance.now(); while (FPD.stair && performance.now() - t0 < 4000){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); const h = ISO.player.holder.position; lowest = Math.min(lowest, h.y); if ((h.x - (s.x + 0.5))*-ex + (h.z - (s.y + 0.5))*-ey > 0.55) beyond = true; }
      window.__trans = false; await fr(20); Object.assign(o, { lowest:+lowest.toFixed(2), beyond, down:G.depth===d0 + 1 }); out[site] = o; G.gameMode = 0; setUi('playing'); }
    return out; });
  console.log(JSON.stringify(r));
  A(r.centred, 'the pyramid centred on the way down at any width');
  A(r.city.kind==='city' && r.city.atDoor && r.city.wall && r.city.doors >= 1 && r.city.lay==='city2', 'the city\'s way down at the pyramid\'s door: ' + JSON.stringify(r.city));
  A(r.dungeon.wall && r.dungeon.doors >= 1, 'a dungeon\'s flight down goes on through a doorway: ' + JSON.stringify(r.dungeon));
  for (const k of ['city', 'dungeon']) A(r[k].beyond && r[k].lowest < -0.9 && r[k].down, 'walked down into it and on, below the ground: ' + JSON.stringify(r[k]));
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
