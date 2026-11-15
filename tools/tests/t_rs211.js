// RS-211: dragon heads look ahead (a little down), not folded under or staring up at the camera; a skeletal warrior is bare bones
// and a sword; the player's staff stands standing as it does in the barber's chair
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing');
    try{ sk3Build(); }catch(e){} for (let i=0;i<150 && !SK3.ok;i++) await new Promise(r=>setTimeout(r, 200));
    const T = THREE, out = {};
    const e = m3dInstance({ nm:'ancient dragon' }, monsterPortraitFor('ancient dragon')), sc = new T.Scene(); sc.add(e.holder);
    const pitch = ()=>{ sc.updateMatrixWorld(true); const v = new T.Vector3(0,0,1).applyQuaternion(e.rig.head.getWorldQuaternion(new T.Quaternion())); return [Math.round(Math.asin(v.y)*180/Math.PI), +v.z.toFixed(2)]; };
    const keep = FPD.cam; FPD.cam = null; e.anim(e.rig, 0.3, 0, 0, 0, 0, e); out.noCam = pitch();
    const cam = new T.PerspectiveCamera(); cam.position.set(0, 6, 6); FPD.cam = cam; e.anim(e.rig, 0.3, 0, 0, 0, 0, e); out.cam = pitch(); FPD.cam = keep;
    const sk = sk3Instance({ nm:'skeletal warrior' }); let gear = 0, shown = 0; sk.holder.traverse(o=>{ if (o.userData && o.userData.gear){ gear++; let v = o, vis = true; while (v){ if (!v.visible) vis = false; v = v.parent; } if (vis && o.isMesh) shown++; } });
    out.gear = [gear, shown];
    const plain = sk3Instance({ nm:'skeleton' }); let pShown = 0; plain.holder.traverse(o=>{ if (o.userData && o.userData.gear && o.visible && o.isMesh) pShown++; }); out.plainGear = pShown;
    const root = m3dHumanoid({ weapon:'staff', skin:'#c89070' }), rig = M3D.meta.get(root).rig, s2 = new T.Scene(); s2.add(root); const [R] = rig.arms;
    const lean = ()=>{ s2.updateMatrixWorld(true); const v = new T.Vector3(0,1,0).applyQuaternion(rig.weapon.parent.getWorldQuaternion(new T.Quaternion())); return Math.round(Math.atan2(v.z, v.y)*180/Math.PI); };
    R.sh.rotation.set(-0.35, 0, -0.12); R.el.rotation.x = -0.9; rig.weapon.parent.rotation.x = M3D_STAFF_X - 0.135; out.standing = lean();
    rig.weapon.parent.rotation.x = M3D_STAFF_X; R.sh.rotation.set(-0.55, 0, -0.12); R.el.rotation.x = -0.8; rig.torso.rotation.x = -0.03; out.seated = lean();
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.noCam[0] > -20 && r.noCam[0] < 5 && r.noCam[1] > 0.9, 'dragon head looks ahead without a camera');
  A(r.cam[0] > -20 && r.cam[0] < 5 && r.cam[1] > 0.9, 'dragon head looks ahead with the dungeon camera');
  A(r.gear[0] > 10 && r.gear[1]===0, 'a skeletal warrior wears no gear');
  A(r.plainGear > 10, 'a plain skeleton keeps its fur and boots');
  A(Math.abs(r.standing - r.seated) <= 1, 'the staff stands as it does in the barber chair');
};
