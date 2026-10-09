// RS-264: torsos sculpted finer, and a woman's figure sculpted into the torso itself - a bust that stands out from the chest
// (not two little balls stuck on), a narrower waist and wider hips; picking Feminine in character creation clears the beard
module.exports = async page=>{
  const r = await page.evaluate(()=>{
    const out = {};
    const prof = (fem)=>{ const g = m3dTorsoGeo(1, 0, fem), p = g.attributes.position; let chestZ = -1, waistX = 0, hipX = 0, ribX = 0, shX = 0;
      for (let i=0;i<p.count;i++){ const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
        if (y > 0.17 && y < 0.22 && Math.abs(x) > 0.025 && Math.abs(x) < 0.06) chestZ = Math.max(chestZ, z);
        if (Math.abs(y - 0.11) < 0.01) waistX = Math.max(waistX, Math.abs(x));
        if (Math.abs(y + 0.01) < 0.01) hipX = Math.max(hipX, Math.abs(x)); if (Math.abs(y - 0.2) < 0.01) ribX = Math.max(ribX, Math.abs(x)); if (Math.abs(y - 0.268) < 0.01) shX = Math.max(shX, Math.abs(x)); }
      return { verts:p.count, chestZ:+chestZ.toFixed(4), waistX:+waistX.toFixed(4), hipX:+hipX.toFixed(4), ribX:+ribX.toFixed(4), shX:+shX.toFixed(4) }; };
    out.m = prof(false); out.f = prof(true);
    goToCharCreate(); G.ccLookTouched = false; ccSelectRace(RACES.findIndex(r=>r[0]==='Human')); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); o3Pref = false; try{ v3Pref = false; }catch(e){}
    for (const sl of ['head','chest','legs','arms','feet','cape']) G.gear[sl] = newItem();
    const L = G.player.look; L.body = 1; const e = m3dInstance({}, rsPlayerLook()); let balls = 0; out.fHip = e.rig.legs[1].hip.position.x; out.fSh = e.rig.arms[1].sh.position.x;
    L.body = 0; { const m = m3dInstance({}, rsPlayerLook()); out.mHip = m.rig.legs[1].hip.position.x; out.mSh = m.rig.arms[1].sh.position.x; } L.body = 1;
    e.rig.torso.children.forEach(c=>{ if (c.isMesh && c.geometry.type==='SphereGeometry' && c.position.y > 0.18 && c.position.y < 0.23 && Math.abs(c.position.x) > 0.02) balls++; });
    out.balls = balls; out.femTorso = e.rig.chestMesh.geometry===m3dWearGeo(Math.round((rsPlayerLook().o.bulk||1)*10)/10, true, 'tunic');   /* (RS-279: her tunic is sculpted over the feminine figure) */
    { G.gear.legs = rsMakeArmour('cloth', 2, 'legs'); const e2 = m3dInstance({}, rsPlayerLook()), sk = e2.rig.skirt, sp = sk.geometry.attributes.position, hp = e2.rig.chestMesh.geometry.attributes.position;   /* (RS-286: the skirt clears her hips) */
      const rAt = (p, y0, sc)=>{ let r = 0; for (let i=0;i<p.count;i++) if (Math.abs(p.getY(i) + (sc||0) - y0) < 0.012) r = Math.max(r, Math.abs(p.getX(i))); return r; };
      out.skirtHip = +rAt(sp, -0.038, sk.position.y).toFixed(4); out.bodyHip = +rAt(hp, -0.038).toFixed(4); out.skirtWaist = +rAt(sp, 0.01, sk.position.y).toFixed(4); G.gear.legs = newItem(); }
    goToCharCreate(); ccSelectRace(RACES.findIndex(r=>r[0]==='Human')); const T = lookTarget(); T.body = 0; T.beard = 3; lookStep('body', 1); out.beardAfter = T.beard; out.bodyAfter = T.body;
    return out; });
  const A = (c, m)=>{ if (!c) throw new Error(m+' :: '+JSON.stringify(r)); };
  A(r.m.verts > 9000 && r.f.verts > 9000, 'torsos are sculpted finely');
  A(r.f.chestZ > r.m.chestZ + 0.012, 'the bust stands out from the chest');
  A(r.f.waistX < r.m.waistX - 0.006 && r.f.hipX >= r.m.hipX, 'a narrower waist and wider hips');
  A(r.f.waistX < r.f.ribX - 0.008 && r.f.waistX < r.f.hipX - 0.008, 'her waist curves in, narrower than her ribs and her hips');
  A(r.balls===0, 'no little balls stuck on the chest');
  A(r.f.shX < r.m.shX - 0.008 && r.f.hipX > r.m.hipX + 0.006 && r.f.hipX > r.f.shX*0.72, 'RS-283: narrower shoulders and wider hips, an hourglass');
  A(r.fHip > r.mHip*1.15 && r.fSh < r.mSh*0.9, 'RS-283: her hip joints set wider, her shoulders narrower');
  A(r.femTorso, 'a woman wears the feminine torso');
  A(r.bodyAfter===1 && r.beardAfter===0, 'picking Feminine clears the beard');
  A(r.skirtHip > r.bodyHip && r.skirtWaist < r.skirtHip, 'RS-286: her robe bottom is gathered at the waist and clears her hips: '+JSON.stringify([r.skirtWaist, r.skirtHip, r.bodyHip]));
  console.log('torso ok', JSON.stringify(r));
};
