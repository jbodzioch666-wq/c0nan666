// (probe, not in ALL) how long a dungeon floor takes to come up from cold (a fresh page): load to the end of the shader warm-up, and the
// longest frame on the way. ZSAVE a save; ZNOPRE=1 turns off the parallel link (RS-571) to compare; ZKIND a site kind (dungeon)
const fs = require('fs');
module.exports = async page=>{
  page.setDefaultTimeout(0);
  const txt = process.env.ZSAVE ? fs.readFileSync(process.env.ZSAVE, 'utf8') : null;
  const r = await page.evaluate(async ([txt, nopre, kind])=>{ window.__noWarmSlice = false; window.__noPrelink = nopre;
    if (txt){ const d = JSON.parse(txt).data; importSaveText(txt); loadGame(d.id); } else { goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); }
    setUi('playing'); saveCurrentGame = ()=>{};
    const OWK = { dungeon:OW_DUNGEON, temple:OW_TEMPLE, graveyard:OW_GRAVEYARD, castle:OW_CASTLE, mine:OW_MINE }[kind] || OW_DUNGEON;
    let dx=-1, dy=-1, bd = 1e9; for (let x=0;x<OW_COLS;x++) for (let y=0;y<OW_ROWS;y++) if (G.ow.map[x][y]===OWK){ const d = Math.abs(x - G.owPos.x) + Math.abs(y - G.owPos.y); if (d < bd){ bd = d; dx = x; dy = y; } }
    G.interior = null; G.gameMode = 0; G.owPos = { x:dx, y:dy };
    const fr = []; let last = performance.now(), on = true; const loop = ()=>{ const t = performance.now(); fr.push(t - last); last = t; if (on) requestAnimationFrame(loop); }; requestAnimationFrame(loop);
    const ext = !!gfxPscExt(FPD.r || { getContext:()=>document.createElement('canvas').getContext('webgl2') });
    window.__preK = []; const gp0 = gfxPrelink; gfxPrelink = function(V, r){ const b = new Set(r.info.programs); const out = gp0.apply(this, arguments); for (const p of r.info.programs) if (!b.has(p)) window.__preK.push(p); return out; };
    const t0 = performance.now(); G.pendingDungeon = { x:dx, y:dy }; enterDungeonConfirm(); setUi('playing');
    // the floor is up when its build ran and the warm-up (and the parallel link) are both done
    while (performance.now() - t0 < 60000){ await new Promise(r=>setTimeout(r, 30)); if (FPD.mapRef===G.map && !FPD.warmWait && !FPD.prelink) break; }
    const up = performance.now() - t0; await new Promise(r=>setTimeout(r, 1500)); on = false;
    const during = fr.slice(1).sort((a,b)=>b-a);
    return { kind, ext, prelink:!nopre, up:+(up/1000).toFixed(2), worst:+during[0].toFixed(0), next:during.slice(1, 5).map(v=>+v.toFixed(0)), programs:FPD.r.info.programs.length, pre:window.__preK.length, unused:window.__preK.filter(p=>p.usedTimes===0 || !FPD.r.info.programs.includes(p)).length, used1:window.__preK.map(p=>p.name+':'+p.usedTimes).slice(0, 50), late:FPD.r.info.programs.filter(p=>!window.__preK.includes(p)).map(p=>p.name) }; }, [txt, !!process.env.ZNOPRE, process.env.ZKIND || 'dungeon']);
  console.log('load', JSON.stringify(r));
};
