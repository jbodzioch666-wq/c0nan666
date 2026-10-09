// RS-264: torsos sculpted finer, and a woman's figure sculpted into the torso itself - a bust that stands out from the chest
// (not two little balls stuck on), a narrower waist and wider hips; picking Feminine in character creation clears the beard
module.exports = async page=>{
  const r = await page.evaluate(()=>{
    const out = {};
    const prof = (fem)=>{ const g = m3dTorsoGeo(1, 0, fem), p = g.attributes.position; let chestZ = -1, waistX = 0, hipX = 0, ribX = 0;
      for (let i=0;i<p.count;i++){ const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
        if (y > 0.17 && y < 0.22 && Math.abs(x) > 0.025 && Math.abs(x) < 0.06) chestZ = Math.max(chestZ, z);
        if (Math.abs(y - 0.11) < 0.01) waistX = Math.max(waistX, Math.abs(x));
        if (Math.abs(y + 0.01) < 0.01) hipX = Math.max(hipX, Math.abs(x)); if (Math.abs(y - 0.2) < 0.01) ribX = Math.max(ribX, Math.abs(x)); }
      return { verts:p.count, chestZ:+chestZ.toFixed(4), waistX:+waistX.toFixed(4), hipX:+hipX.toFixed(4), ribX:+ribX.toFixed(4) }; };
    out.m = prof(false); out.f = prof(true);
    goToCharCreate(); G.ccLookTouched = false; ccSelectRace(RACES.findIndex(r=>r[0]==='Human')); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); o3Pref = false; try{ v3Pref = false; }catch(e){}
    for (const sl of ['head','chest','legs','arms','feet','cape']) G.gear[sl] = newItem();
    const L = G.player.look; L.body = 1; const e = m3dInstance({}, rsPlayerLook()); let balls = 0;
    e.rig.torso.children.forEach(c=>{ if (c.isMesh && c.geometry.type==='SphereGeometry' && c.position.y > 0.18 && c.position.y < 0.23 && Math.abs(c.position.x) > 0.02) balls++; });
    out.balls = balls; out.femTorso = e.rig.torso.children.some(c=>c.isMesh && c.geometry===m3dTorsoGeo(Math.round((rsPlayerLook().o.bulk||1)*10)/10, 0, true));
    goToCharCreate(); ccSelectRace(RACES.findIndex(r=>r[0]==='Human')); const T = lookTarget(); T.body = 0; T.beard = 3; lookStep('body', 1); out.beardAfter = T.beard; out.bodyAfter = T.body;
    return out; });
  const A = (c, m)=>{ if (!c) throw new Error(m+' :: '+JSON.stringify(r)); };
  A(r.m.verts > 9000 && r.f.verts > 9000, 'torsos are sculpted finely');
  A(r.f.chestZ > r.m.chestZ + 0.012, 'the bust stands out from the chest');
  A(r.f.waistX < r.m.waistX - 0.006 && r.f.hipX >= r.m.hipX, 'a narrower waist and wider hips');
  A(r.f.waistX < r.f.ribX - 0.008 && r.f.waistX < r.f.hipX - 0.008, 'her waist curves in, narrower than her ribs and her hips');
  A(r.balls===0, 'no little balls stuck on the chest');
  A(r.femTorso, 'a woman wears the feminine torso');
  A(r.bodyAfter===1 && r.beardAfter===0, 'picking Feminine clears the beard');
  console.log('torso ok', JSON.stringify(r));
};
