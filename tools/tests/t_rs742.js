// RS-742: magic is cast through a wizard's staff, and necromancy needs cloth body armour. With a sword in hand no spell casts (but the
// alchemy) and the reason says so; with a staff it does. In plate the dead don't rise and the Raise button says to wear a robe; in a robe they do.
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const ev = (f, a)=>page.evaluate(f, a), A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
  const r = await ev(()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); o3Pref = false; v3Pref = false; fp3dPref = false; saveCurrentGame = ()=>{};
    let dx=-1, dy=-1; for (let x=0;x<OW_COLS && dx<0;x++) for (let y=0;y<OW_ROWS;y++) if (G.ow.map[x][y]===OW_DUNGEON){ dx=x; dy=y; break; }
    G.gameMode = 0; G.pendingDungeon = { x:dx, y:dy }; enterDungeonConfirm(); setUi('playing');
    const p = G.player; p.hp = p.maxHp = 99999; skAdd('r_air', 100); skAdd('r_mind', 100);
    const m = G.mon.find(o=>o.alive); G.mon = [m]; m.x = p.x + 2; m.y = p.y; m.hp = m.maxHp = 99999; if (!tileOpen(m.x, m.y)) G.map[m.x][m.y] = T_FLOOR;
    const sp = rsSpell('windstrike'), out = {};
    G.gear.weapon = rsMakeWeapon(0, 0); out.swordWhy = rsSpellBlock(sp); const r0 = skHave('r_air'); out.swordCast = rsCastAt(0, 'windstrike'); out.swordRunes = r0 - skHave('r_air'); out.swordPick = rsCastableSpell();
    G.gear.weapon = rsMakeStaff(0); out.staffWhy = rsSpellBlock(sp); out.staffCast = rsCastAt(0, 'windstrike'); out.staffPick = (rsCastableSpell()||[])[0];
    /* the dead */
    skAdd('bones', 5); p.minions = [];
    G.gear.chest = rsMakeArmour('metal', 0, 'chest'); necroRaise(); out.plate = p.minions.length; necroHudSync(); out.btn = (document.getElementById('necroBtn')||{}).textContent || '';
    out.btnOff = document.getElementById('necroBtn') && document.getElementById('necroBtn').classList.contains('off');
    G.gear.chest = rsMakeArmour('cloth', 0, 'chest'); necroRaise(); out.robe = p.minions.length; necroHudSync(); out.btn2 = (document.getElementById('necroBtn')||{}).textContent || '';
    out.log = G.log.slice(-6).map(l=>l.msg).join(' | ');
    return out;
  });
  console.log(JSON.stringify(r));
  A(/wizard's staff/.test(r.swordWhy) && r.swordCast===false && r.swordRunes===0 && !r.swordPick, 'no spell without a staff: ' + JSON.stringify(r));
  A(r.staffWhy==='' && r.staffCast===true && r.staffPick==='windstrike', 'a staff casts: ' + JSON.stringify(r));
  A(r.plate===0 && /wear a robe/.test(r.btn) && r.btnOff && /robed caller/.test(r.log), 'no raising in plate: ' + JSON.stringify(r));
  A(r.robe===1 && !/wear a robe/.test(r.btn2), 'raising in a robe: ' + JSON.stringify(r));
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
