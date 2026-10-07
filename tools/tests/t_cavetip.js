// RS-185: hovering an ore vein in a mine shows a tooltip like the gathering spots on the overworld (what it is, the Mining
// level, what it gives for how much xp, how much is left), and on a phone a tap on it shows the same
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing');
    let mx=-1, my=-1; for (let x=0;x<OW_COLS && mx<0;x++) for (let y=0;y<OW_ROWS;y++) if (G.ow.map[x][y]===OW_MINE){ mx=x; my=y; break; }
    if (mx<0) return { none:true };
    G.gameMode = 0; G.pendingDungeon = { x:mx, y:my }; enterDungeonConfirm(); setUi('playing');
    const frames = async n=>{ for (let i=0;i<n;i++){ renderGame(); await new Promise(res=>setTimeout(res, 40)); } };
    // an ore vein with a free floor tile beside it: stand there
    let ore = null, stand = null;
    for (let x=1;x<COLS-1 && !ore;x++) for (let y=1;y<ROWS-1;y++){ if (G.dungeonDeco[x][y]!=='ore') continue;
      const nb = [[0,1],[1,0],[-1,0],[0,-1]].map(([a,b])=>[x+a,y+b]).find(([a,b])=>G.map[a][b]===T_FLOOR && !G.dungeonDeco[a][b] && !G.mon.some(m=>m.alive && m.x===a && m.y===b));
      if (nb){ ore = [x,y]; stand = nb; break; } }
    if (!ore) return { noOre:true };
    G.mon.forEach(m=>{ if (Math.hypot(m.x-ore[0], m.y-ore[1]) < 6) m.alive = 0; });
    G.player.x = stand[0]; G.player.y = stand[1]; G.dungeonSeen[ore[0]][ore[1]] = true;
    await frames(25);
    const out = { ore, html:skCaveTipHtml('ore', ore[0], ore[1]) };
    // hover it
    const c = isoProject(ore[0]+0.5, ore[1]+0.5, 0.05), rc = canvas.getBoundingClientRect();
    const cx = rc.left + c.sx/canvas.width*rc.width, cy = rc.top + c.sy/canvas.height*rc.height;
    ISO.caveTipT = 0; canvas.dispatchEvent(new MouseEvent('mousemove', { clientX:cx, clientY:cy, bubbles:true }));
    const el = document.getElementById('itemTooltip');
    out.hover = { shown:el.style.display!=='none', text:el.textContent };
    // away from it: the tooltip goes
    ISO.caveTipT = 0; canvas.dispatchEvent(new MouseEvent('mousemove', { clientX:rc.left + 5, clientY:rc.top + 5, bubbles:true }));
    out.away = el.style.display==='none';
    // a tap on a phone
    document.body.classList.add('touch'); isoClick({ clientX:cx, clientY:cy, shiftKey:false });
    out.tap = { shown:el.style.display!=='none', text:el.textContent };
    document.body.classList.remove('touch');
    return out; });
  console.log(JSON.stringify(r).slice(0, 1500));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  if (r.none || r.noOre){ console.log('no mine with a reachable vein in this world - nothing to check'); return; }
  A(/Mining \d+/.test(r.html) && /xp each/.test(r.html) && /left/.test(r.html), 'the tooltip names the level, the xp and what is left');
  A(r.hover.shown && /vein|seam/i.test(r.hover.text) && /Mining/.test(r.hover.text), 'hovering the vein shows its tooltip');
  A(r.away, 'moving off it hides the tooltip');
  A(r.tap.shown && /Mining/.test(r.tap.text), 'a tap on a phone shows it too');
};
