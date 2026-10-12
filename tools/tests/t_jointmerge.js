// RS-352: a town frame draws fewer parts. Each townsperson's meshes that share a material under one joint are baked into
// one, so the figure still bends at every joint (its walk and strike still change its pose) but draws about a third fewer
// parts; the player's figure is untouched. (RS-353 took back RS-352's alternate-frame shadow map: it flickered on a walking figure)
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    const t = townList()[0]; G.gameMode = 0; G.owPos = { x:t.x, y:t.y }; enterVillage(); setUi('playing'); G.player.clock = DAY_LENGTH*0.5;
    const fr = async n=>{ for (let i=0;i<n;i++){ renderGame(); await new Promise(r=>setTimeout(r, 20)); } }; await fr(8);
    const out = {}, R = V3.renderer, folk = [...V3.npcs, ...V3.villagers];
    const meshes = p=>{ let n = 0; p.e.holder.traverse(o=>{ if (o.isMesh) n++; }); return n; };
    out.merged = folk.reduce((a, p)=>a + (p.e.mergedParts||0), 0); out.now = folk.reduce((a, p)=>a + meshes(p), 0); out.before = out.merged + out.now; out.playerMerged = V3.player.e.mergedParts||0;
    // a merged villager still walks and strikes
    const snap = (root)=>{ root.updateMatrixWorld(true); const a = [], v = new THREE.Vector3(); root.traverse(o=>{ if (o.isMesh && o.geometry.attributes.position){ const P = o.geometry.attributes.position, st = Math.max(1, Math.floor(P.count/24)); for (let i=0;i<P.count;i+=st){ v.fromBufferAttribute(P, i).applyMatrix4(o.matrixWorld); a.push(v.x, v.y, v.z); } } }); return a; };
    const diff = (a, b)=>{ let d = 0; for (let i=0;i<Math.min(a.length, b.length);i++) d = Math.max(d, Math.abs(a[i]-b[i])); return d; };
    const p = folk.find(q=>(q.e.mergedParts||0) > 3 && !q.e.beast && !q.e.anim) || folk[0]; const e = p.e, rg = e.rig;
    const pose = (mv, wind, strike)=>{ e.fol = 0; e.wph = 9; if (e.anim) e.anim(rg, 1, mv, wind, strike, 0, e); else if (e.beast) m3dPoseBeast(rg, 1, mv, wind, strike, 0, e); else m3dPoseHumanoid(rg, 1, mv, wind, strike, 0, e); return snap(e.holder); };
    const still = pose(0, 0, 0); out.walk = +diff(pose(1, 0, 0), still).toFixed(3); out.strike = +diff(pose(0, 0, 1), still).toFixed(3); out.whoMerged = p.e.mergedParts||0;
    // (RS-353) the shadow map is drawn every frame again: an alternate-frame one flickered on a walking figure
    await fr(2); out.auto = R.shadowMap.autoUpdate;
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.merged >= r.before*0.25, 'the townsfolk draw at least a quarter fewer parts: '+r.before+' -> '+r.now);
  A(r.playerMerged===0, 'your own figure is untouched');
  A(r.whoMerged > 3 && r.walk > 0.012 && r.strike > 0.02, 'a merged townsperson still walks and strikes');
  A(r.auto===true, 'the shadow map is drawn every frame (RS-353)');
};
