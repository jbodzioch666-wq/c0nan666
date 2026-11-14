// RS-441: a timber house's braces never cross its windows (on the narrow Alchemist they ran through the glass), and its shutters swing open
// either way, flat to the wall's face - on a side wall they stood out square from it
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1;
    const t = townList().find(t=>G.ow && townInfo(t.x, t.y).race==='human') || townList()[0]; G.owPos = { x:t.x, y:t.y }; trackVisitedTown(t.x, t.y); setUi('playing'); enterVillage(); setUi('playing');
    for (let i=0;i<4;i++){ renderGame(); await new Promise(r=>setTimeout(r, 40)); }
    const T = THREE, b = VILLAGE_BUILDINGS.find(b=>b.key==='alch'), mats = V3.mats, grp = new T.Group(), keep = V3.windows; V3.windows = [];
    v3Building(b, mats, grp, { face:b.face, door:b.door, floors:b.floors }); const glass = V3.windows.filter(w=>w.geometry.parameters && w.geometry.parameters.height > 0.4); V3.windows = keep;
    let cross = 0, shut = 0, square = 0; grp.updateMatrixWorld(true);
    grp.traverse(o=>{ if (!o.isMesh || o.material!==mats.wood && o.material!==mats.planks) return; const rz = Math.abs(o.rotation.z) + Math.abs(o.rotation.x);
      if (rz > 0.3 && o.material===mats.wood){ for (const g of glass) if (Math.hypot(o.position.x - g.position.x, o.position.y - g.position.y, o.position.z - g.position.z) < 0.35) cross++; }
      if (o.material===mats.planks && Math.abs(o.rotation.y) > 0.2 && o.geometry.parameters && Math.abs(o.geometry.parameters.height - 0.46) < 0.01){ shut++; if (Math.abs(o.rotation.y) > 1.0) square++; } });
    /* (RS-860) the shutters are boards on a hinge now: each group's face to its wall - flat to the wall it faces out, standing square it faces along it */
    const sb = v3RBoxGeo(0.085, 0.48, 0.03, 0.01), cx = b.x0 + b.w/2, cz = b.y0 + b.h/2, seen = new Set();
    grp.traverse(o=>{ if (!o.isMesh || o.geometry!==sb || seen.has(o.parent)) return; const g = o.parent; seen.add(g); shut++; const dx = g.position.x - cx, dz = g.position.z - cz, fn = Math.abs(dx/b.w) > Math.abs(dz/b.h) ? [Math.sign(dx), 0] : [0, Math.sign(dz)];
      const nx = Math.sin(g.rotation.y), nz = Math.cos(g.rotation.y); if (Math.abs(nx*fn[0] + nz*fn[1]) < 0.5) square++; });
    return { race:G.villageRace, glass:glass.length, cross, shut, square }; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.glass >= 2, 'the Alchemist has windows');
  A(r.cross===0, 'no brace crosses a window');
  A(r.shut >= 4 && r.square===0, 'the shutters swing open, none standing out square from the wall');
};
