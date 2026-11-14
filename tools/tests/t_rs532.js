// RS-532: eye sliders - the eyes' size and spacing, the sockets, lids and eyeballs moving together so the eyes stay set in the face;
// at their defaults the eyes are where they were
module.exports = async page=>{
  const r = await page.evaluate(()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); const out = {};
    const eyes = fc=>{ const L = Object.assign(lookDefault('Human'), { body:0, beard:0 }); if (fc) L.fc = fc; const pt = rsPlayerLook({ race:'Human', look:L, bare:true }), root = m3dBuilders().get(pt.paint)(pt.o), head = M3D.meta.get(root).rig.head; let b = [];
      head.traverse(o=>{ if (o.isMesh && o.geometry.type==='SphereGeometry' && o.material.userData.hex==='#eceae2') b.push(o); }); b.sort((a, c)=>a.position.x - c.position.x);
      return { r:+b[1].geometry.parameters.radius.toFixed(5), x:+b[1].position.x.toFixed(4), front:+(b[1].position.z + b[1].geometry.parameters.radius).toFixed(4) }; };
    out.def = eyes(null); out.small = eyes({ eyeSize:0 }); out.big = eyes({ eyeSize:1 }); out.close = eyes({ eyeSep:0 }); out.wide = eyes({ eyeSep:1 });
    out.sliders = LOOK_FACE.slice(0, 2).map(f=>f[0]).join(',');
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.sliders==='eyeSize,eyeSep', 'two eye sliders lead the face section');
  A(Math.abs(r.def.r - 0.0116) < 1e-4 && Math.abs(r.def.x - 0.026) < 1e-4, 'at the defaults the eyes are as they were');
  A(r.small.r < r.def.r*0.85 && r.big.r > r.def.r*1.15, 'the eye slider sizes the eyes');
  A(r.close.x < r.def.x*0.9 && r.wide.x > r.def.x*1.1, 'the spacing slider spreads them');
  A([r.small, r.big, r.def].every(e=>Math.abs(e.front - 0.0661) < 2e-4), 'whatever their size, each sits in its socket');
};
