// RS-415: a woman's hips no wider set than a man's and her tunic gathered closer at the waist; an Egyptian pyramid (smooth cased
// faces, a gilded pyramidion - no steps); the rat king bigger and crowned; every dungeon doorway a stone archway, the treasure
// room's door a studded iron-bound one under it, no taller than the walls; torches in sconces on the town's gate towers; and
// capes laid over the shoulders and on the back instead of standing off it
module.exports = async page=>{
  await page.evaluate(()=>{ M3D_SKIN = false; if (M3D.tpl) M3D.tpl.clear(); });   /* (the parts as built, not merged into skinned meshes (RS-379) nor the atlas (RS-578): this test looks at them one by one) */
  const r = await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); G.gameMode = 0; saveCurrentGame = ()=>{}; o3Pref = true;
    for (let i=0;i<8;i++){ renderGame(); await new Promise(r=>setTimeout(r, 30)); }
    const T = THREE, out = {}, box = o=>{ o.updateMatrixWorld(true); return new T.Box3().setFromObject(o); };
    // the hips and the skirt
    const body = (race, fem)=>{ goToCharCreate(); G.chosenRace = RACES.findIndex(q=>q[0]===race); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); G.gameMode = 0;
      for (const sl of ['head','chest','legs','arms','feet','cape']) G.gear[sl] = newItem(); G.gear.chest = rsMakeArmour('hide', 1, 'chest'); G.player.look.body = fem ? 1 : 0;   /* (RS-546: out of body armour you're in your underclothes - a jerkin, for its skirt) */ const pt = rsPlayerLook(), e = m3dInstance({}, pt); return { e, b:pt.o.bulk || 1, outfit:pt.o.outfit }; };
    const f = body('Dragonborn', true), m = body('Dragonborn', false), hipX = e=>Math.abs(e.rig.legs[0].hip.position.x);
    let skTop = 0; { const o = f.e.rig.pelvisMesh, p = o.geometry.attributes.position; let ymax = -9; for (let i=0;i<p.count;i++) ymax = Math.max(ymax, p.getY(i)); for (let i=0;i<p.count;i++) if (p.getY(i) > ymax - 0.01) skTop = Math.max(skTop, Math.abs(p.getX(i))*o.scale.x); }   /* (the garment's skirt is sculpted with the pelvis now (m3dWearGeo 'bot'): its waist, at the top of the sculpt) */
    out.hips = { f:+hipX(f.e).toFixed(4), m:+hipX(m.e).toFixed(4), skTop:+skTop.toFixed(4), outfit:f.outfit };
    // the pyramid
    G.gameMode = 0; O3.flames = O3.flames || []; O3.glows = O3.glows || []; O3.smoke = O3.smoke || [];
    const pg = o3Site(OW_PYRAMID, 0, 0); let steps = 0, faces = 0, capstone = 0; pg.traverse(o=>{ if (!o.isMesh) return; const g = o.geometry; if (g.type==='BoxGeometry' && g.parameters.width > 0.5) steps++; if (g.attributes.uv && g.attributes.color && g.attributes.position.count >= 12) faces++;   /* (RS-675: the front face notched for the gatehouse) */ if (g.type==='ConeGeometry' && o.material.metalness > 0.5) capstone++; });
    out.pyramid = { steps, faces, capstone, h:+box(pg).max.y.toFixed(2) };
    // the rat king
    const rkP = m3dPortrait({ nm:'rat king' }), grP = m3dPortrait({ nm:'giant rat' }), rk = m3dInstance({ nm:'rat king' }, rkP), gr = m3dInstance({ nm:'giant rat' }, grP);
    const gold = e=>{ let n = 0; e.root.traverse(o=>{ if (o.isMesh && o.material && /e6b23a/i.test((o.material.userData && o.material.userData.hex)||'')) n++; }); return n; };   /* (the crown's gold - its parts are merged with the rest) */
    const H = e=>box(e.holder).getSize(new T.Vector3()).y;
    out.rat = { scale:+((rkP.h||1)/(grP.h||1)).toFixed(2), crown:gold(rk), plain:gold(gr), taller:+(H(rk)/H(gr)).toFixed(2) };
    // the doorways
    out.doors = {}; for (const d of ['door', 'dooro', 'arch', 'ldoor', 'ldooro']){ const g = isoPropModel({ x:0, y:0, kind:'dress', d, rot:0, side:1 }); let ext = 0; g.traverse(o=>{ if (o.isMesh && o.geometry.type==='ExtrudeGeometry') ext++; }); out.doors[d] = { ext, top:+box(g).max.y.toFixed(3) }; }
    // the cape over a knight's shoulders
    { const pt = m3dPortrait({ nm:'warlord' }), e = m3dInstance({ nm:'warlord' }, pt), c = e.rig.cape, p = c.geometry.attributes.position; let shZ = -9, n = 0;
      for (let i=0;i<p.count;i++){ const x = p.getX(i), y = p.getY(i); if (Math.abs(Math.abs(x) - 0.12) < 0.03 && y > -0.02){ shZ = Math.max(shZ, p.getZ(i)); n++; } }
      out.cape = { n, shZ:+shZ.toFixed(3) }; }
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(Math.abs(r.hips.f - r.hips.m) < 1e-4, 'her hips are set no wider than his');
  A(r.hips.skTop > 0 && r.hips.skTop < 0.112*1.25, 'her tunic is gathered close at the waist: '+r.hips.skTop);
  A(r.pyramid.steps===0 && r.pyramid.faces >= 1 && r.pyramid.capstone >= 1 && r.pyramid.h > 0.85, 'the pyramid is a smooth cased one with a gilded capstone, not steps');
  A(r.rat.scale >= 1.8 && r.rat.crown >= 1 && r.rat.plain===0 && r.rat.taller < 1.3, 'the rat king is bigger, and wears a crown sitting on its head (no taller than a hand over a rat\'s own height): '+JSON.stringify(r.rat));
  A(['door', 'dooro', 'arch', 'ldoor', 'ldooro'].every(d=>r.doors[d].ext >= 9), 'every doorway has its stone arch');
  A(r.doors.ldoor.top > 1.35 && r.doors.ldoor.top < 1.55 && r.doors.door.top > 1.35 && r.doors.door.top < 1.55, 'the doorways are as tall as the way-out portal (RS-417), not the old posts of the treasure room door');

  A(r.cape.n > 0 && r.cape.shZ > -0.04, 'the cape lies over the shoulders');
  // the town gate's torches, in a real town
  const gt = await page.evaluate(async ()=>{ v3Pref = true; const t = G.ow.spawnPos; G.owPos = { x:t.x, y:t.y }; enterVillage(); setUi('playing');
    for (let i=0;i<120 && !(V3.world && V3.player && V3.player.e); i++){ renderGame(); await new Promise(r=>setTimeout(r, 100)); }
    let sconces = 0; V3.world.traverse(o=>{ if (o.isMesh && o.geometry.type==='ExtrudeGeometry' && o.geometry.parameters && o.geometry.parameters.options && o.geometry.parameters.options.depth===0.025) sconces++; });   /* (a sconce's back plate) */
    const gateLamps = (V3.lamps||[]).filter(l=>l.p[2] > ROWS - 2 && l.p[1] > 1.6).length;
    return { sconces, gateLamps, walled:!!(G.townLy && G.townLy.info.style.walled) }; });
  console.log('gate', JSON.stringify(gt));
  A(gt.sconces >= 2 && gt.gateLamps >= 2, 'the gate towers hold their torches in sconces, lit: '+JSON.stringify(gt));
};
