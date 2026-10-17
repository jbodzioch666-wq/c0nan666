// RS-366: zoomed all the way out, the edge of the built land never comes into view. The land around you is 96 tiles a side
// (72 before), and it is rebuilt when you are as far from its middle as the camera's reach allows - early when zoomed out,
// late when zoomed in - so the far, coarse ground never shows where the real land should be
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); G.gameMode = 0; saveCurrentGame = ()=>{}; G.player.wildWarned = 1;
    const fr = async n=>{ for (let i=0;i<n;i++){ renderGame(); await new Promise(r=>setTimeout(r, 20)); } };
    await fr(3); const out = { W:O3_W }, T = THREE;
    // the real camera's reach on the ground, fully zoomed out: the farthest view corner from you, along either axis
    O3.dist = 28; O3.camTgt = null; await fr(2); const cam = O3.cam; cam.updateMatrixWorld(); const P = O3.ppos; let m = 0;
    for (const [nx, ny] of [[-1,1],[1,1],[-1,-1],[1,-1],[0,1]]){ const a = new T.Vector3(nx, ny, -1).unproject(cam), d = new T.Vector3(nx, ny, 1).unproject(cam).sub(a).normalize(), t = -a.y/d.y; const g = a.addScaledVector(d, t); m = Math.max(m, Math.abs(g.x - P.x), Math.abs(g.z - P.z)); }
    out.trueReach = +m.toFixed(1); out.reach28 = o3Reach(); out.aspect = +cam.aspect.toFixed(2);
    O3.dist = 12; out.reach12 = o3Reach(); O3.dist = 28;
    // walk away from the land's middle: zoomed out, the rebuild starts well before its edge could show
    const win = O3.win, trig28 = Math.max(6, O3_W/2 - out.reach28 - 4); out.trig28 = trig28;
    G.owPos = { x:win.cx + trig28 + 1, y:win.cy }; O3.ppos = null; renderGame(); out.started28 = !!O3.pend || O3.win!==win;
    if (O3.pend) o3BuildAbandon(); O3.win = win;
    // zoomed in, the same spot is not yet a reason to rebuild
    O3.dist = 12; G.owPos = { x:win.cx + trig28 + 1, y:win.cy }; renderGame(); out.started12 = !!O3.pend || O3.win!==win;
    if (O3.pend) o3BuildAbandon();
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.W===96, 'the land is built 96 tiles a side');
  A(r.reach28 >= r.trueReach && r.reach28 < r.trueReach + 8, 'the reach the game assumes covers what the camera sees, fully zoomed out: '+r.reach28+' vs '+r.trueReach);
  A(r.trig28 + r.trueReach <= r.W/2, 'the rebuild starts before the edge could come into view');
  A(r.reach12 < r.reach28, 'zoomed in, the reach is shorter');
  A(r.started28 && !r.started12, 'zoomed out, a rebuild starts at that distance; zoomed in, it waits');
};
