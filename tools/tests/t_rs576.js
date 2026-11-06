// RS-576: steadier frames in town. Parts too small to cast a shadow worth drawing don't (gfxPruneCasters, on every figure and the town);
// the town's sun shadow covers what's in view, not the whole town; background work runs in the browser's idle time (gfxIdle), each
// slice short; and a room's boards are painted ahead a few rows at a step (v3TexBoardsGen), the same picture as painted at once
module.exports = async page=>{
  page.setDefaultTimeout(0);
  const r = await page.evaluate(async ()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    const out = {}, T = THREE, v = new T.Vector3();
    // a figure: no caster left under the size
    { const e = m3dInstance({}, rsPlayerLook()); e.holder.updateMatrixWorld(true); const bb = new T.Box3().setFromObject(e.holder), H = bb.max.y - bb.min.y; let tiny = 0, cast = 0; e.holder.traverse(o=>{ if (!o.isMesh || o.isInstancedMesh || !o.castShadow) return; cast++; const g = o.geometry; if (!g.boundingSphere) g.computeBoundingSphere(); o.getWorldScale(v); if (g.boundingSphere.radius*Math.max(v.x, v.y, v.z) < H*0.095) tiny++; }); out.fig = { cast, tiny, H:+H.toFixed(2) }; }   /* (a figure's own size: a tenth of its height) */
    // the town: its shadow box, and no tiny casters in its scene
    { const t = G.ow.spawnPos; G.owPos = { x:t.x, y:t.y }; enterVillage(); setUi('playing'); for (let i=0;i<40;i++){ renderGame(); await new Promise(r=>setTimeout(r, 30)); }
      const s = V3.sun.shadow.camera; out.box = [s.left, s.right, s.top, s.bottom]; let tiny = 0; V3.world.updateMatrixWorld(true); V3.world.traverse(o=>{ if (!o.isMesh || o.isInstancedMesh || !o.castShadow || !o.geometry) return; const g = o.geometry; if (!g.boundingSphere) g.computeBoundingSphere(); o.getWorldScale(v); if (g.boundingSphere.radius*Math.max(v.x, v.y, v.z) < 0.085) tiny++; }); out.townTiny = tiny; }
    // idle-time work: done, each slice short
    { let worst = 0, n = 0, done = false; const job = (function*(){ for (let i=0;i<3000;i++){ let x = 0; for (let k=0;k<4000;k++) x += Math.sqrt(k); yield x; } })();
      gfxIdle(dl=>{ const t0 = performance.now(); n++; let fin = false; while (performance.now() < dl){ if (job.next().done){ fin = true; break; } } worst = Math.max(worst, performance.now() - t0); if (fin) done = true; return fin; });
      const t0 = performance.now(); while (!done && performance.now() - t0 < 30000) await new Promise(r=>setTimeout(r, 30)); out.idle = { done, n, worst:+worst.toFixed(1) }; }
    // the boards: the sliced painter makes the same texture
    { const o1 = { boards:4, joints:false, knots:0.3, size:256, seed:999 }, a = v3TexBoards('#806040', o1); for (const k in V3_INT_TEX) if (V3_INT_TEX[k]===a) delete V3_INT_TEX[k];
      const it = v3TexBoardsGen('#806040', o1); let r, steps = 0; while (!(r = it.next()).done) steps++; const b = r.value;
      const px = t=>t.map.image.getContext('2d').getImageData(0, 0, 64, 64).data; const pa = px(a), pb = px(b); let diff = 0; for (let i=0;i<pa.length;i++) if (pa[i]!==pb[i]) diff++; out.boards = { steps, diff }; }
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.fig.cast > 3 && r.fig.tiny===0, 'a figure keeps its shadows, none from its tiny parts');
  A(r.townTiny===0, 'nor in the town');
  A(r.box[1] - r.box[0] <= 26.01, 'the town\'s sun shadow covers what is in view');
  A(r.idle.done && r.idle.n > 3 && r.idle.worst < 12, 'idle-time work gets done, in short slices: ' + JSON.stringify(r.idle));
  A(r.boards.steps > 5 && r.boards.diff===0, 'boards painted a step at a time are the same picture');
};
