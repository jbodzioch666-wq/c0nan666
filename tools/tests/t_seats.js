// RS-183: long beds (two tiles), a bed sleeps you till dawn, chairs and stools sized to the people, the player and the tavern
// regulars sit on them, the stairwell upstairs has no door-like lid, and the Peddler's trapdoor is in the back corner
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing');
    const t = townList()[0]; G.owPos = { x:t.x, y:t.y }; enterVillage(); setUi('playing'); townClosedCheck = ()=>false;
    const p = G.player, out = {};
    const frames = async n=>{ for (let i=0;i<n;i++){ v3Render(); await new Promise(res=>setTimeout(res, 16)); } };
    p.clock = DAY_LENGTH*3 + DAY_LENGTH*0.7;        // evening: the regulars are in
    enterInterior('tavern'); renderGame(); await frames(3);
    const seated = G.villagers.filter(v=>v.seat);
    out.patrons = seated.length; out.patronsOnStools = seated.every(v=>benchAt(v.x, v.y)==='stool');
    out.tables = ROOM_LAYOUT.tavern.benches.filter(b=>b[0]==='table').length; out.stools = ROOM_LAYOUT.tavern.benches.filter(b=>b[0]==='stool').length;
    out.clearPath = [7,8,9,10,11].every(y=>G.map[10][y]!==T_BENCH);
    // sit on a free stool
    const st = ROOM_LAYOUT.tavern.benches.find(b=>b[0]==='stool' && !G.villagers.some(v=>v.x===b[1] && v.y===b[2]));
    const nb = [[0,1],[0,-1],[1,0],[-1,0]].map(([dx,dy])=>[st[1]+dx, st[2]+dy]).find(([x,y])=>G.map[x][y]===T_FLOOR && !G.villagers.some(v=>v.x===x && v.y===y));
    p.x = nb[0]; p.y = nb[1]; renderGame(); await frames(30);
    moveDir(st[1]-nb[0], st[2]-nb[1]);
    out.sitAt = G.sitAt && [G.sitAt.x, G.sitAt.y]; out.stool = [st[1], st[2]];
    await frames(90);
    const gp = V3.player.g.position, s = V3.player.e.holder.scale.y;
    out.playerAt = [+gp.x.toFixed(2), +gp.z.toFixed(2)]; out.playerHips = +(V3.player.e.rig.hips.position.y*s).toFixed(2);
    const pat = V3.villagers.find(q=>q.v.seat); out.patronHips = pat ? +(pat.e.rig.hips.position.y*pat.e.holder.scale.y).toFixed(2) : null;
    // the lowest point of the seated player stays above the floor (feet on the ground, not through it)
    { V3.player.g.updateMatrixWorld(true); let lo = 9; V3.player.e.rig.legs.forEach(L=>L.knee.traverse(o=>{ if (o.isMesh && o.geometry){ o.geometry.computeBoundingBox(); const b = o.geometry.boundingBox.clone().applyMatrix4(o.matrixWorld); lo = Math.min(lo, b.min.y); } })); out.feet = +lo.toFixed(2); }
    // taken seats
    if (pat){ const v = pat.v, nb2 = [[0,1],[0,-1],[1,0],[-1,0]].map(([dx,dy])=>[v.x+dx, v.y+dy]).find(([x,y])=>G.map[x][y]===T_FLOOR);
      if (nb2){ p.x = nb2[0]; p.y = nb2[1]; moveDir(v.x-nb2[0], v.y-nb2[1]); out.takenSeat = G.sitAt; } }
    // standing up
    p.x = nb[0]; p.y = nb[1]; G.sitAt = { x:st[1], y:st[2], yaw:0 }; moveDir(0, 0); out.upAfterMove = G.sitAt;
    // the chair: sized to a person
    const chairs = []; V3.world.traverse(o=>{ if (o.isMesh && o.geometry && o.geometry.type==='BoxGeometry' && Math.abs(o.geometry.parameters.width-0.32)<0.001 && Math.abs(o.geometry.parameters.depth-0.3)<0.001){ const w = new THREE.Vector3(); o.getWorldPosition(w); chairs.push(+w.y.toFixed(2)); } });
    out.chairSeat = chairs;
    await frames(4);
    // upstairs: long beds, a stairwell with no lid, a night's sleep till dawn
    townBench('stairs'); renderGame(); await frames(3);
    out.bedFoot = ROOM_LAYOUT.tavern_up.benches.filter(b=>b[0]==='innbed').every(([k,x,y])=>benchAt(x, y)==='innbed' && benchAt(x, y+1)==='innbed');
    let lids = 0; V3.world.traverse(o=>{ if (o.isMesh && Math.abs(o.rotation.x - 1.2) < 0.01) lids++; }); out.lids = lids;
    p.gold = 100; p.clock = DAY_LENGTH*5 + DAY_LENGTH*0.6; const c0 = p.clock; townBench('innbed');
    out.dawn = +dayPhase().toFixed(3); out.slept = p.clock > c0;
    p.clock = DAY_LENGTH*5 + DAY_LENGTH*0.1; townBench('innbed'); out.dawnEarly = [+dayPhase().toFixed(3), Math.floor(p.clock/DAY_LENGTH)];
    // the Peddler's cellar trapdoor in the back corner, in and out
    exitInterior(); enterInterior('shop'); renderGame(); await frames(3);
    out.trap = benchAt(ROOM_STAIRS[0], ROOM_STAIRS[1]);
    townBench('cellar'); out.inCellar = G.interior.key; townBench('stairsup'); out.backUp = [G.interior.key, p.x, p.y, G.map[p.x][p.y]===T_FLOOR];
    renderGame(); await frames(3);
    p.clock = DAY_LENGTH*3 + DAY_LENGTH*0.7; exitInterior(); enterInterior('tavern'); G.sitAt = { x:st[1], y:st[2], yaw:roomSeatYaw('stool', st[1], st[2]) }; renderGame(); await frames(60);
    return out; });
  console.log(JSON.stringify(r));
  await page.screenshot({ path: SHOTS+'/shot_seats.png', timeout:120000 });
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.tables===2 && r.stools>=6 && r.clearPath, 'two tables with stools, and the way to the bar clear');
  A(r.patrons>=3 && r.patronsOnStools, 'the regulars sit on the stools');
  A(r.sitAt && r.sitAt[0]===r.stool[0] && r.sitAt[1]===r.stool[1], 'you sit on the stool you walk into');
  A(Math.abs(r.playerAt[0]-r.stool[0]-0.5) < 0.12 && Math.abs(r.playerAt[1]-r.stool[1]-0.5) < 0.12, 'your figure moves onto the stool');
  A(r.playerHips < 0.45 && r.patronHips!==null && r.patronHips < 0.45, 'seated low, not standing');
  A(r.feet > -0.04 && r.feet < 0.08, 'feet on the floor, not through it or dangling');
  A(!r.takenSeat, 'you can\'t sit where someone already sits');
  A(r.upAfterMove===null, 'moving gets you up');
  A(r.chairSeat.length >= 1 && r.chairSeat.every(y=>y < 0.4), 'chairs sized to a person');
  A(r.bedFoot, 'the inn beds are two tiles long');
  A(r.lids===0, 'no door-like lid over the stairwell');
  A(r.slept && Math.abs(r.dawn-0.25) < 0.01 && Math.abs(r.dawnEarly[0]-0.25) < 0.01 && r.dawnEarly[1]===5, 'a bed sleeps you till the next dawn');
  A(r.trap==='cellar' && r.inCellar==='cellar' && r.backUp[0]==='shop' && r.backUp[3], 'the trapdoor in the back corner, there and back');
};
