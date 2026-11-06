// RS-420: your raised dead (and a siege's defenders) find their way round walls to the foe, and a skeleton archer shoots only what it
// can see; you pick which of the dead to raise and from which bones; monsters step and strike on the diagonal (round no wall's corner),
// and so do you; and the skills menu's XP tracker switch - auto follows what you train, manual shows your ticks
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1;
    let dx=-1, dy=-1; for (let x=0;x<OW_COLS && dx<0;x++) for (let y=0;y<OW_ROWS;y++) if (G.ow.map[x][y]===OW_DUNGEON){ dx=x; dy=y; break; }
    G.gameMode = 0; G.owPos = { x:dx, y:dy }; G.pendingDungeon = { x:dx, y:dy }; enterDungeonConfirm(); setUi('playing');
    const p = G.player, out = {}; p.hp = p.maxHp = 99999;
    // a room split by a wall, the way round at its foot
    const room = ()=>{ G.map = makeGrid(T_WALL); for (let x=2;x<=12;x++) for (let y=2;y<=8;y++) G.map[x][y] = T_FLOOR; for (let y=2;y<=7;y++) G.map[7][y] = T_WALL;
      for (const c of G.dungeonDeco) c.fill(''); G.mon = []; };
    const foe = (x, y)=>{ const m = newMonster(); Object.assign(m, { alive:1, x, y, hp:500, maxHp:500, ac:1, atkBonus:0, dmg1:1, dmg2:1, xp:1, sym:'o', nm:'orc', col:'#8f8', art:null, abilities:[] }); G.mon.push(m); return m; };
    // a skeleton on one side, an orc on the other
    room(); p.x = 2; p.y = 2; const o1 = foe(9, 4); p.minions = [{ k:'skeleton', nm:'your skeleton', atkBonus:40, dmg1:1, dmg2:2, turnsLeft:99, reach:1, x:5, y:4 }];
    let inWall = 0; for (let t=0;t<12;t++){ necroTick(); const m = p.minions[0]; if (m && G.map[m.x][m.y]===T_WALL) inWall++; }
    out.melee = { hurt:o1.hp < 500, inWall, at:p.minions[0] && [p.minions[0].x, p.minions[0].y] };
    // an archer: no shot through the wall; it goes round for a clear one
    room(); const o2 = foe(9, 4); p.minions = [{ k:'archer', nm:'your skeleton archer', atkBonus:40, dmg1:1, dmg2:2, turnsLeft:99, reach:4, x:5, y:4 }];
    necroTick(); out.archer1 = { hurt:o2.hp < 500, moved:p.minions[0].x!==5 || p.minions[0].y!==4 };
    for (let t=0;t<10;t++) necroTick(); out.archer = { hurt:o2.hp < 500 };
    // the picker: a zombie, from big bones
    p.skills.necromancy = SK_XP[20]; skAdd('bones', 3); skAdd('bigbones', 2); p.minions = []; room(); p.x = 3; p.y = 3; setUi('playing'); G.gameMode = 1;
    G.gear.chest = rsMakeArmour('cloth', 0, 'chest'); /* (RS-742) the dead answer a robed caller */  necroPickSet('k', 'zombie'); necroPickSet('bone', 'bigbones'); necroRaise();
    out.pick = { k:p.minions[0] && p.minions[0].k, big:skHave('bigbones'), plain:skHave('bones'), panel:!!document.getElementById('necroPanel') };
    // a monster on the diagonal strikes; behind a wall's corner it can't
    room(); p.minions = []; p.x = 4; p.y = 4; const o3 = foe(5, 5); let strikes = 0; const ms0 = monsterStrikesPlayer; monsterStrikesPlayer = (...a)=>{ strikes++; };
    tickMonsters(); out.diag = { strikes, pos:[o3.x, o3.y] };
    room(); G.map[5][4] = T_WALL; G.map[4][5] = T_WALL; p.x = 4; p.y = 4; const o4 = foe(5, 5); strikes = 0; tickMonsters(); out.corner = { strikes };
    monsterStrikesPlayer = ms0;
    // and you strike on the diagonal
    room(); p.x = 4; p.y = 4; const o5 = foe(5, 5); let hits = 0; const f0 = fight; fight = (...a)=>{ hits++; }; tryMove(1, 1); fight = f0; out.you = { hits };
    // RS-421: with nothing to fight, a minion comes back to you - round the wall
    room(); p.x = 3; p.y = 3; p.minions = [{ k:'skeleton', nm:'your skeleton', atkBonus:4, dmg1:1, dmg2:2, turnsLeft:99, reach:1, x:11, y:3 }]; let fWall = 0;
    for (let t=0;t<12;t++){ necroTick(); const m = p.minions[0]; if (G.map[m.x][m.y]===T_WALL) fWall++; }
    out.follow = { at:[p.minions[0].x, p.minions[0].y], near:Math.max(Math.abs(p.minions[0].x-3), Math.abs(p.minions[0].y-3)), fWall };
    // the XP tracker's switch
    xptSetAuto(false); const man = Array.isArray(p.xpPick); xptSetAuto(true); const auto = p.xpPick===null; setUi('skills'); const btn = /XP tracker: auto/.test(document.getElementById('overlay') ? document.getElementById('overlay').innerHTML : buildSkills()) || /XP tracker: auto/.test(buildSkills());
    out.xpt = { man, auto, btn };
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.melee.hurt && r.melee.inWall===0, 'the skeleton goes round the wall and strikes the orc behind it');
  A(!r.archer1.hurt && r.archer1.moved, 'the archer doesn\'t shoot through the wall - it moves for a clear shot');
  A(r.archer.hurt, 'and then it shoots');
  A(r.pick.k==='zombie' && r.pick.big===1 && r.pick.plain===3, 'you raise the minion you picked, from the bones you picked');
  A(r.diag.strikes===1, 'a monster on the diagonal strikes you');
  A(r.corner.strikes===0, 'but not round a wall\'s corner');
  A(r.you.hits===1, 'you strike on the diagonal too');
  A(r.follow.near <= 2 && r.follow.fWall===0, 'with nothing to fight, the minion follows you round the wall (RS-421)');
  A(r.xpt.man && r.xpt.auto && r.xpt.btn, 'the XP tracker switch: manual, then auto, in the skills menu');
};
