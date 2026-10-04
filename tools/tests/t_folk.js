// RS-117: townsfolk step out of your way (no chat), and walk in real time whether or not you move
// RS-118: the town is stretched roomier, and everything placed in it lands on open ground
// RS-123: the shop pictures are painted on the banner cloths, with nothing floating above the poles
module.exports = async page=>{
  const ev = (f, a)=>page.evaluate(f, a), A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
  await ev(()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); if (G.gameMode!==3){ const t = townList()[0]; G.owPos = { x:t.x, y:t.y }; enterVillage(); setUi('playing'); } G.interior = null; });
  // the roomier town: wider and taller, and nothing ends up inside a wall
  const lay = await ev(()=>{ const bad = [];
    for (const n of G.villageNpcs) if (![T_VENDOR, T_QUESTGIVER].includes(G.map[n.x][n.y])) bad.push('npc '+n.service);
    for (const v of G.villagers) if (!v.indoors && !v.sit && G.map[v.x][v.y]!==T_FLOOR) bad.push('folk '+v.x+','+v.y);
    for (const b of VILLAGE_BUILDINGS) if (G.map[b.door.x][b.door.y]!==b.tile) bad.push('door '+b.key);
    if (G.map[TOWN_CX][tY(12)]!==T_WAYPOINT) bad.push('waypoint'); if (G.villageDeco[tX(15)][tY(8)]!=='board') bad.push('board'); if (G.map[TOWN_CX][ROWS-1]!==T_EXIT) bad.push('gate');
    return { stretched:!!G.townLy.stretched, cols:COLS, rows:ROWS, base:G.townLy.W0, bad }; });
  A(lay.stretched && lay.rows===23, 'the town is roomier: '+JSON.stringify(lay)); A(!lay.bad.length, 'everything stands on open ground: '+lay.bad.join(', '));
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
