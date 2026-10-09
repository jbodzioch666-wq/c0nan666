// RS-279: clothes are sculpted garments worn over the body, not the bare muscled torso recoloured - a tunic, a leather jerkin
// split at the front, a mail hauberk to mid-thigh, a breastplate with a centre ridge and a fauld of lames, a robe; sleeves and
// hose to match (a puffed cloth sleeve, a strapped bracer, a vambrace, a greave with a knee cop); a neck shows in the
// neckline, the belt goes round the body, pauldrons are sculpted shells and a tabard hangs round the chest
module.exports = async page=>{
  const r = await page.evaluate(()=>{
    const out = {};
    const prof = g=>{ const p = g.attributes.position; let frontZ = -1, lowY = 1, waistX = 0, n = 0; for (let i=0;i<p.count;i++){ const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
        lowY = Math.min(lowY, y); if (Math.abs(y - 0.1) < 0.005 && Math.abs(x) < 0.01) frontZ = Math.max(frontZ, z); if (Math.abs(y - 0.11) < 0.01) waistX = Math.max(waistX, Math.abs(x)); n++; } return { verts:n, lowY:+lowY.toFixed(3), waistX:+waistX.toFixed(4), frontZ:+frontZ.toFixed(4) }; };
    out.bare = prof(m3dTorsoGeo(1, 0, false)); out.tunic = prof(m3dWearGeo(1, false, 'tunic')); out.jerkin = prof(m3dWearGeo(1, false, 'jerkin')); out.chain = prof(m3dWearGeo(1, false, 'chain')); out.plate = prof(m3dWearGeo(1, false, 'plate')); out.femTunic = prof(m3dWearGeo(1, true, 'tunic'));
    const info = nm=>{ const e = m3dInstance({ nm }, m3dPortrait({ nm })), rig = e.rig; let belt = 0, neck = 0, pauld = 0, tabard = 0, box = 0;
      rig.torso.children.forEach(c=>{ if (!c.isMesh) return; const t = c.geometry.type; if (t==='TorusGeometry' && Math.abs(c.position.y - 0.025) < 0.001) belt++; if (t==='CapsuleGeometry') neck++; if (c.name==='tabard') tabard++; if (t==='BoxGeometry' && c.geometry.parameters.height > 0.2) box++;
        if (c.geometry===m3dPauldronGeo('plate', c.geometry.userData.r || 0) || /pauldron/.test(c.geometry.name||'')) pauld++; });
      rig.torso.children.forEach(c=>{ if (c.isMesh && [...M3D.sculpt.entries()].some(([k, g])=>g===c.geometry && k.startsWith('pauldron'))) pauld++; });
      const limbWear = [rig.arms[0].sh.children[0].children[0], rig.legs[0].hip.children[0].children[0]].map(m=>{ const k = [...M3D.sculpt.entries()].find(([k, g])=>g===m.geometry); return k ? k[0] : '?'; });
      return { wear:rig.wear, belt, neck, pauld, tabard, box, limbWear, chestKey:[...M3D.sculpt.entries()].find(([k, g])=>g===rig.chestMesh.geometry)[0] }; };
    out.bandit = info('bandit'); out.knight = info('knight'); out.orc = info('orc warrior'); out.fanatic = info('fanatic'); out.troll = info('troll');
    return out; });
  const A = (c, m)=>{ if (!c) throw new Error(m+' :: '+JSON.stringify(r)); };
  A(r.tunic.frontZ > r.bare.frontZ + 0.005 && r.plate.frontZ > r.bare.frontZ + 0.008, 'cloth and steel stand off the belly');
  A(r.jerkin.lowY < -0.07 && r.chain.lowY < -0.13 && r.tunic.lowY > -0.06, 'a jerkin skirts the hips, a hauberk hangs to mid-thigh, a tunic ends at the belt');
  A(r.tunic.waistX > r.bare.waistX && r.femTunic.waistX < r.tunic.waistX - 0.005, 'cloth stands off the body; a woman\'s tunic follows her waist');
  for (const k of ['tunic','jerkin','chain','plate']) A(r[k].verts > 8000, k+' is sculpted finely');
  A(r.bandit.wear==='jerkin' && r.knight.wear==='plate' && r.orc.wear==='chain' && r.fanatic.wear==='robe' && !r.troll.wear, 'each outfit wears its garment; a loincloth stays bare');
  A(r.bandit.chestKey.startsWith('wear3|jerkin') && r.troll.chestKey.startsWith('torso3|'), 'the chest mesh is the garment, or the bare torso');
  A(r.bandit.neck===1 && r.troll.neck===0, 'a skin neck shows in the neckline');
  A(r.bandit.belt===1 && r.bandit.box===0, 'the belt is a band round the body');
  A(r.knight.pauld===2, 'sculpted pauldrons');
  A(r.orc.tabard===1 && r.orc.box===0, 'the tabard hangs round the chest');
  A(r.knight.limbWear[0].startsWith('upper|plate') && r.knight.limbWear[1].startsWith('thigh|plate') && r.bandit.limbWear[0].startsWith('upper|leather'), 'sleeves and hose match the outfit: '+JSON.stringify([r.knight.limbWear, r.bandit.limbWear]));
  console.log('wear ok', JSON.stringify(r));
};
