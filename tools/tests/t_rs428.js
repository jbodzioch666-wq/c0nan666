// RS-428: mining swings the pickaxe (and woodcutting the axe) again - the arms were being hung loose over the swing while your weapon
// was put away; and a room's open sides have torch stands, so the near half of a room isn't left dark
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1;
    const out = {}, frames = async n=>{ for (let i=0;i<n;i++){ renderGame(); await new Promise(r=>setTimeout(r, 30)); } };
    G.gear.weapon = rsMakeWeapon(2, 5); rsSync && rsSync(); G.gameMode = 0; G.mon = []; await frames(10);
    for (const [k, tool] of [['mining', 'pick'], ['woodcutting', 'axe']]){
      G.gather = { o:{ k, label:k, at:{ x:G.owPos.x + 1, y:G.owPos.y } }, iv:900000, next:performance.now()+600000, pos:G.owPos.x+','+G.owPos.y, mode:0, n:0 };
      await frames(4); const R = O3.player.e.rig.arms[0]; let lo = 9, hi = -9;
      for (let i=0;i<40;i++){ renderGame(); await new Promise(r=>setTimeout(r, 25)); lo = Math.min(lo, R.sh.rotation.x); hi = Math.max(hi, R.sh.rotation.x); }
      out[k] = { swing:+(hi - lo).toFixed(2), tool:O3.player.e.toolKey, away:!!O3.player.e.rig.sheathed };
      G.gather = null; await frames(3); }
    // the tavern: torch stands by the open sides as well as the sconces on the back and west walls
    const t = townList()[0]; G.owPos = { x:t.x, y:t.y }; trackVisitedTown(t.x, t.y); setUi('playing'); enterVillage(); setUi('playing');
    enterInterior('tavern'); setUi('playing'); await frames(4);
    const east = V3.lamps.filter(l=>l.p && l.p[0] > ROOM.x1 + 0.3).length, front = V3.lamps.filter(l=>l.p && l.p[2] > ROOM.y1 + 0.3).length, walls = V3.lamps.filter(l=>l.sconce).length;
    out.room = { east, front, walls };
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.mining.swing > 0.6 && /pick/.test(r.mining.tool), 'mining swings the pickaxe');
  A(r.woodcutting.swing > 0.6 && /axe/.test(r.woodcutting.tool), 'woodcutting swings the axe');
  A(r.mining.away, 'the weapon stays put away while you work');
  A(r.room.walls >= 5 && r.room.east >= 1 && r.room.front >= 1, 'sconces on the back and west walls, and on posts in the low east and front walls (RS-429)');
};
