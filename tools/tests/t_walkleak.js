// RS-414: a long walk over the land leaves nothing behind on the graphics card. The animals, the wandering groups and their
// rings, and the corpses of fights are freed when they go (each copy's skinned-mesh wrapper, without the template's shared
// buffers); each old land's shore foam, glows and depth map go with it; and the water reads the depth of the land showing
module.exports = async page=>{
  page.setDefaultTimeout(0);
  await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); G.gameMode = 0; G.player.wildWarned = 1; saveCurrentGame = ()=>{};
    G.player.hp = G.player.maxHp = 99999; randomEncounter = ()=>{};
    let leg = 0;
    window.__walk = setInterval(()=>{ if (G.gameMode!==0) G.gameMode = 0; if (G.ui!=='playing') setUi('playing');
      if (O3.path && O3.path.length) return; const p = G.owPos; let best = null;
      for (let tries=0; tries<400 && !best; tries++){ const a = (leg*1.7 + tries*0.37), d = 35 + (tries%5)*5, x = Math.round(p.x + Math.cos(a)*d), y = Math.round(p.y + Math.sin(a)*d);
        if (x<2||y<2||x>=OW_COLS-2||y>=OW_ROWS-2) continue; const t = G.ow.map[x][y]; if (t===OW_WATER || t===OW_MOUNTAIN || OW_SITE_TILES.includes(t)) continue; const pth = o3PathTo(x, y); if (pth && pth.length > 20) best = { x, y }; }
      leg++; if (best) o3WalkTo({ kind:'ground', x:best.x, y:best.y }); }, 250);
  });
  await page.waitForTimeout(15000);
  // from here on, every geometry and texture made remembers that it was made
  await page.evaluate(()=>{ window.__made = []; window.__swaps = 0; const T = THREE;
    for (const k of Object.keys(T)){ const C = T[k]; if (typeof C!=='function' || !C.prototype) continue;
      const isG = C===T.BufferGeometry || C.prototype instanceof T.BufferGeometry, isT = C===T.Texture || C.prototype instanceof T.Texture; if (!isG && !isT) continue;
      const W = class extends C { constructor(...a){ super(...a); window.__made.push({ o:this, g:isG }); } }; try{ Object.defineProperty(W, 'name', { value:C.name }); T[k] = W; }catch(e){} }
    const sw = window.o3BuildSwap; window.o3BuildSwap = function(...a){ window.__swaps++; return sw.apply(this, a); };
    window.__start = G.owPos.x+','+G.owPos.y; });
  await page.waitForTimeout(60000);
  const r = await page.evaluate(()=>{ clearInterval(window.__walk);
    const used = new Set(); for (const sc of [O3.scene, typeof FPD!=='undefined' && FPD.scene, typeof V3!=='undefined' && V3.scene].filter(Boolean)) sc.traverse(o=>{ if (o.geometry) used.add(o.geometry); for (const m of [].concat(o.material||[])) for (const k in m) if (m[k] && m[k].isTexture) used.add(m[k]); });
    if (O3.pend && O3.pend.st && O3.pend.st.world) O3.pend.st.world.traverse(o=>{ if (o.geometry) used.add(o.geometry); });   /* (a land still being built isn't left behind) */
    for (const v of [O3.uDep && O3.uDep.value, O3.depthTex, O3.pend && O3.pend.st && O3.pend.st.depthTex]) if (v) used.add(v);
    let lg = 0, lt = 0, mg = 0, mt = 0; for (const m of window.__made){ m.g ? mg++ : mt++; const L = m.o._listeners && m.o._listeners.dispose; if (!L || !L.length || used.has(m.o)) continue; m.g ? lg++ : lt++; }
    return { start:window.__start, end:G.owPos.x+','+G.owPos.y, swaps:window.__swaps, madeG:mg, madeT:mt, leftG:lg, leftT:lt, depthOk:!O3.uDep || O3.uDep.value===O3.depthTex }; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.swaps >= 2 && r.madeG > 100, 'the walk went far enough for the land to move on and creatures to come and go');
  A(r.leftG <= 6, 'almost no geometry is left on the card that nothing draws (a land in mid-build aside): '+r.leftG);
  A(r.leftT <= 3, 'nor textures: '+r.leftT);
  A(r.depthOk, 'the water reads the depth map of the land showing');
};
