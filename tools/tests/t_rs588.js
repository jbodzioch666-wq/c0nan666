// RS-588: someone seated in a robe has it folded once by the seat and kept - it was folded for standing legs and then for the seat, every
// frame, for everyone sitting; up again, the robe folds to the legs and the seat is forgotten. And the hearth's grill out on the hearth stone.
// Shot: shots/rs588-tavern.png
module.exports = async page=>{
  page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 200)));
  const r = await page.evaluate(async ()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    const t = G.ow.spawnPos; G.owPos = { x:t.x, y:t.y }; enterVillage(); setUi('playing'); townClosedCheck = ()=>false; G.player.clock = DAY_LENGTH*10 + DAY_LENGTH*0.95;
    const fr = async n=>{ for (let i=0;i<n;i++){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); } }; await fr(40);
    enterInterior('tavern'); setUi('playing'); await fr(200); const out = {};
    const folk = V3.villagers.concat(V3.npcs).filter(p=>p.e && p.e.rig), seated = folk.filter(p=>p.e.rig.sitting);
    let robed = seated.filter(p=>p.e.rig.skirt);
    if (!robed.length){ /* a robed sitter of our own: one of the seated, re-dressed */ const p = seated[0]; out.dressed = !!p; }
    out.seated = seated.length; out.robed = robed.length;
    /* refolds per frame, steady */
    let n = 0; const F0 = m3dFastNormals; m3dFastNormals = function(){ n++; return F0.apply(this, arguments); }; await fr(60); m3dFastNormals = F0; out.refolds = +(n/60).toFixed(2);
    /* still folded on the seat: the robe's cloth not where it hangs standing */
    if (robed[0]){ const m = robed[0].e.rig.skirt, a = m.geometry.attributes.position.array, b = m.userData.base; let d = 0; for (let i=0;i<a.length;i++) d = Math.max(d, Math.abs(a[i] - b[i])); out.folded = +d.toFixed(3);
      /* up from the seat: the seat forgotten, the robe folded to the legs */
      const p = robed[0], who = p.v || p.n, st = who.seat; who.seat = null; await fr(10); out.stood = { sitting:!!p.e.rig.sitting, seatBox:!!p.e.rig.seatBox }; who.seat = st; await fr(20); out.resat = !!p.e.rig.sitting; }
    const H = (V3.hearthCook||[])[0]; out.grill = H ? { grill:!!H.pan2, z:+H.g.position.z.toFixed(2) } : null;
    return out; });
  await page.screenshot({ path: SHOTS + '/rs588-tavern.png' });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.robed >= 1, 'someone robed sits in the tavern');
  A(r.refolds < 0.5, 'their robes are not refolded every frame: ' + r.refolds + ' a frame');
  A(r.folded > 0.03, 'still folded on the seat: ' + r.folded);
  A(!r.stood.sitting && !r.stood.seatBox && r.resat, 'up again, the seat is forgotten; back down, seated again: ' + JSON.stringify(r.stood));
  A(r.grill && r.grill.grill && r.grill.z > 0.1, 'the hearth\'s grill out on the hearth stone: ' + JSON.stringify(r.grill));
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
