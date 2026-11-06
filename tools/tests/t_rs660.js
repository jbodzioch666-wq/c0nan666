// RS-660: the last town hitches. (1) A town's point lights are padded to a floor of ten from the start (V3.lightFloor, gfxPadLights), so a
// room with more lights than the town had (the tavern's nine) keys the same programs: its first entry used to rebuild every one (38 programs,
// ~16ms of shader source in the frame). (2) The robe's shaping (m3dRobeShape, 7-9ms that can't be split) yields to the next try when the
// sculpt's budget is spent, instead of running on at the end of a full slice
module.exports = async page=>{
  page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 200)));
  const r = await page.evaluate(async ()=>{ window.__noWarmSlice = false; goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.player.hp = G.player.maxHp = 99999;
    const fr = n=>new Promise(res=>{ let i = 0; const f = ()=>{ renderGame(); ++i >= n ? res() : requestAnimationFrame(f); }; requestAnimationFrame(f); });
    const settle = async ()=>{ const t0 = performance.now(); while (performance.now() - t0 < 30000){ await fr(1); if (!V3.warmWait && !V3.prelink && !V3.peopleQ && performance.now() - t0 > 1500) break; } };
    const out = {};
    /* (1) the town padded to the floor; the tavern, with the most lights, keys the town's programs */
    { const t = G.ow.spawnPos; G.gameMode = 0; G.owPos = { x:t.x, y:t.y }; enterVillage(); setUi('playing'); await settle();
      const lights = sc=>{ let pt = 0, pad = 0; sc.traverse(o=>{ if (o.isPointLight){ if (o.userData && o.userData.padL){ if (o.visible) pad++; } else if (o.visible) pt++; } }); return { pt, pad }; };
      const R = V3.renderer, town = lights(V3.scene), ceil0 = V3.lightCeil, n0 = R.info.programs.length;
      enterInterior('tavern'); setUi('playing'); await settle(); const room = lights(V3.scene), n1 = R.info.programs.length;
      out.pad = { floor:V3.lightFloor, ceil0, ceil1:V3.lightCeil, town, room, progs0:n0, progs1:n1, made:n1 - n0 }; exitInterior(); setUi('playing'); await settle(); }
    /* (2) the robe: its sculpts made, the builder run again with the budget spent and sculpting counted yields before it; with no budget it runs */
    { const look = HUM({ outfit:'robe', cloth:'#1a3a2a', trim:'#d8b050', hair:'#2a1a10', beard:'#2a1a10', seed:9 });   /* (a robed figure, the banker's look: the skirt extends to the top, m3dRobeShape runs) */
      const rs0 = window.m3dRobeShape; let called = 0; window.m3dRobeShape = function(){ called++; return rs0.apply(this, arguments); };
      M3D.tpl.delete(m3dTplKey(look)); const whole = m3dTemplate(look), wholeCalls = called;   /* (built whole: every sculpt of it cached now) */
      const run = (budget, n)=>{ called = 0; M3D_BUDGET = budget; M3D.sculptN = n; let threw = null; try{ m3dBuilders().get(look.paint)(look.o||{}); }catch(e){ threw = e===M3D_YIELD ? 'yield' : String(e).slice(0, 80); } finally { M3D_BUDGET = 0; } return { called, threw }; };
      const spent = run(performance.now() - 1, 3), first = run(performance.now() - 1, 0), free = run(performance.now() + 50, 3), none = run(0, 3);
      window.m3dRobeShape = rs0; out.robe = { whole:!!whole, wholeCalls, spent, first, free, none }; }
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.pad.floor===10 && r.pad.ceil0 >= 10 && r.pad.town.pt + r.pad.town.pad===r.pad.ceil0, 'the town is padded to the floor of ten: ' + JSON.stringify(r.pad));
  A(r.pad.ceil1===r.pad.ceil0 && r.pad.room.pt + r.pad.room.pad===r.pad.ceil0 && r.pad.room.pt <= 10, 'the tavern keeps the count: ' + JSON.stringify(r.pad));
  A(r.pad.made <= 10, 'its first entry makes few programs, not every one: ' + JSON.stringify(r.pad));
  A(r.robe.whole && r.robe.wholeCalls===1 && r.robe.none.called===1 && !r.robe.none.threw, 'built whole, the robe is shaped within the build: ' + JSON.stringify(r.robe));
  A(r.robe.spent.called===0 && r.robe.spent.threw==='yield', 'with the budget spent after sculpting, the builder yields before the robe: ' + JSON.stringify(r.robe));
  A(r.robe.first.called===1 && !r.robe.first.threw && r.robe.free.called===1 && !r.robe.free.threw, 'first in its try, or with time left, it runs: ' + JSON.stringify(r.robe));
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
