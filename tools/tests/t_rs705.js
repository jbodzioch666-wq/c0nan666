// RS-705: loot on the ground. A drop's beam stands taller the rarer it is (plain short, magic, rare, set, Unique), a rare's sends sparks
// up, and its name floats over it in its rarity's colour (a top roll tagged T1); a magic drop chimes, a rare chimes brighter, once a kill
// for the best of its drops; a salvaged drop shows its name in grey with the gold. The loot filter gains a rarity row (plain and magic
// salvaged by default, a rare kept) and a guard for top rolls; an old filter loads with both
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const r = await page.evaluate(async ()=>{ const wait = ms=>new Promise(res=>setTimeout(res, ms)), fr = ()=>new Promise(res=>requestAnimationFrame(res));
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    G.gameMode = 0; randomEncounter(false); setUi('playing');
    const P = G.player, out = {}; P.hp = P.maxHp = 9999; G.mon = []; for (let i=0;i<30;i++){ renderGame(); await wait(30); }
    const sounds = [], sfx0 = sfx; sfx = n=>{ sounds.push(n); sfx0(n); };
    const mk = q=>{ const it = rsMakeArmour('metal', 3, 'chest'); if (q===1 || q===2) afDress(it, 60, q); return it; };
    /* one drop of each rarity, each on its own tile */
    const plain = mk(0), magic = mk(1), rare = mk(2), set = mk(0), uniq = rsMakeArmour('metal', 3, 'head'); uniq.quality = 4; uniq.nm = 'Test Unique Helm'; set.quality = 3; set.nm = 'Test Set Body';
    const F = lootfP(); F.on = false; G.inv = []; ISO.beams = [];
    [plain, magic, rare, set, uniq].forEach((it, i)=>{ G.dropAt = { x:P.x - 2 + i, y:P.y + 2 }; addToInventory(it); }); G.dropAt = null;
    await wait(20); out.sounds1 = sounds.slice(); sounds.length = 0;
    const parts0 = FP.parts.length; let sparks = 0; for (let i=0;i<40;i++){ renderGame(); await fr(); sparks = Math.max(sparks, FP.parts.filter(p=>p.add && p.vx===0 && p.vy===0 && p.z > 0.05).length); }
    const fx = ISO.fx, hs = ISO.beams.map(b=>{ const o = fx.beams.get(b); return o ? +o.sh.scale.y.toFixed(2) : null; });
    out.beams = { n:ISO.beams.length, hs, nm:ISO.beams.map(b=>b.nm===[plain, magic, rare, set, uniq][ISO.beams.indexOf(b)].nm), col:ISO.beams.map(b=>b.col), sparks };
    /* the labels: a plate per drop in its colour, drawn over the beam */
    const pl = ISO.beams.map(b=>b.plate); out.plates = pl.map(c=>!!c && c.width > 40 && c.height > 12);
    { const c = pl[2], x = c.getContext('2d'), d = x.getImageData(0, 0, c.width, c.height).data; let near = 0; for (let i=0;i<d.length;i+=4) if (d[i] > 140 && d[i+1] > 130 && d[i+2] < d[i] - 50) near++;   /* (yellow ink) */ out.rareInk = near; }
    /* a top roll is tagged */
    { const it = mk(2); it.aff[0].t = 1; out.top = lootTopRoll(it) && !lootTopRoll(mk(0)); ISO.beams = []; G.dropAt = { x:P.x, y:P.y + 1 }; addToInventory(it); G.dropAt = null; out.topBeam = ISO.beams[0] && ISO.beams[0].top; }
    /* one chime a kill: two magic drops and a rare -> the rare's chime once */
    await wait(20); sounds.length = 0; G.dropAt = { x:P.x, y:P.y + 1 }; addToInventory(mk(1)); addToInventory(mk(2)); addToInventory(mk(1)); G.dropAt = null; await wait(20); out.sounds2 = sounds.filter(n=>/^drop/.test(n));
    sounds.length = 0; G.dropAt = { x:P.x, y:P.y + 1 }; addToInventory(mk(1)); G.dropAt = null; await wait(20); out.sounds3 = sounds.filter(n=>/^drop/.test(n));
    sounds.length = 0; addToInventory(mk(2)); await wait(20); out.sounds4 = sounds.filter(n=>/^drop/.test(n));   /* (not from a kill: no chime) */
    /* the filter: plain and magic salvaged by default, a rare kept; the gold shows on the ground */
    { const d = JSON.parse(JSON.stringify(P.lootf)); delete d.rar; delete d.keepT; P.lootf = d; const F2 = lootfP(); out.oldDef = { rar:F2.rar.join(), keepT:F2.keepT };
      const keepArrow = lootArrow; lootArrow = ()=>''; Object.assign(F2, { on:true, tiers:[0,1,2,3,4,5,6], stats:[] });
      out.why = [mk(0), mk(1), mk(2)].map(it=>lootfWhy(it, F2)).join();
      F2.rar = [0,1,2]; out.whyAll = lootfWhy(mk(2), F2); F2.rar = [0,1];
      const t1 = mk(1); t1.aff[0].t = 1; const t3 = mk(1); t3.aff.forEach(a=>a.t = Math.max(3, a.t)); F2.keepT = 2; out.whyTop = [lootfWhy(t1, F2), lootfWhy(t3, F2)].join(); F2.keepT = 0;
      ISO.beams = []; G.inv = []; const g0 = P.gold; G.dropAt = { x:P.x, y:P.y + 1 }; addToInventory(mk(0)); G.dropAt = null; const b = ISO.beams[0];
      out.salv = { taken:G.inv.length===0 && P.gold > g0, label:!!b && b.salv===P.gold - g0 && !!b.nm };
      for (let i=0;i<4;i++){ renderGame(); await fr(); } out.salv.noBeam = !!b && !fx.beams.get(b); out.salv.plate = !!(b && b.plate);
      /* the menu */
      setUi('lootfilter'); const ov = document.getElementById('overlay'); out.menu = { rarity:/RARITY/.test(ov.textContent), top:/TOP ROLLS/.test(ov.textContent) };
      [...ov.querySelectorAll('.lf-chip')].find(c=>c.textContent.trim()==='rare').click(); out.menu.rareOn = F2.rar.includes(2);
      [...document.querySelectorAll('#overlay .lf-chip')].find(c=>c.textContent.trim()==='keep T1').click(); out.menu.keepT = F2.keepT;
      G.inv = [mk(0)]; F2.rar = [1]; setUi('lootfilter'); out.menu.why = /of a rarity not picked/.test(document.querySelector('#overlay .lf-sum').textContent);
      F2.on = false; lootArrow = keepArrow; setUi('playing'); }
    /* a bow's rare has its three bonuses, and a bow can roll a suffix */
    { let short = 0, suf = 0; for (let i=0;i<400;i++){ const b = rsMakeBow(3, false); afDress(b, 60, 2); const n = b.aff.filter(q=>!q.imp).length; if (n < 3) short++; if (b.aff.some(q=>AFFIX_FAM[q.fam] && !AFFIX_FAM[q.fam].pre)) suf++; } out.bow = { short, suf }; }
    sfx = sfx0; return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: ' + m + ' ' + JSON.stringify(r)); };
  const h = r.beams.hs;
  A(r.beams.n===5 && h.every(x=>x > 0) && h[0] < h[1] && h[1] < h[2] && h[2] < h[3] && h[3] < h[4] && r.beams.nm.every(Boolean), 'a beam for each drop, taller the rarer: ' + h);
  A(r.beams.sparks >= 1, 'a rare drop sends sparks up its beam');
  A(r.plates.every(Boolean) && r.rareInk > 20, 'each drop\'s name on a plate, a rare\'s in its yellow');
  A(r.top && r.topBeam, 'a top roll is tagged T1 on the ground');
  A(r.sounds1.filter(n=>/^drop/.test(n)).join()==='dropRare' && r.sounds2.join()==='dropRare' && r.sounds3.join()==='dropMagic' && !r.sounds4.length, 'one chime a kill, for its best drop: rare, rare, magic; none off a kill: ' + [r.sounds1, r.sounds2, r.sounds3, r.sounds4].join(' | '));
  A(r.oldDef.rar==='0,1' && r.oldDef.keepT===0, 'an old filter loads salvaging plain and magic, top rolls off');
  A(r.why==='match,match,rarity' && r.whyAll==='match' && r.whyTop==='toproll,match', 'the rarity row and the top-roll guard: ' + r.why + ' / ' + r.whyTop);
  A(r.salv.taken && r.salv.label && r.salv.noBeam && r.salv.plate, 'a salvaged drop shows its name and the gold, no beam');
  A(r.menu.rarity && r.menu.top && r.menu.rareOn && r.menu.keepT===1 && r.menu.why, 'the menu\'s rarity and top-roll rows work, and say what they keep');
  A(r.bow.short===0 && r.bow.suf > 100, 'a bow rare has three bonuses at the least, and bows roll suffixes: ' + JSON.stringify(r.bow));
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
