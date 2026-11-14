// (probe, not in ALL) why a town come back to from the land isn't put back from the parked scene: which part of its key differs
module.exports = async page=>{
  page.setDefaultTimeout(0);
  const r = await page.evaluate(async ()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1;
    const fr = async n=>{ for (let i=0;i<n;i++){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); } };
    const parts = ()=>({ size:COLS + 'x' + ROWS, theme:G.villageTheme + '|' + G.villageRace, map:G.map.map(c=>c.join(',')).join(';'), deco:G.villageDeco.map(c=>c.join(',')).join(';'),
      bld:JSON.stringify((VILLAGE_BUILDINGS||[]).map(b=>[b.key, b.x0, b.y0, b.w, b.h, b.face, b.floors|0, b.stone ? 1 : 0, b.barracks ? 1 : 0, b.door && b.door.x, b.door && b.door.y])), houses:JSON.stringify((VILLAGE_HOUSES||[]).map(b=>[b.key, b.x0, b.y0, b.w, b.h, b.face, b.floors|0, b.stone ? 1 : 0, b.barracks ? 1 : 0])), at:v3ParkAt() });
    const t = G.ow.spawnPos; G.owPos = { x:t.x, y:t.y }; enterVillage(); setUi('playing'); await fr(60); const a = parts(), out = { parkedAfterTown:!!V3.parked, townNoted:!!V3.worldTown };
    G.gameMode = 0; G.villageNpcs = []; setUi('playing'); await fr(30); out.parkedOnLand = !!V3.parked; out.worldOnLand = !!V3.world;
    enterVillage(); setUi('playing'); const b = parts(); out.parkedBefore = !!V3.parked; out.fits = V3.parked ? v3ParkFits(V3.parked) : null;
    out.diff = {}; for (const k in a) out.diff[k] = a[k]===b[k] ? 'same' : (k==='map' || k==='deco' ? (()=>{ const x = a[k].split(';'), y = b[k].split(';'); let n = 0; const ex = []; x.forEach((row, i)=>{ const p = row.split(','), q = (y[i]||'').split(','); p.forEach((v, j)=>{ if (v!==q[j]){ n++; if (ex.length < 5) ex.push(i + ',' + j + ':' + v + '>' + q[j]); } }); }); return n + ' cells: ' + ex.join(' '); })() : a[k].slice(0, 120) + ' >>> ' + b[k].slice(0, 120));
    await fr(60); out.builtAgain = !!V3.worldTown; return out; });
  console.log(JSON.stringify(r, null, 1));
};
