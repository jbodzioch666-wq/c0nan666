// RS-572: a floor loads without the long freezes. (1) gfxPrelink starts every program and returns at once - three's compile no
// longer waits out each link for its uniforms - and once linked, the materials draw exactly as through the plain path. (2) A floor's
// creatures are sculpted a slice a frame behind the card (FPD.prep), each slice short, and come out built. (3) The chart is painted
// a few milliseconds a step in the background, the same picture as painted in one go
module.exports = async page=>{
  page.setDefaultTimeout(0);
  const r = await page.evaluate(async ()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    const T = THREE, out = {}; gfxCheapPointShadow();
    // (1) the parallel link, and the same picture
    { const mk = ()=>{ const cv = document.createElement('canvas'); cv.width = cv.height = 48; const rr = new T.WebGLRenderer({ canvas:cv, preserveDrawingBuffer:true }); rr.shadowMap.enabled = true; return rr; };
      const sc = new T.Scene(), cam = new T.PerspectiveCamera(50, 1, 0.1, 50); cam.position.set(0, 2, 4); cam.lookAt(0, 0, 0); sc.background = new T.Color(0x102030);
      for (let i=0;i<5;i++){ const L = new T.PointLight(0xffcc88, 2, 9); L.position.set(i - 2, 2.2, 1.5); L.castShadow = i < 4; sc.add(L); } sc.add(new T.AmbientLight(0x404040, 1));
      const tags = []; for (let i=0;i<6;i++){ const tag = 'q' + i + Math.floor(Math.random()*1e9); tags.push(tag); const m = new T.MeshStandardMaterial({ color:new T.Color().setHSL(i/6, 0.6, 0.5), roughness:0.6 }); m.customProgramCacheKey = ()=>tag;
        m.onBeforeCompile = sh=>{ sh.fragmentShader = sh.fragmentShader.replace('void main() {', 'void main() { float ' + tag + ' = 0.0;'); }; const b = new T.Mesh(new T.BoxGeometry(0.5, 0.5, 0.5), m); b.position.set((i%3) - 1, 0, Math.floor(i/3) - 0.5); b.castShadow = b.receiveShadow = true; sc.add(b); }
      const rr = mk(), V = {}; const t0 = performance.now(); gfxPrelink(V, rr, sc, cam); const call = performance.now() - t0;
      while (!gfxPrelinkDone(V)) await new Promise(r=>setTimeout(r, 5)); const done = performance.now() - t0;
      rr.render(sc, cam); rr.render(sc, cam); const px = new Uint8Array(48*48*4), gl = rr.getContext(); gl.readPixels(0, 0, 48, 48, gl.RGBA, gl.UNSIGNED_BYTE, px);
      const r2 = mk(); r2.render(sc, cam); r2.render(sc, cam); const px2 = new Uint8Array(48*48*4), g2 = r2.getContext(); g2.readPixels(0, 0, 48, 48, g2.RGBA, g2.UNSIGNED_BYTE, px2);
      let diff = 0, lit = 0; for (let i=0;i<px.length;i+=4){ const d = Math.abs(px[i]-px2[i]) + Math.abs(px[i+1]-px2[i+1]) + Math.abs(px[i+2]-px2[i+2]); if (d > 6) diff++; if (px[i] + px[i+1] + px[i+2] > 160) lit++; }
      rr.dispose(); r2.dispose(); out.link = { ext:!!V.r || !!gfxPscExt(mk()), call:+call.toFixed(0), done:+done.toFixed(0), diff, lit }; }
    // (2) a floor's creatures sculpted a slice at a time
    { window.__noWarmSlice = false; const st0 = fpdPrepStep; let worst = 0, steps = 0; fpdPrepStep = function(){ const t = performance.now(); const r = st0.apply(this, arguments); worst = Math.max(worst, performance.now() - t); steps++; return r; };
      M3D.tpl.clear(); if (M3D.sculpt) M3D.sculpt.clear(); const gdb = sculptDbGet; sculptDbGet = ()=>null;
      let dx=-1, dy=-1; for (let x=0;x<OW_COLS && dx<0;x++) for (let y=0;y<OW_ROWS;y++) if (G.ow.map[x][y]===OW_DUNGEON){ dx=x; dy=y; break; }
      G.gameMode = 0; G.owPos = { x:dx, y:dy }; G.pendingDungeon = { x:dx, y:dy }; enterDungeonConfirm(); setUi('playing');
      const t0 = performance.now(); while (performance.now() - t0 < 60000){ renderGame(); await new Promise(r=>setTimeout(r, 16)); if (FPD.mapRef===G.map && !FPD.prep && !FPD.warmWait && !FPD.prelink) break; }
      sculptDbGet = gdb; fpdPrepStep = st0; window.__noWarmSlice = 1;
      const alive = G.mon.filter(m=>m.alive && m3dPortrait(m)), built = alive.filter(m=>{ const pt = m3dPortrait(m); return M3D.tpl.has(m3dTplKey(pt)); }).length;
      out.prep = { steps, worst:+worst.toFixed(0), mons:alive.length, built, secs:+((performance.now() - t0)/1000).toFixed(1) }; G.gameMode = 0; }
    // (3) the chart, sliced and at once
    { PM.cv = null; PM.job = null; PM.sched = false; let worst = 0; const sl = []; const it = pmBuildGen(); for (;;){ const t = performance.now(), dl = t + 6; let d = false; while (performance.now() < dl){ if (it.next().done){ d = true; break; } } worst = Math.max(worst, performance.now() - t); if (d) break; await new Promise(r=>setTimeout(r, 0)); }
      const a = PM.cv, ad = a.getContext('2d').getImageData(0, 0, a.width, a.height).data; pmBuild(); const b = PM.cv, bd = b.getContext('2d').getImageData(0, 0, b.width, b.height).data;
      let diff = 0; for (let i=0;i<ad.length;i+=4) if (Math.abs(ad[i]-bd[i]) + Math.abs(ad[i+1]-bd[i+1]) + Math.abs(ad[i+2]-bd[i+2]) > 8) diff++;
      out.chart = { worst:+worst.toFixed(0), w:a.width, diff, frac:+(diff/(ad.length/4)).toFixed(4) }; }
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.link.call < 60 && r.link.call < r.link.done*0.5 + 5, 'the programs are started and the call returns before they are linked: ' + JSON.stringify(r.link));
  A(r.link.lit > 100 && r.link.diff===0, 'linked that way, the materials draw exactly as through the plain path: ' + JSON.stringify(r.link));
  A(r.prep.steps > 3 && r.prep.worst < 120 && r.prep.built===r.prep.mons && r.prep.mons > 0, 'the floor\'s creatures sculpted a slice a frame, and all built: ' + JSON.stringify(r.prep));
  A(r.chart.worst < 40 && r.chart.frac < 0.001, 'the chart painted a few ms a step, the same picture: ' + JSON.stringify(r.chart));
};
