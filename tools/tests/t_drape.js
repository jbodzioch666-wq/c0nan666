// RS-297: a cloak drapes over a wood elf's (and a half-orc's) hunched back instead of passing through the hump; a shield
// sits against the knuckles rather than floating past them; an open tome rests on the left palm whatever the arm's length;
// and the land you're walking through is always named under the clock bar
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{
    const T = THREE, A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); }, out = {};
    const make = (nm, extra)=>{ const pt = m3dPortrait({ nm }), p2 = Object.assign({}, pt, { o:Object.assign({}, pt.o, extra) }); const e = m3dInstance({}, p2); m3dPoseHumanoid(e.rig, 0.7, 0, 0, 0, 0, e); e.holder.updateMatrixWorld(true); return e; };
    // the cloak: how many of its points end up inside the body (an odd number of crossings of the torso along a ray)
    const inside = e=>{ const c = e.rig.cape, ch = e.rig.chestMesh, side = ch.material.side; ch.material.side = T.DoubleSide;
      const ps = c.geometry.attributes.position, ray = new T.Raycaster(), v = new T.Vector3(); let n = 0, tot = 0;
      for (let i=0;i<ps.count;i++){ v.fromBufferAttribute(ps, i); c.localToWorld(v); ray.set(v, new T.Vector3(0.3, 1, 0.2).normalize()); if (ray.intersectObject(ch, false).length % 2) n++; tot++; }
      ch.material.side = side; return n/tot; };
    for (const [k, look] of [['elf', woodElfLook], ['orc', halfOrcLook], ['plain', null]]){
      const base = m3dPortrait({ nm:'knight' }).o, extra = Object.assign({ cape:'#6a2a2a' }, look ? look(Object.assign({}, base)) : {});
      const e = make('knight', extra); out['cape_'+k] = +inside(e).toFixed(3);
      A(out['cape_'+k] <= 0.01, 'the cloak stays outside the '+k+' body: '+out['cape_'+k]);
    }
    // the shield: its back within a few millimetres of the fist, and not through it
    for (const nm of ['goblin', 'knight']){
      const e = make(nm, {}), rig = e.rig, hand = rig.arms[1].hand, inv = new T.Matrix4().copy(hand.matrixWorld).invert(), hb = new T.Box3(), sb = new T.Box3();
      hand.traverse(o=>{ if (!o.isMesh) return; let p = o, inS = false; while (p && p!==hand){ if (p===rig.shield) inS = true; p = p.parent; }
        const g = o.geometry.clone(); g.applyMatrix4(new T.Matrix4().multiplyMatrices(inv, o.matrixWorld)); g.computeBoundingBox(); (inS ? sb : hb).union(g.boundingBox); });
      const gap = hb.min.y - sb.max.y; out['shieldGap_'+nm] = +gap.toFixed(4);
      A(gap > 0 && gap < 0.006, 'the '+nm+"'s shield is against the fist, not through it: "+gap);
    }
    // the tome: on the left palm for a plain figure and a stooped, long-armed wood elf alike, its pages tipped up
    for (const [k, look] of [['plain', null], ['elf', woodElfLook]]){
      const base = m3dPortrait({ nm:'knight' }).o, extra = Object.assign({ tome:'#5a2a6a', shield:null, offWeapon:null }, look ? look(Object.assign({}, base)) : {});
      const e = make('knight', extra), rig = e.rig; A(rig.tome, 'a tome for '+k);
      const palm = new T.Vector3(-(rig.gripX||0.026), -0.045, 0.004); rig.arms[1].hand.localToWorld(palm);
      const tp = rig.tome.getWorldPosition(new T.Vector3()), up = new T.Vector3(0, 1, 0).applyQuaternion(rig.tome.getWorldQuaternion(new T.Quaternion()));
      out['tome_'+k] = { d:+tp.distanceTo(palm).toFixed(3), upY:+up.y.toFixed(2), upZ:+up.z.toFixed(2) };
      A(tp.distanceTo(palm) < 0.05, 'the tome rests on the palm ('+k+'): '+JSON.stringify(out['tome_'+k]));
      A(up.y > 0.5 && up.z < -0.4, 'its pages tipped up toward the reader ('+k+'): '+JSON.stringify(out['tome_'+k]));
    }
    // the land under the clock bar
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); G.gameMode = 0; clockBarSync();
    const land = clockLandText(), el = document.getElementById('dhClock');
    out.land = land; A(/combat \d+-\d+/.test(land), 'the land is named with its levels: '+land);
    if (el && el.style.display!=='none') A(el.querySelector('.ck-land') && el.querySelector('.ck-land').textContent===land, 'and shown under the clock bar');
    return out;
  });
  console.log(JSON.stringify(r));
};
