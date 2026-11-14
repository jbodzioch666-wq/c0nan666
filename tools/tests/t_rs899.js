// RS-899: the smithy's forge lean-to in a town (v3BuildScene) is round braced posts, a plate, rafters and a shingled roof falling to the street
// over the RS-862 stone forge (mouth to the street, flue through the roof) and anvil, a plank quench trough with water, tools on the wall -
// no six-sided posts, flat roof slab or box forge, anvil and trough; the forge still lights and sparks. Shot: shots/rs899-forge.png
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const A = (c, msg, r)=>{ if (!c) throw new Error('assert: ' + msg + ' ' + JSON.stringify(r || {})); };
  const r = await page.evaluate(async ()=>{ const w = ms=>new Promise(r=>setTimeout(r, ms)), T = THREE, out = {};
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.clock = Math.round(0.45*DAY_LENGTH) + 3*DAY_LENGTH;
    const t = townList().find(q=>((townFlavorAt(q.x, q.y)||{}).race||'human')==='human') || townList()[0]; G.owPos = { x:t.x, y:t.y }; enterVillage(); setUi('playing'); townClosedCheck = ()=>false;
    G.player.x = 8; G.player.y = 4; V3.dist = 6; for (let i=0;i<30;i++){ renderGame(); await w(25); }
    /* everything standing in the lean-to's footprint */
    let low = 0, plainBox = 0, cones8 = 0, anvils = 0, n = 0; const rbs = new Set(Object.values(V3_RB)), wp = new T.Vector3();
    V3.scene.traverse(o=>{ if (!o.isMesh) return; o.getWorldPosition(wp); if (wp.x < 6.0 || wp.x > 7.2 || wp.z < 2.6 || wp.z > 5.5) return; n++; const gg = o.geometry, pr = gg.parameters || {};
      if (gg.type==='CylinderGeometry' && pr.radialSegments < 8 && pr.radialSegments !== 4) low++; if (gg.type==='BoxGeometry' && !rbs.has(gg)) plainBox++; if (gg.type==='ConeGeometry' && pr.radialSegments <= 8) cones8++; if (gg===townV3Bench.anvil) anvils++; });
    Object.assign(out, { n, low, plainBox, cones8, anvils, lamp:V3.lamps.some(l=>l.forge && Math.abs(l.p[0] - 6.87) < 0.3), sparks:!!(V3.sparks && Math.abs(V3.sparks.p[0] - 6.45) < 0.2 && V3.sparks.p[1] > 1) });
    return out; });
  await page.screenshot({ path: __dirname + '/shots/rs899-forge.png' });
  console.log(JSON.stringify(r));
  A(r.n > 30 && !r.low && !r.cones8, 'the lean-to made of round parts, no six-sided posts or eight-sided horn', r);
  A(r.plainBox <= 2, 'no plain boxes (the furnace footing and body are its own boxes from RS-862)', r);
  A(r.lamp && r.sparks, 'the forge still glows at its mouth and sparks off its coals', r);
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
