// RS-444: the compass rose round the waypoint is stone, not paint: eight bevelled points in two tones round a band, a step of its own, and the
// dais, its runes and its crystal stand a step higher on it
module.exports = async page=>{
  const r = await page.evaluate(()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1;
    const t = townList().find(t=>townInfo(t.x, t.y).race!=='halfling') || townList()[0]; G.owPos = { x:t.x, y:t.y }; trackVisitedTown(t.x, t.y); setUi('playing'); enterVillage(); setUi('playing'); renderGame();
    const [wx, wy] = townWpAt(); let pts = 0, top = 0;
    V3.world.traverse(o=>{ if (o.isMesh && o.geometry && o.geometry.type==='ExtrudeGeometry'){ o.geometry.computeBoundingBox(); const b = o.geometry.boundingBox; if (Math.hypot((b.min.x + b.max.x)/2 - wx - 0.5, (b.min.z + b.max.z)/2 - wy - 0.5) < 3.2 && b.max.y < 0.15){ pts++; top = Math.max(top, b.max.y); } } });
    let wide = 0; V3.world.traverse(o=>{ if (o.isMesh && o.geometry && o.geometry.type==='CylinderGeometry' && o.geometry.parameters.radiusBottom > 1.2 && o.position.y > 0.1 && Math.hypot(o.position.x - wx - 0.5, o.position.z - wy - 0.5) < 0.1) wide++; });
    /* (RS-447) round the dais, just outside its bottom step, the rose's stone is unbroken: a ray from the centre at every angle meets a point */
    const hits = []; V3.world.traverse(o=>{ if (o.isMesh && o.geometry && o.geometry.type==='ExtrudeGeometry'){ o.geometry.computeBoundingBox(); const b = o.geometry.boundingBox; if (Math.hypot((b.min.x + b.max.x)/2 - wx - 0.5, (b.min.z + b.max.z)/2 - wy - 0.5) < 3.2 && b.max.y < 0.15) hits.push(o); } });
    const rc = new THREE.Raycaster(); let gaps = 0; for (let i=0;i<64;i++){ const a = i/64*Math.PI*2, px = wx + 0.5 + Math.cos(a)*1.34, pz = wy + 0.5 + Math.sin(a)*1.34; rc.set(new THREE.Vector3(px, 1, pz), new THREE.Vector3(0, -1, 0)); if (!rc.intersectObjects(hits, false).length) gaps++; }
    return { gaps, wide, pts, top:+top.toFixed(3), runes:+V3.runes.position.y.toFixed(3), crystal:+V3.crystal.position.y.toFixed(2), painted:!!V3.world.getObjectByName('compassRose') }; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.pts===16 && r.top > 0.07, 'the rose is stone: sixteen half-points standing up off the ground, no band under them (RS-446)');
  A(r.runes > 0.45 && r.crystal > 1.3 && r.wide===1, 'the dais and its three steps on the rose, runes and crystal over it (RS-446)');
  A(!r.painted, 'no painted rose left');
  A(r.gaps===0, 'no gaps between the points round the dais (RS-447)');
};
