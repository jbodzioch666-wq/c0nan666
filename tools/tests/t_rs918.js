// RS-918: the landmarks remade. The wizard's tower (stone shaft, stair and arched door, lit lancet windows, corbelled battlemented gallery,
// flared slate roof with dormers and a gold finial, ivy), the great tree (gnarled flared trunk, tapering roots and boughs, billowing crown)
// and the Black Spire (swept blade buttresses, curved thorn crown, pointed-arch gate and framed windows) each build without error, are
// solid (no stray open parts: every mesh has normals and a finite box), sit inside their hit boxes, and show on the land.
// Shots: shots/rs918-landmarks.jpg (day and night, three sides each), rs918-land.png
const path = require('path'), fs = require('fs');
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const A = (c, msg, r)=>{ if (!c) throw new Error('assert: ' + msg + ' ' + JSON.stringify(r || {})); };
  const r = await page.evaluate(async ()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    const out = { kinds:{} }, T = THREE, ks = ['tower', 'tree', 'spire'], W = 300, H = 420, sides = [0.4, 2.3, 4.2], sheet = document.createElement('canvas'); sheet.width = W*sides.length*2; sheet.height = H*ks.length;
    const sx = sheet.getContext('2d'), cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    const R = new T.WebGLRenderer({ canvas:cv, antialias:true, preserveDrawingBuffer:true }); R.outputColorSpace = T.SRGBColorSpace; R.toneMapping = T.ACESFilmicToneMapping;
    ks.forEach((k, row)=>{ const o = o3LandmarkModel({ id:k, kind:k, x:0, y:0 }), box = new T.Box3(); o.g.updateMatrixWorld(true); let n = 0, bad = 0, verts = 0;
      o.g.traverse(m=>{ if (!m.isMesh || m===o.hb) return; n++; const b = new T.Box3().setFromObject(m); if (!isFinite(b.min.x) || !isFinite(b.max.y) || !m.geometry.attributes.normal) bad++; else box.union(b); verts += m.geometry.attributes.position.count; });
      const hb = new T.Box3().setFromObject(o.hb); out.kinds[k] = { n, bad, verts, top:+box.max.y.toFixed(2), w:+(box.max.x - box.min.x).toFixed(2), inHit:box.max.y <= hb.max.y + 0.6 };
      [[0x8fb4d8, 1.4, 2.0, 0xfff2dc], [0x141a2c, 0.35, 0.35, 0x8090c0]].forEach(([bg, hi, di, dc], night)=>sides.forEach((a, i)=>{
        const sc = new T.Scene(); sc.background = new T.Color(bg); sc.add(new T.HemisphereLight(0xdde8ff, 0x403828, hi)); const dl = new T.DirectionalLight(dc, di); dl.position.set(6, 12, 8); sc.add(dl); sc.add(o.g);
        const top = Math.max(12, box.max.y), cam = new T.PerspectiveCamera(30, W/H, 0.1, 200), d = Math.max(top*2.1, (box.max.x - box.min.x)*3.2); cam.position.set(Math.cos(a)*d, top*0.62, Math.sin(a)*d); cam.lookAt(0, top*0.47, 0); R.render(sc, cam);
        sx.drawImage(cv, (night*sides.length + i)*W, row*H); }));
      sx.fillStyle = '#fff'; sx.font = '16px sans-serif'; sx.fillText(k, 6, row*H + 18); });
    R.dispose(); out.sheet = sheet.toDataURL('image/jpeg', 0.88);
    /* on the land: walk up to the tower */
    const lms = owGeo().landmarks; out.lms = lms.map(l=>l.kind); const tw = lms.find(l=>l.kind==='tower') || lms[0];
    if (tw){ G.player.wildWarned = 1; G.gameMode = 0; G.interior = null; let q = null; for (let r=3;r<9 && !q;r++) for (let i=-r;i<=r && !q;i++) for (const j of [-r, r]) if (!q && o3Passable(tw.x + i, tw.y + j) && G.ow.map[tw.x + i][tw.y + j]!==OW_WATER) q = { x:tw.x + i, y:tw.y + j }; G.owPos = q || { x:tw.x, y:tw.y + 4 }; O3.ppos = null; for (let i=0;i<120;i++){ renderGame(); await new Promise(q=>setTimeout(q, 30)); } out.shown = (O3.lmObjs||[]).filter(o=>o.g.visible).map(o=>o.lm.kind); }
    return out; });
  if (r.sheet){ fs.writeFileSync(path.join(__dirname, 'shots', 'rs918-landmarks.jpg'), Buffer.from(r.sheet.split(',')[1], 'base64')); delete r.sheet; }
  await page.screenshot({ path:path.join(__dirname, 'shots', 'rs918-land.png') });
  console.log(JSON.stringify(r));
  for (const k of ['tower', 'tree', 'spire']){ const K = r.kinds[k]; A(K && K.n > 0 && K.bad===0, k + ' builds, every part sound', r); A(K.inHit, k + ' inside its hit box', r); }
  A(r.kinds.tower.top > 13.5 && r.kinds.tree.top > 10 && r.kinds.spire.top > 18, 'each as tall as it should stand', r);
  A(!r.lms.length || (r.shown||[]).length > 0, 'the landmarks show on the land', r);
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
