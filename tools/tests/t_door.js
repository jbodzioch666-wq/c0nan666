// RS-127: walk through a door without a cut - the door swings open, the camera leans in, the room appears, and the camera eases back out
module.exports = async page=>{
  const ev = (f, a)=>page.evaluate(f, a), A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); }, shot = n=>process.env.DOOR_SHOTS ? page.screenshot({ path:process.env.DOOR_SHOTS+'/'+n+'.png', timeout:120000 }).catch(()=>{}) : null;
  await ev(()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); if (G.gameMode!==3){ const t = townList()[0]; G.owPos = { x:t.x, y:t.y }; enterVillage(); setUi('playing'); } G.interior = null; G.player.clock = DAY_LENGTH*0.4; });
  const frames = n=>ev(async n=>{ for (let i=0;i<n;i++){ renderGame(); await new Promise(r=>setTimeout(r, 40)); } }, n);
  // stand just outside the tavern door and settle
  const st = await ev(()=>{ const b = buildingByKey('tavern'); G.player.x = b.door.x; G.player.y = b.door.y + 1; G.villagers.forEach(v=>{ if (Math.abs(v.x-b.door.x) + Math.abs(v.y-b.door.y) < 3){ v.x = 1; v.y = 1; } }); renderGame(); return { face:b.face, door:b.door, hinge:!!(V3.doors && V3.doors.tavern) }; });
  A(st.hinge, 'the tavern door hangs on a hinge'); await frames(30);
  // step in
  const s1 = await ev(()=>{ moveDir(0, -1); window.__pv = V3.door && V3.door.pv; return { inside:!!G.interior && G.interior.key, phase:V3.door && V3.door.phase, sameScene:V3.mapRef!==G.map }; });
  A(s1.inside==='tavern', 'stepping into the doorway takes you inside at once (the game does not wait)'); A(s1.phase==='in' && s1.sameScene, 'but the picture still shows the street while you walk through');
  const blocked = await ev(()=>{ const x = G.player.x, y = G.player.y; moveDir(0, -1); return x===G.player.x && y===G.player.y; }); A(blocked, 'no wandering off half way through the door');
  await frames(3); await shot('door_in');
  const mid = await ev(()=>({ open:window.__pv ? Math.abs(window.__pv.rotation.y) : -1, fade:V3.fadeEl ? +V3.fadeEl.style.opacity : 0 })); A(mid.open > 0.5, 'the door swings open: '+JSON.stringify(mid));
  await ev(async ()=>{ for (let i=0;i<60 && V3.door && V3.door.phase==='in';i++){ renderGame(); await new Promise(r=>setTimeout(r, 40)); } });
  const s2 = await ev(()=>({ phase:V3.door && V3.door.phase, built:V3.mapRef===G.map })); A(s2.built, 'the room is built as you cross the threshold'); await frames(2); await shot('door_out');
  await ev(async ()=>{ for (let i=0;i<60 && V3.door;i++){ renderGame(); await new Promise(r=>setTimeout(r, 40)); } });
  const s3 = await ev(()=>({ done:!V3.door, fade:V3.fadeEl ? V3.fadeEl.style.display : 'none' })); A(s3.done && s3.fade==='none', 'and the view clears inside: '+JSON.stringify(s3));
  // and back out: the door swings shut behind you
  const s4 = await ev(()=>{ G.player.x = ROOM.door.x; G.player.y = ROOM.door.y - 1; renderGame(); return true; }); await frames(20);
  const s5 = await ev(()=>{ moveDir(0, 1); return { out:!G.interior, phase:V3.door && V3.door.phase }; }); A(s5.out && s5.phase==='in', 'out through the door the same way');
  await ev(async ()=>{ for (let i=0;i<120 && V3.door;i++){ renderGame(); await new Promise(r=>setTimeout(r, 40)); } });
  const s6 = await ev(()=>({ done:!V3.door, shut:V3.doors.tavern ? Math.abs(V3.doors.tavern.rotation.y) : -1, town:V3.mapRef===G.map && !G.interior })); A(s6.done && s6.town && s6.shut < 0.05, 'back on the street with the door shut: '+JSON.stringify(s6));
  // without 3D the door still just works
  const s7 = await ev(()=>{ v3Pref = false; const b = buildingByKey('tavern'); G.player.x = b.door.x; G.player.y = b.door.y + 1; tryMove(0, -1); const r = !!G.interior && !V3.door; exitInterior(); v3Pref = true; return r; }); A(s7, 'and with no 3D, straight in');
};
