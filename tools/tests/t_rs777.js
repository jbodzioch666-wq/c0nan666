// RS-777: the hearth in your house's kitchen no longer fades out while you stand by it. Its cooking rig, put away (hidden) until you cook,
// held the pot's bubbles at a unit wide, and the see-through check's ray hit them inside the hidden group - so the whole hearth faded.
// Stands on each tile round the hearth: nothing fades. Shots: shots/rs777-*.png
const fs = require('fs');
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const ev = (f, a)=>page.evaluate(f, a);
  const frames = n=>ev(async n=>{ for (let i=0;i<n;i++){ renderGame(); await new Promise(r=>setTimeout(r, 30)); } }, n);
  const r0 = await ev(()=>{ window.__noWarmSlice = true;
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; townClosedCheck = ()=>false;
    const p = G.player; p.clock = p.turnCount = 60; G.owPos = { x:G.ow.spawnPos.x, y:G.ow.spawnPos.y }; enterVillage(); setUi('playing');
    p.gold = 100000; houseBuy(); skGainXP('construction', 2000000); const N = HOUSE_SIZES[2]; for (const k in N.cost) skAdd(k, N.cost[k]); houseUpgrade();
    enterHouse(); G.housePlot = null; const S = HOUSE_SIZES[houseP().size]; for (let c=0;c<S.c && !G.housePlot;c++) for (let r=0;r<S.r;r++) if (!houseRoomAt(c, r)){ G.housePlot = { c, r }; break; } for (const k of ['oak_plank', 'nails', 'logs', 'plank', 'ironb', 'stone', 'limestone', 'clay']) skAdd(k, 200); houseBuildRoom('kitchen');
    const h = houseP(); h.built.hearth = 1; houseRelayout(); const b = ROOM_LAYOUT.house.benches.find(b=>b[0]==='hearth');
    return { rooms:h.rooms.map(o=>o.k + '@' + o.c + ',' + o.r), hearth:b && b.slice(1), sz:[COLS, ROWS] }; });
  console.log(JSON.stringify(r0));
  const out = [];
  if (r0.hearth) for (const [dx, dy] of [[0,1],[-1,1],[1,1],[-1,0],[1,0],[0,2]]){
    const r = await ev(async ([dx, dy])=>{ const b = ROOM_LAYOUT.house.benches.find(b=>b[0]==='hearth'), x = b[1] + dx, y = b[2] + dy; if (G.map[x][y]!==T_FLOOR) return { dx, dy, wall:true };
      const p = G.player; p.x = x; p.y = y; for (let i=0;i<40;i++){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); }
      const fd = []; for (const g of V3.world.children){ if ((g.userData.fade||0) > 0.2){ const bb = new THREE.Box3().setFromObject(g), c = bb.getCenter(new THREE.Vector3()); fd.push({ fade:+g.userData.fade.toFixed(2), at:[+c.x.toFixed(2), +c.z.toFixed(2)], h:+(bb.max.y - bb.min.y).toFixed(2), occ:!!(V3.occ||[]).some(o=>o.userData.grp===g), n:g.name||g.type }); } }
      return { dx, dy, me:[x + 0.5, y + 0.5], benchAt:[b[1] + 0.5, b[2] + 0.5], fd, shot:V3.renderer ? V3.renderer.domElement.toDataURL('image/png') : null }; }, [dx, dy]);
    if (r.shot){ fs.writeFileSync(SHOTS + `/rs777-${dx}_${dy}.png`, Buffer.from(r.shot.split(',')[1], 'base64')); r.shot = true; }
    out.push(r); }
  console.log(JSON.stringify(out.map(o=>({ at:[o.dx, o.dy], wall:o.wall, fd:o.fd }))));
  const A = (c, m)=>{ if (!c) throw new Error('assert: ' + m); };
  A(r0.hearth && r0.rooms.some(k=>/^kitchen/.test(k)), 'a kitchen with a hearth: ' + JSON.stringify(r0));
  A(out.filter(o=>!o.wall).length >= 4, 'stood round it on four tiles or more');
  for (const o of out) A(o.wall || !o.fd.length, 'nothing fades standing at ' + [o.dx, o.dy] + ': ' + JSON.stringify(o.fd));
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
