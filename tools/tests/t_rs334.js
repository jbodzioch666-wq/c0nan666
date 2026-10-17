// RS-334: bronze and iron arrows (every arrow and bolt type) show by name with an icon in the bag's resources, not as one
// "Arrows"; the world map's two bars sit at the top; the fps meter sits on the right and can be dragged; each race's
// city gate banner draws its emblem
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); G.gameMode = 0; saveCurrentGame = ()=>{};
    const p = G.player, out = {};
    G.gear.ammo = rsMakeAmmo(1); p.arrows = 36; p.ammoStacks = { 0:39 };
    out.names = [resName('arw_0'), resName('arw_1')]; out.counts = [resCount('arw_0'), resCount('arw_1')];
    G.csBag = 'res'; setUi('inventory'); await new Promise(r=>setTimeout(r, 50));
    const chips = [...document.querySelectorAll('.reschip')].filter(c=>/Arrows/.test(c.textContent)).map(c=>({ t:c.textContent.trim(), img:!!c.querySelector('img.resico') }));
    out.chips = chips; out.plain = chips.some(c=>/^Arrows/.test(c.t)); setUi('playing');
    // the fps meter: right side, and it drags
    SET.fps = true; for (let i=0;i<50;i++) await new Promise(r=>requestAnimationFrame(r));
    const f = document.getElementById('fpsCounter'), fr = f.getBoundingClientRect(); out.fps = { right:fr.left > innerWidth/2, drag:f.dataset.drag };
    LAYOUT.fps = { x:100, y:300 }; for (let i=0;i<40;i++) await new Promise(r=>requestAnimationFrame(r)); const fr2 = f.getBoundingClientRect(); out.fpsMoved = Math.abs(fr2.left - 100) < 2 && Math.abs(fr2.top - 300) < 2; delete LAYOUT.fps; SET.fps = false;
    // the world map's bars at the top
    handlePlayingKey('m'); for (let i=0;i<4;i++){ renderGame(); await new Promise(r=>setTimeout(r, 50)); }
    const mt = document.getElementById('mapTools'); out.mapTop = mt ? Math.round(mt.getBoundingClientRect().top) : null;
    // every race's banner
    out.banners = Object.keys(V3_RACE).map(k=>{ try{ const m = v3RaceBannerMat(k); return !!(m && m.map && m.map.image); }catch(e){ return 'ERR '+e.message; } });
    return out; });
  const A = (c, m)=>{ if (!c) throw new Error(m+' :: '+JSON.stringify(r)); };
  A(r.names[0]==='Bronze Arrows' && r.names[1]==='Iron Arrows' && r.counts[0]===39 && r.counts[1]===36, 'each arrow type by name with its own count');
  A(r.chips.length >= 2 && r.chips.every(c=>c.img) && !r.plain, 'the bag shows Bronze and Iron Arrows with icons, no plain "Arrows"');
  A(r.fps.right && r.fps.drag==='fps' && r.fpsMoved, 'the fps meter is on the right and can be moved');
  A(r.mapTop!==null && r.mapTop < 20, 'the world map bars are at the top');
  A(r.banners.every(b=>b===true), 'every race has a gate banner');
  console.log('rs334 ok', JSON.stringify(r));
};
