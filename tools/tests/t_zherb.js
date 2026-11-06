// (probe, not in ALL) picking the last cave herb patch on a dungeon floor: every frame and gather tick timed around it
const fs = require('fs');
module.exports = async page=>{
  const txt = process.env.ZSAVE ? fs.readFileSync(process.env.ZSAVE, 'utf8') : null;
  const r = await page.evaluate(async txt=>{ window.__noWarmSlice = false; window.__realSave = true;
    if (txt){ const d = JSON.parse(txt).data; importSaveText(txt); loadGame(d.id); } else { goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); } setUi('playing'); if (!window.__realSave){ saveCurrentGame = ()=>{}; } const sv0 = saveCurrentGame; window.__svT = []; saveCurrentGame = function(){ const t = performance.now(); const r = sv0.apply(this, arguments); window.__svT.push(+(performance.now()-t).toFixed(1)); return r; };
    let dx=-1, dy=-1; for (let x=0;x<OW_COLS && dx<0;x++) for (let y=0;y<OW_ROWS;y++) if (G.ow.map[x][y]===OW_DUNGEON){ dx=x; dy=y; break; }
    G.gameMode = 0; G.owPos = { x:dx, y:dy }; G.pendingDungeon = { x:dx, y:dy }; enterDungeonConfirm(); setUi('playing'); G.dungeonMaxDepth = Math.max(G.dungeonMaxDepth, 4);
    G.dgCache = {}; loadLevel(3, false, false); setUi('playing'); G.mon = []; skP().lv = skP().lv || {}; G.player.skills = G.player.skills || {};
    try{ skGainXP('foraging', 1e6); }catch(e){}
    const p = G.player, D = G.dungeonDeco; let extra = 0; for (let x=1;x<COLS-1 && extra < 8;x++) for (let y=1;y<ROWS-1 && extra < 8;y++) if (G.map[x][y]===T_FLOOR && !D[x][y] && fpHash(x, y, 9) < 0.03){ D[x][y] = ['ore','cavherb','eelpool','essvein'][extra%4]; extra++; } window.__veins = [].concat(...D.map(c=>c.filter(d=>SK_CAVE_DECOS.includes(d)))).length;
    let at = null; for (const [i,j] of [[1,0],[-1,0],[0,1],[0,-1]]) if (!at && G.map[p.x+i][p.y+j]===T_FLOOR && !D[p.x+i][p.y+j]) at = [p.x+i, p.y+j];
    D[at[0]][at[1]] = 'cavherb'; G.veinLeft = G.veinLeft || {}; G.veinLeft[G.dungeonSlot+'/'+G.depth+':'+at[0]+','+at[1]] = 1;
    const frames = []; const fr = async n=>{ for (let i=0;i<n;i++){ const t0 = performance.now(); renderGame(); frames.push(+(performance.now()-t0).toFixed(1)); await new Promise(r=>setTimeout(r, 16)); } };
    await fr(30);
    const o = skOptions().find(o=>o.vein && o.vein.x===at[0] && o.vein.y===at[1]); if (!o) return { noOpt:true, opts:skOptions().map(o=>o.label) };
    skDo(o); const marks = { start:frames.length };
    const T0 = performance.now(); let ticks = [];
    while (G.gather && performance.now() - T0 < 8000){ const t1 = performance.now(); skGatherTick(performance.now() + 2000); ticks.push(+(performance.now()-t1).toFixed(1)); const t2 = performance.now(); renderGame(); frames.push(+(performance.now()-t2).toFixed(1)); await new Promise(r=>setTimeout(r, 16)); }
    marks.done = frames.length; await fr(60);
    const big = frames.map((f,i)=>[i,f]).filter(([i,f])=>f > 40);
    return { veins:window.__veins, warmCard:!!(window.FPD && FPD.cardShown), sv:window.__svT, marks, ticks, deco:D[at[0]][at[1]], big, max:Math.max(...frames), log:(G.log||[]).slice(-4).map(l=>l.msg) };
  }, txt);
  console.log(JSON.stringify(r));
};
