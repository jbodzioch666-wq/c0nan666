// (probe, not in ALL) in through the tavern's door and out again by walking, in a robe (ZT tier, '' for none): any error on the way
const fs = require('fs');
module.exports = async page=>{
  page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e.stack || e).slice(0, 900))); page.on('console', m=>{ if (m.type()==='error' || /THREE/.test(m.text())) errs.push('console ' + m.type() + ': ' + m.text().slice(0, 600)); });
  await page.evaluate(h=>{ window.__hr = h; }, process.env.ZH || 0.3); const r = await page.evaluate(async ([zt, txt])=>{ window.__trans = true; if (txt){ importSaveText(txt); loadGame(saveIndexList().slice(-1)[0].id); if (G.interior) exitInterior(); G.gameMode = 0; zt = ''; } else { goToCharCreate(); G.chosenKit = 2; ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); } setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1;
    if (zt!=='') G.gear.chest = rsMakeArmour('cloth', +zt, 'chest'); G.player.look.body = 1;
    const t = G.ow.spawnPos; G.owPos = { x:t.x, y:t.y }; enterVillage(); setUi('playing'); townClosedCheck = ()=>false; G.player.clock = DAY_LENGTH*10 + DAY_LENGTH*(+(window.__hr||0.3));
    const fr = n=>new Promise(async res=>{ for (let i=0;i<n;i++){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); } res(); });
    await fr(150); const out = {};
    for (let k=0;k<2;k++){ const b = VILLAGE_BUILDINGS.find(b=>b.key==='tavern'), d = b.door; G.player.x = d.x; G.player.y = d.y + 1; await fr(30); moveDir(0, -1); await fr(150); out['in' + k] = !!G.interior;
      let ex = null; for (let x=0;x<G.map.length;x++) for (let y=0;y<G.map[x].length;y++) if (G.map[x][y]===T_DOOROUT) ex = { x, y };
      if (!ex){ out.noExit = true; break; } let st = null; for (const [dx, dy] of [[0,-1],[0,1],[1,0],[-1,0]]){ const x = ex.x + dx, y = ex.y + dy; if (G.map[x] && G.map[x][y]===T_FLOOR) { st = { x, y, dx:-dx, dy:-dy }; break; } }
      G.player.x = st.x; G.player.y = st.y; await fr(30); moveDir(st.dx, st.dy); await fr(200); out['out' + k] = !G.interior; }
    return out; }, [process.env.ZT == null ? '0' : process.env.ZT, process.env.ZSAVE ? fs.readFileSync(process.env.ZSAVE, 'utf8') : '']);
  console.log(JSON.stringify(r)); for (const e of errs) console.log('ERR', e);
};
