// RS-555: life. Butterflies over the flower fields by day (none in winter, rain or storm) and fireflies over the grass, woods and
// swamps by night - each one instanced mesh flown on the card from its own seed and the clock (nothing moved on the CPU a frame),
// shown and hidden with the hour
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{ const out = {}; goToCharCreate(); ccBegin(); wgRegenerate(12345); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); o3Pref = true; G.gameMode = 0; weatherSync = ()=>{};
    G.owPos = { x:24, y:54 }; G.player.clock = G.player.turnCount = DAY_LENGTH/2; G.weather = 'clear'; O3.win = null; O3.ppos = null;
    for (let i=0;i<12;i++){ renderGame(); await new Promise(r=>setTimeout(r, 40)); }
    const bf = GFX.flies, ff = GFX.fireflies; out.bf = bf ? { n:bf.userData.flies, vis:bf.visible, gpu:!!bf.geometry.attributes.aBase && !!bf.geometry.attributes.aSeed, inst:bf.geometry.instanceCount } : null; out.ff = ff ? { n:ff.userData.flies, vis:ff.visible, add:ff.material.blending===THREE.AdditiveBlending } : null;
    /* the butterflies' colours differ; the attributes are never re-uploaded after the build */
    if (bf){ const c = bf.geometry.attributes.aCol; const seen = new Set(); for (let i=0;i<c.count;i++) seen.add(c.getX(i).toFixed(2)); out.bfCols = seen.size; out.bfVer = bf.geometry.attributes.aBase.version; }
    for (let i=0;i<20;i++){ renderGame(); await new Promise(r=>setTimeout(r, 16)); } if (bf) out.bfVer2 = bf.geometry.attributes.aBase.version;
    G.player.clock = G.player.turnCount = Math.round(DAY_LENGTH*1.02); for (let i=0;i<6;i++){ renderGame(); await new Promise(r=>setTimeout(r, 30)); } out.night = { bf:bf ? bf.visible : null, ff:ff ? ff.visible : null, uNight:+GFX.u.uNight.value.toFixed(2) };
    G.player.clock = G.player.turnCount = Math.round(DAY_LENGTH*1.5); G.weather = 'storm'; for (let i=0;i<6;i++){ renderGame(); await new Promise(r=>setTimeout(r, 30)); } out.storm = { bf:bf ? bf.visible : null }; G.weather = 'clear';
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.bf && r.bf.n > 5 && r.bf.gpu && r.bf.inst===r.bf.n && r.bfCols >= 3, 'butterflies over the flowers, flown on the card, in several colours');
  A(r.ff && r.ff.n > 10 && r.ff.add, 'fireflies, glowing');
  A(r.bf.vis && !r.ff.vis, 'by day the butterflies show and the fireflies hide');
  A(!r.night.bf && r.night.ff, 'by night the other way round');
  A(!r.storm.bf, 'no butterflies in a storm');
  A(r.bfVer===r.bfVer2, 'nothing re-uploaded frame to frame');
};
