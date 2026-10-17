// RS-321: a resurrected thrall stands beside you as a real 3D figure - a ghost (lesser), a skeleton (superior) or a zombie
// (greater) - keeps a free tile next to you, and swings at the foe it strikes
module.exports = async page=>{
  await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    let dx=-1, dy=-1; for (let x=0;x<OW_COLS && dx<0;x++) for (let y=0;y<OW_ROWS;y++) if (G.ow.map[x][y]===OW_DUNGEON){ dx=x; dy=y; break; }
    G.gameMode = 0; G.pendingDungeon = { x:dx, y:dy }; enterDungeonConfirm(); setUi('playing'); G.mon = [];
    skGainXP('magic', 5e6); for (const r of ['air','mind','chaos','soul','fire','blood']) skAdd('r_'+r, 500); rsSwitchBook('arceuus');
    for (let x=1;x<COLS-1;x++) for (let y=1;y<ROWS-1;y++) G.dungeonSeen[x][y] = true; });
  const out = {};
  for (const [id, want] of [['lesserthrall','ghost'], ['supthrall','skeleton'], ['grthrall','zombie']]){
    out[id] = await page.evaluate(async ([id, want])=>{
      const P = G.player; P.thrall = null; G.mon = []; rsCastFromBook(id); while (foePending()) foeFlush();
      for (let i=0;i<30;i++){ renderGame(); await new Promise(r=>setTimeout(r, 30)); }
      const t = P.thrall, px = t && THRALL_PX.get(t), e = px && (M3D.inst.get(px) || (typeof SK3!=='undefined' && SK3.inst && SK3.inst.get && SK3.inst.get(px)));
      return { up:!!t, kind:t && THRALL_KIND(t.nm), want, beside:t && Math.max(Math.abs(t.x-P.x), Math.abs(t.y-P.y))===1, model:!!(e && e.holder && e.holder.parent), cam:[P.x, P.y] }; }, [id, want]);
    await page.screenshot({ path:'/tmp/claude-0/-home-user-c0nan666/3bb54428-39f0-502a-8d60-2c5df0a710a2/scratchpad/thrall-'+want+'.png' });
  }
  // it strikes a foe in reach, and its figure swings
  out.hit = await page.evaluate(async ()=>{ const P = G.player, t = P.thrall;
    const spot = [[2,0],[0,2],[-2,0],[0,-2]].map(([a,b])=>[P.x+a, P.y+b]).find(([x,y])=>G.map[x] && G.map[x][y]!==T_WALL && !(x===t.x && y===t.y));
    const m = { nm:'goblin', x:spot[0], y:spot[1], hp:500, maxHp:500, alive:true, awake:true, ac:10, atkBonus:0, dmg1:1, dmg2:1, cb:5, lvl:2 }; G.mon = [m];
    const hp0 = m.hp; rsThrallAct(); return { hurt:m.hp < hp0, swing:!!t._atkT, faces:thrallProxy(t).faceAt===m }; });
  console.log(JSON.stringify(out));
  for (const k of ['lesserthrall','supthrall','grthrall']){ const o = out[k];
    if (!o.up || o.kind!==o.want || !o.beside) throw new Error(k+' rises beside you as a '+o.want+' '+JSON.stringify(o));
    if (!o.model) throw new Error(k+' is a 3D figure in the scene '+JSON.stringify(o)); }
  if (!out.hit.hurt || !out.hit.swing || !out.hit.faces) throw new Error('the thrall strikes the foe and swings at it '+JSON.stringify(out.hit));
};
