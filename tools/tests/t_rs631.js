// RS-631: a Planet's 3D land bends away round you (every built-in material, through three's project_vertex chunk and one shared uniform),
// set only for the open land of a planet and cleared after, as much as the globe bends (RS-648); a click finds the bent ground where it's drawn; other sizes stay flat. Shot: shots/rs631-curve.png
module.exports = async page=>{
  page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const r = await page.evaluate(async ()=>{ const raf = ()=>new Promise(r=>requestAnimationFrame(r)), out = {};
    goToCharCreate(); ccBegin(); confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.gameMode = 0; G.interior = null; for (let i=0;i<120;i++) await raf();
    out.flatK = o3CurveK(); out.chunk = /dcCurve/.test(THREE.ShaderChunk.project_vertex) && /dcCurve/.test(THREE.ShaderChunk.common);
    goToCharCreate(); ccBegin(); setWorldSizeTier('planet'); confirmWorldPreview(); setUi('playing'); G.gameMode = 0; G.interior = null; G.owMainZoomScale = OW_MAIN_ZOOM_MIN; for (let i=0;i<240;i++) await raf();
    out.k = o3CurveK(); out.after = DC_CURVE.z; out.trueK = Math.PI/OW_COLS;   /* (RS-648: 1:1 with the globe) */
    /* the uniform is the one object in a compiled material */
    { let shared = false; O3.scene.traverse(o=>{ if (shared || !o.material || Array.isArray(o.material)) return; const p = O3.renderer.properties.get(o.material); if (p && p.uniforms && p.uniforms.dcCurve && p.uniforms.dcCurve.value===DC_CURVE) shared = true; }); out.shared = shared; }
    /* a click at the screen's top corner finds the ground nearer than the flat ground would be (it bends down, away) */
    { const r0 = O3.cv.getBoundingClientRect(), T = THREE, ray = new T.Raycaster(); ray.setFromCamera(new T.Vector2(0.3, 0.6), O3.cam);
      const bent = o3GroundHit(ray.ray); const k = DC_CURVE.z; const pp = O3.ppos; const flat = (()=>{ const sv = owIsPlanet; window.owIsPlanet = ()=>false; try{ return o3GroundHit(ray.ray); } finally { window.owIsPlanet = sv; } })();
      out.pick = bent && flat ? [+Math.hypot(bent.x - pp.x, bent.z - pp.z).toFixed(1), +Math.hypot(flat.x - pp.x, flat.z - pp.z).toFixed(1)] : null; }
    return out; });
  await page.screenshot({ path: SHOTS + '/rs631-curve.png' });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.chunk, 'the curve is in three\'s shared vertex chunk');
  A(r.flatK===0, 'another size stays flat');
  A(r.k > 0 && r.after===0, 'on a planet the land bends, and the curve is cleared after its render');
  A(r.shared, 'every material shares the one curve');
  A(Math.abs(r.k - r.trueK) < 1e-9, 'the curve is as much as the globe bends, 1:1 (RS-648)');
  A(r.pick && r.pick[0] !== r.pick[1], 'a click finds the bent ground where it is drawn');
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
