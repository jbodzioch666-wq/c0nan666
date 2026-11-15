// RS-426: the bounty board stands at the tavern's right-hand wall with the Captain of the Watch to its right; and a minion hurrying two
// squares in a turn walks through both - its figure used to glide straight to the second, or jump there
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1;
    const out = {}, p = G.player;
    // the board
    const t = townList()[0]; G.owPos = { x:t.x, y:t.y }; trackVisitedTown(t.x, t.y); setUi('playing'); enterVillage(); setUi('playing');
    const tav = VILLAGE_BUILDINGS.find(b=>b.key==='tavern'), [bx, by] = townBoardAt(), cap = G.villageNpcs.find(n=>n.service==='questgiver');
    out.board = { bx, by, right:tav.x0 + tav.w, rows:[tav.y0, tav.y0 + tav.h - 1], cap:[cap.x, cap.y], front:G.map[bx][by+1]===T_FLOOR };
    // a minion two squares a turn
    let dx=-1, dy=-1; for (let x=0;x<OW_COLS && dx<0;x++) for (let y=0;y<OW_ROWS;y++) if (G.ow.map[x][y]===OW_DUNGEON){ dx=x; dy=y; break; }
    G.gameMode = 0; G.owPos = { x:dx, y:dy }; G.pendingDungeon = { x:dx, y:dy }; enterDungeonConfirm(); setUi('playing'); p.hp = p.maxHp = 99999;
    G.map = makeGrid(T_WALL); for (let x=2;x<=14;x++) for (let y=2;y<=8;y++) G.map[x][y] = T_FLOOR; for (const c of G.dungeonDeco) c.fill('');
    p.x = 3; p.y = 7; G.mon = []; const m0 = newMonster(); Object.assign(m0, { alive:1, x:12, y:2, hp:500, maxHp:500, ac:1, atkBonus:0, dmg1:1, dmg2:1, xp:1, sym:'o', nm:'orc', col:'#8f8', art:null, abilities:[], asleep:true }); G.mon.push(m0);
    p.minions = [{ k:'skeleton', nm:'your skeleton', atkBonus:4, dmg1:1, dmg2:2, turnsLeft:99, reach:1, x:4, y:7 }]; const m = p.minions[0];
    for (let i=0;i<20;i++){ renderGame(); await new Promise(r=>setTimeout(r, 30)); }
    const px = NECRO_PX.get(m); out.has3d = !!px;
    const x0 = m.x, y0 = m.y; necroTick(); const steps = (px && px._q ? px._q.slice() : []).concat((m._trail||[]).slice()), x1 = m.x, y1 = m.y;
    const mid = [x0 + Math.sign(x1 - x0), y0 + Math.sign(y1 - y0)];   /* (its first step: one square toward the second) */
    let near = 9, jump = 0, last = px ? { x:px._pos.x, y:px._pos.y } : null;
    for (let i=0;i<40;i++){ renderGame(); await new Promise(r=>setTimeout(r, 16)); if (!px) break; const q = px._pos;
      near = Math.min(near, Math.hypot(q.x - mid[0] - 0.5, q.y - mid[1] - 0.5)); jump = Math.max(jump, Math.hypot(q.x - last.x, q.y - last.y)); last = { x:q.x, y:q.y }; }
    out.walk = { moved:Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)), steps, near:+near.toFixed(2), jump:+jump.toFixed(2), end:px ? +Math.hypot(px._pos.x - x1 - 0.5, px._pos.y - y1 - 0.5).toFixed(2) : null };
    // a diagonal hurry: two squares on the slant is over two squares' distance - the figure had jumped it
    for (let i=0;i<10;i++){ renderGame(); await new Promise(r=>setTimeout(r, 16)); }
    { const sx = m.x, sy = m.y; m.x = sx + 2; m.y = sy - 2; m._trail = [[sx + 1, sy - 1], [sx + 2, sy - 2]]; let nr = 9, jp = 0, ls = { x:px._pos.x, y:px._pos.y };
      for (let i=0;i<40;i++){ renderGame(); await new Promise(r=>setTimeout(r, 16)); const q = px._pos; nr = Math.min(nr, Math.hypot(q.x - sx - 1.5, q.y - sy + 0.5)); jp = Math.max(jp, Math.hypot(q.x - ls.x, q.y - ls.y)); ls = { x:q.x, y:q.y }; }
      out.diag = { near:+nr.toFixed(2), jump:+jp.toFixed(2), end:+Math.hypot(px._pos.x - m.x - 0.5, px._pos.y - m.y - 0.5).toFixed(2) }; }
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.board.bx===r.board.right && r.board.by >= r.board.rows[0] && r.board.by <= r.board.rows[1], 'the board against the tavern\'s right-hand wall');
  A(r.board.cap[0]===r.board.bx + 1 && r.board.cap[1]===r.board.by && r.board.front, 'the Captain to its right, its front clear');
  A(r.has3d, 'the minion stands as a 3D figure');
  A(r.walk.moved===2 && r.walk.steps.length===2, 'far from its foe it hurries two squares');
  A(r.walk.near < 0.2 && r.walk.jump < 0.6 && r.walk.end < 0.05, 'and its figure walks through both, no jump, ending on its square');
  A(r.diag.near < 0.2 && r.diag.jump < 0.6 && r.diag.end < 0.05, 'two squares on the slant too, without jumping');
};
