// RS-359: the shadow pass draws one depth-only proxy per thing instead of every caster again. A building's casters (window
// panes included, since they only change material by night) bake into one mesh of plain triangles, a person's skinned
// parts and loose parts (a held weapon on its own node as a bone) into one skinned mesh, and the parts themselves stop
// casting. The proxies are visible only while the shadow map is drawn, so the colour pass never sees them. Doors swing,
// so they keep casting on their own
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    const ts = townList(); const t = ts[0]; G.gameMode = 0; G.owPos = { x:t.x, y:t.y }; SET.gfx = 'high'; enterVillage(); setUi('playing'); G.player.clock = 10;
    for (let i=0;i<10;i++){ renderGame(); await new Promise(r=>setTimeout(r, 30)); }
    const R = V3.renderer, out = {};
    const count = ()=>{ R.info.autoReset = false; R.info.reset(); renderGame(); const c = R.info.render.calls; R.info.autoReset = true; return c; };
    out.calls = count(); R.shadowMap.enabled = false; out.noShadow = count(); R.shadowMap.enabled = true;
    // the proxies: built, hidden after a frame, shown inside the shadow pass
    const px = []; V3.scene.traverse(o=>{ if (o.userData.proxy) px.push(o); }); out.px = px.length; out.pxSk = px.filter(o=>o.isSkinnedMesh).length; out.pxVisible = px.filter(o=>o.visible).length; out.list = GFX_PROXY.get(R).length;
    const L = GFX_PROXY.get(R), saved = L.splice(0); out.callsNoProxy = count(); L.push(...saved); out.callsAgain = count();   /* (off the list, the proxies draw nothing: the shadow pass shrinks by them) */
    // what still casts on its own
    const folkSet = new Set(); for (const p of [...V3.npcs, ...V3.villagers]) p.g.traverse(o=>folkSet.add(o)); const player = new Set(); V3.player.g.traverse(o=>player.add(o));
    let folkOwn = 0, playerOwn = 0, windowsOwn = 0, doorsOwn = 0, other = 0; V3.scene.traverse(o=>{ if (!o.isMesh || !o.castShadow || o.userData.proxy) return; if (player.has(o)) playerOwn++; else if (folkSet.has(o)) folkOwn++; else other++; });
    for (const w of V3.windows||[]) if (w.isMesh && w.castShadow) windowsOwn++; for (const d of Object.values(V3.doors||{})) if (d && d.isObject3D) d.traverse(o=>{ if (o.isMesh && o.castShadow) doorsOwn++; });
    out.folkOwn = folkOwn; out.playerOwn = playerOwn; out.windowsOwn = windowsOwn; out.doorsOwn = doorsOwn; out.other = other; out.people = V3.npcs.length + V3.villagers.length;
    out.playerProxy = !!(V3.player.e && V3.player.e.shadowProxy); out.playerBones = out.playerProxy ? V3.player.e.shadowProxy.skeleton.bones.length : 0;
    // a person's proxy follows the walk, read through its bones
    const p = [...V3.npcs, ...V3.villagers].find(q=>q.e && q.e.shadowProxy && q.e.skinned && !q.e.beast && !q.e.anim), e = p.e, m = e.shadowProxy;
    const sample = ()=>{ e.holder.updateMatrixWorld(true); const a = [], v = new THREE.Vector3(), P = m.geometry.attributes.position, st = Math.max(1, Math.floor(P.count/60)); for (let i=0;i<P.count;i+=st){ v.fromBufferAttribute(P, i); m.boneTransform(i, v); a.push(v.x, v.y, v.z); } return a; };
    const pose = (mv)=>{ e.fol = 0; e.wph = 9; m3dPoseHumanoid(e.rig, 1, mv, 0, 0, 0, e); return sample(); };
    const diff = (a, b)=>{ let d = 0; for (let i=0;i<a.length;i++) d = Math.max(d, Math.abs(a[i]-b[i])); return d; };
    out.walk = +diff(pose(1), pose(0)).toFixed(3); out.bones = m.skeleton.bones.length; out.skinBones = e.skinBones.length; out.parts = m.userData.proxy;
    // a change of gear rebuilds your figure, and its proxy with it
    const old = V3.player; G.player.equip = G.player.equip || {}; const was = rsLookKey(); V3.lookKey = 'x'; renderGame(); out.rebuilt = V3.player!==old; out.rebuiltProxy = !!(V3.player.e && V3.player.e.shadowProxy && V3.player.e.shadowProxy!==old.e.shadowProxy);
    // another town: the old town's proxies fall off the list
    G.gameMode = 0; G.owPos = { x:ts[1].x, y:ts[1].y }; enterVillage(); setUi('playing'); for (let i=0;i<4;i++){ renderGame(); await new Promise(r=>setTimeout(r, 30)); }
    let px2 = 0; V3.scene.traverse(o=>{ if (o.userData.proxy) px2++; }); out.px2 = px2; out.list2 = GFX_PROXY.get(R).length;
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.calls - r.noShadow < r.noShadow*0.5, 'the shadow pass draws far less than the colour pass: '+(r.calls - r.noShadow)+' of '+r.calls);
  A(r.px > 20 && r.pxSk >= r.people && r.pxVisible===0 && r.list===r.px && r.callsNoProxy < r.calls - 20 && r.callsAgain > r.callsNoProxy + 20, 'the proxies are hidden to the camera and shown to the shadow map');
  A(r.folkOwn <= r.people && r.windowsOwn < 10 && r.other < 40, 'the parts, the window panes and the townsfolk cast through the proxies');
  A(r.playerProxy && r.playerOwn===0 && r.playerBones > 10, 'your figure casts as one');
  A(r.walk > 0.012 && r.bones >= r.skinBones && r.parts > 8, 'a person\'s proxy follows the walk through the bones');
  A(r.rebuilt && r.rebuiltProxy, 'a change of gear rebuilds the proxy');
  A(r.list2===r.px2, 'the first town\'s proxies fell off the list: '+r.list2+' listed, '+r.px2+' in the scene');
};
