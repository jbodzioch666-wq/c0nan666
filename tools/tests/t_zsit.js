// (probe, not in ALL) what changes a seated robe's fold key from frame to frame
module.exports = async page=>{
  page.setDefaultTimeout(0);
  const r = await page.evaluate(async ()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    const t = G.ow.spawnPos; G.owPos = { x:t.x, y:t.y }; enterVillage(); setUi('playing'); townClosedCheck = ()=>false;
    const fr = async n=>{ for (let i=0;i<n;i++){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); } }; await fr(40); enterInterior('tavern'); setUi('playing'); await fr(200);
    const p = V3.villagers.concat(V3.npcs).find(p=>p.e && p.e.rig && p.e.rig.sitting && p.e.rig.skirt), r = p.e.rig, rows = [];
    const F0 = m3dFastNormals; let who = []; m3dFastNormals = function(g){ who.push(g===r.skirt.geometry ? 'skirt' : 'other:' + (new Error().stack.split('\n')[2]||'').trim().slice(0, 60)); return F0.apply(this, arguments); };
    for (let i=0;i<4;i++){ who = []; await fr(1); const L = r.legs; rows.push({ who, sw:L.map(l=>+l.hip.rotation.x.toFixed(4)), kn:L.map(l=>+l.knee.rotation.x.toFixed(4)), hy:+r.hips.position.y.toFixed(4), ty:+r.torso.rotation.y.toFixed(4), tz:+r.torso.rotation.z.toFixed(4), sig:r.skirt.userData.sig, key:r.skirt.userData.seatKey, sk:r.seatBox && r.seatBox.key }); }
    m3dFastNormals = F0; return rows; });
  for (const x of r) console.log(JSON.stringify(x));
};
