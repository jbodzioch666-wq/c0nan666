// RS-538: armour and robes fit whatever build is inside them - a belt round the body as it is (not the build everyone used to have),
// a robe's waist and skirt as wide as the body in it (a heavy belly hung out over the skirt like a shelf), a tabard laid on the chest
// and belly and hanging straight below them (it was a flat card the belly pushed through)
module.exports = async page=>{
  const r = await page.evaluate(()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); const out = {};
    const build = (fam, tier, bd)=>{ G.gear.chest = rsMakeArmour(fam, tier, 'chest'); G.gear.legs = rsMakeArmour(fam, tier, 'legs'); G.gear.cape = newItem(); G.gear.head = newItem();
      const L = Object.assign(lookDefault('Human'), { body:0 }); if (bd) L.bd = bd; const pt = rsPlayerLook({ race:'Human', look:L }), root = m3dBuilders().get(pt.paint)(pt.o); return M3D.meta.get(root).rig; };
    const heavy = { fat:1, muscle:1, shoulders:1, waist:1, frame:1 };
    for (const [k, fam, bd] of [['beltAvg', 'hide', null], ['beltHeavy', 'hide', heavy]]){ const rig = build(fam, 5, bd); let belt = null; rig.hips.children.forEach(c=>{ if (c.isMesh && c.geometry.type==='TorusGeometry' && Math.abs(c.position.y - 0.025) < 0.002) belt = c; });
      const rg = m3dRingAt([rig.chestMesh, rig.pelvisMesh], 0.025, 0.004, 0.94), R0 = belt.geometry.parameters.radius; out[k] = { beltX:+(R0*belt.scale.x).toFixed(4), bodyX:+rg.x.toFixed(4) }; }
    for (const [k, bd] of [['robeAvg', null], ['robeHeavy', heavy]]){ const rig = build('cloth', 3, bd), sk = rig.skirt, p = sk.geometry.attributes.position; let top = -9, wx = 0; for (let i=0;i<p.count;i++) if (p.getY(i) > top) top = p.getY(i);
      for (let i=0;i<p.count;i++) if (p.getY(i) > top - 0.01) wx = Math.max(wx, Math.abs(p.getX(i)*sk.scale.x));
      const rg = m3dRingAt([rig.chestMesh, rig.pelvisMesh], 0.014, 0.01); out[k] = { skirtWaist:+wx.toFixed(4), body:+rg.x.toFixed(4) }; }
    { const rig = build('metal', 5, heavy), tb = rig.torsoIn.getObjectByName('tabard'), p = tb.geometry.attributes.position; let under = 0, n = 0;
      for (let i=0;i<p.count;i++){ const x = p.getX(i), y = p.getY(i) + tb.position.y, z = p.getZ(i), sz = m3dSurfZ([rig.chestMesh, rig.pelvisMesh], x, y, 0.006); if (sz > 0){ n++; if (z < sz - 0.001) under++; } }
      out.tabard = { under, n }; }
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.beltHeavy.beltX > r.beltAvg.beltX*1.25 && r.beltHeavy.beltX >= r.beltHeavy.bodyX && r.beltHeavy.beltX < r.beltHeavy.bodyX + 0.02, 'a heavy body\'s belt goes round it, close');
  A(r.robeHeavy.skirtWaist >= r.robeHeavy.body - 0.002, 'a heavy body\'s robe skirt is as wide as its waist - no shelf');
  A(r.tabard.n > 50 && r.tabard.under <= r.tabard.n*0.04, 'the tabard lies on the chest and belly, not under them');
};
