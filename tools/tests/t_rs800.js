// RS-800: new ships. All five boats at sea are the ships built on the slipway, whole: a deck you stand on, painted hulls, guns run out, sails that turn with their masts. The water stays out of them.
// Shots: shots/rs800_t1.png to rs800_t5.png, each from the side and the stern quarter (rs800_t5b.png)
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const A = (c, m, d)=>{ if (!c) throw new Error(m + ' :: ' + JSON.stringify(d)); };
  await page.evaluate(async ()=>{ const fr = n=>new Promise(res=>{ let i = 0; const f = ()=>++i >= n ? res() : requestAnimationFrame(f); requestAnimationFrame(f); }); window.__noLock = true;
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; weatherSync = ()=>{}; const p = G.player; p.hasBoat = 1; p.boatTier = 1; p.clock = 100;
    let best = null, bw = -1; for (let x=4;x<OW_COLS-4;x++) for (let y=4;y<OW_ROWS-4;y++){ if (G.ow.map[x][y]!==OW_WATER) continue; let w = 0; for (let i=-4;i<=4;i++) for (let j=-4;j<=4;j++) if (G.ow.map[x+i] && G.ow.map[x+i][y+j]===OW_WATER) w++; if (w > bw){ bw = w; best = { x, y }; } if (w===81) break; }
    G.owPos = { x:best.x, y:best.y }; owReveal(best.x, best.y, 8); G.gameMode = 0; for (let i=0;i<40 && !(O3.boat && O3.boat.visible && O3.ship);i++) await fr(20); await fr(30); return { boat:!!O3.boat, ship:!!O3.ship, active:o3Active(), ui:G.ui, mode:G.gameMode }; });
  const out = {};
  for (const t of [1, 2, 3, 4, 5]){
    const d = await page.evaluate(async t=>{ const fr = n=>new Promise(res=>{ let i = 0; const f = ()=>++i >= n ? res() : requestAnimationFrame(f); requestAnimationFrame(f); }); G.player.boatTier = t; O3.boatYaw = 0.5; await fr(40);
      let lid = null, fl = null, verts = 0; O3.boat.traverse(o=>{ if (o.name==='waterLid') lid = o; if (o.name==='boatFloor') fl = o; if (o.isMesh) verts += o.geometry.attributes.position.count; });
      const T = THREE; O3.boat.updateMatrixWorld(true); let lo = 1e9; const pa = fl.geometry.attributes.position, v = new T.Vector3(); for (let i=0;i<pa.count;i++){ v.fromBufferAttribute(pa, i).applyMatrix4(fl.matrixWorld); lo = Math.min(lo, v.y); }
      const S = O3.ship, P = O3.player, foot = P.g.getWorldPosition(new T.Vector3()); fl.updateMatrixWorld(true); const box = new T.Box3().setFromObject(O3.boat), sz = box.getSize(new T.Vector3());
      return { built:O3.boatTierBuilt, vis:O3.boat.visible, lid:!!lid && lid.material.colorWrite===false, margin:+(lo - (O3_WATER_Y + 0.047)).toFixed(3), sails:S.sails.length, masts:S.masts.length, guns:S.guns.length, verts, footAbove:+(foot.y - lo).toFixed(3), standD:S.standD, L:+S.L.toFixed(2), h:+sz.y.toFixed(2), belly:S.sails[0] ? S.sails[0].scale.x : 0 }; }, t);
    out[t] = d; await page.waitForTimeout(t===1 ? 2500 : 900); await page.screenshot({ path:SHOTS + `/rs800_t${t}.png`, clip:{ x:350, y:100, width:700, height:560 } });
    if (t===5){ await page.evaluate(()=>{ O3.boatYaw = 3.6; }); await page.waitForTimeout(500); await page.screenshot({ path:SHOTS + '/rs800_t5b.png', clip:{ x:350, y:100, width:700, height:560 } }); }
    A(d.built===t && d.vis, 'tier ' + t + ' shown', d); A(d.lid, 'tier ' + t + ' keeps the water out', d); A(d.margin > 0, 'tier ' + t + ' deck above the waves', d); A(t===1 ? d.masts===0 && d.sails===0 : d.masts >= 1 && d.sails >= 1, 'tier ' + t + ' rigged (a rowboat has oars)', d); A(d.footAbove > -0.1 && d.footAbove < 0.5, 'tier ' + t + ' you stand on her', d); }
  console.log('rs800', JSON.stringify(out));
  A(out[1].guns===0 && out[2].guns===4 && out[3].guns===6 && out[4].guns===12 && out[5].guns===10, 'each ship carries her guns', out);
  A(out[5].L > out[1].L && out[4].L > out[2].L, 'bigger ships are longer', out);
  /* a galleon half built on the slipway still grows, stage by stage */
  const y = await page.evaluate(async ()=>{ const fr = n=>new Promise(res=>{ let i = 0; const f = ()=>++i >= n ? res() : requestAnimationFrame(f); requestAnimationFrame(f); }); const T = THREE, g = new T.Group(), kids = []; for (const st of [0, 1, 2, 3, 4, 5, 6]){ for (const c of g.children.slice()) g.remove(c); g.userData = {}; v3ShipBuild(g, 4, st, 0.5, false); kids.push(g.children.length); } return kids; });
  A(y.every((k, i)=>!i || k >= y[i-1]), 'the yard builds her up', y);
  A(!errs.length, 'no page errors', errs);
};
