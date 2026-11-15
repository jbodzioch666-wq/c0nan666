// RS-861: the town's props - a turned iron street lamp with a scrolled arm and a caged lantern (a pole and a box), banner poles with a
// stone foot and a gilt finial, a city's walls with a footing, string course, corbelled parapet and turned merlons, round towers with a
// corbel ring and a tall roof, a gatehouse with arrow slits and voussoirs, ragged drooping pine tiers. Shot: shots/rs861-walls.png
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const A = (c, m, d)=>{ if (!c) throw new Error(m + ' :: ' + JSON.stringify(d)); };
  const r = await page.evaluate(async ()=>{ const w = ms=>new Promise(r=>setTimeout(r, ms)), out = {};
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.clock = Math.round(0.42*DAY_LENGTH) + 3*DAY_LENGTH;
    const t = townList()[0]; G.owPos = { x:t.x, y:t.y }; enterVillage(); setUi('playing'); townClosedCheck = ()=>false; for (let i=0;i<10;i++){ renderGame(); await w(25); }
    const T = THREE, mats = V3.mats, race = G.villageRace; G.villageRace = 'human';
    const gl = new T.Group(), keep = V3.windows, kl = V3.lamps; V3.windows = []; V3.lamps = []; v3Lamp(0, 0, mats, gl); out.lamp = { lathe:0, tube:0, glass:V3.windows.length, lamps:V3.lamps.length }; V3.windows = keep; V3.lamps = kl;
    gl.traverse(o=>{ if (o.isMesh && o.geometry===v3Lamp.post) out.lamp.lathe++; if (o.isMesh && o.geometry===v3Lamp.arm) out.lamp.tube++; });
    const gw = new T.Group(); townV3Walls(mats, gw); let corb = 0, cone10 = 0, cone32 = 0; gw.traverse(o=>{ if (!o.isMesh) return; if (o.geometry.type==='ConeGeometry'){ if (o.geometry.parameters.radialSegments===10) cone10++; if (o.geometry.parameters.radialSegments===32) cone32++; } if (o.geometry===v3RBoxGeo(0.08, 0.1, 0.1, 0.015) || o.geometry===v3RBoxGeo(0.1, 0.1, 0.08, 0.015)) corb++; });
    out.walls = { corb, cone10, cone32 };
    const gt = new T.Group(); G.villageTheme = 'tundra'; v3Tree(0, 0, mats, gt, 'pine'); let ragged = 0; gt.traverse(o=>{ if (o.isMesh && v3Tree.pine && v3Tree.pine.includes(o.geometry)) ragged++; }); out.pine = ragged; G.villageRace = race;
    return out; });
  console.log(JSON.stringify(r)); A(errs.length===0, errs.join('|'));
  A(r.lamp.lathe===1 && r.lamp.tube===1 && r.lamp.glass===1 && r.lamp.lamps===1, 'the street lamp', r.lamp);
  A(r.walls.cone10===0 && r.walls.cone32===4 && r.walls.corb > 100, 'the city walls', r.walls); A(r.pine===4, 'the pines', r); };
