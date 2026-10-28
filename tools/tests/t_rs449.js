// RS-449: fishing a cave pool, the line runs from the rod's tip to the pool with a float on it (only the rod showed); and a tome shuts
// whenever your weapon is put away
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1;
    const out = {}, fr = async n=>{ for (let i=0;i<n;i++){ renderGame(); await new Promise(r=>setTimeout(r, 30)); } };
    const s = questNearbySites(G.owPos.x, G.owPos.y, 1, 80, ['dungeon'])[0]; G.gameMode = 0; G.pendingDungeon = { x:s.x, y:s.y }; enterDungeonConfirm(); setUi('playing');
    const p = G.player; for (const m of G.mon) m.alive = 0; G.mon = [];
    // a cave pool beside you
    const px = p.x, py = p.y; let at = null; for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]) if (G.map[px+dx][py+dy]===T_FLOOR){ at = [px+dx, py+dy]; break; }
    G.dungeonDeco[at[0]][at[1]] = 'eelpool'; FPD.mapRef = null; await fr(6);
    skP().tools.rod = Math.max(1, skP().tools.rod||0); skP().skills.fishing = SK_XP[60];
    const o = skOptions().find(o=>o.cave==='eelpool'); out.opt = !!o; if (o) skDo(o); await fr(10); await new Promise(r=>setTimeout(r, 1150)); await fr(3);   /* (RS-696: the first cast lands in the pool) */

    const L = ISO.frig && ISO.frig.line, F = ISO.frig && ISO.frig.float; out.line = !!(L && L.visible && F && F.visible);
    if (L){ const a = L.geometry.attributes.position; out.end = [+(a.getX(19) - at[0] - 0.5).toFixed(2), +(a.getZ(19) - at[1] - 0.5).toFixed(2)]; out.rise = +(a.getY(0) - a.getY(19)).toFixed(2); }
    skStop && skStop(); await fr(4); out.after = !(L && L.visible);
    // a tome shuts with the weapon put away
    G.gear.weapon = rsMakeStaff(1); G.gear.offhand = rsMakeArmour('cloth', 3, 'offhand'); rsSync && rsSync();
    const e = m3dInstance({}, rsPlayerLook()), rg = e.rig; e.fight = true; rg.sheathed = true; for (let i=0;i<20;i++) m3dPoseHumanoid(rg, 0.7, 0, 0, 0, 0, e);
    out.tomeShut = rg.tome.getObjectByName('tomeClosed').visible && !rg.tome.getObjectByName('tomeOpen').visible;
    rg.sheathed = false; for (let i=0;i<20;i++) m3dPoseHumanoid(rg, 0.7, 0, 0, 0, 0, e); out.tomeOpen = rg.tome.getObjectByName('tomeOpen').visible;
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.opt && r.line, 'fishing a cave pool, the line and float show');
  A(Math.abs(r.end[0]) < 0.05 && Math.abs(r.end[1]) < 0.05 && r.rise > 0.3, 'the line runs from the rod tip down to the pool');
  A(r.after, 'and goes when you stop');
  A(r.tomeShut && r.tomeOpen, 'the tome shuts with the weapon put away, and opens drawn');
};
