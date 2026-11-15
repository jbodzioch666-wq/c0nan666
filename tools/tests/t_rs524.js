// RS-524: bodies sculpted to a build - weight, muscle, shoulders, chest, waist, hips, neck, head, legs, arms, height and posture,
// each a smooth number from the look's body sliders (L.bd) - with the garments sculpted over the same masses so they fit any
// build, and the joints set where the build puts them. A look without sliders (an older save) takes the defaults; its old
// Lean / Average / Stocky build sets the frame. Every humanoid monster still builds on the new sculpts
module.exports = async page=>{
  const r = await page.evaluate(()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    const T = THREE, out = { ver:M3D_SCULPT_VER };
    const fig = (body, bd, outfit)=>{ const L = Object.assign(lookDefault('Human'), { body, beard:0, hair:1 }); if (bd) L.bd = bd; const pt = rsPlayerLook({ race:'Human', look:L, bare:true }); if (outfit) pt.o.outfit = outfit; const e = m3dInstance({}, pt); e.holder.updateMatrixWorld(true); return { e, pt }; };
    const span = (m, ax)=>{ const g = m.geometry; g.computeBoundingBox(); return g.boundingBox.max[ax] - g.boundingBox.min[ax]; };
    /* the build moves the sculpts and the joints */
    const base = fig(0, null), fat = fig(0, { fat:1 }), wide = fig(0, { shoulders:1 }), narrow = fig(0, { shoulders:0 }), neck = fig(0, { neck:1 }), hips = fig(0, { hips:1 }), tall = fig(0, { height:1, legs:1, arms:1 });
    out.fatWider = span(fat.e.rig.chestMesh, 'z') > span(base.e.rig.chestMesh, 'z') + 0.01 && span(fat.e.rig.pelvisMesh, 'x') > span(base.e.rig.pelvisMesh, 'x') + 0.004;
    out.shJoint = [narrow.e.rig.arms[0].sh.position.x, base.e.rig.arms[0].sh.position.x, wide.e.rig.arms[0].sh.position.x].map(v=>+Math.abs(v).toFixed(4));
    out.neckUp = +(neck.e.rig.neck.position.y - base.e.rig.neck.position.y).toFixed(4);
    out.hipJoint = +(Math.abs(hips.e.rig.legs[0].hip.position.x) - Math.abs(base.e.rig.legs[0].hip.position.x)).toFixed(4);
    const topY = f=>new T.Box3().setFromObject(m3dTemplate(f.pt)).max.y; out.taller = tall.pt.stature > base.pt.stature*1.05 && topY(tall) > topY(base) + 0.03;   /* (a humanoid's size is pinned, so longer legs make a taller figure) */
    out.keysDiffer = base.e.rig.body.key!==fat.e.rig.body.key && base.e.rig.body.key!==wide.e.rig.body.key;
    /* the woman's bust follows the chest slider; sculpted smaller it stays a woman's torso (not his) */
    const wf = fig(1, { chest:0 }), wF = fig(1, { chest:1 }); out.bust = [span(wf.e.rig.chestMesh, 'z'), span(wF.e.rig.chestMesh, 'z')].map(v=>+v.toFixed(4)); out.femKeys = wf.e.rig.body.fem && wF.e.rig.body.fem;
    /* garments fit the heaviest build: a tunic, a robe, a hauberk and a breastplate each reach past the skin under them */
    out.fit = {}; for (const [wear, bd] of [['tunic', { fat:1, muscle:1, shoulders:1 }], ['robe', { fat:1, waist:1, hips:1 }], ['chain', { fat:1, shoulders:1 }], ['plate', { fat:0.9, muscle:1 }]]){
      const o = Object.assign({}, fig(0, bd).pt.o), B = m3dBodySpec(o), skin = m3dTorsoGeo(B, 'top'), g = m3dWearGeo(B, wear, 'top'); skin.computeBoundingBox(); g.computeBoundingBox();
      const sb = skin.boundingBox, gb = g.boundingBox; out.fit[wear] = +Math.min(gb.max.x - sb.max.x, sb.min.x - gb.min.x, gb.max.z - sb.max.z, sb.min.z - gb.min.z).toFixed(4); }
    /* older looks: no sliders at all, or the old three builds */
    const L0 = lookDefault('Human'); delete L0.bd; const d0 = lookBody(L0); out.defaults = d0.fat===0.3 && d0.frame===0.5 && d0.posture===0;
    out.oldStocky = lookBody(Object.assign(lookDefault('Human'), { build:2 })).frame===1 && lookBody(Object.assign(lookDefault('Human'), { build:0 })).frame===0;
    out.clamp = lookBody({ bd:{ fat:7, muscle:-2, hips:'x' } }).fat===1 && lookBody({ bd:{ muscle:-2 } }).muscle===0 && lookBody({ bd:{ hips:'x' } }).hips===0.5;
    /* the monsters still build, on the same sculpts */
    out.mon = {}; for (const nm of ['goblin', 'orc warrior', 'knight', 'bandit', 'ogre']){ try{ const pt = m3dPortrait({ nm }); const e = m3dInstance({ nm }, pt); out.mon[nm] = !!(e.rig && e.rig.body && e.H > 0); }catch(err){ out.mon[nm] = String(err); } }
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.ver >= 2, 'the sculpt cache version is bumped for the new shapes');
  A(r.fatWider && r.keysDiffer, 'weight deepens the torso and widens the seat, as its own sculpt');
  A(r.shJoint[0] < r.shJoint[1] && r.shJoint[1] < r.shJoint[2], 'the shoulder joints move out with the shoulders');
  A(r.neckUp > 0.003, 'a long neck lifts the head');
  A(r.hipJoint > 0.002, 'wide hips set the legs further apart');
  A(r.taller, 'height, legs and arms make a taller figure');
  A(r.bust[1] > r.bust[0] + 0.01 && r.femKeys, 'her bust follows the chest slider');
  for (const k in r.fit) A(r.fit[k] > -0.001, 'the ' + k + ' reaches past the skin on the heaviest build');
  A(r.defaults && r.oldStocky && r.clamp, 'an old look takes the defaults, its old build the frame; bad values are clamped');
  for (const k in r.mon) A(r.mon[k]===true, k + ' still builds');
};
