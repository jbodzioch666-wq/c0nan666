// RS-888: aiming a crossbow, you stand bladed to the mark by about a third of a right angle (torso and hips together), not two thirds - turned
// that far your back and cape were to the camera and the crossbow stuck out at your side, as if through your back (seen on a tiefling in
// a robe and a long cape). Still shouldered and on the mark: butt at the right shoulder, the hands on grip and fore-end (see rs490 too).
// Shot: shots/rs888-aim.jpg
const path = require('path'), fs = require('fs');
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const A = (c, msg, r)=>{ if (!c) throw new Error('assert: ' + msg + ' ' + JSON.stringify(r || {})); };
  const r = await page.evaluate(()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    G.gear.ranged = rsMakeCrossbow(36); G.gear.chest = rsMakeArmour('cloth', 3, 'chest'); G.gear.legs = rsMakeArmour('cloth', 3, 'legs'); G.gear.cape = rsMakeCape(0, 'Legends Cape'); G.player.rsLastType = 'ranged'; rsSync && rsSync();
    const T = THREE, out = {}, keepP = ISO.player, keepM = G.mon;
    try{ const me = m3dInstance({}, rsPlayerLook()), sc = new T.Scene(); sc.add(me.holder); me.holder.position.set(5.5, 0, 5.5); ISO.player = me; const rg = me.rig, piv = rg.xbPiv, xb = piv && piv.children[0];
      const p = G.player; p.x = 5; p.y = 5; p.facing = 2; p.faceDiag = null; const fv = FACING_VECT[2];
      const gob = { x:5 + fv[0]*5, y:5 + fv[1]*5, alive:true, nm:'goblin' }, ge = m3dInstance({}, m3dPortrait({ nm:'goblin' })); sc.add(ge.holder); ge.holder.position.set(gob.x + 0.5, 0, gob.y + 0.5); M3D.inst.set(gob, ge); G.mon = [gob];
      me.holder.rotation.y = Math.atan2(fv[0], fv[1]);
      m3dPoseHumanoid(rg, 1, 0, 1, 0, 0, me); me.holder.updateMatrixWorld(true); sc.onBeforeRender(); me.holder.updateMatrixWorld(true);
      const yawOf = o=>{ const f = new T.Vector3(0, 0, 1).transformDirection(o.matrixWorld); return Math.atan2(f.x, f.z); }, d = (a, b)=>Math.abs(Math.atan2(Math.sin(a - b), Math.cos(a - b)))*180/Math.PI;
      out.blade = +d(yawOf(rg.torso), yawOf(me.holder)).toFixed(1);
      const nose = xb.localToWorld(new T.Vector3(0, 0.05, 0.6)), butt = xb.localToWorld(new T.Vector3(0, 0.02, -0.37)), ax = nose.clone().sub(butt).normalize(), fw = new T.Vector3(0, 0, 1).transformDirection(me.holder.matrixWorld);
      out.aimFw = +ax.dot(fw).toFixed(2); const S = me.holder.scale.y, sh = rg.arms[0].sh.getWorldPosition(new T.Vector3()); out.buttToShoulder = +(butt.distanceTo(sh)/S).toFixed(3);
      out.rightOnGrip = +(rg.arms[0].hand.localToWorld(new T.Vector3(0, -0.04, 0)).distanceTo(xb.localToWorld(new T.Vector3(0, 0, 0)))/S).toFixed(3);
      /* seen from where the game's camera sits behind and above the mark's line: how much of the cape faces it */
      const cam = new T.PerspectiveCamera(30, 1.6, 0.05, 50), wp = me.holder.position, A0 = me.holder.rotation.y + Math.PI*0.75; cam.position.set(wp.x + Math.sin(A0)*2.6, 1.8, wp.z + Math.cos(A0)*2.6); cam.lookAt(wp.x, 0.45, wp.z);
      sc.add(new T.HemisphereLight(0xe8f0ff, 0x4a4030, 1.1)); const dl = new T.DirectionalLight(0xfff0d8, 2.2); dl.position.set(8, 5, 8); sc.add(dl); sc.background = new T.Color(0x9ab4cc);
      const R = new T.WebGLRenderer({ canvas:document.createElement('canvas'), antialias:true, preserveDrawingBuffer:true }); R.setSize(800, 500, false); R.outputColorSpace = T.SRGBColorSpace; R.render(sc, cam); out.shot = R.domElement.toDataURL('image/jpeg', 0.85); R.dispose(); }
    finally { ISO.player = keepP; G.mon = keepM; }
    return out; });
  fs.writeFileSync(path.join(__dirname, 'shots', 'rs888-aim.jpg'), Buffer.from(r.shot.split(',')[1], 'base64')); delete r.shot;
  console.log(JSON.stringify(r));
  A(r.blade > 15 && r.blade < 40, 'bladed to the mark by about a third of a right angle, not turned your back to it', r);
  A(r.aimFw > 0.85, 'the crossbow on the mark, ahead of you', r); A(r.buttToShoulder < 0.12 && r.rightOnGrip < 0.06, 'still shouldered, the hand on the grip', r);
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
