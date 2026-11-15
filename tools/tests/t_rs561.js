// RS-561: living details below ground. Props that stir as you pass (g.userData.near, fed your distance each frame): cobwebs sway
// and tremble when brushed, a chain hangs from the ceiling and swings hard when you walk under it, rats nesting by the refuse
// scatter from under your feet and creep back, water drips from the ceiling in the damp places with a ring where it lands and a
// plink now and then. The rats' and drips' tiles never block the way
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{ const out = { bad:[] }; goToCharCreate(); ccBegin(); wgRegenerate(12345); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; weatherSync = ()=>{};
    let dx = -1, dy = -1; for (let x=0;x<OW_COLS && dx<0;x++) for (let y=0;y<OW_ROWS;y++) if (G.ow.map[x][y]===OW_DUNGEON){ dx = x; dy = y; break; }
    let rats = 0, drips = 0; for (let f=0;f<6;f++){ G.gameMode = 0; G.pendingDungeon = { x:dx, y:dy }; enterDungeonConfirm(); setUi('playing');
      for (let x=0;x<COLS;x++) for (let y=0;y<ROWS;y++){ const d = G.dungeonDeco[x][y]; if (d==='rats'){ rats++; if (dgSolid(x, y)) out.bad.push('rats solid'); } if (d==='drip'){ drips++; if (dgSolid(x, y)) out.bad.push('drip solid'); } } }
    out.rats = rats; out.drips = drips;
    /* each stirring prop built on its own, driven with a distance: far, then near, then far */
    const drive = (d, steps)=>{ const g = isoPropModel({ kind:'dress', d, rot:0, x:5, y:7 }); if (!g.userData.near) return null; const out2 = []; let t = 0; for (const [dist, n] of steps){ for (let i=0;i<n;i++){ t += 1/60; g.userData.near(t, 0.3, dist, 1/60); } out2.push(g); } return { g, near:g.userData.near }; };
    { const w = drive('cobweb', [[5, 30]]); const web = w.g.children.find(c=>c.isMesh && c.geometry.type==='PlaneGeometry'); const r0 = web.rotation.z; let t = 0.5; for (let i=0;i<30;i++){ t += 1/60; w.near(t, 0.3, 5, 1/60); } const calm = Math.abs(web.rotation.z - r0);
      let mx = 0; for (let i=0;i<60;i++){ t += 1/60; w.near(t, 0.3, 0.3, 1/60); mx = Math.max(mx, Math.abs(web.rotation.z - r0)); } out.web = { calm:+calm.toFixed(4), brushed:+mx.toFixed(4) }; }
    { const c = drive('chains', [[5, 1]]); const hang = c.g.children.find(o=>o.isGroup && o.position.y > 0.9); let t = 0, far = 0, near = 0; for (let i=0;i<120;i++){ t += 1/60; c.near(t, 0.3, 5, 1/60); far = Math.max(far, Math.abs(hang.rotation.z)); } for (let i=0;i<120;i++){ t += 1/60; c.near(t, 0.3, 0.3, 1/60); near = Math.max(near, Math.abs(hang.rotation.z)); } out.chain = { far:+far.toFixed(3), near:+near.toFixed(3) }; }
    { const q = drive('rats', [[5, 1]]); const rg = q.g.children.filter(o=>o.isGroup); const home = rg.map(o=>[o.position.x, o.position.z]); let t = 0; for (let i=0;i<90;i++){ t += 1/60; q.near(t, 0.3, 0.5, 1/60); } const fled = rg.map((o, i)=>Math.hypot(o.position.x - home[i][0], o.position.z - home[i][1]));
      for (let i=0;i<400;i++){ t += 1/60; q.near(t, 0.3, 6, 1/60); } const back = rg.map((o, i)=>Math.hypot(o.position.x - home[i][0], o.position.z - home[i][1])); out.rats2 = { n:rg.length, fled:+Math.min(...fled).toFixed(3), back:+Math.max(...back).toFixed(3) }; }
    { const dr = drive('drip', [[5, 1]]); const drop = dr.g.children.find(o=>o.isMesh && o.geometry.type==='SphereGeometry'); let seenHigh = false, seenLow = false, t = 0; for (let i=0;i<300;i++){ t += 1/60; dr.near(t, 0.3, 6, 1/60); if (drop.visible && drop.position.y > 0.8) seenHigh = true; if (drop.visible && drop.position.y < 0.2) seenLow = true; } out.drip = { falls:seenHigh && seenLow, text:!!EXAMINE_DECO.drip, snd:typeof audDrip==='function' }; }
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.rats > 0 && r.drips > 0 && r.bad.length===0, 'rats and drips are placed, and never block the way: ' + r.bad.join(';'));
  A(r.web.brushed > r.web.calm + 0.02, 'a cobweb trembles when you brush it');
  A(r.chain.near > r.chain.far*2, 'a chain swings hard when you pass under it');
  A(r.rats2.n===4 && r.rats2.fled > 0.4 && r.rats2.back < 0.05, 'the rats scatter and creep back');
  A(r.drip.falls && r.drip.text && r.drip.snd, 'the drip falls from the ceiling to the floor, with its sound');
};
