// RS-282: a cloak that hangs from both shoulders - its yoke curves round behind the neck, clear of the pauldrons, and it
// falls in folds to a flared hem, pinned with a cord and two brooches, swaying with the stride; a kite shield (curved face,
// iron rim and rivets, a cross) for anyone with an emblem - knights, and you with a metal kiteshield - point down; round
// shields stay round
module.exports = async page=>{
  const r = await page.evaluate(()=>{
    const out = {};
    const info = pt=>{ const e = m3dInstance({}, pt), rig = e.rig; m3dPoseHumanoid(rig, 0.7, 0, 0, 0, 0, e); e.holder.updateMatrixWorld(true);
      const c = rig.cape, cp = c && c.geometry.attributes.position; let top = [], hem = [], brooch = 0;
      if (cp) for (let i=0;i<cp.count;i++){ const y = cp.getY(i); if (y > -0.01) top.push([cp.getX(i), cp.getZ(i)]); if (y < -0.5) hem.push(cp.getX(i)); }
      rig.torso.children.forEach(x=>{ if (x.isMesh && x.geometry.type==='SphereGeometry' && Math.abs(x.position.y - 0.3) < 0.001 && Math.abs(Math.abs(x.position.x) - 0.085*(pt.o.bulk||1)) < 0.001) brooch++; });
      const sg = rig.shield; let kite = false, round = false, pointY = null, midY = null;
      if (sg){ const f = sg.children[0]; kite = f.geometry.type==='ExtrudeGeometry'; round = f.geometry.type==='LatheGeometry';
        if (kite){ const p = f.geometry.attributes.position; let zmin = 1, imin = 0; for (let i=0;i<p.count;i++) if (p.getZ(i) < zmin){ zmin = p.getZ(i); imin = i; }
          const v = new THREE.Vector3(p.getX(imin), p.getY(imin), p.getZ(imin)); f.localToWorld(v); pointY = v.y; midY = sg.getWorldPosition(new THREE.Vector3()).y; } }
      const topW = top.length ? Math.max(...top.map(q=>q[0])) - Math.min(...top.map(q=>q[0])) : 0, hemW = hem.length ? Math.max(...hem) - Math.min(...hem) : 0;
      const shoulderZ = top.filter(q=>Math.abs(Math.abs(q[0]) - 0.1) < 0.02).map(q=>q[1]);
      return { cape:!!c, topW:+topW.toFixed(3), hemW:+hemW.toFixed(3), shoulderZ:shoulderZ.length ? +Math.max(...shoulderZ).toFixed(3) : null, brooch, kite, round, pointY, midY }; };
    out.knight = info(m3dPortrait({ nm:'knight' })); out.goblin = info(m3dPortrait({ nm:'goblin' }));
    goToCharCreate(); G.ccLookTouched = false; ccSelectRace(RACES.findIndex(r=>r[0]==='Human')); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); o3Pref = false; try{ v3Pref = false; }catch(e){}
    for (const sl of ['head','chest','legs','arms','feet','cape']) G.gear[sl] = newItem(); G.gear.offhand = rsMakeArmour('metal', 2, 'offhand'); G.gear.cape = newItem();
    out.player = info(rsPlayerLook());
    const sway = (()=>{ const e = m3dInstance({}, m3dPortrait({ nm:'knight' })); m3dPoseHumanoid(e.rig, 0.3, 1, 0, 0, 0, e); const a = e.rig.cape.rotation.z; m3dPoseHumanoid(e.rig, 0.9, 1, 0, 0, 0, e); return Math.abs(e.rig.cape.rotation.z - a); })();
    out.sway = +sway.toFixed(3);
    return out; });
  const A = (c, m)=>{ if (!c) throw new Error(m+' :: '+JSON.stringify(r)); };
  A(r.knight.cape && r.knight.topW > 0.27 && r.knight.hemW > r.knight.topW*1.15, 'the cloak spans the shoulders and flares to the hem');
  A(r.knight.shoulderZ !== null && r.knight.shoulderZ < -0.06, 'the yoke passes behind the pauldrons');
  A(r.knight.brooch===2, 'a brooch at each shoulder');
  A(r.knight.kite && r.knight.pointY < r.knight.midY - 0.1, 'the knight carries a kite shield, point down');
  A(r.goblin.round && !r.goblin.kite, 'the goblin keeps a round shield');
  A(r.player.kite, 'your metal kiteshield is a kite shield');
  A(r.sway > 0.005, 'the cloak sways with the stride');
  console.log('cloak ok', JSON.stringify(r));
};
