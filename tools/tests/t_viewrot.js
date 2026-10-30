// RS-141: the camera orbits you as it turns, and the minimap is square
// RS-140: the towns and the overworld turn like the dungeons (Z/X, or the buttons on the minimap's rim), the walking keys turn
// with the view, the minimap turns with it, a room keeps the usual view, and the turn is kept in the save
module.exports = async page=>{
  const ev = (f, a)=>page.evaluate(f, a), A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
  const frames = n=>ev(async n=>{ for (let i=0;i<n;i++){ renderGame(); await new Promise(r=>setTimeout(r, 50)); } }, n);
  await ev(()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); G.gameMode = 0; ISO.rot = 0; VIEW.yaw = null; });
  await frames(6);
  const camAng = ()=>ev(()=>{ const p = O3.player && O3.player.g ? O3.player.g.getWorldPosition(new THREE.Vector3()) : null, c = O3.cam.position; return p ? Math.atan2(c.x - p.x, c.z - p.z) : null; });
  const a0 = await camAng();
  // turn with X: the camera swings a quarter turn
  await ev(()=>handlePlayingKey('x')); await frames(10); await page.waitForTimeout(3000);
  const a1 = await camAng(), r1 = await ev(()=>({ rot:ISO.rot, saved:G.player.viewRot, mm:MM.rot, yaw:viewYaw(), journal:G.ui }));
  console.log(JSON.stringify({ a0, a1, r1 }));
  A(a0!==null && a1!==null, 'the overworld camera is there to check');
  A(r1.rot===1 && r1.saved===1 && r1.journal==='playing', 'X turns the view a quarter turn (and no longer opens the journal)');
  // RS-141: the camera orbits you (it keeps looking at you all the way round the turn), and the minimap is square
  const orb = await ev(async ()=>{ const T = THREE, p = O3.player.g.getWorldPosition(new T.Vector3()); handlePlayingKey('x'); let worst = 0;
    for (let i=0;i<8;i++){ renderGame(); await new Promise(r=>setTimeout(r, 120)); const c = O3.cam.position, dir = new T.Vector3(); O3.cam.getWorldDirection(dir); const to = new T.Vector3(p.x - c.x, p.y + 0.5 - c.y, p.z - c.z).normalize(); worst = Math.max(worst, dir.angleTo(to)); }
    handlePlayingKey('z'); for (let i=0;i<4;i++){ renderGame(); await new Promise(r=>setTimeout(r, 60)); } return { worst, radius:getComputedStyle(document.getElementById('miniMap')).borderRadius }; });
  A(orb.worst < 0.12, 'the camera keeps looking at you while it turns: '+orb.worst);
  A(parseFloat(orb.radius) < 20, 'the minimap is square: '+orb.radius);
  if (a0!==null && a1!==null){ let d = a1 - a0; d = Math.atan2(Math.sin(d), Math.cos(d)); A(Math.abs(Math.abs(d) - Math.PI/2) < 0.25, 'the overworld camera swings round a quarter turn: '+d); }
  A(Math.abs(r1.mm - r1.yaw) < 0.05, 'the minimap turns with the view');
  // the walking keys turn with it: up still walks up the screen
  const wk = await ev(()=>{ const d0 = viewRotDir([0,-1]); ISO.rot = 0; const d00 = viewRotDir([0,-1]); ISO.rot = 1; return { d0, d00 }; });
  A(wk.d00[0]===0 && wk.d00[1]===-1 && !(wk.d0[0]===0 && wk.d0[1]===-1), 'the walking keys follow the turn: '+JSON.stringify(wk));
  // the buttons on the minimap's rim
  const btn = await ev(()=>{ const w = document.getElementById('mmRot'); if (!w || w.style.display==='none') return null; const b = w.querySelector('button[data-r="1"]'), mm = document.getElementById('miniMap').getBoundingClientRect(), br = b.getBoundingClientRect(); b.click(); return { rot:ISO.rot, near: Math.hypot(br.left+br.width/2 - (mm.left+mm.width/2), br.top+br.height/2 - (mm.top+mm.height/2)) < mm.width*0.8 }; });
  const onScreen = await ev(()=>[...document.querySelectorAll('#mmRot button')].every(b=>{ const r = b.getBoundingClientRect(); return r.left >= 0 && r.right <= innerWidth && r.top >= 0; }));
  A(onScreen, 'both turn buttons are fully on screen');
  // RS-143: the turn buttons go away with the minimap when a menu opens, and come back after
  const menus = await ev(async ()=>{ const vis = ()=>{ const w = document.getElementById('mmRot'); return !!w && w.style.display!=='none'; }, out = {};
    for (const u of ['inventory','skills','bestiary','charsheet']){ setUi(u); renderGame(); await new Promise(r=>setTimeout(r, 60)); out[u] = vis(); }
    setUi('playing'); renderGame(); await new Promise(r=>setTimeout(r, 60)); out.back = vis(); return out; });
  A(!menus.inventory && !menus.skills && !menus.bestiary && !menus.charsheet && menus.back, 'no turn buttons over menus: '+JSON.stringify(menus));
  A(btn && btn.rot===2 && btn.near, 'the turn buttons sit on the minimap rim and turn the view: '+JSON.stringify(btn));
  // a town turns too; a room inside keeps the usual view
  const town = await ev(async ()=>{ const t = townList()[0]; G.owPos = { x:t.x, y:t.y }; enterVillage(); setUi('playing'); G.interior = null; for (let i=0;i<25;i++){ renderGame(); await new Promise(r=>setTimeout(r, 50)); }
    const p = V3.player.g.position, c = V3.cam.position, ang = Math.atan2(c.x - p.x, c.z - p.z), want = viewYaw(); let d = ang - want; d = Math.atan2(Math.sin(d), Math.cos(d));
    enterInterior('tavern'); const inRot = viewRot(); exitInterior(); return { d, inRot }; });
  A(Math.abs(town.d) < 0.2, 'the town camera turns with the view: '+town.d); A(town.inRot===0, 'a room inside keeps the usual view');
  // kept in the save
  const kept = await ev(()=>{ saveCurrentGame(); const id = G.saveId; ISO.rot = 0; loadGame(id); return ISO.rot; });
  A(kept===2, 'the turn is kept in the save: '+kept);
  await ev(()=>{ ISO.rot = 0; G.player.viewRot = 0; });
};
module.exports.mobile = true;
