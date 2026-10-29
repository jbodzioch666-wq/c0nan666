// RS-736: a house of rooms. The estate agent sells a cottage of two plots (a parlour with the front door, and - RS-740 - a bedroom, its bed the first thing to build) and
// builds it bigger - house, manor, estate - as Construction grows; a room goes up on an empty plot, and its furniture is built in it.
// An old one-room house is rebuilt as rooms on a house big enough, its furniture kept.
// Shots: shots/rs736_cottage.png, rs736_plot.png (the room list), rs736_estate.png (every room, from the front door), rs736_back.png
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const ev = (f, a)=>page.evaluate(f, a), A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
  const frames = n=>ev(async n=>{ for (let i=0;i<n;i++){ renderGame(); await new Promise(r=>setTimeout(r, 40)); } }, n);
  const r0 = await ev(()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; townClosedCheck = ()=>false;
    const p = G.player; p.clock = p.turnCount = 60; G.owPos = { x:G.ow.spawnPos.x, y:G.ow.spawnPos.y }; enterVillage(); setUi('playing');
    p.gold = 100000; houseBuy(); const h = houseP(); setUi('estate'); const est = document.getElementById('overlay').textContent;
    enterHouse(); const [dx, dy] = houseDoorXY();
    const spots0 = ROOM_LAYOUT.house.benches.map(b=>b[0]); skAdd('logs', 6); houseBuildDialog(HOUSE_SPOTS.find(s=>s.id==='bed')); wevChoose(0);
    return { spots0, bed:ROOM_LAYOUT.house.benches.some(b=>b[0]==='bed'), h:JSON.stringify(h), est:/cottage/i.test(est) && /build it bigger/.test(est), at:[p.x, p.y], door:[dx, dy], doorTile:G.map[dx][dy]===T_DOOROUT, plots:ROOM_LAYOUT.house.benches.filter(b=>b[0]==='plot').length,
      spots:ROOM_LAYOUT.house.benches.map(b=>b[0]), cols:COLS, rows:ROWS }; });
  await frames(20); await page.screenshot({ path:SHOTS + '/rs736_cottage.png' });
  /* built bigger to a house: a plot, its room list; a workshop built on it */
  const r1 = await ev(()=>{ skGainXP('construction', 4000000); exitInterior(); const N = HOUSE_SIZES[2]; for (const k in N.cost) skAdd(k, N.cost[k]); houseUpgrade(); enterHouse(); setUi('playing'); const pl = ROOM_LAYOUT.house.benches.find(b=>b[0]==='plot'); G.benchXY = [pl[1], pl[2]]; useBench('plot'); const ov = document.getElementById('overlay');
    const out = { ui:G.ui, rooms:ov.querySelectorAll('.hroom').length, at:G.housePlot };
    skAdd('plank', 10); return out; });
  await page.waitForTimeout(300); await page.screenshot({ path:SHOTS + '/rs736_plot.png' });
  const r2 = await ev(()=>{ houseBuildRoom('workshop'); const h = houseP(); return { rooms:h.rooms.map(o=>o.k+'@'+o.c+','+o.r), planks:skHave('plank'), spots:ROOM_LAYOUT.house.benches.map(b=>b[0]), ui:G.ui,
      free:G.map[G.player.x][G.player.y]===T_FLOOR, again:(houseBuildRoom('workshop'), houseP().rooms.length) }; });
  /* bigger: house, manor, estate; every room; every piece of furniture */
  const r3 = await ev(async ()=>{ const p = G.player; setUi('playing'); exitInterior(); skGainXP('construction', 4000000); const out = { sizes:['House'] };
    for (let i=0;i<2;i++){ const N = HOUSE_SIZES[houseP().size + 1]; for (const k in N.cost) skAdd(k, N.cost[k]); houseUpgrade(); out.sizes.push(houseSz().nm); }
    out.gold = p.gold; enterHouse();
    for (const k of Object.keys(HOUSE_ROOMS)){ if (houseHas(k) || HOUSE_ROOMS[k].out) continue;   /* (the garden and farmyard have tests of their own) */ const S = houseSz(); let at = null; for (let r=0;r<S.r && !at;r++) for (let c=0;c<S.c && !at;c++) if (!houseRoomAt(c, r)) at = { c, r };
      G.housePlot = at; for (const m in HOUSE_ROOMS[k].cost) skAdd(m, HOUSE_ROOMS[k].cost[m]); houseBuildRoom(k); }
    skAdd('logs', 400); skAdd('ironb', 200); skAdd('essence', 1000);
    for (const s of HOUSE_SPOTS.filter(s=>houseHas(s.room))) for (let t=0; t<(s.tiers ? s.tiers.length : 1); t++){ houseBuildDialog(s); wevChoose(0); }
    setUi('playing'); const h = houseP(), L = ROOM_LAYOUT.house;
    /* every bench and every plot can be walked up to from the door */
    const [dx, dy] = houseDoorXY(), seen = new Set([dx+','+(dy - 1)]), q = [[dx, dy - 1]];
    while (q.length){ const [x, y] = q.shift(); for (const [ix, iy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const nx = x + ix, ny = y + iy, k = nx+','+ny; if (seen.has(k) || !G.map[nx] || G.map[nx][ny]!==T_FLOOR) continue; seen.add(k); q.push([nx, ny]); } }
    const reach = L.benches.filter(([k, x, y])=>roomBenchTiles(k, x, y).some(([tx, ty])=>[[1,0],[-1,0],[0,1],[0,-1]].some(([ix, iy])=>seen.has((tx + ix)+','+(ty + iy)))));
    Object.assign(out, { size:h.size, rooms:h.rooms.length, built:Object.keys(h.built).length, benches:L.benches.length, reach:reach.length, spots:L.benches.filter(b=>/^spot_|^plot$/.test(b[0])).map(b=>b[0]), cols:COLS, rows:ROWS });
    p.x = dx; p.y = dy - 1; return out; });
  await frames(25); await page.screenshot({ path:SHOTS + '/rs736_estate.png' });
  const r4 = await ev(async ()=>{ const p = G.player, pr = houseP().rooms.find(o=>o.k==='portal'), [x0, y0] = houseCellXY(pr.c, pr.r); p.x = x0 + 1; p.y = y0 + 4; for (let i=0;i<25;i++){ renderGame(); await new Promise(r=>setTimeout(r, 40)); }
    const faded = (V3.occ||[]).filter(o=>o.userData.grp && o.userData.grp.userData.faded).length; return { faded, occ:(V3.occ||[]).length, lamps:(V3.lamps||[]).length }; });
  await page.screenshot({ path:SHOTS + '/rs736_back.png' });
  /* the whole house from above, for a look at its plan */
  const plan = await ev(()=>{ const T = THREE, S = houseSz(), cx = HOUSE_X0 + S.c*3, cz = HOUSE_Y0 + S.r*3, c = new T.PerspectiveCamera(40, 1.6, 0.1, 200), R = V3.renderer, sz = R.getSize(new T.Vector2());
    c.aspect = sz.x/sz.y; c.position.set(cx + 4, 22, cz + 16); c.lookAt(cx, 0, cz); c.updateProjectionMatrix(); R.render(V3.scene, c); return R.domElement.toDataURL('image/jpeg', 0.85); });
  require('fs').writeFileSync(SHOTS + '/rs736_plan.jpg', Buffer.from(plan.split(',')[1], 'base64'));
  /* an old one-room house is rebuilt as rooms */
  const r5 = await ev(()=>{ setUi('playing'); exitInterior(); const p = G.player; p.house = { built:{ bed:1, hearth:1, altar:1, portal:2, trophy:1 } }; const h = houseP();
    enterHouse(); const L = ROOM_LAYOUT.house; const out = { size:h.size, rooms:h.rooms.map(o=>o.k), portal:houseTier('portal'), beds:L.benches.filter(b=>b[0]==='bed').length, altar:L.benches.some(b=>b[0]==='altar'), moved:!!h.moved };
    exitInterior(); return out; });
  console.log(JSON.stringify({ r0, r1, r2, r3, r4, r5 }));
  A(r0.est && r0.doorTile && r0.plots===0 && r0.spots0.includes('spot_trophy') && r0.spots0.includes('spot_bed') && r0.bed, 'a cottage: the parlour with its trophy space, and a bedroom whose bed is built first: ' + JSON.stringify(r0));
  A(r0.at[0]===r0.door[0] && r0.at[1]===r0.door[1] - 1, 'you come in at the front door');
  A(r1.ui==='housePlot' && r1.rooms===8 && r1.at.c===0 && r1.at.r===1, 'the plot lists the eight rooms: ' + JSON.stringify(r1));
  A(r2.rooms.join()==='parlour@0,0,bedroom@1,0,workshop@0,1' && r2.planks===0 && r2.spots.includes('spot_furnace') && r2.spots.filter(k=>k==='plot').length===1 && r2.free && r2.again===3, 'a workshop built on the plot: ' + JSON.stringify(r2));
  A(r3.sizes.join()==='House,Manor,Estate' && r3.size===4 && r3.rooms===7 && r3.built===10, 'an estate with every room and every piece of furniture: ' + JSON.stringify(r3));
  A(r3.spots.join()==='plot,plot' && r3.reach===r3.benches, 'every piece of furniture and the last two plots within reach: ' + JSON.stringify(r3));
  A(r3.gold===100000 - 2500 - 6000 - 15000 - 40000, 'the sizes cost their gold: ' + r3.gold);
  A(r4.occ > 0 && r4.faded > 0, 'a back wall fades when it hides you: ' + JSON.stringify(r4));
  A(r5.size===3 && r5.rooms.join()==='parlour,bedroom,kitchen,chapel,portal' && r5.portal===2 && r5.beds===1 && r5.altar && !r5.moved, 'an old house rebuilt as rooms, its furniture kept: ' + JSON.stringify(r5));
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
