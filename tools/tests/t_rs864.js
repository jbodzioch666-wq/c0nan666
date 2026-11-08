// RS-864: the tailor's - a Saxony spinning wheel (spoked wheel, treadle, flyer and bobbin, drive band, distaff), a floor loom (castle,
// shafts, beater and reed, warp threads to the woven web, cloth and warp beams, treadles), an open dye vat of staves (it was a lidded
// cylinder), the bolts of cloth on a trestle table (they hung in the air); the wall plates stand proud of the wall top (they flickered);
// darker timber for elves, half-elves and gnomes; no grass up through a tree's trunk. Shots: shots/rs864-tailor.png, rs864-tree.png
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const A = (c, m, d)=>{ if (!c) throw new Error(m + ' :: ' + JSON.stringify(d)); };
  const r = await page.evaluate(async ()=>{ const w = ms=>new Promise(r=>setTimeout(r, ms)), out = {}, T = THREE; goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.clock = Math.round(0.45*DAY_LENGTH) + 3*DAY_LENGTH;
    const lum = h=>v3hex(h).reduce((a, b)=>a + b, 0); out.wood = { elf:lum(V3_RACE.elf.wood), halfelf:lum(V3_RACE.halfelf.wood), gnome:lum(V3_RACE.gnome.wood), human:lum(V3_RACE.human.wood) };
    const t = townList().find(t=>(townFlavorAt(t.x, t.y)||{}).race==='elf') || townList()[0]; G.owPos = { x:t.x, y:t.y }; enterVillage(); setUi('playing'); townClosedCheck = ()=>false; for (let i=0;i<10;i++){ renderGame(); await w(25); }
    const trees = []; for (let x=0;x<COLS;x++) for (let y=0;y<ROWS;y++) if (G.villageDeco[x][y]==='tree') trees.push([x + 0.5, y + 0.5]);
    let near = 0, blades = 0; V3.world.traverse(o=>{ const a = o.isMesh && o.geometry.attributes.aA; if (!a || o.geometry.attributes.aA.itemSize!==4 || !o.geometry.index) return; for (let i=0;i<a.count;i++){ const x = a.getX(i), z = a.getZ(i); blades++; if (trees.some(([tx, tz])=>Math.hypot(x - tx, z - tz) < 0.3)) near++; } });
    out.turf = townTurfOn();
    out.grass = { trees:trees.length, blades, near };
    enterInterior('tailor'); setUi('playing'); G.player.x = 10; G.player.y = 9; V3.dist = 11; for (let i=0;i<20;i++){ renderGame(); await w(25); }
    let spokes = 0, lines = 0, circle = 0, lid = 0, floatBolt = 0, bolts = 0, plateTop = -1; const bb = new T.Box3();
    V3.world.traverse(o=>{ if (o.isLineSegments) lines++; if (!o.isMesh) return; const g = o.geometry, P = g.parameters || {};
      if (g.type==='CircleGeometry') circle++; if (g.type==='CylinderGeometry' && P.radiusTop===0.42 && P.radiusBottom===0.36) lid++;
      if (g.type==='CylinderGeometry' && P.radiusTop===0.009 && P.height===0.23) spokes++;
      if (g.type==='CylinderGeometry' && P.radiusTop===0.1 && P.height===0.5){ bolts++; bb.setFromObject(o); const y = bb.min.y; if (!(y < 0.03 || (y > 0.38 && y < 0.44) || y > 0.55)) floatBolt++; }
      if (P.width && P.height===0.17 && P.depth===0.22){ bb.setFromObject(o); plateTop = Math.max(plateTop, bb.max.y); } });
    out.room = { spokes, lines, circle, lid, bolts, floatBolt, plateTop:+plateTop.toFixed(3), H:V3.roomH || null };
    return out; });
  await page.screenshot({ path: SHOTS + '/rs864-tailor.png' });
  await page.evaluate(async ()=>{ exitInterior(); setUi('playing'); let t = null; for (let x=0;x<COLS && !t;x++) for (let y=0;y<ROWS;y++) if (G.villageDeco[x][y]==='tree'){ t = [x, y]; break; } if (!t) return; G.player.x = t[0]; G.player.y = Math.min(ROWS - 2, t[1] + 1); for (let i=0;i<40;i++){ V3.dist = 4; renderGame(); await new Promise(r=>setTimeout(r, 25)); } });
  await page.screenshot({ path: SHOTS + '/rs864-tree.png' }); console.log(JSON.stringify(r)); A(errs.length===0, errs.join('|'));
  A(r.wood.elf < 330 && r.wood.halfelf < 300 && r.wood.gnome < 300, 'the elves\' timber is still pale', r.wood);
  A(r.grass.trees > 0 && r.grass.blades > 1000 && r.grass.near===0, 'grass up through a trunk', r.grass);
  A(r.room.spokes===10 && r.room.lines >= 1 && r.room.circle >= 1 && r.room.lid===0, 'the wheel, the loom or the vat', r.room);
  A(r.room.plateTop > 2.705, 'the wall plate level with the wall top', r.room); A(r.room.bolts===4 && r.room.floatBolt===0, 'a bolt of cloth hangs in the air', r.room); };
