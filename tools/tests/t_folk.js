// RS-117: townsfolk step out of your way (no chat), and walk in real time whether or not you move
// RS-118: the town is stretched roomier, and everything placed in it lands on open ground
// RS-129: the bounty board and the Captain moved clear of the bank; drifted props put back on their tiles
// RS-123: the shop pictures are painted on the banner cloths, with nothing floating above the poles
module.exports = async page=>{
  const ev = (f, a)=>page.evaluate(f, a), A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
  await ev(()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); if (G.gameMode!==3){ const t = townList()[0]; G.owPos = { x:t.x, y:t.y }; enterVillage(); setUi('playing'); } G.interior = null; });
  // the roomier town: wider and taller, and nothing ends up inside a wall
  const lay = await ev(()=>{ const bad = [];
    for (const n of G.villageNpcs) if (![T_VENDOR, T_QUESTGIVER].includes(G.map[n.x][n.y])) bad.push('npc '+n.service);
    for (const v of G.villagers) if (!v.indoors && !v.sit && G.map[v.x][v.y]!==T_FLOOR) bad.push('folk '+v.x+','+v.y);
    for (const b of VILLAGE_BUILDINGS) if (G.map[b.door.x][b.door.y]!==b.tile) bad.push('door '+b.key);
    if (G.map[TOWN_CX][tY(12)]!==T_WAYPOINT) bad.push('waypoint'); { const [bx,by] = townBoardAt(); if (G.villageDeco[bx][by]!=='board') bad.push('board'); } if (G.map[TOWN_CX][ROWS-1]!==T_EXIT) bad.push('gate');
    return { stretched:!!G.townLy.stretched, cols:COLS, rows:ROWS, base:G.townLy.W0, bad }; });
  A(lay.stretched && lay.rows===23, 'the town is roomier: '+JSON.stringify(lay)); A(!lay.bad.length, 'everything stands on open ground: '+lay.bad.join(', '));
  // RS-129: the bounty board and the Captain stand together, clear of the bank; the props stand where their tiles are
  const tidy = await ev(()=>{ const bank = buildingByKey('bank'), cap = G.villageNpcs.find(n=>n.service==='questgiver'), [bx,by] = townBoardAt();
    const gap = (x,y)=>Math.max(bank.x0 - x, x - (bank.x0+bank.w-1), bank.y0 - y, y - (bank.y0+bank.h-1));
    renderGame(); let stall = null, desk = 0; V3.world.traverse(o=>{ if (o.isMesh && o.material===V3.mats.awning && o.geometry.parameters && o.geometry.parameters.width===1.3) stall = [Math.floor(o.position.x), Math.floor(o.position.z)];
      if (o.isMesh && o.material && o.material.color && o.material.color.getHex()===0x2a5a3a) desk++; });
    let sd = null; for (let x=0;x<COLS;x++) for (let y=0;y<ROWS;y++) if (G.villageDeco[x][y]==='stall') sd = [x,y];
    return { board:gap(bx,by), cap:gap(cap.x,cap.y), together:Math.abs(cap.x-bx)+Math.abs(cap.y-by), stall, sd, desk, capTile:G.map[cap.x][cap.y]===T_QUESTGIVER }; });
  A(tidy.board >= 3 && tidy.cap >= 3, 'the board and the Captain stand clear of the bank: '+JSON.stringify(tidy)); A(tidy.together===1 && tidy.capTile, 'the Captain stands by his board');
  A(tidy.stall && tidy.sd && tidy.stall[0]===tidy.sd[0] && tidy.stall[1]===tidy.sd[1], 'the market stall stands on its own tile, not in a tree: '+JSON.stringify(tidy)); A(tidy.desk===0, 'the banker\'s old outdoor desk is gone');
  const fl = await ev(()=>{ renderGame(); const bs = V3.banners||[]; let floating = 0; V3.world && V3.world.traverse(o=>{ if (o.isSprite && o.material.map && o.material.map.image && o.material.map.image.tagName==='CANVAS' && o.material.alphaTest===0.2) floating++; }); return { n:bs.length, painted:bs.every(b=>!!b.material.map), floating, signs:(V3.signs||[]).length }; });
  A(fl.n >= 7 && fl.painted, 'every shop banner has its picture painted on: ' + JSON.stringify(fl));
  A(fl.floating === 0, 'no pictures float above the banner poles');
  A(fl.signs >= 7, 'the door signs still hang');
  // put a villager right in front of you and walk into them
  const r = await ev(()=>{ const p = G.player, v = (G.villagers||[]).find(o=>!o.animal && !o.guard && !o.sit);
    const dirs = [[0,-1],[1,0],[-1,0],[0,1]]; let d = null;
    for (const [dx,dy] of dirs){ const x = p.x+dx, y = p.y+dy; if (G.map[x] && G.map[x][y]===T_FLOOR && !G.villagers.some(o=>o!==v && o.x===x && o.y===y)){ d = [dx,dy]; break; } }
    if (!v || !d) return { skip:true }; v.x = p.x + d[0]; v.y = p.y + d[1]; const vx = v.x, vy = v.y;
    tryMove(d[0], d[1]); return { moved:p.x===vx && p.y===vy, ui:G.ui, vAway:!(v.x===vx && v.y===vy), vNotOnYou:!(v.x===p.x && v.y===p.y) }; });
  A(!r.skip, 'a villager and a free step to test with');
  A(r.moved, 'you walked on through'); A(r.ui==='playing', 'no chat opened: '+r.ui); A(r.vAway && r.vNotOnYou, 'the villager stepped aside');
  // standing still, the town keeps moving
  const before = await ev(()=>JSON.stringify((G.villagers||[]).filter(v=>!v.sit).map(v=>[v.x,v.y])));
  const px = await ev(()=>[G.player.x, G.player.y]);
  let after = before; for (let i=0; i<30 && after===before; i++){ await page.waitForTimeout(1000); after = await ev(()=>JSON.stringify((G.villagers||[]).filter(v=>!v.sit).map(v=>[v.x,v.y]))); }   // (software 3D draws slowly here, so give the clock time)
  A(JSON.stringify(px)===JSON.stringify(await ev(()=>[G.player.x, G.player.y])), 'you stood still');
  A(before!==after, 'the townsfolk walked while you stood still');
  // and nobody walks onto you
  A(await ev(()=>!(G.villagers||[]).some(v=>!v.indoors && v.x===G.player.x && v.y===G.player.y)), 'nobody stands on you');
  console.log(JSON.stringify(r));
};
