// RS-182: inside the buildings - a real doorway in the front wall, the floor stops at the walls, cabinets clear of the windows,
// bookshelves, hearths, beds and shrines against a wall, the stairs in the back corner up to a door, and no rugs on top of each other
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing');
    const t = townList()[0]; G.owPos = { x:t.x, y:t.y }; enterVillage(); setUi('playing'); townClosedCheck = ()=>false;
    const out = { layout:[], rooms:{} };
    // the layouts: wall furniture on a wall
    const onWall = (x, y)=>x===ROOM.x0 || y===ROOM.y0;
    for (const key in ROOM_LAYOUT) for (const [k,x,y] of ROOM_LAYOUT[key].benches){
      if (['books','hearth','shrine','bed','innbed'].includes(k) && !onWall(x, y)) out.layout.push(key+':'+k+'@'+x+','+y);
      if (['stairs','stairsup'].includes(k) && y!==ROOM.y0) out.layout.push(key+':'+k+' not at the back wall'); }
    for (const sp of HOUSE_SPOTS) if (['bed','hearth'].includes(sp.k) && !onWall(sp.x, sp.y)) out.layout.push('house:'+sp.k);
    // each room in 3D
    const rooms = ['smith','tavern','alch','shop','tailor','bank','temple','tavern_up','cellar'];
    for (const k of rooms){
      if (G.interior) exitInterior();
      if (k==='tavern_up'){ enterInterior('tavern'); townBench('stairs'); } else if (k==='cellar'){ enterInterior('shop'); townBench('cellar'); } else if (VILLAGE_BUILDINGS.some(b=>b.key===k)) enterInterior(k); else continue;
      renderGame(); await new Promise(res=>setTimeout(res, 60)); renderGame();
      const meshes = []; V3.world.traverse(o=>{ if (o.isMesh && o.geometry && o.geometry.parameters){ o.updateMatrixWorld(); const p = new THREE.Vector3(); o.getWorldPosition(p); meshes.push({ o, p, g:o.geometry.parameters, t:o.geometry.type }); } });
      const box = (w, h, d)=>meshes.filter(m=>m.t==='BoxGeometry' && Math.abs(m.g.width-w)<0.001 && Math.abs(m.g.height-h)<0.001 && Math.abs(m.g.depth-d)<0.001);
      const R = {};
      // cabinets (1.0 x 1.9) clear of the windows (0.9 x 0.9 panes) on the back wall
      const cab = box(1.0, 1.9, 0.35).map(m=>m.p.x), win = box(0.9, 0.9, 0.06).map(m=>m.p.x);
      R.cabWin = Math.min(99, ...cab.flatMap(c=>win.map(w=>Math.abs(c - w))));
      // the floor (the room-wide slab) ends at the front wall
      const fl = meshes.filter(m=>m.t==='BoxGeometry' && Math.abs(m.g.height-0.06)<0.001 && m.g.width >= 9 && Math.abs(m.p.y + 0.03) < 0.01).map(m=>m.p.z + m.g.depth/2);
      R.floorEnd = fl.length ? +Math.max(...fl).toFixed(2) : null;
      // nothing walls up the doorway
      const dz = ROOM.y1+1.15, gx = ROOM.door.x+0.5;
      R.doorBlocked = meshes.some(m=>m.t==='BoxGeometry' && Math.abs(m.p.z - dz) < 0.05 && m.g.height <= 0.55 && m.g.height >= 0.4 && Math.abs(m.p.x - gx) < m.g.width/2 - 0.05);
      // rugs: flat planes on the floor that don't overlap
      const rugs = meshes.filter(m=>m.t==='PlaneGeometry' && Math.abs(m.p.y - 0.012) < 0.003).map(m=>{ const turned = Math.abs(m.o.rotation.z) > 0.1, w = turned ? m.g.height : m.g.width, d = turned ? m.g.width : m.g.height; return [m.p.x - w/2, m.p.x + w/2, m.p.z - d/2, m.p.z + d/2]; });
      let ov = 0; for (let i=0;i<rugs.length;i++) for (let j=i+1;j<rugs.length;j++){ const a = rugs[i], b = rugs[j]; if (a[0] < b[1]-0.01 && b[0] < a[1]-0.01 && a[2] < b[3]-0.01 && b[2] < a[3]-0.01) ov++; }
      R.rugs = rugs.length; R.rugOverlap = ov;
      // a door at the top of the stairs
      R.stairDoor = box(0.78, 1.55, 0.05).length;
      out.rooms[k] = R; }
    if (G.interior) exitInterior();
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.layout.length===0, 'bookshelves, hearths, beds, shrines and stairs all stand against a wall');
  for (const [k, R] of Object.entries(r.rooms)){
    A(R.cabWin > 1.0, k+': the cabinets stand clear of the windows');
    A(R.floorEnd!==null && R.floorEnd <= 12.2, k+': the floor stops at the front wall');
    if (k==='tavern_up' || k==='cellar') A(R.doorBlocked, k+': no doorway to the street from upstairs or the cellar (RS-184)'); else A(!R.doorBlocked, k+': nothing walls up the front doorway');
    A(R.rugOverlap===0, k+': no rugs on top of each other');
  }
  A(r.rooms.tavern.stairDoor >= 1 && r.rooms.cellar.stairDoor >= 1, 'the stairs up climb to a door in the wall');
};
