// RS-522: robes move like Gandalf's grey in Bakshi's film - heavy wool following the walk lazily, the hem doing the swinging, one
// slow swing when you stop and then still - finer each tier (Ahrim's billows), and out of doors the air takes the hem, more in a storm
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    const T = THREE, out = {}, hero0 = m3dClothHero, wind0 = m3dClothWind;
    const dress = tier=>{ G.gear.chest = rsMakeArmour('cloth', tier, 'chest'); const e = m3dInstance({}, rsPlayerLook()), sc = new T.Scene(); sc.add(e.holder); m3dClothHero = ()=>e; return e; };
    /* the hem's mean offset at the back, and the waist's */
    const rowMax = (sk, row)=>{ const u = sk.userData.phys, prm = sk.geometry.parameters, W = prm.radialSegments + 1; let m = 0; for (let c=0;c<W-1;c++){ const i = row*W + c; m = Math.max(m, Math.hypot(u.O[i*3], u.O[i*3+2])); } return m; };
    const rowOff = (sk, row)=>{ const u = sk.userData.phys, prm = sk.geometry.parameters, W = prm.radialSegments + 1; let s = 0; for (let c=0;c<W-1;c++){ const i = row*W + c; s += Math.hypot(u.O[i*3], u.O[i*3+2]); } return s/(W-1); };
    const run = async (e, n, vz, rec)=>{ for (let i=0;i<n;i++){ e.t = (e.t||0) + 1/60; e.holder.position.z += vz/60; m3dPoseHumanoid(e.rig, e.t, vz ? 1 : 0, 0, 0, 0, e); e.holder.updateMatrixWorld(true); if (rec) rec(i); await new Promise(r2=>setTimeout(r2, 16)); } };
    m3dClothWind = ()=>null;
    for (const tier of [0, 4]){ const e = dress(tier), sk = e.rig.skirt, prm = sk.geometry.parameters;
      await run(e, 20, 0); await run(e, 60, 1.6); const trail = rowOff(sk, prm.heightSegments), waist = rowOff(sk, 3);
      /* stop: count the swings past the pose at the back of the hem, and how long until it is still */
      let sign = 0, swings = 0, stillAt = -1; const back = ()=>{ const u = sk.userData.phys, W = prm.radialSegments + 1, A = sk.geometry.attributes.position.array; let b = 0; for (let c=0;c<W-1;c++){ const i = prm.heightSegments*W + c; if (A[i*3+2] < -0.03) b += u.O[i*3+2]; } return b; };
      await run(e, 180, 0, i=>{ const v = back(), s = Math.abs(v) < 2e-4 ? 0 : Math.sign(v); if (s && sign && s!==sign) swings++; if (s) sign = s; if (stillAt < 0 && sk.userData.phys.rest) stillAt = i; });
      out['t' + tier] = { cloth:sk.userData.cloth && sk.userData.cloth.k, trail:+trail.toFixed(4), waist:+waist.toFixed(4), swings, stillAt }; }
    /* wind: standing still out of doors, the hem stirs, more in a storm; none indoors */
    m3dClothWind = wind0; G.gameMode = 0; G.interior = null;
    for (const wx of ['clear', 'storm']){ G.weather = wx; const e = dress(0), sk = e.rig.skirt, prm = sk.geometry.parameters; let mx = 0;
      await run(e, 30, 0); await run(e, 300, 0, ()=>{ mx = Math.max(mx, rowMax(sk, prm.heightSegments)); }); out[wx] = { hem:+mx.toFixed(4), waist:+rowOff(sk, 3).toFixed(4) }; }
    G.gameMode = 1; out.indoor = m3dClothWind(5)===null; G.gameMode = 0; G.weather = 'clear';
    m3dClothHero = hero0; return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.t0.cloth===26 && r.t4.cloth===20, 'plain robes are heavy wool, Ahrim\'s lighter cloth');
  A(r.t0.trail > 0.02 && r.t0.waist < r.t0.trail*0.25, 'walking, the hem trails and the waist stays calm');
  A(r.t4.trail > r.t0.trail, 'Ahrim\'s billows further than wool');
  A(r.t0.swings <= 2 && r.t0.stillAt > 0, 'wool: a slow swing when you stop, then still');
  A(r.t4.swings >= r.t0.swings, 'Ahrim\'s swings on longer');
  A(r.clear.hem > 0.004 && r.storm.hem > r.clear.hem*1.8, 'out of doors the air stirs the hem, a storm far more');
  A(r.storm.waist < r.storm.hem*0.3, 'the wind takes the hem, not the hips');
  A(r.indoor, 'still air underground');
};
