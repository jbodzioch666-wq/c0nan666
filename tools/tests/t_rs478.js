// RS-478: a leather coif is finer each tier, like the metal helms and wizard's hats: a stitched seam, then studs, a feather, dragon
// scales, silver thread and a clasp, and black dragonhide's spines - each set on the hood's own surface
module.exports = async page=>{
  const r = await page.evaluate(()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    const T = THREE, out = [], tris = o=>{ let n = 0; o.traverse(x=>{ if (x.isMesh && x.geometry) n += (x.geometry.index ? x.geometry.index.count : x.geometry.attributes.position.count)/3; }); return Math.round(n); };
    G.gear.head = rsMakeArmour('hide', 0, 'head'); rsSync && rsSync(); const base = tris(m3dInstance({}, rsPlayerLook()).holder);
    for (let t=0;t<7;t++){ G.gear.head = rsMakeArmour('hide', t, 'head'); rsSync && rsSync(); const L = rsPlayerLook(), e = m3dInstance({}, L); e.holder.updateMatrixWorld(true);
      let off = 0; const hb = new T.Box3(); e.rig.head.traverse(o=>{ if (o.isMesh) hb.expandByObject(o); }); hb.expandByScalar(0.08);
      out.push({ tier:L.o.cowlTier, extra:tris(e.holder) - base }); }
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.every((x, i)=>x.tier===i), 'each coif knows its tier');
  A(r[0].extra===0, 'a plain leather coif is plain');
  for (let i=1;i<7;i++) A(r[i].extra > r[i-1].extra, 'finer each tier, '+i);
};
