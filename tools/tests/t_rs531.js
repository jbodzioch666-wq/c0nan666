// RS-531: muscle shows - from soft to hard it swells the chest, the trapezius, deltoids and lats, the upper arms, forearms, thighs
// and calves (sleeves and hose cut to fit), centred on each sex's default so the default build keeps its shape
module.exports = async page=>{
  const r = await page.evaluate(()=>{ const out = {};
    const W = g=>{ g.computeBoundingBox(); const b = g.boundingBox; return { x:b.max.x - b.min.x, z:b.max.z - b.min.z }; };
    const B = (fem, mus)=>m3dBodySpec({ bulk:1, fem, bodyMus:mus });
    for (const fem of [false, true]){ const lo = B(fem, 0), hi = B(fem, 1), k = fem ? 'f' : 'm';
      const arm = [W(m3dLimbGeo('upper', 1, lo)).x, W(m3dLimbGeo('upper', 1, hi)).x], thigh = [W(m3dLimbGeo('thigh', 1, lo)).x, W(m3dLimbGeo('thigh', 1, hi)).x];
      const top = [W(m3dTorsoGeo(lo, 'top')), W(m3dTorsoGeo(hi, 'top'))], sleeve = [W(m3dLimbWearGeo('upper', 1, 'cloth', lo)).x, W(m3dLimbWearGeo('upper', 1, 'cloth', hi)).x];
      out[k] = { arm:+(arm[1]/arm[0]).toFixed(3), thigh:+(thigh[1]/thigh[0]).toFixed(3), chestZ:+(top[1].z/top[0].z).toFixed(3), chestX:+(top[1].x/top[0].x).toFixed(3), sleeve:+(sleeve[1]/sleeve[0]).toFixed(3) }; }
    out.defKey = m3dBodySpec({ bulk:1 }).key===M3D_BODY0.key;
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  for (const k of ['m', 'f']){ A(r[k].arm > 1.25 && r[k].thigh > 1.2, k + ': hard muscle makes far thicker arms and thighs than soft');
    A(r[k].chestZ > (k==='f' ? 1.02 : 1.08) && r[k].chestX > 1.08, k + ': and a broader, deeper chest (hers is set by the bust)'); A(r[k].sleeve > 1.15, k + ': the sleeves are cut to fit'); }
  A(r.defKey, 'the default build is the default sculpt');
};
