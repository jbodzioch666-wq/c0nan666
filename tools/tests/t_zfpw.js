// probe: the first-person weapon view for every way of holding a weapon, four to a sheet (shots/zfpw-a.jpg to -d.jpg).
// ZFPW_P=0.5 pins the swing at that point of the attack.
const fs = require('fs');
module.exports = async page=>{ page.setDefaultTimeout(0);
  const ev = (f, a)=>page.evaluate(f, a), wait = ms=>ev(async ms=>{ const t = performance.now() + ms; while (performance.now() < t){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); } }, ms);
  await ev(async ()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.player.hp = G.player.maxHp = 99999;
    const s = questNearbySites(G.owPos.x, G.owPos.y, 1, 80, ['dungeon'])[0]; G.gameMode = 0; G.pendingDungeon = { x:s.x, y:s.y }; enterDungeonConfirm(); setUi('playing'); G.mon.length = 0; });
  await wait(1200);
  await ev(()=>{ const p = G.player, ok = (x, y)=>tileAt(x, y)===T_FLOOR && isoPassable(x, y);
    let best = null, bd = 1e9;
    for (let x=1; x<COLS-1; x++) for (let y=1; y<ROWS-1; y++) for (let f=0; f<4; f++){ const F = FACING_VECT[f]; let good = true; for (let k=0; k<=5 && good; k++) good = ok(x+F[0]*k, y+F[1]*k);
      const d = Math.hypot(x - p.x, y - p.y); if (good && d < bd){ bd = d; best = [x, y, f]; } }
    p.x = best[0]; p.y = best[1]; p.facing = best[2]; G.mon.forEach(m=>{ m.alive = 0; }); });
  await page.keyboard.press('o'); await wait(800);
  const P = process.env.ZFPW_P ? +process.env.ZFPW_P : undefined;
  const set = (wpn, gear)=>ev(([wpn, gear, P])=>{ G.mon.forEach(m=>{ m.alive = 0; });
    G.gear.weapon = wpn==='fists' ? newItem() : wpn==='staff' ? rsMakeStaff(0) : rsMakeWeapon(3, wpn); G.gear.weapon.used = wpn!=='fists';
    G.gear.arms = gear==='leather' ? rsMakeArmour('hide', 1, 'arms') : gear==='metal' ? rsMakeArmour('metal', 5, 'arms') : newItem();
    G.gear.chest = gear==='leather' ? rsMakeArmour('hide', 1, 'chest') : gear==='metal' ? rsMakeArmour('metal', 5, 'chest') : gear==='robe' ? rsMakeArmour('cloth', 2, 'chest') : newItem();
    for (const k of ['arms','chest']) if (G.gear[k].nm) G.gear[k].used = true;
    FPW.wkey = ''; window.__fpwP = P; }, [wpn, gear, P]);
  const grab = ()=>ev(async ()=>{ renderGame(); await new Promise(r=>requestAnimationFrame(r)); const c = document.createElement('canvas'); c.width = canvas.width; c.height = canvas.height; const g = c.getContext('2d'); g.drawImage(FPD.cv, 0, 0, c.width, c.height); g.drawImage(canvas, 0, 0); return c.toDataURL('image/png'); });
  const sheets = { a:[['fists'],[2],[0],[1]], b:[[5],[7],[9],[8]], c:[[4],['staff'],[2,'leather'],[2,'metal']], d:[['fists','metal'],[9,'leather'],[4,'robe'],[6]] };
  if (process.env.ZFPW_OFF){ const shots = [];   /* (FP-011) the left hand: ZFPW_OFF='[[weapon, offhand], ...]', offhand kite|tower|tome|dagger|sword|scim */
    for (const [wpn, off] of JSON.parse(process.env.ZFPW_OFF)){ await set(wpn); await ev(off=>{ G.gear.offhand = off==='kite' ? rsMakeArmour('metal', 3, 'offhand') : off==='tower' ? rsMakeArmour('metal', 5, 'tower') : off==='tome' ? rsMakeArmour('cloth', 2, 'offhand') : (()=>{ const w = RS_WEAPONS[{ dagger:0, sword:2, scim:3 }[off]], m = RS_METALS[3], it = rsItem('offhand'); it.nm = m[0] + ' Off-hand ' + w[0]; it.basis = w[1]; it.rsCol = m[5]; it.offWeapon = 1; return it; })(); G.gear.offhand.used = true; FPW.wkey = ''; }, off);
      await wait(900); shots.push(await grab()); }
    const out = await ev(async shots=>{ const im = await Promise.all(shots.map(s=>new Promise(r=>{ const i = new Image(); i.onload = ()=>r(i); i.src = s; })));
      const w = im[0].width/2, h = im[0].height/2, c = document.createElement('canvas'); c.width = w*2; c.height = h*Math.ceil(im.length/2); const g = c.getContext('2d');
      im.forEach((i, n)=>g.drawImage(i, (n%2)*w, Math.floor(n/2)*h, w, h)); return c.toDataURL('image/jpeg', 0.86); }, shots);
    fs.writeFileSync(SHOTS + '/zfpw-off.jpg', Buffer.from(out.split(',')[1], 'base64')); return; }
  if (process.env.ZFPW_FIST){ const shots = [];
    for (const v of JSON.parse(process.env.ZFPW_FIST)){ await ev(v=>{ Object.assign(FPW_STYLE.fists, v); }, v); await set('fists'); await wait(500); shots.push(await grab()); }
    const out = await ev(async shots=>{ const im = await Promise.all(shots.map(s=>new Promise(r=>{ const i = new Image(); i.onload = ()=>r(i); i.src = s; })));
      const w = im[0].width/2, h = im[0].height/2, c = document.createElement('canvas'); c.width = w*2; c.height = h*2; const g = c.getContext('2d');
      im.forEach((i, n)=>g.drawImage(i, i.width*0.5, i.height*0.35, i.width*0.5, i.height*0.65, (n%2)*w, Math.floor(n/2)*h, w, h)); return c.toDataURL('image/jpeg', 0.88); }, shots);
    fs.writeFileSync(SHOTS + '/zfpw-fist.jpg', Buffer.from(out.split(',')[1], 'base64')); return; }
  if (process.env.ZFPW_CROP){ const shots = [];
    for (const [w, gear, cx, cy] of [[2,null,0.62,0.45],[2,'leather',0.62,0.45],[2,'metal',0.62,0.45],['fists',null,0.55,0.4]]){ await set(w, gear); await wait(500); shots.push(await grab()); }
    const out = await ev(async shots=>{ const im = await Promise.all(shots.map(s=>new Promise(r=>{ const i = new Image(); i.onload = ()=>r(i); i.src = s; })));
      const w = im[0].width*0.4, h = im[0].height*0.5, c = document.createElement('canvas'); c.width = w*2; c.height = h*2; const g = c.getContext('2d');
      im.forEach((i, n)=>g.drawImage(i, i.width*(n===3 ? 0.55 : 0.6), i.height*0.45, w, h, (n%2)*w, Math.floor(n/2)*h, w, h)); return c.toDataURL('image/jpeg', 0.9); }, shots);
    fs.writeFileSync(SHOTS + '/zfpw-crop.jpg', Buffer.from(out.split(',')[1], 'base64')); return; }
  for (const [k, list] of Object.entries(sheets)){
    const shots = [];
    for (const [w, gear] of list){ await set(w, gear); await wait(500); shots.push(await grab()); }
    const out = await ev(async shots=>{ const im = await Promise.all(shots.map(s=>new Promise(r=>{ const i = new Image(); i.onload = ()=>r(i); i.src = s; })));
      const w = im[0].width/2, h = im[0].height/2, c = document.createElement('canvas'); c.width = w*2; c.height = h*2; const g = c.getContext('2d');
      im.forEach((i, n)=>g.drawImage(i, (n%2)*w, Math.floor(n/2)*h, w, h)); return c.toDataURL('image/jpeg', 0.85); }, shots);
    fs.writeFileSync(SHOTS + '/zfpw-' + k + '.jpg', Buffer.from(out.split(',')[1], 'base64'));
  }
};
