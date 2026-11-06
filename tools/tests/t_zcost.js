// (probe, not in ALL) the open land's frame (ZSAVE): draw calls and triangles of the scene pass, and the CPU ms of a frame with each big
// group hidden in turn - what each costs
const fs = require('fs');
module.exports = async page=>{
  const txt = fs.readFileSync(process.env.ZSAVE, 'utf8');
  const r = await page.evaluate(async txt=>{ window.__noWarmSlice = false; const d = JSON.parse(txt).data; importSaveText(txt); loadGame(d.id); G.interior = null; G.gameMode = 0; const t = G.ow.spawnPos; G.owPos = { x:t.x, y:t.y + 3 }; setUi('playing');
    for (let i=0;i<150;i++){ renderGame(); await new Promise(r=>setTimeout(r, 25)); }
    const R = O3.renderer; R.info.autoReset = false; R.info.reset(); renderGame(); const calls = R.info.render.calls, tris = R.info.render.triangles; R.info.autoReset = true;
    const time = async ()=>{ const a = []; for (let i=0;i<60;i++){ const t0 = performance.now(); renderGame(); a.push(performance.now() - t0); await new Promise(r=>setTimeout(r, 5)); } a.sort((x,y)=>x-y); return +a[30].toFixed(2); };
    const out = { calls, tris, base:await time() };
    const groups = { nodes:O3.nodeGrp, world:O3.world }; for (const k in O3){ const v = O3[k]; if (v && v.isObject3D && v!==O3.scene && !groups[k] && v.parent===O3.scene) groups[k] = v; }
    const tri = ()=>{ R.info.autoReset = false; R.info.reset(); renderGame(); const t = R.info.render.triangles, c = R.info.render.calls; R.info.autoReset = true; return [t, c]; };
    for (const [k, g] of Object.entries(groups)){ if (!g) continue; let n = 0; g.traverse(()=>n++); if (n < 10) continue; const v0 = g.visible; g.visible = false; const [t, c] = tri(); out['no_' + k] = { n, tris:tris - t, calls:calls - c }; g.visible = v0; }
    { const pg = O3.pgrp; if (pg){ let tr = 0; pg.traverse(o=>{ if (o.isMesh && o.geometry){ const g = o.geometry; tr += (g.index ? g.index.count : g.attributes.position.count)/3; } }); out.playerTris = Math.round(tr); } }
    { let shadowCasters = 0; O3.scene.traverse(o=>{ if (o.isMesh && o.castShadow && o.visible) shadowCasters++; }); out.casters = shadowCasters; }
    // and the matrix walk alone over the nodes
    { const g = O3.nodeGrp, t0 = performance.now(); for (let i=0;i<50;i++) g.updateMatrixWorld(false); out.nodeWalk = +((performance.now() - t0)/50).toFixed(3); }
    return out; }, txt);
  console.log(JSON.stringify(r));
};
