// RS-586: a hearth fire that looks like one - an open stone firebox, logs, embers and shader flames; the sage's hat's moon and stars
// in its trim dye; a robe's cord at the middle of the waist; a shut tome held in the palm. Shot: shots/rs586-hearth.png
module.exports = async page=>{
  page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 200))); page.on('console', m=>{ if (m.type()==='error') errs.push(m.text().slice(0, 200)); });
  const r = await page.evaluate(async ()=>{ goToCharCreate(); G.chosenKit = 2; ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; const out = {}, T = THREE;
    /* the sage's hat: band, moon and stars in the trim dye */
    { const it = buildUnique(UNIQUES.findIndex(u=>u[0]==='Visage of the Sage') + 1, 40); it.trimDye = '#c02a30'; G.gear.head = it; const L = rsPlayerLook(); out.sage = { band:L.o.sageBand }; const S0 = m3dSageHat; m3dSageHat = function(hg, mats, geo, opt){ out.sage.opt = opt || null; return S0.apply(this, arguments); };
      const e = m3dInstance({}, L); const cols = new Set(); e.root.traverse(o=>{ if (o.isMesh && o.material && o.geometry && (o.geometry.type==='ExtrudeGeometry' || o.geometry.type==='TorusGeometry')) cols.add('#' + o.material.color.clone().convertLinearToSRGB().getHexString()); });
      out.sage.cols = [...cols]; m3dSageHat = S0; G.gear.head = newItem(); }
    /* a robe's cord on a woman: at the middle of the waist */
    { const L = rsPlayerLook({ look:Object.assign(lookDefault('Human'), { body:1 }) }); const e = m3dInstance({}, L); out.cordY = e.rig.robeWaistY; out.fem = !!L.o.fem;
      const L2 = rsPlayerLook({ look:Object.assign(lookDefault('Human'), { body:0 }) }); out.cordYm = m3dInstance({}, L2).rig.robeWaistY; }
    /* the shut tome: in the hand, not beside it */
    { G.gear.offhand = rsMakeArmour('cloth', 2, 'offhand'); const e = m3dInstance({}, rsPlayerLook()); e.fight = false; m3dPoseHumanoid(e.rig, 0, 0, 0, 0, 0, e); e.holder.updateMatrixWorld(true);
      const tg = e.rig.tome, cl = tg.getObjectByName('tomeClosed'), hand = e.rig.arms[1].hand, s = e.holder.scale.x || 1; cl.visible = true; const bb = new T.Box3().setFromObject(cl), hp = hand.localToWorld(new T.Vector3(-(e.rig.gripX||0.026), -0.045, 0.004));
      const inside = bb.clone().expandByScalar(0.004*s).containsPoint(hp), below = hp.y < bb.min.y + (bb.max.y - bb.min.y)*0.35; out.book = { closed:cl.visible, gripInBook:inside, nearBottom:below, dist:+(bb.distanceToPoint(hp)/s).toFixed(4) }; }
    /* the hearth: its fire, its flames drawn by their shader, keeping time */
    { const t = G.ow.spawnPos; G.owPos = { x:t.x, y:t.y }; enterVillage(); setUi('playing'); townClosedCheck = ()=>false; G.player.clock = DAY_LENGTH*10 + DAY_LENGTH*0.9;
      const fr = async n=>{ for (let i=0;i<n;i++){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); } }; await fr(20);
      enterInterior('tavern'); await fr(40); const fires = V3.flames.filter(f=>f.userData.hearthFire); out.fires = fires.length;
      const f = fires[0]; if (f){ let sheets = 0, logs = 0; f.traverse(o=>{ if (o.isMesh && o.material && o.material.isShaderMaterial) sheets++; if (o.isMesh && o.geometry.type==='CylinderGeometry') logs++; }); out.sheets = sheets; out.logs = logs;
        const t0 = V3_FIRE_T.value; await fr(10); out.ticks = V3_FIRE_T.value > t0; const prog = V3.renderer.info.programs.length; out.progs = prog;
        const c = f.getWorldPosition(new T.Vector3()); const q = f.parent.getWorldQuaternion(new T.Quaternion()), fw = new T.Vector3(0, 0, 1).applyQuaternion(q);
        const cam = V3.cam.clone(); cam.aspect = 1.4; cam.fov = 35; cam.updateProjectionMatrix(); cam.position.copy(c).add(new T.Vector3(fw.x*1.3, 0.45, fw.z*1.3)); cam.lookAt(c.x, c.y + 0.1, c.z);
        const r = V3.renderer; r.setSize(560, 400, false); gfxRender(r, V3.scene, cam, 'v3'); out.shot = r.domElement.toDataURL('image/png'); V3.sz = ''; } }
    return out; });
  if (r.shot){ require('fs').writeFileSync(SHOTS + '/rs586-hearth.png', Buffer.from(r.shot.split(',')[1], 'base64')); delete r.shot; }
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.sage.band==='#c02a30' && r.sage.opt && r.sage.opt.band==='#c02a30' && r.sage.opt.gold==='#c02a30', 'the sage hat\'s band, moon and stars in the trim dye: ' + JSON.stringify(r.sage.opt));
  A(r.fem && r.cordY >= 0.065 && r.cordY <= 0.09 && r.cordYm <= 0.09, 'the cord at the middle of the waist: ' + r.cordY + ' / ' + r.cordYm);
  A(r.book.closed && (r.book.gripInBook || r.book.dist < 0.012) && r.book.nearBottom, 'the shut book held in the palm by its lower edge: ' + JSON.stringify(r.book));
  A(r.fires >= 1 && r.sheets >= 5 && r.logs >= 3 && r.ticks, 'the hearth has its fire: logs, flame sheets, keeping time');
  A(!errs.some(e=>/shader|WebGL|THREE/i.test(e)), 'its shader compiles: ' + errs.join(' | '));
};
