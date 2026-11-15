// RS-590: a robe's cord low on the waist where it meets the hips, in the robe's trim colour, tied with a bound knot and two cord ends
// falling over the robe, each finished with a tassel. Shots: shots/rs590-cord.png (a woman, a man; front and three-quarter)
module.exports = async page=>{
  page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 200)));
  const r = await page.evaluate(async ()=>{ goToCharCreate(); G.chosenKit = 2; ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; const T = THREE, out = {};
    const ch = G.gear.chest; if (ch) ch.trimDye = '#c02a30';
    const S0 = m3dRobeShape; let col = null; m3dRobeShape = function(rig){ col = rig.sashM ? '#' + rig.sashM.color.clone().convertLinearToSRGB().getHexString() : null; return S0.apply(this, arguments); };
    const figs = []; for (const body of [1, 0]){ col = null; let lathes = 0, tubes = 0; const _L = T.LatheGeometry, _Tu = T.TubeGeometry;
      G.player.look.body = body; if (body) G.player.look.beard = 0; const L = rsPlayerLook(); const e = m3dInstance({}, L);
      out[body ? 'fem' : 'male'] = { cordY:e.rig.robeWaistY, col, trim:L.o.robeTrim, fem:!!L.o.fem, extFrom:e.rig.skirt && e.rig.skirt.userData.extFrom }; figs.push(e); }
    m3dRobeShape = S0;
    /* the shot: each figure from the front and three-quarter, close on the waist */
    const W = 360, H = 420, cv = document.createElement('canvas'); cv.width = W*4; cv.height = H; const R = new T.WebGLRenderer({ canvas:cv, antialias:true }); R.setSize(W*4, H, false); R.setScissorTest(true);
    const sc = new T.Scene(); sc.background = new T.Color('#2a2420'); sc.add(new T.HemisphereLight(0xffffff, 0x403020, 1.1)); const dl = new T.DirectionalLight(0xffffff, 1.4); dl.position.set(1.5, 3, 4); sc.add(dl);
    let k = 0; for (const e of figs){ for (const yaw of [0, 0.7]){ const g = new T.Group(); g.add(e.holder); sc.add(g); g.rotation.y = yaw; m3dPoseHumanoid(e.rig, 0, 0, 0, 0, 0, e); e.holder.updateMatrixWorld(true);
        const w = e.rig.torso.localToWorld(new T.Vector3(0, e.rig.robeWaistY || 0.05, 0)), cam = new T.PerspectiveCamera(30, W/H, 0.01, 50); cam.position.set(w.x, w.y + 0.05, w.z + 0.62*(e.holder.scale.x || 1)); cam.lookAt(w.x, w.y - 0.05, w.z);
        R.setViewport(k*W, 0, W, H); R.setScissor(k*W, 0, W, H); R.render(sc, cam); sc.remove(g); k++; } }
    out.shot = cv.toDataURL('image/png'); R.dispose(); return out; });
  require('fs').writeFileSync(SHOTS + '/rs590-cord.png', Buffer.from(r.shot.split(',')[1], 'base64')); delete r.shot;
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  for (const k of ['fem', 'male']){ const f = r[k];
    A(f.cordY >= 0.028 && f.cordY <= 0.042 && f.cordY > f.extFrom + 0.01, k + ': the cord low on the waist, above where the cloth turns with the hips: ' + f.cordY);
    A(f.trim && f.col===f.trim.toLowerCase(), k + ': the cord in the robe\'s trim: ' + f.col + ' / ' + f.trim); }
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
