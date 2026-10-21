// RS-596: roads kept off a mountain's flank and the water, and not worn up a steep bank; trees' shadows dappled by the light through their
// leaves (the leaves still drawn whole); and under rain the sun all but hidden, so the shadows fade. Shot: shots/rs596-trees.png
module.exports = async page=>{
  page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 200)));
  const r = await page.evaluate(async ()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.gameMode = 0; G.mon = []; G.weather = 'clear'; G.player.clock = DAY_LENGTH*10 + DAY_LENGTH*0.45;
    for (let i=0;i<150;i++) await new Promise(r=>requestAnimationFrame(r)); const out = {};
    /* the roads: no point of one on a mountain, or over water off a ford, in the whole world */
    { let bad = 0, pts = 0; const road = G.ow.road; for (let cy=40; cy<OW_ROWS; cy+=90) for (let cx=40; cx<OW_COLS; cx+=90){ for (const c of o3RoadChains(cx - 48, cy - 48, 96, 5)) for (const [x, z] of c.p){ pts++; const tx = Math.floor(x), ty = Math.floor(z), t = G.ow.map[tx] && G.ow.map[tx][ty]; if (road[ty*OW_COLS + tx]) continue; if (t===OW_MOUNTAIN || t===OW_WATER || t===OW_RIVER) bad++; } }
      out.road = { pts, bad }; }
    { const m = O3.land.material, sh = { uniforms:{}, vertexShader:'#include <begin_vertex>', fragmentShader:'#include <map_fragment>' }; m.onBeforeCompile(sh); out.slope = /dFdx\(vGW\)/.test(sh.fragmentShader); }
    /* the leaves: masked for the sun's shadow, whole on screen */
    { let n = 0, whole = 0; const seen = new Set(); O3.scene.traverse(o=>{ const mt = o.isMesh && o.material; if (!mt || Array.isArray(mt) || !mt.userData || !mt.userData.dapple || seen.has(mt)) return; seen.add(mt); n++;
        const sh = { uniforms:{}, vertexShader:'#include <begin_vertex>', fragmentShader:'#include <map_fragment>\n#include <alphamap_fragment>\n#include <alphatest_fragment>\n#include <color_fragment>' }; mt.onBeforeCompile(sh, O3.renderer); if (!/alphatest_fragment|alphamap_fragment/.test(sh.fragmentShader) && mt.alphaMap && mt.alphaTest > 0) whole++; });
      out.leaves = { n, whole }; }
    /* rain: the sun dimmed, the sky's light up */
    { const s0 = O3.sun.intensity, h0 = O3.hemi.intensity; G.weather = 'rain'; o3ApplyTime(); out.rain = { sun:+(O3.sun.intensity/s0).toFixed(2), sky:+(O3.hemi.intensity/h0).toFixed(2) }; G.weather = 'clear'; o3ApplyTime(); }
    return out; });
  await page.screenshot({ path: SHOTS + '/rs596-trees.png' });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.road.pts > 100 && r.road.bad===0, 'no road drawn up a mountain or out over the water: ' + JSON.stringify(r.road));
  A(r.slope, 'and none worn up a steep bank');
  A(r.leaves.n >= 2 && r.leaves.whole===r.leaves.n, 'the leaves throw a dappled shadow and are drawn whole: ' + JSON.stringify(r.leaves));
  A(r.rain.sun < 0.6 && r.rain.sky > 1.05, 'under rain the sun is dim and the sky fills in: ' + JSON.stringify(r.rain));
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
