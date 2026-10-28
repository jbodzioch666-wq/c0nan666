// RS-691: Lobsters and Shoals. A lobster on the fire is a lobster (it was the trout): the cook rig has one of its own - claws, plated tail,
// legs, feelers - blue-black raw and scarlet done; its bag icons drawn as a lobster, raw blue and cooked red. And a fishing spot shows its
// fish: three circling at the surface and one that leaps, batched with the ripples (one swim mesh and one leap mesh a chunk), their own
// lit shader compiled without error, and on screen at the spot.
module.exports = async page=>{
  page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300))); page.on('console', m=>{ if (m.type()==='error') errs.push('console: ' + m.text().slice(0, 200)); });
  const r = await page.evaluate(async ()=>{ const fr = n=>new Promise(res=>{ let i = 0; const f = ()=>++i >= n ? res() : requestAnimationFrame(f); requestAnimationFrame(f); });
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.player.clock = DAY_LENGTH*0.4;
    const T = THREE, out = {}, avg = (a, k)=>{ let s = 0, n = 0; for (let i=k;i<a.length;i+=3){ s += a[i]; n++; } return s/n; };
    /* the rig */
    { const rg = cookRigMake(T, {}), show = (a, done)=>{ G.ui = 'cook'; CQ.list = [{ kind:'cook', a, n:3, done:0, ui:'cook' }]; CQ.next = done ? performance.now() - 1 : performance.now() + cqStepOf({ kind:'cook' }); cookRigSync(rg, true, 1); return Object.keys(rg.foods).filter(k=>rg.foods[k].visible); };
      out.lobSeen = show('lobster', false); const m = rg.foods.lobster && rg.foods.lobster.userData.meshes[0]; const col = ()=>{ const a = m.geometry.attributes.color.array; return [avg(a, 0), avg(a, 2)]; };
      const raw = col(); show('lobster', true); const done = col(); out.lobRaw = raw.map(v=>+v.toFixed(3)); out.lobDone = done.map(v=>+v.toFixed(3));
      out.lobVerts = m.geometry.attributes.position.count; { const rg2 = cookRigMake(T, {}), m2 = rg2.foods.lobster.userData.meshes[0]; out.shared = m2.geometry.attributes.position.array===m.geometry.attributes.position.array && m2.geometry.attributes.color.array!==m.geometry.attributes.color.array; } out.troutSeen = show('trout', false); out.shrimpSeen = show('shrimp', false); G.ui = 'playing'; CQ.list = []; }
    /* the icons */
    { const tint = async id=>{ const im = new Image(); im.src = foodIconUrl(id); await new Promise(res=>{ im.onload = res; }); const c = document.createElement('canvas'); c.width = c.height = 48; const x = c.getContext('2d'); x.drawImage(im, 0, 0);
        const d = x.getImageData(0, 0, 48, 48).data; let r = 0, b = 0, n = 0; for (let i=0;i<d.length;i+=4) if (d[i+3] > 200){ r += d[i]; b += d[i+2]; n++; } return { r:Math.round(r/n), b:Math.round(b/n), n }; };
      out.iconRaw = await tint('lobster'); out.iconDone = await tint('c_lobster'); }
    /* a fishing spot */
    G.gameMode = 0; G.inTown = false; G.interior = null; setUi('playing'); await fr(150);
    const meshes = (k)=>{ const l = []; O3.scene.traverse(o=>{ if (o.userData && o.userData.fish===k) l.push(o); }); return l; };
    let sw = meshes('swim'), jp = meshes('jump');
    if (!sw.length){ for (let x=G.owPos.x - 30;x<=G.owPos.x + 30 && !sw.length;x+=6) for (let y=G.owPos.y - 30;y<=G.owPos.y + 30 && !sw.length;y+=6){ if (!o3Passable(x, y) || G.ow.map[x][y]===OW_WATER) continue; G.owPos = { x, y }; await fr(60); sw = meshes('swim'); } jp = meshes('jump'); }
    out.rings = 0; O3.scene.traverse(o=>{ if (o.isMesh && O3.ripMat && o.material===O3.ripMat) out.rings++; }); out.swim = sw.reduce((s, o)=>s + o.userData.n, 0); out.jump = jp.reduce((s, o)=>s + o.userData.n, 0); out.chunks = sw.length;
    out.prog = (O3.renderer.info.programs || []).map(p=>p.cacheKey || '').filter(k=>/fish/.test(k)).length;
    /* the nearest spot on screen, through a close camera: the fish draw something there */
    let sp = null, bd = 1e9; for (const o of sw){ const A = o.geometry.attributes.aC, nv = A.count/o.userData.n; for (let k=0;k<o.userData.n;k++){ const v = o.localToWorld(new T.Vector3(A.getX(k*nv), A.getY(k*nv), A.getZ(k*nv))), d = Math.hypot(v.x - O3.ppos.x, v.z - O3.ppos.z); if (d < bd){ bd = d; sp = v; } } }
    if (sp){ const c2 = O3.cam.clone(); c2.position.set(sp.x + 0.9, 0.9, sp.z + 0.9); c2.lookAt(sp.x, -0.1, sp.z); c2.updateProjectionMatrix(); const gl = O3.renderer.getContext(), W = gl.drawingBufferWidth, H = gl.drawingBufferHeight;
      const grab = ()=>{ O3.renderer.render(O3.scene, c2); const px = new Uint8Array(W*H*4); gl.readPixels(0, 0, W, H, gl.RGBA, gl.UNSIGNED_BYTE, px); return px; };
      O3.discT.value = 1.234; for (const o of sw.concat(jp)) o.visible = false; const a = grab(); for (const o of sw.concat(jp)) o.visible = true; const b = grab();
      let diff = 0; for (let i=0;i<a.length;i+=4) if (Math.abs(a[i] - b[i]) + Math.abs(a[i+1] - b[i+1]) + Math.abs(a[i+2] - b[i+2]) > 30) diff++; out.fishPx = diff;
      /* the leaper: hidden most of the time, out of the water at the top of its leap */
      let J = null, jk = 0, jd = 1e9; for (const o of jp){ const C0 = o.geometry.attributes.aC, nv = C0.count/o.userData.n; for (let k=0;k<o.userData.n;k++){ const v = o.localToWorld(new T.Vector3(C0.getX(k*nv), C0.getY(k*nv), C0.getZ(k*nv))), d = Math.hypot(v.x - sp.x, v.z - sp.z); if (d < jd){ jd = d; J = o; jk = k*nv; } } }   /* (the leaper at the nearest spot) */
      if (J){ const A = J.geometry.attributes.aPh, h1 = x=>x - Math.floor(x), ph = A.getX(jk), P = 4.5 + 4.0*h1(ph*7.31), h2 = h1(ph*3.17 + 0.3);
        /* (the time its leap is at its top, from the shader's own sums) */ const tTop = (Math.ceil(10/P) + 0.085 - h2)*P; O3.discT.value = tTop; for (const o of sw) o.visible = false;
        const C = J.geometry.attributes.aC, v = J.localToWorld(new T.Vector3(C.getX(jk), C.getY(jk), C.getZ(jk))); c2.position.set(v.x + 1.2, 0.6, v.z + 1.2); c2.lookAt(v.x, 0.1, v.z);
        /* (one leaper alone, built by o3NodeFx at J's spot: a chunk's leapers are one mesh, and another spot's may be in the air) */
        const one = o3NodeFx([], [], [], o3NodeGeo(), [{ x:C.getX(jk), y:C.getY(jk), z:C.getZ(jk), col:'#ffffff', ph, a:A.getY(jk), jump:true }])[0]; J.parent.add(one); for (const o of sw.concat(jp)) o.visible = false; J = one;
        J.visible = false; const a2 = grab(); J.visible = true; const b2 = grab(); let d2 = 0; for (let i=0;i<a2.length;i+=4) if (Math.abs(a2[i] - b2[i]) + Math.abs(a2[i+1] - b2[i+1]) + Math.abs(a2[i+2] - b2[i+2]) > 30) d2++; out.leapPx = d2;
        O3.discT.value = (Math.ceil(10/P) + 0.6 - h2)*P; J.visible = false; const a3 = grab(); J.visible = true; const b3 = grab(); let d3 = 0; for (let i=0;i<a3.length;i+=4) if (Math.abs(a3[i] - b3[i]) + Math.abs(a3[i+1] - b3[i+1]) + Math.abs(a3[i+2] - b3[i+2]) > 30) d3++; out.hiddenPx = d3;
        out.shot = (()=>{ O3.discT.value = tTop; for (const o of sw) o.visible = true; O3.renderer.render(O3.scene, c2); return O3.renderer.domElement.toDataURL('image/png'); })(); one.parent.remove(one); for (const o of jp) o.visible = true; } }
    return out; });
  if (r.shot) require('fs').writeFileSync(SHOTS + '/rs691.png', Buffer.from(r.shot.split(',')[1], 'base64')); r.shot = !!r.shot;
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: ' + m + ' ' + JSON.stringify(r)); };
  A(r.lobSeen.join()==='lobster' && r.troutSeen.join()==='fish' && r.shrimpSeen.join()==='fish', 'a lobster on the fire is a lobster; a trout (and a shrimp) the fish as before');
  A(r.lobVerts > 20000, 'sculpted, not a few blobs: ' + r.lobVerts);
  A(r.lobRaw[0] < 0.12 && r.lobRaw[1] < 0.12 && r.lobDone[0] > 0.4 && r.lobDone[0] > 3*r.lobDone[1], 'dark raw, scarlet done');
  A(r.shared, 'its shape built once and shared between rigs');
  A(r.iconRaw.n > 350 && r.iconDone.n > 350 && r.iconRaw.b > r.iconRaw.r && r.iconDone.r > 2*r.iconDone.b, 'its icons a lobster, raw blue and cooked red');
  A(r.chunks >= 1 && r.swim >= 3 && r.swim===3*r.jump, 'three fish circling every fishing spot and one to leap');
  A(r.prog >= 1, 'their shader built');
  A(r.rings===0, 'no ripple rings round a spot (RS-692)');
  A(r.fishPx > 400, 'and on screen at the spot: ' + r.fishPx);
  A(r.leapPx > 300 && r.hiddenPx < 20, 'the leaper out of the water at the top of its leap, hidden between leaps: ' + r.leapPx + '/' + r.hiddenPx);
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
