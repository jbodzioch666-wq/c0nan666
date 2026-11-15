// RS-351: the town and the open land ask the browser for the high-performance graphics card, as the dungeon already did
// (on a machine with two cards the browser may otherwise hand them the slow one), and the fps meter names the card that
// draws the view you're in, so a slow one can be seen
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); G.gameMode = 0; saveCurrentGame = ()=>{};
    const fr = async n=>{ for (let i=0;i<n;i++){ renderGame(); await new Promise(r=>setTimeout(r, 20)); } };
    await fr(3); const out = {};
    const pref = R=>{ try{ return R.getContext().getContextAttributes().powerPreference; }catch(e){ return 'err'; } };
    out.land = pref(O3.renderer);
    const t = townList()[0]; G.owPos = { x:t.x, y:t.y }; enterVillage(); setUi('playing'); await fr(3); out.town = pref(V3.renderer);
    out.gpu = gfxGpuName(V3.renderer); out.gpuLand = gfxGpuName(O3.renderer);
    SET.fps = true; let ts = 1000; for (let i=0;i<40;i++){ fpsTick(ts); ts += 16; } out.meter = document.getElementById('fpsCounter') ? document.getElementById('fpsCounter').textContent : ''; SET.fps = false; fpsTick(ts + 1000);
    out.parse = ['ANGLE (NVIDIA, NVIDIA GeForce RTX 3080 Ti Direct3D11 vs_5_0 ps_5_0, D3D11)', 'ANGLE (Intel, Intel(R) UHD Graphics 630 Direct3D11 vs_5_0 ps_5_0, D3D11)', 'ANGLE (Apple, ANGLE Metal Renderer: Apple M2, Unspecified Version)'].map(gfxGpuParse);
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.land==='high-performance' && r.town==='high-performance', 'the land and the town ask for the high-performance card');
  A(r.gpu.length > 0 && r.gpuLand.length > 0, 'the card has a name');
  A(/\d+ fps · .+/.test(r.meter), 'the fps meter names the card: '+r.meter);
  A(r.parse[0]==='NVIDIA GeForce RTX 3080 Ti' && r.parse[1]==='Intel UHD Graphics 630' && r.parse[2]==='Apple M2', 'an ANGLE renderer string reads as the card: '+JSON.stringify(r.parse));
};
