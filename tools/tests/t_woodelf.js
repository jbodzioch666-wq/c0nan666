// RS-242: elves split in two - high elves for magic, wood elves for the bow - and the wood elf's own look, after the
// old Hobbit cartoon: tall, gaunt and stooped on long thin limbs, a leaf cap over blond hair, a leaf tunic, bare long toes
module.exports = async page=>{
  const r = await page.evaluate(()=>{
    const out = {};
    const mk = nm=>{ goToCharCreate(); G.chosenRace = RACES.findIndex(r=>r[0]===nm); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); o3Pref = false; try{ v3Pref = false; }catch(e){} };
    out.names = RACES.map(r=>r[0]);
    mk('Wood Elf'); out.we = { rng:rsAtkBonus('ranged'), mag:rsAtkBonus('magic'), key:lookRaceKey(G.player.race) }; for (const sl of ['head','chest','legs','arms','feet']) G.gear[sl] = newItem();
    const pt = rsPlayerLook(), lo = pt.o || pt; out.look = { stoop:lo.stoop, cap:!!lo.leafCap, toes:!!lo.longToes, legs:lo.legWear, thin:lo.limbThin, long:lo.limbLen, nose:!!lo.pointNose, lids:!!lo.lids, stature:pt.stature };
    const e = m3dInstance({}, pt); out.rig = { stoop:e.rig.stoop, hipY:e.rig.hipY };
    m3dPoseHumanoid(e.rig, 1, 0, 0, 0, 0, e); out.lean = e.rig.torso.rotation.x;
    // in a helm, no leaf cap; in boots, no bare toes
    G.gear.head = rsMakeArmour('metal', 0, 'head'); G.gear.feet = rsMakeArmour('metal', 0, 'feet'); const p2 = rsPlayerLook().o; out.armoured = { cap:!!p2.leafCap, toes:!!p2.longToes, stoop:p2.stoop };
    mk('Human'); out.hum = { rng:rsAtkBonus('ranged'), mag:rsAtkBonus('magic'), stoop:rsPlayerLook().o.stoop };
    mk('High Elf'); out.he = { mag:rsAtkBonus('magic'), rng:rsAtkBonus('ranged'), key:lookRaceKey(G.player.race), stoop:rsPlayerLook().o.stoop };
    // one spell in ten costs no runes
    const sp = RS_SPELLS.find(s=>rsSpellCombat(s)); let free = 0; for (let i=0;i<400;i++){ for (const k in sp[4]) skAdd('r_'+k, 10); const b = JSON.stringify(G.player.bag); rsSpendRunes(sp); if (JSON.stringify(G.player.bag)===b) free++; } out.free = free;
    // an old save's elf is a wood elf now
    G.player.race = 'Elf'; saveCurrentGame(); const id = G.saveId; loadGame(id); out.migrated = G.player.race;
    return out; });
  const A = (c, m)=>{ if (!c) throw new Error(m+' :: '+JSON.stringify(r)); };
  A(r.names.includes('High Elf') && r.names.includes('Wood Elf') && !r.names.includes('Elf'), 'elves split in two');
  A(r.we.rng===r.hum.rng+1 && r.we.mag===r.hum.mag && r.we.key==='woodelf', 'a wood elf shoots truer');
  A(r.he.mag===r.hum.mag+1 && r.he.rng===r.hum.rng && r.he.key==='elf', 'a high elf casts truer');
  A(r.free > 15 && r.free < 70, 'about one spell in ten is free for a high elf: '+r.free);
  A(r.look.stoop > 0 && r.look.cap && r.look.toes && r.look.legs==='skin' && r.look.thin < 1 && r.look.long > 1 && r.look.nose && r.look.lids && r.look.stature > 1.05, 'the wood elf look');
  A(r.rig.stoop > 0 && r.rig.hipY > 0.47 && r.lean > 0.3, 'built stooped on long legs');
  A(!r.armoured.cap && !r.armoured.toes && r.armoured.stoop > 0, 'a helm hides the leaf cap, boots the toes');
  A(!r.hum.stoop && !r.he.stoop, 'nobody else stoops');
  A(r.migrated==='Wood Elf', 'an old save\'s elf loads as a wood elf');
  // RS-243: the stoop holds in a wood elf town too, for you and the townsfolk
  const tw = await page.evaluate(async ()=>{
    const wait = ms=>new Promise(r=>setTimeout(r, ms));
    goToCharCreate(); G.chosenRace = RACES.findIndex(r=>r[0]==='Wood Elf'); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); v3Pref = true;
    const t = townList().find(q=>(townFlavorAt(q.x, q.y)||{}).race==='woodelf') || G.ow.spawnPos; G.owPos = { x:t.x, y:t.y }; enterVillage(); setUi('playing');
    for (let i=0;i<120 && !(V3.world && V3.player && V3.player.e); i++){ renderGame(); await wait(100); }
    for (let i=0;i<8;i++){ v3Render(); await wait(60); }
    const lean = e=>e && e.rig && e.rig.torso ? +e.rig.torso.rotation.x.toFixed(2) : null;
    const folk = (V3.villagers||[]).concat(V3.npcs||[]).filter(p=>p.e && p.e.rig && p.e.rig.stoop).map(p=>lean(p.e));
    return { race:G.villageRace, me:lean(V3.player && V3.player.e), folk:folk.slice(0, 6), n:folk.length };
  });
  A(tw.race==='woodelf' && tw.me > 0.25, 'you stoop in a wood elf town: '+JSON.stringify(tw));
  A(tw.n > 0 && tw.folk.every(v=>v > 0.25), 'the wood elf townsfolk stoop too: '+JSON.stringify(tw));
  console.log('woodelf ok', JSON.stringify({ free:r.free, lean:r.lean }));
};
