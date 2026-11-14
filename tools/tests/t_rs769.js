// RS-769: the river at night - no rings of surf drawn down a river (shallow bank to bank, the depth's foam lines filled it), the flow's
// streaks wide enough not to shimmer into stripes, and the shallows and the foam in the night's light, not glowing.
// Reads the land as drawn under mid-river tiles at night: its brightness and how much it changes pixel to pixel (the stripes)
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
  const r = await page.evaluate(async ()=>{ const fr = n=>new Promise(res=>{ let i = 0; const f = ()=>++i >= n ? res() : requestAnimationFrame(f); requestAnimationFrame(f); });
    goToCharCreate(); ccBegin(); wgRegenerate(12345); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; weatherSync = ()=>{}; G.player.wildWarned = 1; G.gameMode = 0; G.interior = null; G.weather = 'clear';
    const m = G.ow.map, p = G.owPos, riv = (x, y)=>m[x] && m[x][y]===OW_RIVER; let best = null, bd = 1e9;
    for (let x=2;x<OW_COLS-2;x++) for (let y=2;y<OW_ROWS-2;y++){ if (!riv(x, y)) continue; let n = 0; for (let a=-2;a<=2;a++) for (let b=-2;b<=2;b++) if (riv(x+a, y+b)) n++; if (n < 7) continue; const d = Math.hypot(x - p.x, y - p.y); if (d < bd){ bd = d; best = { x, y }; } }
    let st = null; for (const [a, b] of DIR8){ const t = m[best.x + a*2] && m[best.x + a*2][best.y + b*2]; if (t===OW_GRASS || t===OW_FOREST){ st = { x:best.x + a*2, y:best.y + b*2 }; break; } }
    G.owPos = st || { x:best.x + 2, y:best.y }; owReveal(G.owPos.x, G.owPos.y, 8);
    const out = { at:G.owPos, src:'' }; G.player.clock = DAY_LENGTH*0.85; await fr(90);
    /* the river tiles in view with river on five sides of eight or more */
    const tiles = []; for (let x=G.owPos.x-5;x<=G.owPos.x+5;x++) for (let y=G.owPos.y-5;y<=G.owPos.y+5;y++){ if (!riv(x, y)) continue; let k = 0; for (const [a, b] of DIR8) if (riv(x+a, y+b)) k++; if (k >= 5) tiles.push([x, y]); }
    const R = O3.renderer, gl = R.getContext(), cv = R.domElement, W = gl.drawingBufferWidth, H = gl.drawingBufferHeight, S = 10, px = new Uint8Array(S*2*S*2*4), v = new THREE.Vector3();
    const meas = [];
    for (const [x, y] of tiles){ const C = o3C(x, y); v.set(C[0], O3_WATER_Y || 0, C[1]); O3.world.localToWorld(v); v.project(O3.cam); if (Math.abs(v.x) > 0.8 || Math.abs(v.y) > 0.8) continue;
      const cx = Math.round((v.x*0.5 + 0.5)*W), cy = Math.round((v.y*0.5 + 0.5)*H);
      R.render(O3.scene, O3.cam); gl.readPixels(cx - S, cy - S, S*2, S*2, gl.RGBA, gl.UNSIGNED_BYTE, px);
      const L = i=>px[i*4]*0.3 + px[i*4+1]*0.59 + px[i*4+2]*0.11; let sum = 0, dif = 0, n = 0;
      for (let j=0;j<S*2;j++) for (let i=0;i<S*2;i++){ const k = j*S*2 + i; sum += L(k); if (i < S*2-1){ dif += Math.abs(L(k) - L(k+1)); n++; } if (j < S*2-1){ dif += Math.abs(L(k) - L(k + S*2)); n++; } }
      meas.push({ x, y, lum:+(sum/(S*S*4)).toFixed(1), dif:+(dif/n).toFixed(2) }); }
    out.meas = meas;
    /* the shader as built */
    const mt = O3.water && O3.water.material; if (mt && mt.onBeforeCompile){ const sh = { uniforms:{}, vertexShader:'#include <begin_vertex>', fragmentShader:'#include <opaque_fragment>' }; try{ mt.onBeforeCompile(sh); }catch(e){} out.src = sh.fragmentShader; }
    return out; });
  const M = r.meas, med = k=>{ const a = M.map(o=>o[k]).sort((a, b)=>a - b); return a[a.length>>1]; };
  console.log(JSON.stringify({ at:r.at, n:M.length, lum:med('lum'), dif:med('dif'), meas:M.slice(0, 8) }));
  A(M.length >= 3, 'mid-river tiles in view: ' + M.length);
  A(/\(1\.0 - fo\.g\);/.test(r.src.replace(/\s+/g, ' ')) || /brk\*\(1\.0 - fo\.g\)/.test(r.src), 'no surf rings on a river');
  A(med('dif') < 3, 'the river at night smooth, no stripes: ' + med('dif'));
  A(med('lum') < 55, 'the river dark at night, not glowing: ' + med('lum'));
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
