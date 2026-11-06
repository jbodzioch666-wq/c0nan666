// probe (RS-691): the lobster on the grill, raw and cooked, from three sides; its bag icons; and a fishing spot close up over a few
// seconds (the shoal circling, a fish leaping). Shots: shots/zlobster-*.png, zlobster-icons.png, zfish-*.png
const fs = require('fs');
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const shots = await page.evaluate(async ()=>{ const fr = n=>new Promise(res=>{ let i = 0; const f = ()=>++i >= n ? res() : requestAnimationFrame(f); requestAnimationFrame(f); });
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.player.clock = DAY_LENGTH*0.4;
    const T = THREE, out = {}, W = 900, H = 640, R = new T.WebGLRenderer({ antialias:true, preserveDrawingBuffer:true }); R.setSize(W, H); R.outputColorSpace = T.SRGBColorSpace || R.outputColorSpace;
    const sc = new T.Scene(); sc.background = new T.Color(0x3a3430); sc.add(new T.HemisphereLight(0xfff0e0, 0x302820, 1.1)); const dl = new T.DirectionalLight(0xffe8d0, 1.6); dl.position.set(1, 2, 1.2); sc.add(dl);
    const fire = new T.PointLight(0xff8030, 1.2, 1.5); fire.position.set(0, -0.1, 0); sc.add(fire);
    const rg = cookRigMake(T, {}); sc.add(rg.g); const cam = new T.PerspectiveCamera(32, W/H, 0.01, 10);
    for (const [nm, done] of [['raw', false], ['cooked', true]]){ G.ui = 'cook'; CQ.list = [{ kind:'cook', a:'lobster', n:3, done:0, ui:'cook' }]; CQ.next = done ? performance.now() - 1 : performance.now() + cqStepOf({ kind:'cook' }); cookRigSync(rg, true, 1);
      out.vis = Object.keys(rg.foods).filter(k=>rg.foods[k].visible);
      for (const [an, p] of [['iso', [0.42, 0.42, 0.42]], ['side', [0.05, 0.12, 0.5]], ['top', [0.01, 0.6, 0.02]]]){ cam.position.set(...p); cam.lookAt(0, 0.02, 0); R.render(sc, cam); out['l_' + nm + '_' + an] = R.domElement.toDataURL('image/png'); } } G.ui = 'playing'; CQ.list = [];
    /* the icons, big */
    { const c = document.createElement('canvas'); c.width = 4*48*2 + 30; c.height = 4*48; const x = c.getContext('2d'); x.imageSmoothingEnabled = false; x.fillStyle = '#2a2420'; x.fillRect(0, 0, c.width, c.height);
      for (const [i, id] of [[0, 'lobster'], [1, 'c_lobster']]){ const im = new Image(); im.src = foodIconUrl(id); await new Promise(r=>{ im.onload = r; }); x.drawImage(im, i*(4*48 + 30), 0, 4*48, 4*48); }
      out.icons = c.toDataURL('image/png'); }
    /* a fishing spot, close */
    G.ui = 'playing'; CQ.list = []; setUi('playing');
    let best = null, bd = 1e9; for (let x=G.owPos.x - 40;x<=G.owPos.x + 40;x++) for (let y=G.owPos.y - 40;y<=G.owPos.y + 40;y++){ const n = typeof skNodeStatic==='function' ? skNodeStatic(x, y) : null; if (!n || n.k!=='fishing') continue; const d = Math.hypot(x - G.owPos.x, y - G.owPos.y); if (d < bd){ bd = d; best = { x, y, type:n.type }; } }
    out.spot = best; if (!best) return out;
    let st = null; for (const [dx, dy] of [[0,1],[1,0],[-1,0],[0,-1],[1,1],[-1,-1],[1,-1],[-1,1]]){ if (o3Passable(best.x + dx, best.y + dy) && G.ow.map[best.x + dx][best.y + dy]!==OW_WATER){ st = [best.x + dx, best.y + dy]; break; } }
    if (!st) st = [best.x, best.y + 1]; G.gameMode = 0; G.inTown = false; G.interior = null; G.owPos = { x:st[0], y:st[1] }; owReveal(st[0], st[1], 8); await fr(150);
    if (!O3.scene) return Object.assign(out, { dbg:{ ui:G.ui, mode:G.gameMode, o3:Object.keys(O3).slice(0, 30), act:typeof o3Active==='function' && o3Active(), pref:typeof o3Pref!=='undefined' ? o3Pref : 'u' } }); O3.dist = 7; let fishM = 0; O3.scene.traverse(o=>{ if (o.userData && o.userData.fish) fishM++; }); out.fishMeshes = fishM;
    /* the nearest spot the land actually built (a shoal drifts from its first tile): stand by it */
    const pick = ()=>{ let bm = null, bdd = 1e9; O3.scene.traverse(o=>{ if (!o.userData || o.userData.fish!=='swim') return; const A = o.geometry.attributes.aC, nv = A.count/o.userData.n; for (let k=0;k<o.userData.n;k++){ const v = o.localToWorld(new THREE.Vector3(A.getX(k*nv), A.getY(k*nv), A.getZ(k*nv))), d = Math.hypot(v.x - O3.ppos.x, v.z - O3.ppos.z); if (d < bdd){ bdd = d; bm = v; } } }); return bm; };
    let sp = pick(); out.spotAt = sp && [+sp.x.toFixed(2), +sp.z.toFixed(2)];
    if (sp){ const tg = o3G(Math.floor(sp.x), Math.floor(sp.z)); for (const [dx, dy] of [[0,1],[1,0],[-1,0],[0,-1],[1,1],[-1,-1],[1,-1],[-1,1],[0,2],[2,0]]){ const q = [tg[0] + dx, tg[1] + dy]; if (o3Passable(q[0], q[1]) && G.ow.map[q[0]][q[1]]!==OW_WATER && !OW_SITE_TILES.includes(G.ow.map[q[0]][q[1]])){ G.owPos = { x:q[0], y:q[1] }; break; } } await fr(150); sp = pick(); }
    const cx = sp ? sp.x : 0, cz = sp ? sp.z : 0;
    for (let k=0;k<6;k++){ await fr(40); out['f' + k] = O3.renderer.domElement.toDataURL('image/png'); }
    /* and a close camera of our own on the spot */
    const c2 = O3.cam.clone(); c2.position.set(cx + 0.9, 0.9, cz + 0.9); c2.lookAt(cx, -0.1, cz); c2.aspect = O3.cam.aspect; c2.updateProjectionMatrix();
    for (let k=0;k<8;k++){ await fr(25); O3.renderer.render(O3.scene, c2); out['c' + k] = O3.renderer.domElement.toDataURL('image/png'); }
    return out; });
  for (const k in shots){ if (typeof shots[k]==='string' && shots[k].startsWith('data:')){ const f = k.startsWith('l_') ? 'zlobster-' + k.slice(2) : k==='icons' ? 'zlobster-icons' : 'zfish-' + k; fs.writeFileSync(SHOTS + '/' + f + '.png', Buffer.from(shots[k].split(',')[1], 'base64')); delete shots[k]; } }
  console.log(JSON.stringify(shots)); if (errs.length) console.log('ERRS', errs);
};
