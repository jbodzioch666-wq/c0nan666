// RS-554: the painterly grade. The open land's grade follows the painted films: golden fields, blue-green woods, a sickly swamp
// (gfxGradeKey gives 'fields' on grassland); a soft coloured haze lies on the distant land past the land around you - a painted
// backdrop's lilac-blue, its own colour, not the sky's - clear close by; and shafts of light fall through the woods on a foggy morning
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{ const out = {}; goToCharCreate(); ccBegin(); wgRegenerate(12345); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); o3Pref = true; G.gameMode = 0; weatherSync = ()=>{};
    G.owPos = { x:24, y:54 }; G.player.clock = G.player.turnCount = DAY_LENGTH/2; G.weather = 'clear'; O3.win = null; O3.ppos = null; O3.dist = 15;
    for (let i=0;i<12;i++){ renderGame(); await new Promise(r=>setTimeout(r, 40)); }
    out.key = gfxGradeKey('o3'); const g = GFX_GRADES.fields; out.golden = g.gain[0] > g.gain[2] + 0.1; out.woods = GFX_GRADES.forest.gain[0] < GFX_GRADES.forest.gain[2]; out.swamp = GFX_GRADES.swamp.sat < 0.8;
    const f = O3.scene.fog; out.haze = { near:+f.near.toFixed(2), far:+f.far.toFixed(2), cd:+(O3.dist*1.05).toFixed(2), own:f.color.getHexString()!==O3.scene.background.getHexString() };
    G.weather = 'fog'; for (let i=0;i<4;i++){ renderGame(); await new Promise(r=>setTimeout(r, 30)); } out.fog = { near:+O3.scene.fog.near.toFixed(2), sky:O3.scene.fog.color.getHexString()===O3.scene.background.getHexString() };
    /* rays in a foggy morning: find the woods and read the rays' alpha, fog against clear */
    G.owPos = { x:101, y:122 }; O3.win = null; O3.ppos = null; for (let i=0;i<12;i++){ renderGame(); await new Promise(r=>setTimeout(r, 40)); } GFX.raysAt = -9; for (let i=0;i<6;i++){ renderGame(); await new Promise(r=>setTimeout(r, 30)); }
    const al = ()=>Math.max(0, ...(GFX.rays||[]).filter(r=>r.visible).map(r=>r.material.opacity)); out.rayFog = +al().toFixed(3);
    G.weather = 'clear'; for (let i=0;i<6;i++){ renderGame(); await new Promise(r=>setTimeout(r, 30)); } out.rayClear = +al().toFixed(3);
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.key==='fields' && r.golden && r.woods && r.swamp, 'golden fields, blue-green woods, a sickly swamp');
  A(r.haze.near > r.haze.cd*2 && r.haze.far > r.haze.near + 60 && r.haze.own, 'a haze past the land you can see, in its own colour');
  A(r.fog.near < r.haze.near && r.fog.sky, 'a foggy day keeps its close fog in the sky\'s colour');
  A(r.rayFog===0 && r.rayClear===0, 'no shafts of light through the woods (RS-593: the god rays taken out): ' + r.rayFog + ' / ' + r.rayClear);
};
