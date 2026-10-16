// RS-444: the compass rose round the waypoint is stone, not paint: eight bevelled points in two tones round a band, a step of its own, and the
// dais, its runes and its crystal stand a step higher on it
module.exports = async page=>{
  const r = await page.evaluate(()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1;
    const t = townList().find(t=>townInfo(t.x, t.y).race!=='halfling') || townList()[0]; G.owPos = { x:t.x, y:t.y }; trackVisitedTown(t.x, t.y); setUi('playing'); enterVillage(); setUi('playing'); renderGame();
    const [wx, wy] = townWpAt(); let pts = 0, top = 0;
    V3.world.traverse(o=>{ if (o.isMesh && o.geometry && o.geometry.type==='ExtrudeGeometry'){ o.geometry.computeBoundingBox(); const b = o.geometry.boundingBox; if (Math.hypot((b.min.x + b.max.x)/2 - wx - 0.5, (b.min.z + b.max.z)/2 - wy - 0.5) < 3.2 && b.max.y < 0.15){ pts++; top = Math.max(top, b.max.y); } } });
    return { pts, top:+top.toFixed(3), runes:+V3.runes.position.y.toFixed(3), crystal:+V3.crystal.position.y.toFixed(2), painted:!!V3.world.getObjectByName('compassRose') }; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.pts >= 17 && r.top > 0.07, 'the rose is stone: sixteen half-points and a band, standing up off the ground');
  A(r.runes > 0.45 && r.crystal > 1.3, 'the dais, runes and crystal a step higher on it');
  A(!r.painted, 'no painted rose left');
};
