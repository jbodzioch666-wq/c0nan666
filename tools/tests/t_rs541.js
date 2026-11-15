// RS-541: plate fitted to the limbs in it. On a slight build the knee and elbow cops were balls wider than the leg and arm
// (doll joints), the greave a straight pipe and the vambrace a tube round a thin forearm. Now the poleyn cups the knee, the
// greave follows the calf, and each plate stands a little off the limb at every build
module.exports = async page=>{
  const r = await page.evaluate(()=>{ const out = {};
    const half = (g, y, band)=>{ const p = g.attributes.position; let x = 0; for (let i=0;i<p.count;i++) if (Math.abs(p.getY(i) - y) < (band || 0.006)) x = Math.max(x, Math.abs(p.getX(i))); return x; };
    for (const [nm, o] of [['slight', { bulk:0.9, bodyFat:0, bodyMus:0.1 }], ['heavy', { bulk:1.15, bodyFat:0.9, bodyMus:0.8 }]]){ const B = m3dBodySpec(o), b = Math.round(B.b*10)/10 || 1;
      const th = m3dLimbWearGeo('thigh', b, 'plate', B), thB = m3dLimbGeo('thigh', b, B), sh = m3dLimbWearGeo('shin', b, 'plate', B), shB = m3dLimbGeo('shin', b, B), fo = m3dLimbWearGeo('fore', b, 'plate', B), foB = m3dLimbGeo('fore', b, B);
      out[nm] = { knee:+(half(th, -0.235) - half(thB, -0.235)).toFixed(4), thighOff:+(half(th, -0.12) - half(thB, -0.12)).toFixed(4), calf:+(half(sh, -0.07) - half(sh, -0.19)).toFixed(4), shinOff:+(half(sh, -0.07) - half(shB, -0.07)).toFixed(4), fore:+(half(fo, -0.04) - half(foB, -0.04)).toFixed(4) }; }
    out.ver = M3D_SCULPT_VER; return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  for (const k of ['slight', 'heavy']){ const q = r[k];
    A(q.knee < 0.012, k + ': the poleyn cups the knee, no ball wider than the leg');
    A(q.thighOff > 0.002 && q.thighOff < 0.012, k + ': the cuisse stands a little off the thigh');
    A(q.calf > 0.005, k + ': the greave follows the calf');
    A(q.shinOff > 0.002 && q.shinOff < 0.012, k + ': the greave stands a little off the leg');
    A(q.fore > 0.002 && q.fore < 0.012, k + ': the vambrace is as thick as the forearm in it'); }
  A(r.ver >= 9, 'the sculpt cache is renewed');
};
