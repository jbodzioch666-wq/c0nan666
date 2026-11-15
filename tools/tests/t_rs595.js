// RS-595: the wind slowed - plants lean and breathe with a wave every ten seconds or so and take seconds to follow a gust, gusts build over
// ten to twenty seconds; and the dungeon's torches waver softly instead of jumping
module.exports = async page=>{
  page.setDefaultTimeout(0);
  const r = await page.evaluate(async ()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.gameMode = 0; G.weather = 'clear'; const out = {};
    /* the gust: how fast it changes, sampled over two minutes */
    { let mx = 0, lo = 9, hi = 0, prev = null; for (let t=0; t<120; t+=0.1){ const w = m3dClothWind(t), s = Math.hypot(w[0], w[1]); lo = Math.min(lo, s); hi = Math.max(hi, s); if (prev!==null) mx = Math.max(mx, Math.abs(s - prev)/0.1); prev = s; }
      out.gust = { rate:+mx.toFixed(3), lo:+lo.toFixed(3), hi:+hi.toFixed(3) }; }
    /* the sway: its wave's pace, read from the shader as it's built */
    { const m = new THREE.MeshLambertMaterial(); gfxSway(m, 0.35); const sh = { uniforms:{}, vertexShader:'#include <begin_vertex>', fragmentShader:'#include <color_fragment>' }; m.onBeforeCompile(sh); const v = sh.vertexShader;
      const w = /wave = ([0-9.]+) \+ ([0-9.]+)\*sin\(uT\*([0-9.]+)/.exec(v); out.wave = w ? { base:+w[1], depth:+w[2], rate:+w[3] } : null; }
    /* the plants following a gust: the eased wind after a sudden gust, a second on */
    { const U = GFX.u; U.uWindV.value = new THREE.Vector3(1, 0, 0.3); const wv = U.uWindV.value, keep = m3dClothWind; m3dClothWind = ()=>[2, 0]; for (let i=0;i<60;i++) gfxCloudDrift(1/60); m3dClothWind = keep; out.follow1s = +((wv.z - 0.3)/(2 - 0.3)).toFixed(2); }
    /* the torches below ground */
    { const s = questNearbySites(G.owPos.x, G.owPos.y, 1, 60, ['dungeon'])[0]; G.pendingDungeon = { x:s.x, y:s.y }; enterDungeonConfirm(); setUi('playing'); for (const m of G.mon) m.alive = 0;
      const tor = (FP.flames||[])[0]; if (tor){ G.player.x = Math.floor(tor.x); G.player.y = Math.floor(tor.y); }
      for (let i=0;i<60;i++){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); }
      const L = FPD.torches.find(l=>l.intensity > 0); const xs = []; let jump = 0, last = null, t0 = FP.t;
      for (let i=0;i<180;i++){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); if (!L) break; const v = L.intensity, tt = FP.t; xs.push(v); if (last!==null && tt - last[1] > 1e-4) jump = Math.max(jump, Math.abs(v - last[0])/(tt - last[1])); last = [v, tt]; }
      const mean = xs.reduce((a, b)=>a + b, 0)/Math.max(1, xs.length); out.torch = xs.length ? { range:+((Math.max(...xs) - Math.min(...xs))/mean).toFixed(3), ratePerS:+(jump/mean).toFixed(2) } : null; }
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.gust.rate < 0.15 && r.gust.hi > r.gust.lo*2, 'gusts build and die slowly, and still come and go: ' + JSON.stringify(r.gust));
  A(r.wave && r.wave.rate < 0.8 && r.wave.depth <= 0.25, 'the plants\' lean rolls slowly and gently: ' + JSON.stringify(r.wave));
  A(r.follow1s > 0.2 && r.follow1s < 0.5, 'plants take seconds to follow a gust: ' + r.follow1s + ' of the way after a second');
  A(r.torch && r.torch.range < 0.16 && r.torch.ratePerS < 0.4, 'the torches waver softly: ' + JSON.stringify(r.torch));
};
