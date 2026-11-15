// RS-579: the atlas tiles are read from the right row. The atlas canvas goes up to the graphics card flipped, so RS-578's shader read
// each finish from the wrong row - mostly empty cells - and a spider's fur, a townsperson's wool came out flat. A spider rendered
// close up shows its fur again: the light varies across its abdomen as it did before the merge
module.exports = async page=>{
  const r = await page.evaluate(()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); const T = THREE, out = {};
    /* the shader's lookup, done here: the centre of each drawn tile lands inside that tile on the canvas */
    const A = M3D_ATLAS, S = A.cell*A.cols, at = m3dAtlas(); m3dPattern('fur'); m3dAtlasDraw('fur'); m3dPattern('skin'); m3dAtlasDraw('skin');
    const lookup = (t, u, v)=>{ const x = (t % A.cols)*A.cell + A.pad + u*A.N, vv = 1 - (Math.floor(t/A.cols)*A.cell + A.pad + A.N)/S + v*A.N/S; return [x, (1 - vv)*S]; };   /* (canvas y from texture v: flipped) */
    out.rows = ['fur', 'skin'].map(k=>{ const t = M3D_PAT_KINDS.indexOf(k), [x, y] = lookup(t, 0.5, 0.5); return { k, t, row:Math.floor(y/A.cell), want:Math.floor(t/A.cols), col:Math.floor(x/A.cell) }; });
    out.src = /1\.0 - \(floor\(t\/uAtl\.w\)\*uAtl\.z \+ uAtl\.y \+ uAtl\.x\) \+ f\.y\*uAtl\.x/.test(m3dAtlasify.toString());
    /* a spider close up: its abdomen's shading varies with the fur */
    const m = { nm:'giant spider', x:5, y:5, hp:10, maxHp:10, alive:true }, e = m3dInstance(m, m3dPortrait(m));
    const W = 320, H = 240, cv = document.createElement('canvas'); cv.width = W; cv.height = H; const R = gfxThreeR(new T.WebGLRenderer({ canvas:cv, preserveDrawingBuffer:true }));
    const sc = new T.Scene(); sc.background = new T.Color(0); sc.add(new T.HemisphereLight(0xffffff, 0x404040, 1)); const d = new T.DirectionalLight(0xffffff, 1.4); d.position.set(2, 3, 2); sc.add(d); sc.add(e.holder);
    e.anim && e.anim(e.rig, 1, 0, 0, 0, 0, e); e.holder.updateMatrixWorld(true); const bb = new T.Box3().setFromObject(e.holder), c = bb.getCenter(new T.Vector3()), s = bb.getSize(new T.Vector3()).length();
    const cam = new T.PerspectiveCamera(30, W/H, 0.01, 50); cam.position.set(c.x + s*0.55, c.y + s*0.45, c.z + s*0.75); cam.lookAt(c);
    const gl = R.getContext(), px = new Uint8Array(W*H*4);
    /* the step from each pixel to its right-hand neighbour over the lit frame: fur strands make it large, a flat finish small */
    const detail = ()=>{ R.render(sc, cam); gl.readPixels(0, 0, W, H, gl.RGBA, gl.UNSIGNED_BYTE, px); let sum = 0, n = 0;
      for (let y=0; y<H; y++) for (let x=0; x<W-1; x++){ const i = (y*W + x)*4, a = px[i] + px[i+1] + px[i+2], b = px[i+4] + px[i+5] + px[i+6]; if (a < 60 || b < 60) continue; sum += Math.abs(a - b); n++; } out.lit = n; return sum/Math.max(1, n); };
    out.textured = +detail().toFixed(2);
    /* and again with every vertex's tile set to none: the same figure, flat */
    e.root.traverse(o=>{ const mx = o.isMesh && o.material.userData.atlas && o.geometry.attributes.aMix; if (!mx) return; const keep = mx.array.slice(); o.userData.__k = keep; for (let i=0;i<mx.count;i++) mx.setZ(i, -1); mx.needsUpdate = true; });
    out.flat = +detail().toFixed(2);
    R.dispose(); return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.src, 'the shader counts the tile rows down from the top');
  A(r.rows.every(q=>q.row===q.want && q.col===q.t % 4), 'each tile is read from its own cell');
  A(r.lit > 2000 && r.textured > r.flat*1.5, 'the spider\'s fur shows: ' + r.textured + ' against ' + r.flat + ' flat');
};
