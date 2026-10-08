// RS-222: each race has its own body (height, build, an orc's face, a dragonborn's snout and tail, a tiefling's tail,
// bare halfling feet, a gnome's nose) and a reworked trait for the skill game: xp in two skills (every skill for humans)
// plus one trick - accuracy, less damage taken, crits, Relentless Endurance, magic find, damage, haggling.
module.exports = async page=>{
  const ev = (f, a)=>page.evaluate(f, a), A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
  // the creation screen: every race lists its skills, and every race's figure builds
  const cc = await ev(()=>{ goToCharCreate(); const rows = [...document.querySelectorAll('#overlay .choice-row .ccaff')].map(e=>e.textContent);
    const bodies = RACES.map(r=>{ const pt = rsPlayerLook({ race:r[0], look:lookDefault(r[0]), bare:true }); const e = m3dInstance({}, pt); let tail = 0; e.holder.traverse(o=>{ if (o.isMesh) tail++; });
      return { nm:r[0], st:pt.stature, head:pt.o.head||'human', tail:pt.o.tail||'', feet:pt.o.feet||'', nose:pt.o.nose||0, hair:!!pt.o.hairStyle, meshes:tail }; });
    ccSelectRace(RACES.findIndex(r=>r[0]==='Dragonborn')); const rowsDr = [...document.querySelectorAll('#overlay .lkrow .lkn')].map(e=>e.textContent);
    return { rows, bodies, rowsDr }; });
  A(cc.rows.length===9 && cc.rows.every(t=>/xp/.test(t)), 'every race shows its skills: '+JSON.stringify(cc.rows));
  const B = Object.fromEntries(cc.bodies.map(b=>[b.nm, b]));
  A(B.Halfling.st < B.Dwarf.st && B.Gnome.st < B.Halfling.st && B.Dwarf.st < B.Human.st && B.Human.st < B.Elf.st && B.Elf.st < B.Dragonborn.st, 'heights: '+JSON.stringify(cc.bodies.map(b=>[b.nm, b.st])));
  A(B['Half-Orc'].head==='orc' && B.Dragonborn.head==='drake' && B.Dragonborn.tail==='dragon' && B.Tiefling.tail==='spade', 'orc face, dragon head and tail, tiefling tail');
  A(B.Halfling.feet==='bare' && B.Dragonborn.feet==='dclaw' && B.Gnome.nose>0 && !B.Dragonborn.hair, 'bare feet, claws, a gnome nose, no dragonborn hair');
  A(cc.bodies.every(b=>b.meshes > 20), 'every figure builds');
  A(!cc.rowsDr.includes('Hair') && cc.rowsDr.includes('Crest'), 'a dragonborn picks a crest, not hair: '+cc.rowsDr);
  // the traits, each in a fresh character of that race
  const R = await ev(()=>{
    const mk = nm=>{ goToCharCreate(); G.chosenRace = RACES.findIndex(r=>r[0]===nm); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); o3Pref = false; try{ v3Pref = false; }catch(e){} };
    const xp = (nm, k)=>{ mk(nm); const b = G.player.skills[k]||0; skGainXP(k, 1000); return (G.player.skills[k]||0) - b; };
    const r = { humMine:xp('Human', 'mining'), dwMine:xp('Dwarf', 'mining'), dwFish:xp('Dwarf', 'fishing') };
    mk('Human'); r.humRng = rsAtkBonus('ranged'); r.humMag = rsAtkBonus('magic'); r.humSell = sellPrice(G.inv.find(it=>it.used)||G.gear.weapon); r.humCrit = weaponCritThreshold(); r.humRes = mitigate(100);
    G.player.hp = 0; r.humDies = checkDeathWard();
    mk('Elf'); r.elfRng = rsAtkBonus('ranged');
    mk('Tiefling'); r.tiefMag = rsAtkBonus('magic');
    mk('Half-Elf'); r.heSell = sellPrice(G.inv.find(it=>it.used)||G.gear.weapon);
    mk('Halfling'); r.hfCrit = weaponCritThreshold();
    mk('Dwarf'); r.dwRes = mitigate(100);
    mk('Half-Orc'); const p = G.player; p.turnCount = 1000; p.hp = -5; r.ho1 = checkDeathWard(); r.hoHp = p.hp; p.hp = -5; r.ho2 = checkDeathWard(); p.turnCount = 1600; p.hp = -3; r.ho3 = checkDeathWard();
    setUi('charsheet'); G.csPage = 'stats'; csTab('other'); r.sheet = (document.querySelector('#overlay .cs-racerow')||{}).textContent||'';
    return r; });
  A(R.dwMine > R.humMine && R.dwFish < R.dwMine, 'a dwarf mines faster: '+JSON.stringify(R));
  A(R.elfRng===R.humRng+1 && R.tiefMag===R.humMag+1, 'elf ranged and tiefling magic accuracy');
  A(R.heSell > R.humSell, 'a half-elf sells for more'); A(R.hfCrit===R.humCrit-1, 'halfling crits more'); A(R.dwRes < R.humRes, 'a dwarf takes less damage');
  A(!R.humDies && R.ho1 && R.hoHp===1 && !R.ho2 && R.ho3, 'Relentless Endurance once per 500 steps: '+JSON.stringify(R));
  A(/Relentless Endurance/.test(R.sheet) && /Strength/.test(R.sheet), 'the character sheet names the trait: '+R.sheet);
};
