// RS-472: capes are finer each tier, like shields: a trimmed hem, then your shield emblem on the back (in its dye), gold edging, a fur
// collar, an embroidered band and glowing thread at the top - painted on the cloth so it moves with it; a fire cape is molten rock
module.exports = async page=>{
  const r = await page.evaluate(()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    const out = { capes:{} }, look = nm=>{ G.gear.cape = rsMakeCape(130, nm); rsSync && rsSync(); return rsPlayerLook(); };
    for (const nm of ['Red Cape', 'Black Cape', "Ava's Attractor", 'Obsidian Cape', 'Saradomin Cape', 'Legends Cape', "Dizana's Quiver", 'Fire Cape']){ const L = look(nm), o = L.o;
      const e = m3dInstance({}, L), m = e.rig.cape && e.rig.cape.material; out.capes[nm] = { tier:o.capeTier, em:o.capeEm || null, trim:!!o.capeTrimCol, fur:!!o.furCollar, painted:!!(m && m.map && m.color.getHexString()==='ffffff'), glow:!!(m && m.emissiveMap) }; }
    skGainXP('defence', 2e5); emblemPick('sun'); skAdd('dye_blue', 1); emblemDye('blue'); const o2 = look('Legends Cape').o; out.chosen = [o2.capeEm, o2.capeEmCol];
    emblemPick('plain'); out.plain = look('Legends Cape').o.capeEm || null;
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  const c = r.capes, tiers = ['Red Cape', 'Black Cape', "Ava's Attractor", 'Obsidian Cape', 'Saradomin Cape', 'Legends Cape'].map(k=>c[k].tier);
  A(tiers.every((t, i)=>!i || t >= tiers[i-1]) && tiers[0]===0 && tiers[5]===5, 'a finer cape the higher its level');
  A(!c['Red Cape'].painted && c['Black Cape'].trim && c['Black Cape'].painted, 'a plain cape is plain cloth; the next has a trimmed hem, painted on');
  A(c["Ava's Attractor"].em && !c['Red Cape'].em, 'from tier 2 an emblem on the back');
  A(c['Saradomin Cape'].fur && c['Legends Cape'].fur && !c['Black Cape'].fur, 'a fur collar from tier 4');
  A(c['Fire Cape'].tier===6 && c['Fire Cape'].glow && !c['Fire Cape'].em, 'a fire cape glows, molten, with no emblem');
  A(c["Dizana's Quiver"].tier===undefined, 'a quiver is not a cape');
  A(r.chosen[0]==='sun' && r.chosen[1]==='#2a4a9a' && r.plain===null, 'your chosen shield emblem and its dye are on your cape too; plain leaves it bare');
};
