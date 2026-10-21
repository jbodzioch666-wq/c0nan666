// RS-615: a raised house (on stilts in a marsh town, on a terrace in the hills) has a stair up to its door, on whichever side the door
// is, and you climb it: walking in, you go up the steps as the door opens (you walked in under the door before); coming out, you come
// out at the sill and walk down to the square in front. Shots: shots/rs615-up.png, shots/rs615-stair.png
module.exports = async page=>{
  page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e.stack || e).slice(0, 300)));
  const r = await page.evaluate(async ()=>{ window.__trans = true; goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1;
    detectRegionBiome = ()=>OW_SWAMP; let found = false;
    for (const t of townList()){ if (t.x===G.ow.spawnPos.x && t.y===G.ow.spawnPos.y) continue; G.gameMode = 0; G.interior = null; G.owPos = { x:t.x, y:t.y }; enterVillage(); setUi('playing');
      for (let i=0;i<90;i++){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); } if ((V3.steps||[]).some(q=>q.key==='tavern')){ found = true; break; } }   /* (a town whose layout takes the marsh: some were laid out before) */
    townClosedCheck = ()=>false; G.player.clock = DAY_LENGTH*10 + DAY_LENGTH*0.3;
    const fr = async n=>{ for (let i=0;i<n;i++){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); } };
    await fr(150); const out = { theme:G.villageTheme, stilts:!!(G.townLy && G.townLy.info.style.stilts), steps:(V3.steps||[]).length };
    const st = (V3.steps||[]).find(q=>q.key==='tavern'), b = VILLAGE_BUILDINGS.find(q=>q.key==='tavern'); if (!st || !b){ out.none = true; return out; }
    out.top = +st.top.toFixed(2); out.atSill = +v3StepH(st.x - st.nx*0.05, st.z - st.nz*0.05).toFixed(2); out.atFoot = +v3StepH(st.x + st.nx*0.56, st.z + st.nz*0.56).toFixed(2); out.mid = +v3StepH(st.x + st.nx*0.25, st.z + st.nz*0.25).toFixed(2);
    const fx = b.door.x + Math.round(st.nx), fy = b.door.y + Math.round(st.nz); G.player.x = fx; G.player.y = fy; await fr(40); out.standY = +V3.player.g.position.y.toFixed(2);
    moveDir(-Math.round(st.nx), -Math.round(st.nz)); let upMax = 0; for (let i=0;i<70;i++){ await fr(1); if (V3.door && V3.door.phase==='in') upMax = Math.max(upMax, V3.player.g.position.y); if (i===38) window.__shot = 1; }
    out.upMax = +upMax.toFixed(2); out.inside = !!G.interior;
    await fr(120); let ex = null; for (let x=0;x<G.map.length && !ex;x++) for (let y=0;y<G.map[x].length;y++) if (G.map[x][y]===T_DOOROUT){ ex = { x, y }; break; }
    let sp = null; for (const [dx, dy] of [[0,-1],[0,1],[1,0],[-1,0]]){ const x = ex.x + dx, y = ex.y + dy; if (G.map[x] && G.map[x][y]===T_FLOOR){ sp = { x, y, dx:-dx, dy:-dy }; break; } }
    G.player.x = sp.x; G.player.y = sp.y; await fr(40); moveDir(sp.dx, sp.dy); const ys = []; let after = 0; for (let i=0;i<1500 && after < 30;i++){ await fr(1); if (!G.interior && V3.player) ys.push(V3.player.g.position.y); if (!G.interior && !V3.door) after++; }   /* (till the walk out is done, whatever the frame rate) */
    out.outMax = +Math.max(0, ...ys).toFixed(2); out.outEnd = +(ys[ys.length - 1]||0).toFixed(3); out.outside = !G.interior;
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.stilts && r.steps > 0 && !r.none, 'a marsh town on stilts, with steps at its doors');
  A(r.top > 0.7 && Math.abs(r.atSill - r.top) < 0.01 && r.atFoot===0 && r.mid > 0.2 && r.mid < r.top, 'the stair rises from the square to the sill');
  A(r.standY < 0.05, 'standing in front of the door, on the ground');
  A(r.inside && r.upMax > r.top*0.8, 'walking in, up the steps to the door (it was walked under): ' + r.upMax);
  A(r.outside && r.outMax > 0.3 && r.outEnd < 0.02, 'coming out, down from the sill to the square');
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
