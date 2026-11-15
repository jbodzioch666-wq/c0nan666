// Probe (RS-819): a bow slung on your back from behind: in a robe with a quiver, a cape, and nothing on the back. zbowback_<name>.png. Prints what the rig has.
const fs = require('fs');
module.exports = async page=>{ page.setDefaultTimeout(0);
  await page.evaluate(async ()=>{ window.__noLock = true; window.__noPirates = true; goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.clock = DAY_LENGTH*0.3; G.gameMode = 0; moveOverworldEncounters = ()=>{}; checkOverworldEncounterTrigger = ()=>{}; wevStep = ()=>false; wgStep = ()=>false; sqWorldStep = ()=>false; questOverworldTurn = ()=>false; checkMythicBeastTrigger = ()=>false; G.gear.chest = rsMakeArmour('cloth', 4, 'chest'); G.gear.legs = rsMakeArmour('cloth', 4, 'legs'); G.gear.ranged = rsMakeBow(2, false); G.player.rangedMode = 'bow'; G.gear.weapon = rsItem('weapon'); G.gear.weapon.used = false; });
  const ms = t=>page.waitForTimeout(t);
  for (const [nm, cape] of [['quiver', 'Leather Quiver'], ['cape', 'Fire Cape'], ['none', null]]){
    const info = await page.evaluate(async cape=>{ G.gear.cape = cape ? rsMakeCape(cape==='Fire Cape' ? 113 : 0, cape) : rsItem('cape'); if (!cape) G.gear.cape.used = false; rsSync(); renderGame(); return 1; }, cape);
    await ms(1800);
    const r = await page.evaluate(()=>{ const T = THREE, P = O3.player, Rd = O3.renderer, c = window.__c2 || (window.__c2 = new T.PerspectiveCamera(36, 1, 0.05, 60)), v = new T.Vector3(); P.g.getWorldPosition(v); const az = P.yaw + Math.PI; c.aspect = Rd.domElement.width/Rd.domElement.height; c.position.set(v.x + Math.sin(az)*1.55, v.y + 0.85, v.z + Math.cos(az)*1.55); c.lookAt(v.x, v.y + 0.45, v.z); c.updateProjectionMatrix(); const hid = []; for (const ch of O3.scene.children){ if (ch.isLight) continue; let has = false; ch.traverse(o=>{ if (o===P.g) has = true; }); if (!has && ch.visible){ ch.visible = false; hid.push(ch); } } Rd.setRenderTarget(null); Rd.render(O3.scene, c); for (const ch of hid) ch.visible = true; const rig = P.e.rig; return { url:Rd.domElement.toDataURL('image/png'), cape:!!rig.cape, quiver:!!rig.quiver, sheathed:!!rig.sheathed, wk:rig.wk }; });
    console.log(nm, JSON.stringify({ cape:r.cape, quiver:r.quiver, sheathed:r.sheathed, wk:r.wk })); fs.writeFileSync(SHOTS + `/zbowback_${nm}.png`, Buffer.from(r.url.split(',')[1], 'base64'));
  }
};
