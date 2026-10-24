// RS-646: nothing builds up on the graphics card over a session. Each creature's bones' texture was left on the card when its model went;
// the models made ahead for a floor and never seen were kept; a figure's own copy of a shape it bends went with nothing; every look of every
// creature was a template kept for the session; and a portal's glow went with no floor. Over rounds into the same dungeon (three floors, its
// monsters killed) and out, the dungeon's renderer now holds as many textures and shapes in the last round as in the second; the templates
// kept stay at their cap; a released model's bones are freed
module.exports = async page=>{
  page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  await page.evaluate(async ()=>{ goToCharCreate(); ccBegin(); setWorldSizeTier('planet'); confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.gameMode = 0; G.interior = null;
    for (const k of ['attack','strength','defence','hitpoints']) G.player.skills[k] = SK_XP[70]; rsSync(); for (let i=0;i<60;i++) await new Promise(r=>requestAnimationFrame(r)); });
  const rows = [];
  for (let k=0; k<6; k++) rows.push(await page.evaluate(async k=>{ const fr = n=>new Promise(res=>{ let i = 0; const f = ()=>++i >= n ? res() : requestAnimationFrame(f); requestAnimationFrame(f); });
    if (!window.__lk){ let dx = -1, dy = -1, bd = 1e9; const sp = G.owPos; for (let x=0;x<OW_COLS;x++) for (let y=0;y<OW_ROWS;y++) if (G.ow.map[x][y]===OW_DUNGEON){ const d = Math.hypot(x - sp.x, y - sp.y); if (d < bd){ bd = d; dx = x; dy = y; } } window.__lk = { x:dx, y:dy }; }
    const D = window.__lk; G.owPos = { x:D.x, y:D.y }; G.pendingDungeon = { x:D.x, y:D.y }; enterDungeonConfirm(); setUi('playing'); G.player.hp = G.player.maxHp = 99999;
    for (let d=1; d<=3; d++){ if (d > 1) loadLevel(d, false); setUi('playing'); await fr(50);
      const fl = []; for (let x=1;x<COLS-1;x++) for (let y=1;y<ROWS-1;y++) if (G.map[x][y]===T_FLOOR) fl.push([x, y]);
      for (let w=0; w<3; w++){ const [x, y] = fl[(k*7 + d*13 + w*31) % fl.length]; ISO.path = isoFindPath(x, y, false) || []; ISO.nextStep = 0; await fr(40); }
      for (let i=0;i<G.mon.length;i++) if (G.mon[i].alive) try{ monsterDies(i); }catch(e){} await fr(20); }
    const m = FPD.r.info.memory, out = { k, tex:m.textures, geo:m.geometries, progs:FPD.r.info.programs.length, tpl:M3D.tpl.size };
    dgFinish(true); setUi('playing'); await fr(60); return out; }, k));
  /* a model shown and let go: its bones' texture goes with it */
  const bones = await page.evaluate(async ()=>{ const fr = n=>new Promise(res=>{ let i = 0; const f = ()=>++i >= n ? res() : requestAnimationFrame(f); requestAnimationFrame(f); });
    const D = window.__lk; G.owPos = { x:D.x, y:D.y }; G.pendingDungeon = { x:D.x, y:D.y }; enterDungeonConfirm(); setUi('playing'); await fr(40);
    const m = { nm:'goblin', cb:10, hp:5, x:0, y:0, alive:true }, pt = m3dPortrait(m); if (!pt) return { none:true };
    let e = null; for (let i=0;i<40 && !e;i++){ try{ e = m3dInstance(m, pt); }catch(err){} if (!e) await fr(2); } if (!e) return { none:true };
    e.holder.traverse(o=>{ o.frustumCulled = false; }); if (ISO.player && ISO.player.pos) e.holder.position.set(ISO.player.pos.x + 0.5, 0, ISO.player.pos.y + 0.5); FPD.scene.add(e.holder); await fr(8); const sks = []; e.holder.traverse(o=>{ if (o.isSkinnedMesh && o.skeleton) sks.push(o.skeleton); });
    const had = sks.filter(s=>s.boneTexture).length; FPD.scene.remove(e.holder); m3dRelease(e);
    return { skinned:sks.length, had, left:sks.filter(s=>s.boneTexture).length, cap:m3dTplCap(), tpl:M3D.tpl.size }; });
  const r = { rows, bones }; console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  const a = rows[1], b = rows[rows.length - 1];
  A(b.tex - a.tex <= 4, 'the dungeon\'s renderer holds no more textures in the last round than in the second (they grew some 10 a round)');
  A(b.geo - a.geo <= 60, 'nor more shapes (they grew some 20 a round)');
  A(rows.every(x=>x.tpl <= m3dCapGuess(x)), 'the templates kept stay at their cap');
  function m3dCapGuess(x){ return 32 + 6; }
  if (!bones.none) A(bones.skinned > 0 && bones.had > 0 && bones.left===0, 'a released model\'s bones\' texture goes with it');
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
