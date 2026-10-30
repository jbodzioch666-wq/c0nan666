// RS-761: the garden's beds have name plates when you point at them, as the farmyard's animals do: an empty bed, what grows in one and
// how long until it's ready (and whether it's watered), or that it's ready to pick. Shot: shots/rs761_plate.png
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const ev = (f, a)=>page.evaluate(f, a), A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
  const r = await ev(async ()=>{ const fr = async n=>{ for (let i=0;i<n;i++){ renderGame(); await new Promise(r=>setTimeout(r, 30)); } };
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; townClosedCheck = ()=>false;
    const p = G.player; p.clock = p.turnCount = 60; G.owPos = { x:G.ow.spawnPos.x, y:G.ow.spawnPos.y }; enterVillage(); setUi('playing');
    p.gold = 100000; houseBuy(); skGainXP('construction', 200000); const N = HOUSE_SIZES[2]; for (const k in N.cost) skAdd(k, N.cost[k]); houseUpgrade();
    enterHouse(); G.housePlot = { c:0, r:1 }; skAdd('plank', 12); houseBuildRoom('garden'); setUi('playing');
    const g = gardenP(), now = p.clock = 5000; g[0] = null; g[1] = { id:'flax', t0:now - 5 }; g[2] = { id:'silverleaf', t0:now - 15, w:1 }; g[3] = { id:'flax', t0:now - 40, w:1 };
    const o = houseP().rooms.find(o=>o.k==='garden'), [x0, y0] = houseCellXY(o.c, o.r); p.x = x0 + 2; p.y = y0 + 2; houseRelayout(); await fr(40); v3GardenSync(true);
    const pl = V3.plates.filter(q=>q.garden!=null).sort((a, b)=>a.garden - b.garden), out = { n:pl.length, txt:pl.map(q=>q.el.textContent), vg:(V3.garden||[]).length, rooms:houseP().rooms.map(o=>o.k), plates:V3.plates.length, interior:G.interior && G.interior.key };
    out.bp = V3.garden.map(B=>!!B.plate); out.inPl = V3.garden.map(B=>V3.plates.includes(B.plate)); out.labels = !!V3.labels; out.fixed = V3.plates.filter(q=>!q.hover && /Garden bed/.test(q.el.textContent)).length;
    if (pl.length < 3) return out;
    /* point at a bed: its plate shows, the others don't */
    const cv = V3.cv, R = cv.getBoundingClientRect(), v = pl[2].obj.position.clone(); v.y += pl[2].y; v.project(V3.cam);
    V3.mxy = { x:(v.x*0.5 + 0.5)*R.width, y:(-v.y*0.5 + 0.5)*R.height + 40 }; await fr(5);
    out.shown = pl.map(q=>q.el.style.display==='block'); out.time = (()=>{ p.clock += 10; v3GardenSync(true); return pl[1].el.textContent; })();
    return out; });
  await page.screenshot({ path:SHOTS + '/rs761_plate.png' });
  console.log(JSON.stringify(r));
  A(r.n===4 && r.fixed===0, 'a plate for each bed, and no fixed label over it: ' + r.n + ' ' + r.fixed);
  A(/Garden bed.*sow a seed/.test(r.txt[0]), 'an empty bed: ' + r.txt[0]);
  A(/^Flax.*sprouting - ready in about .*water it/.test(r.txt[1]), 'what grows, how long, and to water it: ' + r.txt[1]);
  A(/^Silverleaf.*in leaf.*watered/.test(r.txt[2]), 'a watered herb: ' + r.txt[2]);
  A(/^Flax.*ready to pick/.test(r.txt[3]), 'ready to pick: ' + r.txt[3]);
  A(r.shown.filter(Boolean).length===1 && r.shown[2], 'the one you point at shows: ' + JSON.stringify(r.shown));
  A(r.time!==r.txt[1], 'the time counts down: ' + r.time);
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
