// probe (RS-664): a barrow alone on a flat green, from eight angles round it at a low and a high view, so its shape can be seen with nothing
// in the way. ZB_FLAT=1 a door at ground level, else one with a stair. Shots: shots/zbiso-<angle>-<lo|hi>.png
const fs = require('fs');
module.exports = async page=>{ page.setDefaultTimeout(0);
  const shots = await page.evaluate(async (flat)=>{ const fr = n=>new Promise(res=>{ let i = 0; const f = ()=>++i >= n ? res() : requestAnimationFrame(f); requestAnimationFrame(f); });
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.gameMode = 0; G.player.clock = DAY_LENGTH*0.45; await fr(150);
    let g = null, n = 0; for (const d of (O3.doors || new Map()).values()) if (!g && !!d.doorPit===!flat) g = d; if (!g) return null; n = 0; g.traverse(o=>{ if (o.isMesh) n++; }); console.log('meshes', n, g.scale.x, g.visible);
    const T = THREE, sc = O3.scene, P = new T.Vector3(); g.updateMatrixWorld(true); g.getWorldPosition(P); const keep = new Set(); let q = g; while (q){ keep.add(q); q = q.parent; } g.traverse(o=>{ keep.add(o); o.visible = true; o.frustumCulled = false; });
    sc.traverse(o=>{ if (!keep.has(o) && !o.isLight && o.isObject3D && (o.isMesh || o.isPoints || o.isSprite || o.isLine)) o.visible = false; });   /* (the barrow alone, under the land's own lights; the land's materials bend at the horizon, so it stays where it stands) */
    const gr = new T.Mesh(new T.PlaneGeometry(14, 14), new T.MeshStandardMaterial({ color:0x5f7f3a, roughness:1 })); gr.rotation.x = -Math.PI/2; gr.position.set(P.x, P.y - 0.01, P.z); gr.receiveShadow = true; sc.add(gr);
    const R = O3.renderer, cam = new T.PerspectiveCamera(34, R.domElement.width/R.domElement.height, 0.1, 100), out = {}; const s = g.scale.x;
    O3.ok = false;   /* (the game's own render held off) */
    for (let a=0;a<8;a++) for (const [nm, el] of [['lo', 0.35], ['hi', 0.8]]){ const yaw = a*Math.PI/4, d = 4.2*s; cam.position.set(P.x + Math.sin(yaw)*Math.cos(el)*d, P.y + Math.sin(el)*d + 0.4*s, P.z + Math.cos(yaw)*Math.cos(el)*d); cam.lookAt(P.x, P.y + 0.45*s, P.z - 0.2*s); R.setRenderTarget(null); R.render(sc, cam); out[a*45 + '-' + nm] = R.domElement.toDataURL('image/png'); }
    return out; }, !!process.env.ZB_FLAT);
  if (!shots) throw new Error('no barrow');
  for (const [k, u] of Object.entries(shots)) fs.writeFileSync(SHOTS + '/zbiso-' + k + '.png', Buffer.from(u.split(',')[1], 'base64'));
};
