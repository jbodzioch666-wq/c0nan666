// RS-309/310: at your own campfire on the open land - with a tent pitched or just the fire - you sit on a stool beside it, facing the
// flames, on the far side of the fire from the camera and clear of the tent; walking off gets you up and the stool goes
module.exports = async page=>{
  const ev = (f, a)=>page.evaluate(f, a), A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' :: '+JSON.stringify(out)); }, out = {};
  await ev(()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); G.gameMode = 0; G.gear.weapon = rsMakeStaff(1); G.gear.offhand = rsMakeArmour('cloth', 3, 'offhand');
    let spot = null; const sp = G.ow.spawnPos;
    for (let r=1; r<12 && !spot; r++) for (let dx=-r; dx<=r && !spot; dx++) for (let dy=-r; dy<=r; dy++){ const x = sp.x+dx, y = sp.y+dy, t = G.ow.map[x] && G.ow.map[x][y]; if ((t===OW_GRASS || t===OW_DESERT) && !skNodeAt(x, y) && !owPlaceAt(x, y)){ spot = { x, y }; break; } }
    G.owPos = { x:spot.x, y:spot.y }; G.mon = []; skP().fire = { x:spot.x, y:spot.y, until:(G.player.turnCount||0) + 500 }; G.player.campPitch = null; renderGame(); });
  const frames = async n=>{ for (let i=0;i<n;i++){ await ev(()=>renderGame()); await page.waitForTimeout(40); } };
  const look = ()=>ev(()=>{ const P = O3.player, f = skP().fire, v = new THREE.Vector3(); if (!P || !P.e) return { none:true };
    P.e.holder.updateMatrixWorld(true); P.e.holder.getWorldPosition(v); const hips = P.e.rig.hips.getWorldPosition(new THREE.Vector3()), st = O3.campStool;
    const toFire = Math.atan2(f.x + 0.5 - v.x, f.y + 0.5 - v.z), d = Math.abs(Math.atan2(Math.sin(toFire - P.yaw), Math.cos(toFire - P.yaw)));
    const cam = O3.cam.position, camSide = ((f.x + 0.5 - cam.x)*(v.x - f.x - 0.5) + (f.y + 0.5 - cam.z)*(v.z - f.y - 0.5)) > 0;
    const gy = O3.heightAt(v.x, v.z), tentAt = O3.campTent && O3.campTent.visible ? O3.campTent.getWorldPosition(new THREE.Vector3()) : null;
    return { sit:!!P.campSit, stool:!!(st && st.visible), dist:+Math.hypot(v.x - f.x - 0.5, v.z - f.y - 0.5).toFixed(2), facing:+d.toFixed(2), beyond:camSide,
      hipUp:+(hips.y - gy).toFixed(3), seatTop:st ? +(st.position.y - gy).toFixed(3) : null, k:+((P.e.holder.scale.y||1)*(P.e.H||1)).toFixed(2), tentGap:tentAt ? +Math.hypot(v.x - tentAt.x, v.z - tentAt.z).toFixed(2) : null,
      kitShown:!!((P.e.rig.weapon && (P.e.rig.weapon.parent && P.e.rig.weapon.parent!==P.e.rig.arms[0].hand ? P.e.rig.weapon.parent : P.e.rig.weapon).visible) || (P.e.rig.tome && P.e.rig.tome.visible)),
      stick:!!(O3.campStick && O3.campStick.visible), tip:O3.campStick && O3.campStick.visible ? (()=>{ const w = O3.campStick.getObjectByName('marshmallow').getWorldPosition(new THREE.Vector3()); return +Math.hypot(w.x - f.x - 0.5, w.z - f.y - 0.5).toFixed(2); })() : null }; });
  await frames(20);
  out.fire = await look();
  A(!out.fire.none, 'a 3D figure on the open land');
  A(out.fire.sit && out.fire.stool, 'with just a fire you sit on a stool');
  A(out.fire.dist > 0.3 && out.fire.dist < 0.5 && out.fire.facing < 0.2 && out.fire.beyond, 'beside the fire, facing it, seen across it from the camera');
  A(out.fire.hipUp > out.fire.seatTop && out.fire.hipUp < out.fire.seatTop + 0.3, 'on the seat, not floating or sunk');
  A(!out.fire.kitShown && out.fire.stick && out.fire.tip < 0.08, 'the staff and the book put down, a marshmallow on a stick held over the fire (RS-310)');
  await page.screenshot({ path:SHOTS+'/shot_campseat.png' });
  // a tent pitched by the fire: still on the stool, clear of the tent
  await ev(()=>{ const f = skP().fire; G.player.campPitch = { x:f.x, y:f.y, until:(G.player.turnCount||0) + 500, tent:1, spit:1 }; });
  await frames(10); out.tent = await look();
  A(out.tent.sit && out.tent.stool && out.tent.tentGap > 0.3 && out.tent.tentGap < 0.6 && out.tent.facing < 0.2, 'with a tent too, on the stool beside the tent and clear of it (RS-310)');
  await page.screenshot({ path:SHOTS+'/shot_campseat_tent.png' });
  // a step away: up again, the stool gone
  await ev(()=>{ G.owPos = { x:G.owPos.x + 2, y:G.owPos.y }; }); await frames(25); out.away = await look();
  A(!out.away.sit && !out.away.stool && out.away.kitShown && !out.away.stick, 'walking off gets you up, staff and book back in hand');
  console.log(JSON.stringify(out));
};
