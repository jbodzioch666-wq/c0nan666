// RS-767: a monster's spells are yours. A skeleton mage (and any spellcaster or caster) casts the best strike, bolt, blast, wave or
// surge its level would let you cast, as far as you can cast (8 tiles - it reached 4), and the bolt is seen to fly, in its element's colour
// (a goblin shaman calls its kin first, then casts)
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
  const r = await page.evaluate(async ()=>{ const out = {}, fr = async n=>{ for (let i=0;i<n;i++){ renderGame(); await new Promise(r=>setTimeout(r, 30)); } };
    goToCharCreate(); ccBegin(); wgRegenerate(12345); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; weatherSync = ()=>{};
    G.player.wildWarned = 1; G.player.hp = G.player.maxHp = 99999; G.player.clock = DAY_LENGTH*0.45;
    const m0 = G.ow.map; let c = null; for (let x=0;x<OW_COLS && !c;x++) for (let y=0;y<OW_ROWS;y++) if (m0[x][y]===OW_DUNGEON && !owSeaSite(x, y)){ c = { x, y }; break; }
    let spot = null; for (let tr=0; tr<12 && !spot; tr++){ G.gameMode = 0; G.pendingDungeon = { x:c.x, y:c.y }; enterDungeonConfirm(); setUi('playing'); G.mon.forEach(mo=>mo.alive = false); await fr(10);
    /* a straight open run of 8 tiles */
    for (let x=1;x<COLS-9 && !spot;x++) for (let y=1;y<ROWS-1;y++){ let ok = true; for (let k=0;k<=8;k++) if (G.map[x+k][y]!==T_FLOOR || dgOpaque(x+k, y)){ ok = false; break; } if (ok && shotClear(x, y, x+8, y)){ spot = { x, y }; break; } }
     if (!spot){ G.gameMode = 0; setUi('playing'); } }
    const p = G.player; p.x = spot.x; p.y = spot.y;
    const shots = [], logs = []; const ol = logMsg; logMsg = (t, k)=>{ logs.push(t); return ol(t, k); };
    for (const [fam, idx, d] of (window.__order || [['skeleton', 3, 7], ['skeleton', 3, 8], ['goblin', 3, 6]])){
      G.mon.forEach(mo=>mo.alive = false); const m = Object.assign(newMonster(), famEntry(fam, idx)); m.alive = 1; m.hp = m.maxHp = 400; m.x = p.x + d; m.y = p.y; m.engaged = true; G.mon.push(m);
      ISO.shots = []; logs.length = 0; p.hp = p.maxHp = 99999; G.gameOver = 0; for (let k=0;k<6 && !(ISO.shots||[]).some(s=>s.kind==='spell');k++){ tickMonsters(); foeFlush && foeFlush(); }
      const sh = (ISO.shots||[]).find(s=>s.kind==='spell'), sp = monSpell(m);
      shots.push({ nm:m.nm, d, cb:monCombatLevel(m), spell:sp[1], lvl:sp[2], moved:m.x!==p.x + d, shot:sh ? { elem:sh.elem, tier:sh.tier } : null, said:logs.some(t=>t.includes(sp[1])) }); }
    logMsg = ol; G.gameMode = 0; setUi('playing'); return { shots, spells:RS_SPELLS.map(s=>s[1]) }; });
  console.log(JSON.stringify(r.shots));
  for (const s of r.shots){
    A(s.shot && ['air', 'water', 'earth', 'fire'].includes(s.shot.elem) && s.said, s.nm + ' casts one of your spells at ' + s.d + ' tiles, seen and named: ' + JSON.stringify(s));
    A(s.lvl <= s.cb && r.spells.includes(s.spell), s.nm + ': a spell its level allows: ' + JSON.stringify(s)); }
  A(r.shots[0].lvl >= 35, 'a level-55 skeleton mage casts a bolt or a blast: ' + r.shots[0].spell);
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
