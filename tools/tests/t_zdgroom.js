// (art probe, not in ALL) the dungeon camera over a room of a named purpose on the fixed seed
module.exports = async page=>{
  for (const want of (process.env.ZROOM || 'guard,collapsed').split(',')){
    const r = await page.evaluate(async want=>{ if (!window.__z){ goToCharCreate(); ccBegin(); wgRegenerate(12345); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; weatherSync = ()=>{}; window.__z = 1; }
      let dx = -1, dy = -1; for (let x=0;x<OW_COLS && dx<0;x++) for (let y=0;y<OW_ROWS;y++) if (G.ow.map[x][y]===OW_DUNGEON){ dx = x; dy = y; break; }
      let room = null; for (let f=0;f<12 && !room;f++){ G.gameMode = 0; G.pendingDungeon = { x:dx, y:dy }; enterDungeonConfirm(); setUi('playing'); G.mon = []; room = (G.genRooms||[]).find(r=>r.k===want) || null; }
      if (!room) return { missing:want }; G.player.x = room.x + (room.w>>1); G.player.y = room.y + (room.h>>1); for (let x=room.x;x<room.x+room.w;x++) for (let y=room.y;y<room.y+room.h;y++) if (G.dungeonDeco[x][y] && G.player.x===x && G.player.y===y) G.dungeonDeco[x][y] = '';
      ISO.player = null; ISO.focus = null; ISO.dist = 7; for (let i=0;i<16;i++){ renderGame(); await new Promise(r=>setTimeout(r, 40)); }
      const decos = []; for (let x=room.x;x<room.x+room.w;x++) for (let y=room.y;y<room.y+room.h;y++) if (G.dungeonDeco[x][y]) decos.push(G.dungeonDeco[x][y]); return { room:want, decos }; }, want);
    console.log(want, JSON.stringify(r));
    await page.screenshot({ path: SHOTS + '/zdgroom_' + want + '.png', timeout:120000 });
  }
};
