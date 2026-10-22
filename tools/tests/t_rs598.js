// RS-598: below ground you turn square on to what you're fighting or working at any angle (a foe on a diagonal, a vein off to the side);
// and a gathering spot's disc glows at its rim only, so a tree's shadow over it isn't lifted into a crescent. Shot: shots/rs598-discs.png
module.exports = async page=>{
  page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 200)));
  const r = await page.evaluate(async ()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.player.hp = G.player.maxHp = 99999; const out = {};
    const run = async n=>{ for (let i=0;i<n;i++){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); } };
    const s = questNearbySites(G.owPos.x, G.owPos.y, 1, 60, ['dungeon'])[0]; G.gameMode = 0; G.pendingDungeon = { x:s.x, y:s.y }; enterDungeonConfirm(); setUi('playing');
    const p = G.player; let spot = null; for (let x=2;x<COLS-2 && !spot;x++) for (let y=2;y<ROWS-2;y++){ let ok = true; for (let i=-1;i<=1;i++) for (let j=-1;j<=1;j++) if (G.map[x+i][y+j]!==T_FLOOR) ok = false; if (ok){ spot = { x, y }; break; } }
    for (const m of G.mon) m.alive = false; p.x = spot.x; p.y = spot.y; p.facing = 2; p.faceDiag = null; await run(30);
    const ang = (tx, ty)=>Math.atan2(tx - (p.x + 0.5), ty - (p.y + 0.5)), diff = (a, b)=>Math.abs(Math.atan2(Math.sin(a - b), Math.cos(a - b)));
    /* a foe on the diagonal */
    const m = G.mon.find(()=>true) || null; if (m){ m.alive = true; m.hp = m.maxHp = 99999; m.x = p.x + 1; m.y = p.y + 1; m.ai = 'idle'; G.foeRef = m; FP.monPos && FP.monPos.delete(m); await run(40);
      out.foe = +diff(ISO.player.face, ang(m.x + 0.5, m.y + 0.5)).toFixed(2); m.alive = false; G.foeRef = null; }
    /* a vein off to one side, at an angle */
    { G.gather = { mode:1, o:{ k:'mining', vein:{ x:p.x - 1, y:p.y + 1 } } }; for (let i=0;i<60;i++){ FP.dt = 1/60; try{ isoSyncPlayer(); }catch(e){} } out.vein = +diff(ISO.player.face, ang(p.x - 0.5, p.y + 1.5)).toFixed(2); G.gather = null; }   /* (a stand-in for the work: posed alone, not through the whole game's frame) */
    /* nothing about: the way you face */
    await run(40); out.free = +diff(ISO.player.face, Math.atan2(FACING_VECT[p.facing][0], FACING_VECT[p.facing][1])).toFixed(2);
    /* the gathering spots' discs: a rim */
    G.gameMode = 0; G.owPos = { x:G.ow.spawnPos.x, y:G.ow.spawnPos.y }; setUi('playing'); G.player.clock = DAY_LENGTH*10 + DAY_LENGTH*0.45; G.weather = 'clear'; O3.dist = 8; await run(150);
    out.rim = !O3.discMat;   /* (RS-635: the discs are gone altogether) */
    return out; });
  await page.screenshot({ path: SHOTS + '/rs598-discs.png' });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.foe!==undefined && r.foe < 0.15, 'square on to a foe on the diagonal: ' + r.foe);
  A(r.vein < 0.15, 'and to a vein off at an angle: ' + r.vein);
  A(r.free < 0.15, 'with nothing about, the way you face: ' + r.free);
  A(r.rim, 'no glowing disc under a gathering spot (RS-635)');
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
