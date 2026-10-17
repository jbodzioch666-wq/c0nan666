// RS-126: building interiors have real surfaces - floorboards or flagstones with depth, plaster and panelled walls, rugs and window light
module.exports = async page=>{
  const ev = (f, a)=>page.evaluate(f, a), A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
  await ev(()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); if (G.gameMode!==3){ const t = townList()[0]; G.owPos = { x:t.x, y:t.y }; enterVillage(); setUi('playing'); } G.interior = null; G.player.clock = DAY_LENGTH*0.4; });
  const look = async k=>ev(async k=>{ if (G.interior) exitInterior(); const t0 = performance.now(); enterInterior(k); setUi('playing'); renderGame(); const ms = Math.round(performance.now() - t0);
    let floor = null, rugs = 0, panel = 0, light = 0;
    V3.world.traverse(o=>{ if (!o.isMesh) return; const m = o.material; if (o.geometry.parameters && o.geometry.parameters.width >= 9 && o.geometry.parameters.height===0.06 && o.geometry.parameters.depth >= 6) floor = m;
      if (m.map && m.map.image && m.map.image.height===768) rugs++; if (m.blending===THREE.AdditiveBlending && m.map===V3_INT_TEX.shaft) light++; });
    const tex = floor && floor.map && floor.map.image;
    return { ms, id:floor && floor.uuid, ok:!!floor, map:!!(floor && floor.map), bump:!!(floor && floor.bumpMap), size:tex ? tex.width : 0, rep:floor && floor.map ? floor.map.repeat.x : 0, rugs, light, intWin:(V3.intWin||[]).length }; }, k);
  const tav = await look('tavern'); console.log('tavern', JSON.stringify(tav));
  A(tav.ok && tav.map && tav.bump && tav.size===1024 && tav.rep===0.25, 'the tavern floor is boards with depth, not a stretched smear');
  A(tav.rugs >= 2, 'a rug in the room and a runner at the door'); A(tav.light >= 2, 'daylight falls in through the windows');
  const smith = await look('smith'); console.log('smith', JSON.stringify(smith)); A(smith.bump, 'the smithy has a flagstone floor');
  const kinds = await ev(()=>Object.keys(V3_INT_TEX).filter(k=>k.startsWith('flags')).length); A(kinds >= 1, 'flagstones made');
  const again = await look('tavern'); console.log('again', JSON.stringify(again)); A(again.id===tav.id, 'the room\'s textures are made once and reused, not uploaded again');
  // the wood looks like wood: boards with grain (varied along a board), and dark gaps between them
  const px = await ev(()=>{ const t = V3_INT_TEX[Object.keys(V3_INT_TEX).find(k=>k.startsWith('boards'))].map.image, x = t.getContext('2d'), row = x.getImageData(0, 300, 1024, 1).data; let dark = 0; for (let i=0;i<1024;i++) if (row[i*4] < 40) dark++;
    const col = x.getImageData(30, 0, 1, 1024).data; let mn = 255, mx = 0; for (let i=0;i<1024;i++){ mn = Math.min(mn, col[i*4]); mx = Math.max(mx, col[i*4]); } return { dark, spread:mx - mn }; });
  console.log('boards', JSON.stringify(px)); A(px.dark >= 16 && px.dark < 200, 'gaps between the boards'); A(px.spread > 30, 'grain along each board');
  // by night: no daylight through the windows
  const night = await ev(()=>{ exitInterior(); for (let i=0;i<20 && !isNightTime();i++) G.player.clock = DAY_LENGTH*(0.05*i); if (!isNightTime()) return -1; enterInterior('tavern'); if (!G.interior) return -2; setUi('playing'); renderGame(); return (V3.intWin||[]).length; }); A(night===0, 'no daylight at night');
  await ev(()=>exitInterior());
};
