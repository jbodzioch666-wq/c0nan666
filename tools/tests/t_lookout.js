// RS-237: the tower is a lookout - at its foot you can climb it, and the camera stands on its gallery looking out over the land
// with a wide view, turning slowly round the horizon; everything in sight goes on your map; any key climbs back down
module.exports = async page=>{
  const ev = (f, a)=>page.evaluate(f, a), A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
  const R = await ev(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); G.gameMode = 0; G.interior = null;
    const lm = owLandmark('tower'); if (!lm) return { none:true };
    let at = null; for (let d=1; d<4 && !at; d++) for (let a=0;a<16 && !at;a++){ const x = Math.round(lm.x + Math.cos(a/16*6.28)*d), y = Math.round(lm.y + Math.sin(a/16*6.28)*d); if (o3Passable(x, y) && !OW_SITE_TILES.includes(G.ow.map[x][y])) at = { x, y }; }
    if (!at) return { nospot:true };
    const wait = ms=>new Promise(r=>setTimeout(r, ms)), frames = async n=>{ for (let i=0;i<n;i++){ renderGame(); try{ o3Render(); }catch(e){} await wait(150); } };
    const out = {};
    G.owPos = { x:lm.x + 12, y:lm.y }; out.farNear = !!o3LookoutNear();
    G.owPos = at; await frames(3); out.near = !!o3LookoutNear();
    const far = [lm.x + 24, lm.y]; out.seenBefore = owSeen(far[0], far[1]);
    o3LookoutStart(lm); out.on = !!O3.lookout; out.seenAfter = owSeen(far[0], far[1]) || far[0] >= OW_COLS;
    const bar = document.getElementById('lookoutBar'); out.bar = !!(bar && bar.style.display!=='none' && /view from/i.test(bar.textContent));
    O3.lookout.t = 4; await frames(3);
    out.camUp = +(O3.cam.position.y - O3.heightAt(lm.x+0.5, lm.y+0.5)).toFixed(2); out.fov = Math.round(O3.cam.fov);
    window.dispatchEvent(new KeyboardEvent('keydown', { key:'w' })); await frames(1);
    out.off = !O3.lookout; out.fovBack = Math.round(O3.cam.fov); out.barGone = !bar || bar.style.display==='none';
    return out; });
  if (R.none || R.nospot){ console.log('  (no tower or no spot by it in this world - skipped)', JSON.stringify(R)); return; }
  A(!R.farNear && R.near, 'you can only climb it from its foot: '+JSON.stringify(R));
  A(R.on && R.bar, 'climbing it starts the lookout, with its banner: '+JSON.stringify(R));
  A(R.seenAfter, 'the land in sight goes on your map: '+JSON.stringify(R));
  A(R.camUp > 6 && R.fov >= 50, 'the camera stands high on the gallery with a wide view: '+JSON.stringify(R));
  A(R.off && R.fovBack===34 && R.barGone, 'a key climbs back down: '+JSON.stringify(R));
};
