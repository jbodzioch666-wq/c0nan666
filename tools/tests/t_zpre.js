// (probe, not in ALL) does gfxPrelink return at once? times the call against the wait for the driver, on heavy fresh materials
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{ const T = THREE; gfxCheapPointShadow(); const cv = document.createElement('canvas'); cv.width = cv.height = 64; const rr = new T.WebGLRenderer({ canvas:cv }); rr.shadowMap.enabled = true;
    const sc = new T.Scene(), cam = new T.PerspectiveCamera(50, 1, 0.1, 50); cam.position.set(0, 3, 5); cam.lookAt(0, 0, 0);
    for (let i=0;i<5;i++){ const L = new T.PointLight(0xffaa66, 1, 8); L.position.set(i-2, 2, 0); L.castShadow = i < 4; sc.add(L); }
    for (let i=0;i<8;i++){ const m = new T.MeshStandardMaterial({ color:0x808080 }); const tag = 'p' + i + Math.floor(Math.random()*1e9); m.customProgramCacheKey = ()=>tag; m.onBeforeCompile = sh=>{ sh.fragmentShader = sh.fragmentShader.replace('void main() {', 'void main() { float ' + tag + ' = 0.0;'); }; sc.add(new T.Mesh(new T.BoxGeometry(), m)); }
    const V = {}; const t0 = performance.now(); gfxPrelink(V, rr, sc, cam); const call = performance.now() - t0;
    while (!gfxPrelinkDone(V)) await new Promise(r=>setTimeout(r, 5)); const done = performance.now() - t0;
    sc.background = new T.Color(0x000000); const gl = rr.getContext(); const t1 = performance.now(); rr.render(sc, cam); const draw = performance.now() - t1; const px = new Uint8Array(4); gl.readPixels(32, 32, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px); const err = gl.getError();
    // the same scene drawn the plain way, for comparison
    const rr2 = new T.WebGLRenderer({ canvas:Object.assign(document.createElement('canvas'), { width:64, height:64 }) }); rr2.shadowMap.enabled = true; rr2.render(sc, cam); const g2 = rr2.getContext(), px2 = new Uint8Array(4); g2.readPixels(32, 32, 1, 1, g2.RGBA, g2.UNSIGNED_BYTE, px2);
    rr.dispose(); rr2.dispose();
    return { call:+call.toFixed(0), done:+done.toFixed(0), draw:+draw.toFixed(0), px:[...px], plain:[...px2], err }; });
  console.log(JSON.stringify(r));
};
