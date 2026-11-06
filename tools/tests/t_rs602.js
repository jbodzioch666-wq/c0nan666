// RS-602: going down and back up a dungeon's floors leaves nothing behind on the graphics card - each floor's props and the stand-in
// billboard of its warm-up were left there for good (some 60 shapes and a picture a floor)
module.exports = async page=>{
  page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 200)));
  const r = await page.evaluate(async ()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.player.hp = G.player.maxHp = 99999;
    const s = questNearbySites(G.owPos.x, G.owPos.y, 1, 60, ['dungeon'])[0]; G.gameMode = 0; G.pendingDungeon = { x:s.x, y:s.y }; enterDungeonConfirm(); setUi('playing'); G.dungeonMaxDepth = Math.max(G.dungeonMaxDepth, 4);
    const run = async n=>{ for (let i=0;i<n;i++) await new Promise(r=>requestAnimationFrame(r)); }; await run(90);
    const R = FPD.r, mem = []; for (let k=1;k<=8;k++){ saveLevelCache(G.depth); loadLevel(2 + (k%2), k%2===0, false); setUi('playing'); for (const m of G.mon) m.alive = false; await run(80); mem.push([R.info.memory.geometries, R.info.memory.textures]); }
    return { mem }; });
  console.log(JSON.stringify(r));
  const m = r.mem, A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg+' '+JSON.stringify(r)); };
  A(m[7][0] <= m[1][0] + 15, 'no shapes left behind floor after floor: ' + m.map(x=>x[0]));
  A(m[7][1] <= m[1][1] + 2, 'nor pictures: ' + m.map(x=>x[1]));
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
