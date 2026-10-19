// (probe, not in ALL) how long one standard material takes to link against a given set of lights: N point lights, S of them shadowed, the shadow filter
module.exports = async page=>{
  const r = await page.evaluate(()=>{ gfxCheapPointShadow(); const T = THREE, cv = document.createElement('canvas'); cv.width = cv.height = 64; const rr = new T.WebGLRenderer({ canvas:cv }); rr.shadowMap.enabled = true; rr.debug.checkShaderErrors = true;
    const cam = new T.PerspectiveCamera(50, 1, 0.1, 100); cam.position.set(0, 3, 5); cam.lookAt(0, 0, 0); const out = [];
    let seed = 0;
    for (const [n, s, type, dir] of [[5,4,1,1],[5,4,0,1],[5,4,2,1],[5,2,1,1],[5,1,1,1],[5,0,1,1],[2,2,1,1],[1,1,1,1],[0,0,1,1],[5,4,1,0]]){
      rr.shadowMap.type = type; const sc = new T.Scene(); sc.fog = new T.Fog(0, 1, 20);
      for (let i=0;i<n;i++){ const L = new T.PointLight(0xffaa66, 1, 8); L.position.set(i-2, 2, 0); L.castShadow = i < s; sc.add(L); }
      if (dir){ const D = new T.DirectionalLight(0xffffff, 0.5); D.castShadow = true; sc.add(D); }
      const m = new T.MeshStandardMaterial({ color:0x888888, roughness:0.8 + (seed++)*0.0001 }); m.onBeforeCompile = sh=>{ sh.fragmentShader = sh.fragmentShader.replace('void main() {', 'void main() { float zz' + seed + ' = 0.0;'); };
      m.customProgramCacheKey = ()=>'z' + seed;
      const mesh = new T.Mesh(new T.BoxGeometry(), m); mesh.receiveShadow = true; mesh.castShadow = true; sc.add(mesh);
      const t0 = performance.now(); rr.compile(sc, cam); rr.render(sc, cam); const dt = performance.now() - t0;
      out.push({ n, s, type, dir, ms:+dt.toFixed(0) }); }
    rr.dispose(); return out; });
  console.log(JSON.stringify(r));
};
