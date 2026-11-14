// RS-375: menus sit just under the top bar; the boss-beaten card is a framed panel; kobolds, goblins, imps and the other
// small folk stand a little taller; the treasure room's open door stays drawn while you stand in its doorway
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1;
    const out = {}, wait = ms=>new Promise(r=>setTimeout(r, ms)), el = document.getElementById('overlay');
    setUi('pause'); await wait(300); out.pauseTop = Math.round(el.getBoundingClientRect().top);
    G.victoryLoot = []; G.victoryDepth = 3; G.victoryGold = 100; setUi('victory'); await wait(200); out.victoryPanel = el.classList.contains('ovpanel'); setUi('playing');
    const H = nm=>{ const m = { nm, x:5, y:5, hp:10, maxHp:10, alive:true }, pt = m3dPortrait(m); return { h:pt.h, H:m3dInstance(m, pt).H, old:0.74*pt.h*(/goblin|kobold/.test(nm) ? 0.85 : 1) }; };
    out.kobold = H('kobold'); out.goblin = H('goblin'); out.orc = H('orc');
    const s = questNearbySites(G.owPos.x, G.owPos.y, 1, 60, ['dungeon'])[0]; G.gameMode = 0; G.pendingDungeon = { x:s.x, y:s.y }; enterDungeonConfirm(); setUi('playing');
    for (const m of G.mon) m.alive = 0; const p = G.player, D = G.dungeonDeco; D[p.x][p.y] = 'ldooro'; FPD.mapRef = null;
    for (let i=0;i<4;i++){ renderGame(); await wait(40); }
    out.door = [...(ISO.props||new Map()).entries()].some(([k, o])=>/ldooro/.test(k) && o.g.visible);
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.pauseTop >= 50 && r.pauseTop <= 80, 'a menu sits just under the top bar');
  A(r.victoryPanel, 'the boss-beaten card is a framed panel');
  A(r.kobold.H > r.kobold.old*1.2 && r.goblin.H > r.goblin.old*1.15 && r.kobold.H < 0.62, 'kobolds and goblins stand a bit taller than before, still small');
  A(Math.abs(r.orc.H - r.orc.old) < 0.02, 'man-sized folk are as they were');
  A(r.door, 'the open door stays drawn while you stand in it');
};
