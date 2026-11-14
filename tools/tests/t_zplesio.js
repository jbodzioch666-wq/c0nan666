// Probe (RS-823): the Plesiosaur from several sides and in its poses. zplesio_<name>.png.
const fs = require('fs');
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  await page.evaluate(async ()=>{ const fr = n=>new Promise(res=>{ let i = 0; const f = ()=>++i >= n ? res() : requestAnimationFrame(f); requestAnimationFrame(f); }); window.__noLock = true; window.__noPirates = true; window.__w = ms=>new Promise(res=>setTimeout(res, ms)); window.__seaWind = { a:0, s:1 };
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; weatherSync = ()=>{}; const p = G.player; p.hasBoat = 1; p.boatTier = 4; p.clock = DAY_LENGTH*0.4; G.gameMode = 0; moveOverworldEncounters = ()=>{}; checkOverworldEncounterTrigger = ()=>{}; wevStep = ()=>false; wgStep = ()=>false; sqWorldStep = ()=>false; questOverworldTurn = ()=>false; checkMythicBeastTrigger = ()=>false;
    let spot = null, best = -1; for (let x=20;x<OW_COLS-20;x+=2) for (let y=20;y<OW_ROWS-20;y+=2){ if (G.ow.map[x][y]!==OW_WATER || iceAt(x, y)) continue; let r = 0; for (;r<18;r++){ let all = true; for (let k=0;k<16 && all;k++){ const a = k/16*6.283, X = Math.round(x + Math.sin(a)*r), Y = Math.round(y + Math.cos(a)*r); if (!G.ow.map[X] || G.ow.map[X][Y]!==OW_WATER) all = false; } if (!all) break; } if (r > best){ best = r; spot = { x, y }; } }
    G.owPos = { x:spot.x, y:spot.y }; owReveal(spot.x, spot.y, 14); for (let i=0;i<40 && !(O3.boat && O3.boat.visible && O3.ship);i++) await fr(20); await fr(40); const S = seaState(); S.yaw = O3.boatYaw = 0; S.v = 0; S.sail = 0; seaF();
    window.__look = (x, y, z, tx, ty, tz)=>{ const T = THREE, r = O3.renderer, c = window.__c2 || (window.__c2 = new T.PerspectiveCamera(36, 1, 0.05, 90)); c.aspect = r.domElement.width/r.domElement.height; c.position.set(x, y, z); c.lookAt(tx, ty, tz); c.updateProjectionMatrix(); r.setRenderTarget(null); r.render(O3.scene, c); return r.domElement.toDataURL('image/png'); };
    const f = window.__f = seaBeastSpawn('plesio', [O3.ppos.x + 2, O3.ppos.z - 7]); f.ramT = f.snapT = f.diveT = O3.t + 999; f.mode = 'circle'; const hold = window.__hold = setInterval(()=>{ f.x = O3.ppos.x + 2; f.z = O3.ppos.z - 7; f.want = f.yaw = window.__yaw||0; f.v = 0.01; }, 10); await __w(1800); });
  const save = (nm, url)=>fs.writeFileSync(SHOTS + `/zplesio_${nm}.png`, Buffer.from(url.split(',')[1], 'base64'));
  const at = (a, r, y, ty)=>page.evaluate(([a, r, y, ty])=>{ const f = __f, q = f.yaw + a; return __look(f.x + Math.sin(q)*r, O3_WATER_Y + y, f.z + Math.cos(q)*r, f.x + Math.sin(f.yaw)*0.6, O3_WATER_Y + ty, f.z + Math.cos(f.yaw)*0.6); }, [a, r, y, ty]);
  save('side', await at(1.57, 8.5, 1.6, 0.9));
  save('front', await at(0.45, 7, 1.7, 1.1));
  save('rear', await at(2.5, 7.5, 2.8, 0.9));
  save('high', await at(0.9, 8.5, 7, 0.5));
  save('head', await page.evaluate(()=>{ const f = __f, v = new THREE.Vector3(); f.head.getWorldPosition(v); const q = f.yaw + 0.55; return __look(v.x + Math.sin(q)*1.9, v.y + 0.35, v.z + Math.cos(q)*1.9, v.x, v.y, v.z); }));
  await page.evaluate(async ()=>{ const f = __f; f.mode = 'rear'; f.modeT = 99; await __w(900); }); save('reared', await at(1.3, 8.5, 1.8, 1.2));
  await page.evaluate(async ()=>{ const f = __f; f.mode = 'ram'; f.modeT = 99; await __w(900); }); save('ram', await at(0.7, 7.5, 2.2, 0.4));
  await page.evaluate(async ()=>{ const f = __f; f.mode = 'circle'; window.__yaw = Math.atan2(O3.ppos.x - f.x, O3.ppos.z - f.z); await __w(900); });
  await page.screenshot({ path:SHOTS + '/zplesio_game.png' });
  await page.evaluate(()=>clearInterval(__hold));
  if (errs.length) console.log('ERRS', JSON.stringify(errs));
};
