// RS-771: a wizard out of runes fights with the staff. Click a foe 4 tiles off with the Mage kit and an empty rune pouch: you walk up and
// bash it (a melee blow, Attack xp), told once - 'out of runes - you fight with your staff' and its pop-up - not a red 'no runes' every
// swing. With runes again the staff casts; out again, you're told again
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
  const r = await page.evaluate(async ()=>{ const fr = async n=>{ for (let i=0;i<n;i++){ renderGame(); await new Promise(r=>setTimeout(r, 30)); } };
    goToCharCreate(); ccBegin(); wgRegenerate(12345); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; weatherSync = ()=>{};
    G.player.wildWarned = 1;
    const m0 = G.ow.map; let c = null; for (let x=0;x<OW_COLS && !c;x++) for (let y=0;y<OW_ROWS;y++) if (m0[x][y]===OW_DUNGEON && !owSeaSite(x, y)){ c = { x, y }; break; }
    let spot = null; for (let tr=0; tr<12 && !spot; tr++){ G.gameMode = 0; G.pendingDungeon = { x:c.x, y:c.y }; enterDungeonConfirm(); setUi('playing'); G.mon.forEach(mo=>mo.alive = false); await fr(5);
      for (let x=1;x<COLS-9 && !spot;x++) for (let y=1;y<ROWS-1;y++){ let ok = true; for (let k=0;k<=6;k++) if (G.map[x+k][y]!==T_FLOOR){ ok = false; break; } if (ok){ spot = { x, y }; break; } } }
    const p = G.player; p.x = spot.x; p.y = spot.y;
    rsApplyKit(RS_KITS.findIndex(k=>k.nm==='Mage')); const bag = skP().bag, runes = {}; for (const k of Object.keys(bag)) if (k.startsWith('r_')){ runes[k] = bag[k]; delete bag[k]; }
    const logs = [], toasts = []; const ol = logMsg, on = notify; logMsg = (t, k)=>{ logs.push(String(t)); return ol(t, k); }; notify = (t, k, s)=>{ toasts.push(String(t)); return on(t, k, s); };
    const out = { staff:G.gear.weapon && G.gear.weapon.nm, auto:rsAutocastOn(), cast:!!rsCastableSpell() };
    G.mon.forEach(mo=>mo.alive = false); const m = Object.assign(newMonster(), famEntry('goblin', 0)); m.alive = 1; m.hp = m.maxHp = 4000; m.x = p.x + 4; m.y = p.y; m.awake = true; m.engaged = true; G.mon.push(m);
    const att0 = skP().skills.attack||0, mag0 = skP().skills.magic||0;
    ISO.swingAt = 0; isoAct({ mon:m, gx:m.x, gy:m.y }, false);
    for (let i=0;i<400;i++){ p.hp = effMaxHp(); await fr(1); if (logs.filter(t=>/^you (hit|miss|swing at)/.test(t)).length >= 4) break; }
    out.swings = logs.filter(t=>/^you (hit|miss|swing at)/.test(t)).length; out.hurt = 4000 - m.hp; out.att = (skP().skills.attack||0) - att0; out.mag = (skP().skills.magic||0) - mag0;
    out.notes = logs.filter(t=>/you fight with your staff/.test(t)); out.red = logs.filter(t=>/you have no runes for any spell/.test(t)).length; out.toast = toasts.filter(t=>/fighting with your staff/.test(t)).length;
    /* runes back: the staff casts */
    Object.assign(bag, runes); BAG_VER++; logs.length = 0; const hp1 = m.hp, mag1 = skP().skills.magic||0;
    for (let i=0;i<300;i++){ p.hp = effMaxHp(); ISO.fighting = m; await fr(1); if ((skP().skills.magic||0) > mag1) break; }
    out.castAgain = (skP().skills.magic||0) > mag1; out.flag = p._staffMelee;
    /* out again: told again */
    for (const k of Object.keys(bag)) if (k.startsWith('r_')) delete bag[k]; BAG_VER++; logs.length = 0;
    for (let i=0;i<300;i++){ p.hp = effMaxHp(); ISO.fighting = m; await fr(1); if (logs.some(t=>/you fight with your staff/.test(t))) break; }
    out.again = logs.filter(t=>/you fight with your staff/.test(t)).length;
    logMsg = ol; notify = on; return out; });
  console.log(JSON.stringify(r));
  A(r.staff && r.auto && !r.cast, 'the Mage kit, its staff autocasting, no runes: ' + JSON.stringify(r));
  A(r.swings >= 4 && r.hurt > 0 && r.att > 0 && r.mag===0, 'walks up and bashes with the staff - melee, Attack xp, no magic: ' + JSON.stringify(r));
  A(r.notes.length===1 && /Wind Strike needs/.test(r.notes[0]) && r.toast===1, 'told once, with what the spell needs, and a pop-up: ' + JSON.stringify(r.notes) + ' ' + r.toast);
  A(r.red===0, 'no red "no runes for any spell" each swing: ' + r.red);
  A(r.castAgain && !r.flag, 'with runes again the staff casts');
  A(r.again===1, 'out again, told again: ' + r.again);
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
