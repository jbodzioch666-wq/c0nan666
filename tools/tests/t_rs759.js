// RS-759: the hen house's and the byre's menus stay open - buy a chick or a pen-full at once, and the menu is back with what you bought;
// butcher one or all of the grown ones. Butchering is shown: each animal is led up beside you, you take a cleaver to it (two chops, blood
// and feathers), it topples onto its side and sinks away, then the next; the menu comes back after. What it gives is yours at once, and
// walking off cuts the showing short.
// Shots: shots/rs759_raise.jpg, rs759_chop.jpg, rs759_down.jpg (a hen), rs759_cow.jpg (a cow struck)
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const ev = (f, a)=>page.evaluate(f, a), A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
  const frames = n=>ev(async n=>{ for (let i=0;i<n;i++){ renderGame(); await new Promise(r=>setTimeout(r, 40)); } }, n);
  await ev(()=>{ window.__noWarmSlice = true;
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; townClosedCheck = ()=>false;
    const p = G.player; p.clock = p.turnCount = 60; G.owPos = { x:G.ow.spawnPos.x, y:G.ow.spawnPos.y }; enterVillage(); setUi('playing');
    p.gold = 100000; houseBuy(); skGainXP('construction', 200000); const N = HOUSE_SIZES[2]; for (const k in N.cost) skAdd(k, N.cost[k]); houseUpgrade();
    enterHouse(); G.housePlot = { c:0, r:1 }; skAdd('oak_plank', 15); skAdd('nails', 20); houseBuildRoom('farmyard'); setUi('playing'); });
  /* buying: one, then the rest of the pen at once - the menu open throughout */
  const r1 = await ev(()=>{ const p = G.player, g0 = p.gold, opt = re=>G.wevDlg ? G.wevDlg.opts.findIndex(o=>re.test(o[0])) : -1, out = {};
    G.benchXY = ROOM_LAYOUT.house.benches.find(b=>b[0]==='coop').slice(1); useBench('coop'); out.opts0 = G.wevDlg.opts.map(o=>o[0]);
    wevChoose(opt(/^Buy a chick/)); out.after1 = { ui:G.ui, title:G.wevDlg && G.wevDlg.title, note:/You buy a chick\./.test(G.wevDlg.text), opts:G.wevDlg.opts.map(o=>o[0]) };
    wevChoose(opt(/^Buy 3 chicks - 75 gold/)); out.after2 = { ui:G.ui, note:/You buy 3 chicks\./.test(G.wevDlg.text), opts:G.wevDlg.opts.map(o=>o[0]) }; setUi('playing');
    G.benchXY = ROOM_LAYOUT.house.benches.find(b=>b[0]==='byre').slice(1); useBench('byre'); wevChoose(opt(/^Buy 2 calves - 300 gold/)); out.byre = { ui:G.ui, opts:G.wevDlg.opts.map(o=>o[0]) }; setUi('playing');
    out.spent = g0 - p.gold; out.herd = farmP().a.map(a=>a.k).join(); return out; });
  /* grown; you by the hen house in the yard */
  await ev(()=>{ const f = farmP(); for (const a of f.a) a.g = FARM_KIND[a.k].grow; f.feed = 40; f.at = clockNow();
    const o = houseP().rooms.find(o=>o.k==='farmyard'), [x0, y0] = houseCellXY(o.c, o.r), p = G.player; p.x = x0 + 2; p.y = y0 + 2; houseRelayout(); setUi('playing'); });
  await frames(25);
  /* butcher all four hens, watched */
  const shot = (B)=>`(()=>{ const T = THREE, R = V3.renderer, sz = R.getSize(new T.Vector2()), o = V3.butch.q[V3.butch.i], P = V3.player.g.position, g = o.p.g.position, dx = o.go.dx, dz = o.go.dz, big = ${B};
      const mx = (P.x + g.x)/2, mz = (P.z + g.z)/2, c = new T.PerspectiveCamera(40, sz.x/sz.y, 0.05, 100); c.position.set(mx + dz*(big ? 3.4 : 2.6) - dx*0.6, big ? 1.5 : 1.3, mz - dx*(big ? 3.4 : 2.6) - dz*0.6); c.lookAt(mx, big ? 0.6 : 0.45, mz); c.updateProjectionMatrix(); R.render(V3.scene, c); return R.domElement.toDataURL('image/jpeg', 0.9); })()`;
  const r2 = await ev(async shotSrc=>{ const p = G.player, b0 = [skHave('chicken'), skHave('bones')], out = { shots:{} }, log0 = G.log ? G.log.length : 0;
    G.benchXY = ROOM_LAYOUT.house.benches.find(b=>b[0]==='coop').slice(1); useBench('coop'); out.opts = G.wevDlg.opts.map(o=>o[0]);
    const i = G.wevDlg.opts.findIndex(o=>/^Butcher all 4 hens/.test(o[0])); out.pick = i; wevChoose(i);
    out.atOnce = [skHave('chicken') - b0[0], skHave('bones') - b0[1]]; out.left = farmP().a.map(a=>a.k).join(); out.ui = G.ui; out.q = V3.butch ? V3.butch.q.length : 0;
    let cleaver = 0, roll = 0, blood = 0, feathers = 0, pool = 0, hidden = 0, turned = 9; const t0 = performance.now();
    while (V3.butch && performance.now() - t0 < 40000){ renderGame(); await new Promise(r=>setTimeout(r, 30));
      const B = V3.butch; if (!B) break; const e = V3.player.e, o = B.q[B.i]; if (e.toolKey==='cleaver2' && e.tool && e.tool.parent) cleaver++;
      if (o && o.p){ roll = Math.max(roll, o.p.g.rotation.z); if (o.go && B.t > o.go.w + 0.3){ const P = V3.player.g.position, g = o.p.g.position, want = Math.atan2(g.x - P.x, g.z - P.z); turned = Math.min(turned, Math.abs(Math.atan2(Math.sin(want - V3.player.yaw), Math.cos(want - V3.player.yaw)))); }
        if (B.i===0 && o.go){ const c1 = o.go.w + 0.3; for (const [k, at] of [['raise', c1 + 0.38], ['chop', c1 + 0.52], ['down', c1 + 1.55 + 0.9]]) if (!out.shots[k] && B.t >= at) out.shots[k] = eval(shotSrc); } }
      blood = Math.max(blood, V3.parts.filter(q=>q.fl!=null && !q.sw).length); feathers = Math.max(feathers, V3.parts.filter(q=>q.sw).length); pool = Math.max(pool, B.junk.length);
      hidden = Math.max(hidden, B.q.filter(o=>!o.p.g.visible).length); }
    out.secs = +((performance.now() - t0)/1000).toFixed(1); Object.assign(out, { cleaver, roll:+roll.toFixed(2), blood, feathers, pool, hidden, turned:+turned.toFixed(2), done:!V3.butch });
    out.after = { ui:G.ui, title:G.wevDlg && G.wevDlg.title, note:G.wevDlg && /You butcher 4 hens/.test(G.wevDlg.text), opts:G.wevDlg && G.wevDlg.opts.map(o=>o[0]) };
    out.tool = V3.player.e.toolKey || ''; out.hens = G.villagers.filter(v=>v.animal==='chicken').length; out.said = (G.log||[]).slice(log0).filter(l=>/you butcher a hen/.test(l.text || l.msg || l)).length;
    return out; }, shot('false'));
  /* one cow, then the last cut short by walking off */
  await ev(()=>setUi('playing')); await frames(15);
  const r3 = await ev(async shotSrc=>{ const out = {}, c0 = skHave('beef');
    G.benchXY = ROOM_LAYOUT.house.benches.find(b=>b[0]==='byre').slice(1); useBench('byre'); out.opts = G.wevDlg.opts.map(o=>o[0]); wevChoose(G.wevDlg.opts.findIndex(o=>/^Butcher a cow/.test(o[0])));
    out.q = V3.butch ? V3.butch.q.length : 0; const t0 = performance.now();
    while (V3.butch && performance.now() - t0 < 20000){ renderGame(); await new Promise(r=>setTimeout(r, 30)); const B = V3.butch; if (!B) break; const o = B.q[B.i]; if (!out.shot && o.go && B.t >= o.go.w + 0.3 + 0.52) out.shot = eval(shotSrc); }
    out.after = { ui:G.ui, opts:G.wevDlg && G.wevDlg.opts.map(o=>o[0]) }; out.beef = skHave('beef') - c0;
    wevChoose(G.wevDlg.opts.findIndex(o=>/^Butcher a cow/.test(o[0]))); out.q2 = V3.butch ? V3.butch.q.length : 0;
    for (let i=0;i<10;i++){ renderGame(); await new Promise(r=>setTimeout(r, 30)); }
    const p = G.player; let mv = null; for (const [a, b] of [[1,0],[-1,0],[0,1],[0,-1]]) if (G.map[p.x + a][p.y + b]===T_FLOOR && !G.villagers.some(v=>!v.butch && v.x===p.x + a && v.y===p.y + b)){ mv = [a, b]; break; }
    moveDir(mv[0], mv[1]); for (let i=0;i<5;i++){ renderGame(); await new Promise(r=>setTimeout(r, 30)); }
    out.cut = { done:!V3.butch, ui:G.ui, beef:skHave('beef') - c0, cows:G.villagers.filter(v=>v.animal==='cow').length, left:farmP().a.length, tool:V3.player.e.toolKey || '' };
    return out; }, shot('true'));
  const fs = require('fs'); for (const k in r2.shots) fs.writeFileSync(SHOTS + '/rs759_' + k + '.jpg', Buffer.from(r2.shots[k].split(',')[1], 'base64'));
  if (r3.shot) fs.writeFileSync(SHOTS + '/rs759_cow.jpg', Buffer.from(r3.shot.split(',')[1], 'base64'));
  delete r2.shots; delete r3.shot; console.log(JSON.stringify({ r1, r2, r3 }));
  A(r1.opts0.some(o=>/^Buy a chick - 25 gold/.test(o)) && r1.opts0.some(o=>/^Buy 4 chicks - 100 gold/.test(o)), 'one or a pen-full: ' + JSON.stringify(r1.opts0));
  A(r1.after1.ui==='wevent' && r1.after1.title==='Hen house' && r1.after1.note && r1.after1.opts.some(o=>/^Buy 3 chicks/.test(o)), 'the menu stays open after a buy: ' + JSON.stringify(r1.after1));
  A(r1.after2.ui==='wevent' && r1.after2.note && !r1.after2.opts.some(o=>/^Buy/.test(o)), 'the rest of the pen at once, and the menu still open: ' + JSON.stringify(r1.after2));
  A(r1.byre.ui==='wevent' && r1.spent===100 + 300 && r1.herd==='chicken,chicken,chicken,chicken,cow,cow', 'two calves at once: ' + JSON.stringify(r1));
  A(r2.pick >= 0 && r2.opts.some(o=>/^Butcher a hen/.test(o)), 'butcher one or all: ' + JSON.stringify(r2.opts));
  A(r2.atOnce.join()==='8,4' && r2.left==='cow,cow' && r2.ui==='playing' && r2.q===4, 'four hens\' meat and bones at once, the showing begun: ' + JSON.stringify(r2));
  A(r2.done && r2.secs < 25 && r2.hidden===3, 'each led up, butchered and gone in turn: ' + r2.secs + 's ' + r2.hidden);
  A(r2.cleaver > 20 && r2.turned < 0.3, 'you turn to it with a cleaver in your hand: ' + r2.cleaver + ' ' + r2.turned);
  A(r2.roll > 1.4 && r2.blood >= 8 && r2.feathers >= 5 && r2.pool >= 4, 'blood and feathers, toppled on its side, a pool under each: ' + JSON.stringify(r2));
  A(r2.after.ui==='wevent' && r2.after.title==='Hen house' && r2.after.note && r2.tool==='' && r2.hens===0 && r2.said===4, 'the menu back after, the cleaver put away: ' + JSON.stringify(r2.after) + ' ' + r2.said);
  A(r3.q===1 && r3.after.ui==='wevent' && r3.beef===4 && r3.after.opts.some(o=>/^Butcher a cow/.test(o)), 'a cow, and the byre\'s menu back with the other: ' + JSON.stringify(r3));
  A(r3.q2===1 && r3.cut.done && r3.cut.ui==='playing' && r3.cut.beef===8 && r3.cut.cows===0 && r3.cut.left===0 && r3.cut.tool==='', 'walking off cuts it short, the meat still yours: ' + JSON.stringify(r3.cut));
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
