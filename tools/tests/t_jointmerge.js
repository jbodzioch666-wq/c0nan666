// RS-356: a townsperson is one skinned mesh per make of part (skin, cloth, leather, metal, hair...) instead of thirty-odd
// meshes: every part's vertices are bound to the joint it hangs from, its colour baked into the vertices, so the figure
// still bends at every joint - its walk and strike still change its pose, read through the bones - and draws about a
// quarter as often. Anything the rig moves on its own stays its own mesh. Your own figure is untouched
// (RS-352 merged parts within joints; RS-353 took back RS-352's alternate-frame shadow map, which flickered on a walking figure)
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    const t = townList()[0]; G.gameMode = 0; G.owPos = { x:t.x, y:t.y }; enterVillage(); setUi('playing'); G.player.clock = DAY_LENGTH*0.5;
    const fr = async n=>{ for (let i=0;i<n;i++){ renderGame(); await new Promise(r=>setTimeout(r, 20)); } }; await fr(8);
    const out = {}, R = V3.renderer, folk = [...V3.npcs, ...V3.villagers];
    const meshes = p=>{ let n = 0, sk = 0; p.e.holder.traverse(o=>{ if (o.isMesh && !o.userData.proxy){ n++; if (o.isSkinnedMesh) sk++; } }); return [n, sk]; };   /* (RS-359: the shadow proxy is not a drawn part) */
    out.parts = folk.reduce((a, p)=>a + (p.e.skinnedParts||0), 0); out.now = folk.reduce((a, p)=>a + meshes(p)[0], 0); out.before = out.parts + out.now - folk.reduce((a, p)=>a + meshes(p)[1], 0);
    out.playerSkinned = 0; V3.player.e.holder.traverse(o=>{ if (o.isSkinnedMesh && !o.userData.proxy) out.playerSkinned++; });
    // a skinned villager still walks and strikes: its vertices, read through the bones, move
    const p = folk.find(q=>(q.e.skinnedParts||0) > 10 && !q.e.beast && !q.e.anim) || folk[0], e = p.e, sm = []; e.holder.traverse(o=>{ if (o.isSkinnedMesh && !o.userData.proxy) sm.push(o); });
    const sample = ()=>{ e.holder.updateMatrixWorld(true); const a = [], v = new THREE.Vector3(); for (const m of sm){ const P = m.geometry.attributes.position, st = Math.max(1, Math.floor(P.count/40)); for (let i=0;i<P.count;i+=st){ v.fromBufferAttribute(P, i); m.boneTransform(i, v); v.applyMatrix4(m.matrixWorld); a.push(v.x, v.y, v.z); } } return a; };
    const pose = (mv, strike)=>{ e.fol = 0; e.wph = 9; if (e.anim) e.anim(e.rig, 1, mv, 0, strike, 0, e); else if (e.beast) m3dPoseBeast(e.rig, 1, mv, 0, strike, 0, e); else m3dPoseHumanoid(e.rig, 1, mv, 0, strike, 0, e); return sample(); };
    const diff = (a, b)=>{ let d = 0; for (let i=0;i<Math.min(a.length, b.length);i++) d = Math.max(d, Math.abs(a[i]-b[i])); return d; };
    const still = pose(0, 0); out.walk = +diff(pose(1, 0), still).toFixed(3); out.strike = +diff(pose(0, 1), still).toFixed(3); out.whoParts = e.skinnedParts||0; out.whoMeshes = meshes(p);
    // the colour lives in the vertices: the skinned materials are white with vertex colours on, and the hit flash still reaches them
    out.white = sm.every(m=>m.material.vertexColors && m.material.color.r===1 && m.material.color.g===1 && m.material.color.b===1 && m.geometry.attributes.color);
    out.flashReach = sm.every(m=>!m.material.emissive || e.mats.includes(m.material)) && e.mats.every(m=>{ let used = false; e.holder.traverse(o=>{ if (o.isMesh && [].concat(o.material).includes(m)) used = true; }); return used; });
    await fr(2); out.auto = R.shadowMap.autoUpdate;
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.parts >= r.before*0.5 && r.now < r.before*0.5, 'the townsfolk draw less than half as many parts: '+r.before+' -> '+r.now);
  A(r.playerSkinned===0, 'your own figure is untouched');
  A(r.whoParts > 10 && r.whoMeshes[1] <= 14 && r.walk > 0.012 && r.strike > 0.02, 'a skinned townsperson still walks and strikes');
  A(r.white && r.flashReach, 'the colour is in the vertices and the hit flash reaches the skinned materials');
  A(r.auto===true, 'the shadow map is drawn every frame (RS-353)');
};
