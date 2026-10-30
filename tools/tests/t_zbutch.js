// (art probe, not in ALL; RS-759) the butchering frame by frame: ZKIND chicken|cow. Shots: shots/zbutch_<n>.jpg
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const ev = (f, a)=>page.evaluate(f, a), kind = process.env.ZKIND || 'chicken';
  await ev(kind=>{ window.__noWarmSlice = true;
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; townClosedCheck = ()=>false;
    const p = G.player; p.clock = p.turnCount = 60; G.owPos = { x:G.ow.spawnPos.x, y:G.ow.spawnPos.y }; enterVillage(); setUi('playing');
    p.gold = 100000; houseBuy(); skGainXP('construction', 200000); const N = HOUSE_SIZES[2]; for (const k in N.cost) skAdd(k, N.cost[k]); houseUpgrade();
    enterHouse(); G.housePlot = { c:0, r:1 }; skAdd('oak_plank', 15); skAdd('nails', 20); houseBuildRoom('farmyard'); setUi('playing');
    const f = farmP(); f.a = [{ k:kind, g:FARM_KIND[kind].grow }]; f.feed = 40; f.at = clockNow();
    const o = houseP().rooms.find(o=>o.k==='farmyard'), [x0, y0] = houseCellXY(o.c, o.r); p.x = x0 + 2; p.y = y0 + 2; houseRelayout(); setUi('playing'); }, kind);
  await ev(async ()=>{ for (let i=0;i<25;i++){ renderGame(); await new Promise(r=>setTimeout(r, 40)); } });
  const times = (process.env.ZT || '-0.2,0.2,0.38,0.46,0.5,0.56,0.7,1.6,2.4').split(',').map(Number);
  const r = await ev(async ([kind, times])=>{ const out = { shots:[], log:[] }; farmButcher(kind, 1); let k = 0; const t0 = performance.now();
    while (V3.butch && k < times.length && performance.now() - t0 < 20000){ renderGame(); await new Promise(r=>setTimeout(r, 15)); const B = V3.butch; if (!B) break; const o = B.q[B.i]; if (!o.go) continue;
      if (B.t >= o.go.w + 0.3 + times[k]){ const T = THREE, R = V3.renderer, sz = R.getSize(new T.Vector2()), P = V3.player, pp = P.g.position, g = o.p.g.position, dx = o.go.dx, dz = o.go.dz, big = kind==='cow';
        const mx = (pp.x + g.x)/2, mz = (pp.z + g.z)/2, c = new T.PerspectiveCamera(40, sz.x/sz.y, 0.05, 100); c.position.set(mx + dz*(big ? 3.4 : 2.6), big ? 1.2 : 1.0, mz - dx*(big ? 3.4 : 2.6)); c.lookAt(mx, big ? 0.6 : 0.5, mz); c.updateProjectionMatrix(); R.render(V3.scene, c);
        const [Ra] = P.e.rig.arms, want = Math.atan2(g.x - pp.x, g.z - pp.z);
        out.log.push({ t:times[k], yaw:+P.yaw.toFixed(2), want:+want.toFixed(2), hold:+P.e.holder.rotation.y.toFixed(2), sh:+Ra.sh.rotation.x.toFixed(2), el:+Ra.el.rotation.x.toFixed(2), torso:+P.e.rig.torso.rotation.x.toFixed(2), legs:(P.e.rig.legs||[]).map(L=>[+L.knee.rotation.x.toFixed(2), +L.hip.rotation.x.toFixed(2)]), base:B.legs, hipsY:P.e.rig.hips ? +P.e.rig.hips.position.y.toFixed(3) : null, sit:!!P.e.rig.sitting, sitAt:!!G.sitAt, sleep:!!G.sleepFx, stair:!!(V3.stair||V3.stairArr), crouch:P.e.rig.crouch, pyw:+(P.e.holder.position.y).toFixed(2), dir:[+dx.toFixed(2), +dz.toFixed(2)] });
        out.shots.push(R.domElement.toDataURL('image/jpeg', 0.85)); k++; } }
    return out; }, [kind, times]);
  const fs = require('fs'); r.shots.forEach((s, i)=>fs.writeFileSync(SHOTS + '/zbutch_' + i + '.jpg', Buffer.from(s.split(',')[1], 'base64')));
  console.log(JSON.stringify(r.log)); if (errs.length) console.log('errors: ' + errs.join(' | '));
};
