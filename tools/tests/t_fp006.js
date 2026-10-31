// FP-006: a wider first-person view, and hands and arms that hold things. The view is about 77 degrees across; each hand is a
// palm, four jointed fingers and a thumb closed round its grip; bare hands are your skin, gloves their colour, gauntlets metal;
// a robe gives a wide sleeve; each forearm starts at its wrist and runs out of sight below the view.
// Shot: shots/fp006-hands.jpg
const fs = require('fs');
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
  const ev = (f, a)=>page.evaluate(f, a), wait = ms=>ev(async ms=>{ const t = performance.now() + ms; while (performance.now() < t){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); } }, ms);
  await ev(async ()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.player.hp = G.player.maxHp = 99999;
    const s = questNearbySites(G.owPos.x, G.owPos.y, 1, 80, ['dungeon'])[0]; G.gameMode = 0; G.pendingDungeon = { x:s.x, y:s.y }; enterDungeonConfirm(); setUi('playing'); G.mon.length = 0; });
  await wait(1200);
  await page.keyboard.press('o'); await wait(800);
  const dress = (w, gear)=>ev(([w, gear])=>{ G.mon.forEach(m=>{ m.alive = 0; });
    G.gear.weapon = w==='fists' ? newItem() : rsMakeWeapon(2, w); G.gear.weapon.used = w!=='fists';
    G.gear.arms = gear==='leather' ? rsMakeArmour('hide', 1, 'arms') : gear==='metal' ? rsMakeArmour('metal', 5, 'arms') : newItem();
    G.gear.chest = gear==='leather' ? rsMakeArmour('hide', 1, 'chest') : gear==='metal' ? rsMakeArmour('metal', 5, 'chest') : gear==='robe' ? rsMakeArmour('cloth', 2, 'chest') : newItem();
    for (const k of ['arms','chest']) if (G.gear[k].nm) G.gear[k].used = true; }, [w, gear]);
  const look = ()=>ev(()=>{ const T = THREE, H = FPW.hm, hands = FPW.arms.map(a=>a.h), r = hands[0];
    const meshes = []; r.traverse(o=>{ if (o.isMesh) meshes.push(o); });
    const box = new T.Box3(); meshes.forEach(m=>{ m.geometry.computeBoundingBox(); const b = m.geometry.boundingBox.clone(); m.updateMatrix(); b.applyMatrix4(m.matrix); box.union(b); });
    const c = box.getCenter(new T.Vector3());
    const starts = FPW.arms.map(a=>a.g.position.distanceTo(a.h.localToWorld(a.h.userData.wrist.clone())));
    const sh = FPW.arms.map(a=>{ const p = (a.shAt || a.shoulder).clone(), behind = p.z > 0; p.project(FPW.cam); return behind ? -9 : p.y; });   /* (FP-017: the figure's own shoulders, behind the eye) */
    const hex = m=>m && m.color ? m.color.getHexString() : null;
    return { n:meshes.length, cx:c.x, cz:c.z, hands:hands.length, skin:H.finger===H.skin, finger:hex(H.finger), fMetal:H.finger.metalness||0, sleeve:H.sleeve, starts, sh, nails:!!H.nail }; });
  const fov = await ev(()=>{ const c = FPD.cam; return 2*Math.atan(Math.tan(c.fov*Math.PI/360)*c.aspect)*180/Math.PI; });
  A(fov > 74 && fov < 80, 'about 77 degrees across: ' + fov.toFixed(1));
  /* a sword in a bare hand */
  await dress(2); await wait(600); const a = await look();
  A(a.n >= 18, 'the hand is a palm, jointed fingers and a thumb: ' + a.n + ' parts');
  A(Math.hypot(a.cx, a.cz) < 0.035, 'closed round the grip, not beside it: ' + a.cx.toFixed(3) + ', ' + a.cz.toFixed(3));
  A(a.skin && a.nails && a.sleeve==='shirt', 'bare hands in your own skin, with nails, and a shirt sleeve');
  A(a.starts.every(d=>d < 1e-6), 'the forearm starts at the wrist'); A(a.sh.every(y=>y < -1), 'and runs out of sight below the view: ' + a.sh.map(y=>y.toFixed(2)));
  const shot = await ev(async ()=>{ renderGame(); await new Promise(r=>requestAnimationFrame(r)); const c = document.createElement('canvas'); c.width = canvas.width; c.height = canvas.height; const g = c.getContext('2d'); g.drawImage(FPD.cv, 0, 0, c.width, c.height); g.drawImage(canvas, 0, 0); return c.toDataURL('image/jpeg', 0.85); });
  fs.writeFileSync(SHOTS + '/fp006-hands.jpg', Buffer.from(shot.split(',')[1], 'base64'));
  /* gloves, gauntlets, a robe */
  await dress(2, 'leather'); await wait(400); const b = await look(); const glove = await ev(()=>m3dCol(rsMakeArmour('hide', 1, 'arms').rsCol).getHexString());
  A(!b.skin && b.finger===glove && b.sleeve==='leather', 'leather gloves in their colour and a leather sleeve: ' + b.finger + ' / ' + glove);
  await dress(2, 'metal'); await wait(400); const c = await look();
  A(c.fMetal > 0.5 && c.sleeve==='plate', 'gauntlets of metal and a plate vambrace');
  await dress(2, 'robe'); await wait(400); A((await look()).sleeve==='robe', 'a robe\'s wide sleeve');
  /* two hands on a two-handed sword, two fists with nothing */
  await dress(9); await wait(400); const d = await look(); A(d.hands===2 && d.starts.every(x=>x < 1e-6), 'both hands on a two-hander, each with its arm');
  await dress('fists'); await wait(400); const e = await look(); A(e.hands===2, 'two fists up with nothing in hand');
  A(!errs.length, 'page errors: ' + errs.join(' | '));
};
