// RS-365: the phone tier as a setting for a computer. Switched on in the settings, there and then: four town lamps instead
// of eight, plain shadow edges, smaller shadow maps (sun 1024, dungeon lights 256), no anti-aliasing, at most 1.5x pixels.
// Switched off, it all comes back, eight lamps and all
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1;
    SET.gfx = 'high'; SET.phoneTier = false; const out = { lowMem:v3LowMem() };
    const t = townList()[0]; G.gameMode = 0; G.owPos = { x:t.x, y:t.y }; enterVillage(); setUi('playing'); G.player.clock = 10;
    const fr = async n=>{ for (let i=0;i<n;i++){ renderGame(); await new Promise(r=>setTimeout(r, 25)); } }; await fr(6);
    const R = V3.renderer, P = ()=>GFXP.get(R);
    const read = ()=>{ let lights = 0, lit = 0; V3.scene.traverse(o=>{ if (o.isPointLight){ lights++; if (o.intensity > 0) lit++; } });
      return { lights, lit, plights:V3.plights.length, soft:R.shadowMap.type===THREE.PCFSoftShadowMap, sun:V3.sun.shadow.mapSize.x, samples:P() ? P().scene.samples : -1, pr:gfxPR(), phone:gfxPhone() }; };
    out.before = read();
    // the setting's row is there
    setUi('settings'); out.row = /phone tier/.test(document.getElementById('overlay').textContent); setUi('playing');
    setSetting('phoneTier', true); await fr(6); out.on = read();
    setSetting('phoneTier', false); await fr(6); out.off = read();
    // a dungeon floor built with the tier on gets the small lantern map; switching off grows it again
    setSetting('phoneTier', true); const s = questNearbySites(G.owPos.x, G.owPos.y, 1, 60, ['dungeon'])[0]; G.gameMode = 0; G.pendingDungeon = { x:s.x, y:s.y }; enterDungeonConfirm(); setUi('playing'); await fr(6);
    out.dgOn = { lan:FPD.lan.shadow.mapSize.x, torches:(FPD.torches||[]).map(L=>L.shadow.mapSize.x) };
    setSetting('phoneTier', false); await fr(3); out.dgOff = { lan:FPD.lan.shadow.mapSize.x, torches:(FPD.torches||[]).map(L=>L.shadow.mapSize.x) };
    SET.phoneTier = false; setUi('playing'); return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(!r.lowMem && !r.before.phone && r.before.plights===8 && r.before.soft && r.before.sun===2048, 'a computer starts on the full tier');
  A(r.row, 'the settings have a phone tier row');
  A(r.on.phone && r.on.plights===4 && r.on.lights - r.before.lights===-4 && !r.on.soft && r.on.sun===1024 && r.on.samples===0 && r.on.pr <= 1.5, 'phone tier on: four lamps, plain shadows, a 1024 sun, no anti-aliasing, 1.5x pixels at most');
  A(r.on.lit > 0, 'the four lamps still light the town at night');
  A(!r.off.phone && r.off.plights===8 && r.off.lights===r.before.lights && r.off.soft && r.off.sun===2048 && r.off.samples===r.before.samples, 'phone tier off: everything back as it was');
  A(r.dgOn.lan===256 && r.dgOn.torches.every(n=>n===256) && r.dgOff.lan===512 && r.dgOff.torches.every(n=>n===512), 'dungeon lights\' shadow maps follow the tier');
};
