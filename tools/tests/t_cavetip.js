// RS-185/186: hovering an ore vein in a mine shows the very tooltip the gathering spots on the overworld have (the rock, the
// Mining level, the ore and its level, how many lumps are left - the count mining then really gives), and a tap on a phone too
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
    const node = skCaveNode('ore', ore[0], ore[1]), out = { ore, html:skCaveTipHtml('ore', ore[0], ore[1]), same:skCaveTipHtml('ore', ore[0], ore[1])===skNodeTipHtml(node), left0:node.left };
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
    // mine it out: it gives exactly what the tooltip said
    G.mon = []; G.player.tools = Object.assign(G.player.tools||{}, { pick:1 }); skP().skills.mining = 2e7; setUi('playing');
    const key = G.dungeonSlot+'/'+G.depth+':'+ore[0]+','+ore[1], opt = skOptions().find(o=>o.vein && o.vein.x===ore[0] && o.vein.y===ore[1]);
    let n = 0;
    for (let i=0;i<400 && opt && G.dungeonDeco[ore[0]][ore[1]]==='ore';i++){ const before = G.veinLeft ? G.veinLeft[key] : undefined;
      if (!G.gather) skDo(opt); if (!G.gather) break; G.gather.next = 0; try{ skGatherTick(performance.now()); }catch(e){ out.err = e.message; break; }
      const after = G.veinLeft ? G.veinLeft[key] : undefined; if (after!==before) n++; }
    out.mined = n;
    return out; });
  console.log(JSON.stringify(r).slice(0, 1500));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  if (r.none || r.noOre){ console.log('no mine with a reachable vein in this world - nothing to check'); return; }
  A(r.same && /Mining \d+/.test(r.html) && /level \d+/.test(r.html) && /\d+ lumps? left/.test(r.html), 'the overworld tooltip: the level, the ore and what is left');
  A(r.hover.shown && /rock/i.test(r.hover.text) && /Mining/.test(r.hover.text), 'hovering the vein shows its tooltip');
  A(r.away, 'moving off it hides the tooltip');
  A(r.tap.shown && /Mining/.test(r.tap.text), 'a tap on a phone shows it too');
  A(!r.err && !r.drift && r.mined===r.left0, 'mining gives as many lumps as the tooltip said');
};
