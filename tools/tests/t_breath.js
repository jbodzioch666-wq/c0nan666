// RS-267: a dragon's breath shows: it rears back and a cone of its element (fire, frost, acid, lightning...) pours from its jaws
// onto you, landing in a burst; its jaws open wide as it breathes
module.exports = async page=>{
  const shots = process.env.BREATH_SHOTS;
  const r = await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing');
    let dx=-1, dy=-1; for (let x=0;x<OW_COLS && dx<0;x++) for (let y=0;y<OW_ROWS;y++) if (G.ow.map[x][y]===OW_DUNGEON){ dx=x; dy=y; break; }
    G.gameMode = 0; G.pendingDungeon = { x:dx, y:dy }; enterDungeonConfirm(); setUi('playing');
    for (let i=0;i<6;i++){ renderGame(); await new Promise(r=>setTimeout(r, 50)); }
    const p = G.player; p.hp = p.maxHp = 99999;
    G.mon.forEach(m=>{ if (m.alive) m.alive = 0; });
    // a dragon two tiles off, in the open
    let spot = null; for (const [ox, oy] of [[2,0],[-2,0],[0,2],[0,-2],[2,1],[1,2]]){ const x = p.x + ox, y = p.y + oy; if (G.map[x] && G.map[x][y]!==undefined && G.map[x][y]!==1 && shotClear(x, y, p.x, p.y)){ spot = [x, y]; break; } }
    const m = newMonster(); G.mon.push(m);
    Object.assign(m, { alive:1, nm:'ancient dragon', x:spot[0], y:spot[1], hp:400, maxHp:400, abilities:['breath'], cb:120, ac:10, atkBonus:5, dmg1:1, dmg2:4, breathCharged:undefined, engaged:true });
    for (let i=0;i<10;i++){ renderGame(); await new Promise(r=>setTimeout(r, 40)); }
    G.bossIdx = -1; m.raidBoss = false; m.frightfulUsed = true; const hp0 = p.hp; tickMonsters();
    const out = { dist:Math.abs(m.x-p.x)+Math.abs(m.y-p.y), clear:shotClear(m.x,m.y,p.x,p.y), role:monAi(m).role, hurt:p.hp < hp0, breathT:!!m._breathT, shot:(ISO.shots||[]).some(s=>s.kind==='breath'), elem:((ISO.shots||[]).find(s=>s.kind==='breath')||{}).elem };
    // its jaws gape as it breathes
    const e = M3D.inst.get(m); let jaw = [];
    for (let i=0;i<40;i++){ renderGame(); await new Promise(r=>setTimeout(r, 30)); if (e) jaw.push(e.rig.jaw.rotation.x); if (i===14) window.__mid = true; }
    out.jawMax = e ? +Math.max(...jaw).toFixed(2) : null; out.gone = !(ISO.shots||[]).some(s=>s.kind==='breath');
    return out; });
  const A = (c, m)=>{ if (!c) throw new Error(m+' :: '+JSON.stringify(r)); };
  A(r.hurt && r.breathT && r.shot && r.elem==='fire', 'the dragon breathes fire at you');
  A(r.jawMax > 0.5, 'its jaws open wide');
  A(r.gone, 'the breath passes');
  console.log('breath ok', JSON.stringify(r));
};
