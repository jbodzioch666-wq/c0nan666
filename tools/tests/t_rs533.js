// RS-533: hair that looks like hair - a hair finish (fine streaks along the lock, a soft sheen) for hair, brows and beards in place of
// the speckled fur, more locks and finer, each drawn to a point, the streaks running down them; beasts keep their fur
module.exports = async page=>{
  const r = await page.evaluate(()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); const out = {};
    const L = Object.assign(lookDefault('Human'), { body:0, hair:2, beard:3 }), pt = rsPlayerLook({ race:'Human', look:L, bare:true }), root = m3dBuilders().get(pt.paint)(pt.o), head = M3D.meta.get(root).rig.head;
    const kinds = new Set(); let hairMesh = null, beard = null; head.traverse(o=>{ if (!o.isMesh || !o.material || !o.material.userData) return; if (o.name==='hair') hairMesh = o; if (o.name==='beard') beard = o; kinds.add(o.material.userData.kind); });
    out.kinds = [...kinds]; out.hairKind = hairMesh && hairMesh.material.userData.kind; out.beardKind = beard && beard.material.userData.kind;
    out.uv = !!(hairMesh && hairMesh.geometry.attributes.uv); out.hairVerts = hairMesh ? hairMesh.geometry.attributes.position.count : 0;
    const t = m3dTaper([[0,0,0],[0,-0.03,0.01],[0,-0.06,0.01]], 0.008, 0.0007, m3dMat({}, '#3a2618', 'hair'), 8, 8); const p = t.geometry.attributes.position; let tip = 0; for (let j=0;j<9;j++){ const i = 8*9 + j; tip = Math.max(tip, Math.hypot(p.getX(i), p.getZ(i) - 0.01)); } out.tip = +tip.toFixed(4);
    out.pattern = !!m3dPattern('hair').map && M3D_PAT_KINDS.includes('hair');
    const wolf = m3dPortrait({ nm:'wolf' }); let fur = false; if (wolf){ const wr = m3dBuilders().get(wolf.paint)(wolf.o || {}); wr.traverse(o=>{ if (o.isMesh && o.material && o.material.userData && o.material.userData.kind==='fur') fur = true; }); } out.wolfFur = fur;
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.hairKind==='hair' && r.beardKind==='hair' && r.pattern, 'hair and beard wear the hair finish');
  A(r.uv && r.hairVerts > 1000, 'cards of strands, carrying the texture down their length (RS-537)');
  A(r.tip < 0.0012, 'each lock is drawn to a fine point');
  A(r.wolfFur, 'a wolf keeps its fur');
};
