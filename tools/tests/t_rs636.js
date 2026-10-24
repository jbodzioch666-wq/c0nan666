// RS-636: the hand-written shaders on the open land bend with a planet's curve too - the fishing ripples, bubbles and glows (and the
// rain, fireflies and spell sparks) were flat, so from a distance they hung in the air over water that fell away. Shot: shots/rs636-fish.png
module.exports = async page=>{
  page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300))); page.on('console', m=>{ if (m.type()==='error') errs.push('console: ' + m.text().slice(0, 200)); });
  const r = await page.evaluate(async ()=>{ const raf = ()=>new Promise(r=>requestAnimationFrame(r)), out = {};
    goToCharCreate(); ccBegin(); setWorldSizeTier('planet'); confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.gameMode = 0; G.interior = null; G.player.wildWarned = 1;
    /* stand on land near a fishing spot, a dozen tiles off, and zoom right out */
    let best = null; for (const k in (SKN.nodes||{})){}
    const near = (x, y)=>{ for (let r=10; r<16; r++) for (const [a, b] of [[r,0],[-r,0],[0,r],[0,-r]]){ const q = owOff(x, y, a, b); if (q && G.ow.map[q[0]][q[1]]===OW_GRASS) return q; } return null; };
    for (let x=0;x<OW_COLS && !best;x+=3) for (let y=0;y<OW_ROWS && !best;y+=3){ const n = skNodeAt(x, y); if (n && n.k==='fishing'){ const q = near(x, y); if (q) best = { n:[x, y], at:q }; } }
    out.found = !!best; if (best){ G.owPos = { x:best.at[0], y:best.at[1] }; }
    G.owMainZoomScale = OW_MAIN_ZOOM_MIN; for (let i=0;i<300;i++) await raf();
    const mats = { rip:O3.ripMat, bub:O3.bubMat, glow:O3.glowPtMat }; out.mats = {};
    for (const [k, m] of Object.entries(mats)) out.mats[k] = m ? /dcMV\(/.test(m.vertexShader) && !!m.uniforms.dcCurve && m.uniforms.dcCurve.value===DC_CURVE : null;
    out.fn = typeof dcCurveMat==='function' && /dcMV\(position\)/.test(dcCurveMat({ vertexShader:'void main(){ gl_Position = projectionMatrix*modelViewMatrix*vec4(position, 1.0); }' }).vertexShader);
    out.k = o3CurveK(); return out; });
  await page.screenshot({ path: SHOTS + '/rs636-fish.png' });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.fn, 'a hand-written shader is routed through the curve');
  A(r.mats.rip!==false && r.mats.bub!==false && r.mats.glow!==false && (r.mats.rip || r.mats.glow), 'the fishing ripples, bubbles and glows bend with the land');
  A(r.k > 0, 'on a planet');
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
