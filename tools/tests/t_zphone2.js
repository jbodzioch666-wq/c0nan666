// (probe, not in ALL) the user's save on an emulated phone: draw calls, triangles, shadow casters and the card's ms - comparable across releases
const fs = require('fs');
module.exports = async page=>{
  const txt = fs.readFileSync(process.env.ZSAVE, 'utf8');
  const r = await page.evaluate(async txt=>{ window.__noWarmSlice = false; const d = JSON.parse(txt).data; importSaveText(txt); loadGame(d.id); setUi('playing'); for (let i=0;i<40;i++){ renderGame(); await new Promise(r=>setTimeout(r, 30)); }
    const R = FPD.r, out = { ver:GAME_VERSION, phone:gfxPhone() };
    R.info.autoReset = false; R.info.reset(); FPD.shadowFrames = 1; renderGame(); out.callsWithShadow = R.info.render.calls; out.trisWithShadow = R.info.render.triangles; R.info.reset(); renderGame(); out.calls = R.info.render.calls; out.tris = R.info.render.triangles; R.info.autoReset = true;
    let casters = 0, meshes = 0, sprites = 0, transp = 0; FPD.scene.traverse(o=>{ if (!o.visible) return; if (o.isMesh){ meshes++; if (o.castShadow) casters++; if (o.material && o.material.transparent) transp++; } if (o.isSprite) sprites++; }); Object.assign(out, { meshes, casters, sprites, transp });
    const v = R.getDrawingBufferSize(new THREE.Vector2()); out.px = [v.x, v.y];
    SET.fps = true; for (let i=0;i<20;i++){ renderGame(); gfxGpuPoll(); await new Promise(r=>setTimeout(r, 16)); } PROF.t = {}; PROF.gpuN = 0; const N = 90; for (let i=0;i<N;i++){ renderGame(); gfxGpuPoll(); await new Promise(r=>setTimeout(r, 16)); } for (let i=0;i<4;i++){ await new Promise(r=>setTimeout(r, 16)); gfxGpuPoll(); }
    const t = PROF.t, n = PROF.gpuN || 1; out.gpu = +((t.gpu||0)/N).toFixed(2); out.sh = +((t.g_shadow||0)/n).toFixed(2); out.sc = +((t.g_scene||0)/n).toFixed(2); out.post = +((t.g_post||0)/n).toFixed(2); SET.fps = false;
    return out; }, txt);
  console.log('gpu', JSON.stringify(r));
};
module.exports.mobile = true;
