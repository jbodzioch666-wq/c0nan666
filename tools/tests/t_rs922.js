// RS-922: sleeping in your own bed binds the hearthstone to your house (T brings you home: in at your plot's door, or the town house's);
// you lie on the bed's own mattress, under a blanket of its colour, legs together and arms at your sides (laid again on the bed rebuilt at
// dawn); the house's stairs are walked, up the flight and down into the well. Shots: shots/rs922-sleep.jpg, rs922-stair.jpg
const path = require('path'), fs = require('fs');
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const A = (c, msg, r)=>{ if (!c) throw new Error('assert: ' + msg + ' ' + JSON.stringify(r || {})); };
  const r = await page.evaluate(async ()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; townClosedCheck = ()=>false;
    const p = G.player, out = { shots:[] }; p.clock = p.turnCount = 60; G.owPos = { x:G.ow.spawnPos.x, y:G.ow.spawnPos.y }; enterVillage(); setUi('playing');
    { const roomy = ()=>{ for (let x=0;x<OW_COLS;x++) for (let y=0;y<OW_ROWS;y++) if (G.ow.map[x][y]===OW_TOWN && plotFind(x, y)) return { x, y }; return null; }, t = plotFind(G.owPos.x, G.owPos.y) ? null : roomy(); if (t){ G.owPos = t; enterVillage(); setUi('playing'); } }
    const fr = async (n, ms)=>{ for (let i=0;i<n;i++){ renderGame(); await new Promise(q=>setTimeout(q, ms||30)); } };
    const shot = (b, ax, ay, az)=>{ const R = V3.renderer, sz = R.getSize(new THREE.Vector2()), c = new THREE.PerspectiveCamera(45, sz.x/sz.y, 0.05, 60); c.position.set(b.x + ax, b.y + ay, b.z + az); c.lookAt(b.x, b.y, b.z); R.render(V3.scene, c); return R.domElement.toDataURL('image/jpeg', 0.82); };
    p.gold = 5e6; skGainXP('construction', 6e7); houseBuy(1); out.plot = plotBuy(); houseBuy(3);
    try{
    enterHouse(); await fr(15); out.hearth0 = hearthKey();
    /* asleep in each grade of bed */
    const h = houseP(); out.sleep = [];
    for (const g of [1, 3]){ h.built.bed = g; houseRelayout(); await fr(10); let bed = ROOM_LAYOUT[G.interior.key].benches.find(b=>b[0]==='bed'); if (!bed){ G.houseFloor = houseFl() ? 0 : 1; houseLayout(); await fr(10); bed = ROOM_LAYOUT[G.interior.key].benches.find(b=>b[0]==='bed'); } out.bedFl = houseFl(); const bw = ROOM_LAYOUT[G.interior.key].benches.find(b=>b[0]==='bed'); bed = bw; G.benchXY = [bed[1], bed[2]];
      houseBench('bed'); const o = { g, has:!!G.sleepFx }; let mid = null, after = null;
      for (let i=0;i<200 && G.sleepFx;i++){ await fr(1, 25); const F = G.sleepFx; if (!F) break; const inScene = c=>{ let q = c; while (q && q.parent) q = q.parent; return q===V3.scene; };
        if (!mid && F.t > 0.3){ const b = (F.nf || V3.player).g.position; mid = { y:+b.y.toFixed(3), top:F.top, cover:!!(F.cover && inScene(F.cover)), bed:!!F.bg, night:!!(F.nf && inScene(F.nf.g)), hid:V3.player.g.visible===false, L:F.L, Lb:F.Lb, fz:F.fz }; out.shots.push(shot(b, 1.5, 1.3, 1.1)); out.shots.push(shot(b, -1.2, 1.6, -0.3)); }
        if (!after && F.done && F.t > 2.4){ after = { cover:!!(F.cover && inScene(F.cover)), y:+V3.player.g.position.y.toFixed(3) }; } }
      o.mid = mid; o.after = after; o.ended = !G.sleepFx; o.shown = V3.player.g.visible!==false; out.sleep.push(o); }
    out.hearth1 = hearthKey(); out.hname = hearthName();
    /* the stairs walked */
    if (houseFl()){ G.houseFloor = 0; houseLayout(); await fr(10); } window.__trans = true; const S = housePlan().stair; p.x = S[0]; p.y = S[1] + 1; await fr(10); const y0 = V3.player.g.position.y;
    houseStair(); out.walking = !!V3.stair; let maxY = -9, minY = 9; for (let i=0;i<160 && (V3.stair || V3.stairArr);i++){ await fr(1, 20); const y = V3.player.g.position.y; maxY = Math.max(maxY, y); minY = Math.min(minY, y); if (i===20) out.shots.push(shot(V3.player.g.position, 1.8, 1.4, 1.6)); }
    out.up = { fl:houseFl(), maxY:+maxY.toFixed(2), done:!V3.stair && !V3.stairArr, y:+V3.player.g.position.y.toFixed(2) };
    await fr(5); houseStair(); out.walkingDown = !!V3.stair; minY = 9; for (let i=0;i<160 && (V3.stair || V3.stairArr);i++){ await fr(1, 20); minY = Math.min(minY, V3.player.g.position.y); }
    out.down = { fl:houseFl(), minY:+minY.toFixed(2), done:!V3.stair && !V3.stairArr };
    window.__trans = false;
    /* home by hearthstone from the open land */
    exitInterior(); G.gameMode = 0; G.owPos = { x:G.ow.spawnPos.x, y:G.ow.spawnPos.y }; setUi('playing'); renderGame(); p.hearthAt = -1e9; hearthUse(); await fr(10);
    out.home = !!(G.interior && G.interior.key==='house'); out.cold = hearthLeft() > 0;
    hearthUse(); out.again = G.interior && G.interior.key;
    }catch(e){ out.err = String(e.stack).slice(0, 400); }
    return out; });
  r.shots.forEach((s, i)=>fs.writeFileSync(path.join(__dirname, 'shots', 'rs922-' + i + '.jpg'), Buffer.from(s.split(',')[1], 'base64'))); delete r.shots;
  console.log(JSON.stringify(r));
  A(!r.err, 'ran through', r);
  A(!r.hearth0 && r.hearth1==='house' && r.hname==='your house', 'a night in your own bed binds the hearthstone to your house', r);
  A(r.sleep.every(s=>s.has && s.mid && s.mid.bed && s.mid.cover && Math.abs(s.mid.y - (s.mid.top + 0.02)) < 0.03 && s.after && s.after.cover && s.ended && s.mid.night && s.mid.hid && s.shown), 'on the mattress under its blanket, laid again after dawn', r);
  A(r.sleep[1].mid.y > r.sleep[0].mid.y + 0.05, 'higher on the four-poster than on straw', r);
  A(r.walking && r.up.fl===1 && r.up.maxY > 1.2 && r.up.done && r.up.y < 0.1, 'walked up the flight', r);
  A(r.walkingDown && r.down.fl===0 && r.down.minY < -0.5 && r.down.done, 'walked down into the well', r);
  A(r.home && r.cold, 'the hearthstone brings you home', r);
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
