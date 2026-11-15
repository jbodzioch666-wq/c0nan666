// RS-571: shaders load faster. (1) A point light's soft shadow finds its spot in the shadow map once and takes five samples round
// it (three.js ran cubeToUV nine times a light): a standard material against a dungeon's lights links in well under the old time.
// (2) With KHR_parallel_shader_compile, every program a scene needs is started at once and linked off the frame; the warm-up waits
// for the driver to say they're done. (3) Below ground the sun is off, so no shader carries its shadow; out in a field it's on
module.exports = async page=>{
  page.setDefaultTimeout(0);
  const r = await page.evaluate(async ()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    const out = {}, T = THREE; gfxCheapPointShadow();
    const chunk = T.ShaderChunk.shadowmap_pars_fragment, pt0 = chunk.slice(chunk.indexOf('float getPointShadow')), pt = pt0.slice(0, pt0.indexOf('#else'));   /* (the soft branch) */
    out.cubeCalls = (pt.match(/cubeToUV\(/g) || []).length;
    // link time against five point lights, four shadowed, and a shadowed sun
    const link = cheap=>{ const C = T.ShaderChunk; if (!cheap) C.shadowmap_pars_fragment = C.__ptOrig; const cv = document.createElement('canvas'); cv.width = cv.height = 32; const rr = new T.WebGLRenderer({ canvas:cv }); rr.shadowMap.enabled = true;
      const sc = new T.Scene(), cam = new T.PerspectiveCamera(50, 1, 0.1, 50); cam.position.set(0, 3, 5); cam.lookAt(0, 0, 0);
      for (let i=0;i<5;i++){ const L = new T.PointLight(0xffaa66, 1, 8); L.position.set(i-2, 2, 0); L.castShadow = i < 4; sc.add(L); } const D = new T.DirectionalLight(0xffffff, 0.5); D.castShadow = true; sc.add(D);
      const m = new T.MeshStandardMaterial({ color:0x888888 }); m.customProgramCacheKey = ()=>'rs571' + cheap + Math.random(); m.onBeforeCompile = sh=>{ sh.fragmentShader = sh.fragmentShader.replace('void main() {', 'void main() { float q' + (cheap ? 1 : 0) + Math.floor(Math.random()*1e6) + ' = 0.0;'); };
      const mesh = new T.Mesh(new T.BoxGeometry(), m); mesh.castShadow = mesh.receiveShadow = true; sc.add(mesh);
      const t0 = performance.now(); rr.compile(sc, cam); rr.render(sc, cam); const dt = performance.now() - t0; rr.dispose(); C.shadowmap_pars_fragment = C.__ptOrig && cheap ? C.shadowmap_pars_fragment : C.shadowmap_pars_fragment; return dt; };
    const orig = T.ShaderChunk.shadowmap_pars_fragment; out.cheapMs = +link(true).toFixed(0); out.oldMs = +link(false).toFixed(0); T.ShaderChunk.shadowmap_pars_fragment = orig;
    // the parallel link on a scene of its own
    { const cv = document.createElement('canvas'); cv.width = cv.height = 32; const rr = new T.WebGLRenderer({ canvas:cv }); const sc = new T.Scene(), cam = new T.PerspectiveCamera(50, 1, 0.1, 50); sc.add(new T.PointLight(0xffffff, 1, 5));
      for (let i=0;i<4;i++){ const m = new T.MeshStandardMaterial({ color:0x808080 }); m.customProgramCacheKey = ()=>'pl' + i + Math.random(); m.onBeforeCompile = sh=>{ sh.fragmentShader = sh.fragmentShader.replace('void main() {', 'void main() { float w' + i + Math.floor(Math.random()*1e6) + ' = 0.0;'); }; sc.add(new T.Mesh(new T.BoxGeometry(), m)); }
      const V = {}; out.ext = !!gfxPscExt(rr); const started = gfxPrelink(V, rr, sc, cam); out.prelink = { started, progs:V.prelink ? V.prelink.progs.length : 0 };
      let done = false; const t0 = performance.now(); while (!done && performance.now() - t0 < 20000){ done = gfxPrelinkDone(V); if (!done) await new Promise(r=>setTimeout(r, 20)); } out.prelink.done = done; rr.dispose(); }
    // the sun below ground and out in a field
    { let dx=-1, dy=-1; for (let x=0;x<OW_COLS && dx<0;x++) for (let y=0;y<OW_ROWS;y++) if (G.ow.map[x][y]===OW_DUNGEON){ dx=x; dy=y; break; }
      G.gameMode = 0; G.owPos = { x:dx, y:dy }; G.pendingDungeon = { x:dx, y:dy }; enterDungeonConfirm(); setUi('playing'); for (let i=0;i<4;i++){ renderGame(); await new Promise(r=>setTimeout(r, 30)); }
      out.sunBelow = FPD.sun.visible;
      G.gameMode = 0; generateArena(); G.gameMode = 2; G.mon = []; setUi('playing'); FPD.mapRef = null; for (let i=0;i<4;i++){ renderGame(); await new Promise(r=>setTimeout(r, 30)); }
      out.sunField = FPD.sun.visible; G.gameMode = 0; }
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.cubeCalls===1, 'one cubeToUV a point shadow, not nine: ' + r.cubeCalls);
  A(r.cheapMs < r.oldMs*0.75, 'a material against a dungeon\'s lights links faster: ' + r.cheapMs + 'ms, was ' + r.oldMs + 'ms');
  A(!r.ext || (r.prelink.started && r.prelink.progs >= 4 && r.prelink.done), 'every program started at once and linked off the frame: ' + JSON.stringify(r.prelink));
  A(r.sunBelow===false && r.sunField===true, 'the sun off below ground, on in a field');
};
