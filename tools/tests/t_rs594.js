// RS-594: sat at your campfire in a robe and a cape, the frame stays light - the cape's cloth was thrown away and settled afresh every frame
// (some forty steps of it, 20ms), and the robe folded for standing legs and then for the seat; up again, the cloth hangs and moves as before
module.exports = async page=>{
  page.setDefaultTimeout(0);
  const r = await page.evaluate(async ()=>{ goToCharCreate(); G.chosenKit = 2; ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.gameMode = 0; G.mon = []; G.weather = 'clear';
    G.gear.cape = rsMakeCape(5); G.player.look.body = 1;
    let spot = null; const sp = G.ow.spawnPos;
    for (let r=1; r<12 && !spot; r++) for (let dx=-r; dx<=r && !spot; dx++) for (let dy=-r; dy<=r; dy++){ const x = sp.x+dx, y = sp.y+dy, t = G.ow.map[x] && G.ow.map[x][y]; if ((t===OW_GRASS || t===OW_DESERT) && !skNodeAt(x, y) && !owPlaceAt(x, y)){ spot = { x, y }; break; } }
    G.owPos = { x:spot.x, y:spot.y }; const run = async n=>{ for (let i=0;i<n;i++) await new Promise(r=>requestAnimationFrame(r)); }; await run(200);
    skP().fire = { x:spot.x, y:spot.y, until:(G.player.turnCount||0) + 5000 }; G.player.campPitch = { x:spot.x, y:spot.y, until:(G.player.turnCount||0) + 5000, tent:1, spit:1 }; await run(60);
    const count = async n=>{ const W = {}; for (const nm of ['m3dCapeCloth', 'm3dFastNormals']){ const f = window[nm]; W[nm] = { n:0, ms:0, f }; window[nm] = function(){ const a = performance.now(); try{ return f.apply(this, arguments); } finally { W[nm].n++; W[nm].ms += performance.now() - a; } }; }
      await run(n); const o = {}; for (const k in W){ window[k] = W[k].f; o[k] = { n:+(W[k].n/n).toFixed(2), ms:+(W[k].ms/n).toFixed(2) }; } return o; };
    const P = O3.player, rig = P.e.rig, out = { robe:!!rig.skirt, cape:!!rig.cape };
    out.sat = await count(90); out.sitting = !!(P.campSit && rig.sitting);
    { const c = rig.cape, a = c.geometry.attributes.position.array, b = c.userData.base; let d = 0; if (b) for (let i=0;i<Math.min(a.length, b.length);i++) d = Math.max(d, Math.abs(a[i] - b[i])); out.capeHung = +d.toFixed(3); }
    G.owPos = { x:spot.x + 2, y:spot.y }; await run(40); out.up = await count(60); out.upFlag = !!rig.sitting;
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.robe && r.cape && r.sitting, 'sat at the fire in a robe and a cape');
  A(r.sat.m3dCapeCloth.n===0 && r.sat.m3dFastNormals.n < 0.5, 'no cloth worked while you sit - the cape hung once, the robe folded once: ' + JSON.stringify(r.sat));
  A(r.capeHung > 0.01, 'the cape still hangs over the seat: ' + r.capeHung);
  A(!r.upFlag && r.up.m3dCapeCloth.n > 0, 'up again, the cape is cloth again: ' + JSON.stringify(r.up));
};
