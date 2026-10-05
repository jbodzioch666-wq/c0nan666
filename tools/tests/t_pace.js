// RS-119: a fight you can see - one attack per beat however fast you click; a bow or spell stops walking once in range;
// and the bestiary's box shows a model for the undead and for creatures without one of their own
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{
    const A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); }, out = {};
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing');
    for (const k of ['attack','strength','defence','hitpoints']) G.player.skills[k] = SK_XP[60]; rsSync(); G.player.hp = effMaxHp();
    let dx=-1, dy=-1; for (let x=0;x<OW_COLS && dx<0;x++) for (let y=0;y<OW_ROWS;y++) if (G.ow.map[x][y]===OW_DUNGEON){ dx=x; dy=y; break; }
    G.gameMode = 0; G.pendingDungeon = {x:dx, y:dy}; enterDungeonConfirm(); setUi('playing'); renderGame();
    A(ISO_SWING_MS >= 1500, 'the beat is slower: '+ISO_SWING_MS);
    // a monster beside you: clicking it three times in a row is one attack
    const p = G.player, dirs = [[1,0],[-1,0],[0,1],[0,-1]]; const d = dirs.find(([a,b])=>G.map[p.x+a] && G.map[p.x+a][p.y+b]===T_FLOOR); A(d, 'room beside you');
    G.mon = [newMonster()]; const m = G.mon[0]; Object.assign(m, { x:p.x+d[0], y:p.y+d[1], alive:true, hp:9999, maxHp:9999, nm:'giant rat', ac:1 });
    let swings = 0; const md = moveDir; moveDir = function(a, b){ if (G.mon.some(o=>o.alive && o.x===G.player.x+a && o.y===G.player.y+b)) swings++; return md.apply(this, arguments); };
    ISO.swingAt = 0; for (let i=0;i<3;i++) isoAct({ mon:m, gx:m.x, gy:m.y }, false);
    moveDir = md; out.swings = swings; A(swings===1, 'three quick clicks make one attack, not '+swings);
    // a bow: walking up to a far monster stops as soon as it's in range
    let shots = 0; const rr = rangedReachIdx, ra = rangedAttack;
    rangedReachIdx = mm=> mm && mm.alive && Math.abs(mm.x-G.player.x)+Math.abs(mm.y-G.player.y) <= 3 ? G.mon.indexOf(mm) : -1; rangedAttack = ()=>{ shots++; };
    let far = null; for (let x=1;x<COLS-1 && !far;x++) for (let y=1;y<ROWS-1 && !far;y++){ if (G.map[x][y]!==T_FLOOR) continue; const path = isoFindPath(x, y, true); if (path && path.length >= 7 && path.length <= 12 && Math.abs(x-p.x)+Math.abs(y-p.y) >= 7) far = [x,y]; }   /* (far, but near enough to reach in the time the test allows) */
    A(far, 'a far floor tile');
    m.x = far[0]; m.y = far[1]; m.stunTurns = 999; ISO.swingAt = 0;   /* (held where it stands, so it can't charge into melee range) */ isoAct({ mon:m, gx:m.x, gy:m.y }, false);
    let t = performance.now(); for (let i=0;i<40 && !shots;i++){ t += 400; isoTickPath(t); }
    const dist = Math.abs(m.x-G.player.x)+Math.abs(m.y-G.player.y); rangedReachIdx = rr; rangedAttack = ra;
    out.ranged = { dist, shots }; A(shots > 0 && dist >= 2 && dist <= 3, 'stopped in range and shot: '+JSON.stringify(out.ranged));
    // the bestiary box: undead and model-less creatures still get a model
    for (const nm of ['skeleton', 'zombie', 'lich', 'ghost', 'dragon', 'cultist', 'necromancer', 'giant rat']) A(bvPortrait({ nm }), 'a model for '+nm);
    G.player.codexSeen = ['skeleton']; G.bestSel = 'skeleton'; setUi('bestiary'); await new Promise(r=>setTimeout(r, 900));
    A(BV.e && BV.e.holder, 'the skeleton stands in the bestiary box');
    { const sl = document.getElementById('bvSlot').getBoundingClientRect(), cv = BV.r.domElement.getBoundingClientRect();   // (RS-133) the model's canvas fills its box exactly, at any screen density
      A(Math.abs(cv.width - sl.width) < 1 && Math.abs(cv.height - sl.height) < 1 && Math.abs(cv.x - sl.x) < 1, 'the model is drawn inside its box: '+JSON.stringify([sl.width, sl.height, cv.width, cv.height]));
      A(BV.pivot && BV.pivot.children[0]===BV.e.holder, 'and centred on its own bounds'); } setUi('playing');
    return out;
  });
  console.log(JSON.stringify(r));
};
