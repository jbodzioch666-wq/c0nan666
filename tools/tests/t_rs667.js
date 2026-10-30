// RS-667: no white ring round the boat - the soft patch of foam laid under the hull read as a halo on the water. Sail on open water near
// the start: the boat shows, and nothing in it is a see-through flat sheet. Shot: shots/rs667.png
module.exports = async page=>{
  page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const r = await page.evaluate(async ()=>{ const fr = n=>new Promise(res=>{ let i = 0; const f = ()=>++i >= n ? res() : requestAnimationFrame(f); requestAnimationFrame(f); });
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.gameMode = 0; G.player.clock = DAY_LENGTH*0.45;
    const m = G.ow.map, W = m.length, H = m[0].length, o = G.owPos; let w = null;
    for (let d=1; d<60 && !w; d++) for (let dx=-d; dx<=d && !w; dx++) for (const dy of [-d, d]){ const x = o.x + dx, y = o.y + dy; if (x < 3 || y < 3 || x >= W-3 || y >= H-3) continue;
      let ok = true; for (let i=-2;i<=2 && ok;i++) for (let j=-2;j<=2;j++) if (m[x+i][y+j]!==OW_WATER){ ok = false; break; } if (ok){ w = { x, y }; break; } }
    if (!w) return { none:true };
    G.owPos = w; owReveal(w.x, w.y, 8); await fr(150);
    let sheets = 0, meshes = 0; O3.boat.traverse(q=>{ if (!q.isMesh) return; meshes++; if (q.material && q.material.transparent && q.geometry.type==='PlaneGeometry' && Math.abs(q.rotation.x + Math.PI/2) < 0.01) sheets++; });
    return { w, visible:O3.boat.visible, meshes, sheets, foam:O3.foam }; });
  await page.screenshot({ path: SHOTS + '/rs667.png' });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(!r.none, 'open water near the start');
  A(r.visible && r.meshes > 5, 'you sail in the boat');
  A(r.sheets===0 && r.foam==null, 'no patch of foam under it');
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
