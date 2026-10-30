// RS-738: the farmyard. A room out of doors with a hen house, a byre and a feed trough. Chicks and calves are bought at their pens, eat
// flax from the trough as they grow on the clock (and stop when it's empty), wander the yard, and once grown are butchered for raw chicken
// and bones, or raw beef, cowhides and big bones - new foods to cook.
// Shots: shots/rs738_yard.png (the game's camera), rs738_close.jpg (hens, chicks, a cow and a calf), rs738_cow.jpg (a cow side on)
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const ev = (f, a)=>page.evaluate(f, a), A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
  const frames = n=>ev(async n=>{ for (let i=0;i<n;i++){ renderGame(); await new Promise(r=>setTimeout(r, 40)); } }, n);
  const r0 = await ev(()=>{ window.__noWarmSlice = true;
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; townClosedCheck = ()=>false;
    const p = G.player; p.clock = p.turnCount = 60; G.owPos = { x:G.ow.spawnPos.x, y:G.ow.spawnPos.y }; enterVillage(); setUi('playing');
    p.gold = 100000; houseBuy(); skGainXP('construction', 200000); const N = HOUSE_SIZES[2]; for (const k in N.cost) skAdd(k, N.cost[k]); houseUpgrade();
    enterHouse(); G.housePlot = { c:0, r:1 }; skAdd('oak_plank', 15); skAdd('nails', 20); const o0 = skHave('oak_plank'), n0 = skHave('nails'); houseBuildRoom('farmyard');
    const h = houseP(), L = ROOM_LAYOUT.house, o = h.rooms.find(o=>o.k==='farmyard');
    return { rooms:h.rooms.map(o=>o.k), at:o && [o.c, o.r], paid:[o0 - skHave('oak_plank'), n0 - skHave('nails')], benches:L.benches.map(b=>b[0]).filter(k=>/coop|byre|trough/.test(k)), deco:L.deco.map(d=>d[0]), animals:G.villagers.length }; });
  /* the trough, empty, then filled with flax */
  const r1 = await ev(()=>{ G.benchXY = ROOM_LAYOUT.house.benches.find(b=>b[0]==='trough').slice(1); skAdd('flax', -skHave('flax')); useBench('trough'); const d0 = G.wevDlg && G.wevDlg.opts.map(o=>o[0]); setUi('playing');
    skAdd('flax', 30); useBench('trough'); const d1 = G.wevDlg.opts.map(o=>o[0]); wevChoose(0); return { d0, d1, feed:farmP().feed, flax:skHave('flax') }; });
  /* four chicks and two calves - and no more */
  const r2 = await ev(()=>{ const p = G.player, g0 = p.gold, use = (k, re)=>{ G.benchXY = ROOM_LAYOUT.house.benches.find(b=>b[0]===k).slice(1); useBench(k); const i = G.wevDlg ? G.wevDlg.opts.findIndex(o=>re.test(o[0])) : -1; if (i >= 0) wevChoose(i); else setUi('playing'); return i; };
    const buys = []; for (let i=0;i<5;i++) buys.push(use('coop', /^Buy a chick/)); for (let i=0;i<3;i++) buys.push(use('byre', /^Buy a calf/));
    return { buys, spent:g0 - p.gold, herd:G.villagers.filter(v=>v.farm).map(v=>v.animal).sort().join() }; });
  /* growing on the clock, eating the flax; the chicks grown first; an empty trough stops the calves */
  const r3 = await ev(()=>{ const p = G.player, f = farmP(); p.clock += 50; farmUpdate(); const feed1 = f.feed, g1 = f.a.map(a=>Math.round(a.g));
    p.clock += 60; farmMove(); const hens = G.villagers.filter(v=>v.animal==='chicken').length, feed2 = f.feed;
    f.feed = 0; const gc = f.a.find(a=>a.k==='cow').g; p.clock += 100; farmUpdate(); const stalled = f.a.find(a=>a.k==='cow').g===gc;
    G.benchXY = ROOM_LAYOUT.house.benches.find(b=>b[0]==='byre').slice(1); useBench('byre'); const txt = G.wevDlg.text; setUi('playing');
    return { feed1, g1, hens, feed2, stalled, hungry:f.hungry, txt }; });
  /* butchering */
  const r4 = await ev(()=>{ const p = G.player, f = farmP(), use = (k, re)=>{ G.benchXY = ROOM_LAYOUT.house.benches.find(b=>b[0]===k).slice(1); useBench(k); const i = G.wevDlg ? G.wevDlg.opts.findIndex(o=>re.test(o[0])) : -1; if (i >= 0) wevChoose(i); else setUi('playing'); return i; };
    const b0 = [skHave('chicken'), skHave('bones')]; use('coop', /^Butcher/); const hen = [skHave('chicken') - b0[0], skHave('bones') - b0[1]];
    f.feed = 60; p.clock += 400; farmUpdate(); const c0 = [skHave('beef'), skHave('cowhide'), skHave('bigbones')]; const cowOpt = use('byre', /^Butcher/);
    const cow = [skHave('beef') - c0[0], skHave('cowhide') - c0[1], skHave('bigbones') - c0[2]];
    return { hen, cowOpt, cow, left:f.a.map(a=>a.k).join(), feedLeft:f.feed, roast:skName('c_chicken'), beefC:skName('c_beef'), icon:/^data:image/.test(foodIconUrl('chicken')) && /^data:image/.test(foodIconUrl('c_beef')),
      uses:resUses('beef').join(' '), src:resSources('chicken').join(' '), food:resCats().find(c=>c[0]==='Fish & food')[1].includes('c_chicken') }; });
  /* they wander the yard, and step aside for you */
  const r5 = await ev(()=>{ const vs = G.villagers.filter(v=>v.farm), at0 = vs.map(v=>v.x+','+v.y).join(' '); for (let i=0;i<12;i++) farmMove();
    const inYard = vs.every(v=>v.x >= v.farm[0] && v.y >= v.farm[1] && v.x < v.farm[0] + 5 && v.y < v.farm[1] + 5), moved = vs.map(v=>v.x+','+v.y).join(' ')!==at0;
    const v = vs[0], p = G.player; let side = null; for (const [a, b] of [[1,0],[-1,0],[0,1],[0,-1]]) if (G.map[v.x + a][v.y + b]===T_FLOOR && !G.villagers.some(o=>o.x===v.x + a && o.y===v.y + b)){ side = [a, b]; break; }
    p.x = v.x + side[0]; p.y = v.y + side[1]; const was = [v.x, v.y]; moveDir(-side[0], -side[1]); return { inYard, moved, stepped:p.x===was[0] && p.y===was[1] && !(v.x===was[0] && v.y===was[1]) }; });
  /* a full yard for the shots: two hens, two chicks, a cow and a calf */
  await ev(()=>{ const f = farmP(); f.a = [{ k:'chicken', g:100 }, { k:'chicken', g:100 }, { k:'chicken', g:10 }, { k:'chicken', g:10 }, { k:'cow', g:300 }, { k:'cow', g:20 }]; f.feed = 40; f.at = clockNow();
    const o = houseP().rooms.find(o=>o.k==='farmyard'), [x0, y0] = houseCellXY(o.c, o.r), p = G.player; p.x = x0 + 2; p.y = y0 + 5; houseRelayout(); });
  await frames(30); await page.screenshot({ path:SHOTS + '/rs738_yard.png' });
  const r6 = await ev(()=>{ const T = THREE, o = houseP().rooms.find(o=>o.k==='farmyard'), [x0, y0] = houseCellXY(o.c, o.r), R = V3.renderer, sz = R.getSize(new T.Vector2()), out = {};
    const shot = (px, py, pz, lx, ly, lz)=>{ const c = new T.PerspectiveCamera(40, sz.x/sz.y, 0.05, 100); c.position.set(px, py, pz); c.lookAt(lx, ly, lz); c.updateProjectionMatrix(); R.render(V3.scene, c); return R.domElement.toDataURL('image/jpeg', 0.88); };
    out.close = shot(x0 + 3.6, 2.6, y0 + 6.6, x0 + 2.5, 0.3, y0 + 2.4);
    const cow = V3.villagers.find(q=>q.v.animal==='cow'); const g = cow.g.position; out.cow = shot(g.x + 2.2, 0.9, g.z + 0.3, g.x, 0.45, g.z);
    out.made = V3.villagers.filter(q=>q.v.farm).length; return out; });
  const fs = require('fs'); fs.writeFileSync(SHOTS + '/rs738_close.jpg', Buffer.from(r6.close.split(',')[1], 'base64')); fs.writeFileSync(SHOTS + '/rs738_cow.jpg', Buffer.from(r6.cow.split(',')[1], 'base64'));
  console.log(JSON.stringify({ r0, r1, r2, r3, r4, r5, made:r6.made }));
  A(r0.rooms.includes('farmyard') && r0.at.join()==='0,1' && r0.paid.join()==='15,20' && r0.benches.join()==='coop,byre,trough' && r0.deco.includes('hay') && r0.animals===0, 'a farmyard built: ' + JSON.stringify(r0));
  A(r1.d0.join()==='Close' && /^Fill it with flax - 30/.test(r1.d1[0]) && r1.feed===30 && r1.flax===0, 'the trough filled with flax: ' + JSON.stringify(r1));
  A(r2.buys.join()==='0,0,0,0,-1,0,0,-1' && r2.spent===4*25 + 2*150 && r2.herd==='calf,calf,chick,chick,chick,chick', 'four chicks and two calves bought: ' + JSON.stringify(r2));
  A(Math.abs(r3.feed1 - 25) < 0.1 && r3.g1.join()==='50,50,50,50,50,50' && r3.hens===4 && r3.stalled && r3.hungry===1 && /once there is feed/.test(r3.txt), 'they grow while fed, and stop when the trough is empty: ' + JSON.stringify(r3));
  A(r4.hen.join()==='2,1' && r4.cowOpt >= 0 && r4.cow.join()==='4,2,1' && r4.left==='chicken,chicken,chicken,cow', 'a hen and a cow butchered: ' + JSON.stringify(r4));
  A(r4.roast==='Roast Chicken' && r4.beefC==='Cooked Beef' && r4.icon && /Cooking 20/.test(r4.uses) && /farmyard/.test(r4.src) && r4.food, 'new foods to cook: ' + JSON.stringify(r4));
  A(r5.inYard && r5.moved && r5.stepped, 'they wander the yard and make way: ' + JSON.stringify(r5));
  A(r6.made===6, 'six animals in 3D: ' + r6.made);
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
