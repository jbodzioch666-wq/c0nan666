// RS-177: the mines have seams of rune essence too - you mine them for rune essence at Mining 1, and they look the part
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing');
    let mx=-1, my=-1; for (let x=0;x<OW_COLS && mx<0;x++) for (let y=0;y<OW_ROWS;y++) if (G.ow.map[x][y]===OW_MINE){ mx=x; my=y; break; }
    if (mx<0) return { nomine:true };
    const out = { floors:[] };
    // a few tries at a floor (each floor has a good chance of them)
    for (let k=0;k<6;k++){ G.gameMode = 0; G.pendingDungeon = { x:mx, y:my }; enterDungeonConfirm(); setUi('playing');
      let n = 0, at = null; for (let x=0;x<COLS;x++) for (let y=0;y<ROWS;y++) if (G.dungeonDeco[x][y]==='essvein'){ n++; at = at || { x, y }; }
      out.floors.push(n); out.site = G.siteKind; if (at){ out.at = at; break; } }
    if (!out.at) return out;
    // stand beside it and mine
    const p = G.player, a = out.at; let spot = null;
    for (const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]) if (tileAt(a.x+dx, a.y+dy)===T_FLOOR && !G.dungeonDeco[a.x+dx][a.y+dy]){ spot = [a.x+dx, a.y+dy]; break; }
    if (!spot) return out;
    p.x = spot[0]; p.y = spot[1]; G.mon = []; G.player.tools = Object.assign(G.player.tools||{}, { pick:1 });
    const opt = skOptions().find(o=>o.cave==='essvein'); out.opt = opt && opt.label;
    out.label = skCaveLabel('essvein', a.x, a.y).txt;
    const before = skHave('essence'), xp0 = G.player.skills.mining||0;
    skDo(opt); for (let i=0;i<60 && skHave('essence')===before;i++){ if (!G.gather) skDo(opt); G.gather.next = 0; skGatherTick(performance.now()); }
    out.got = skHave('essence') - before; out.xp = (G.player.skills.mining||0) - xp0;
    // its 3D model: grey rock and pale crystal
    try{ const g = isoCaveNode('essvein', a.x, a.y, c=>new THREE.Color(c)); let crys = 0; g.traverse(o=>{ if (o.isMesh && o.geometry.type==='OctahedronGeometry') crys++; }); out.crystals = crys; }catch(e){ out.modelErr = String(e); }
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(!r.nomine, 'the world has a mine');
  A(r.at && r.site==='mine', 'a mine floor has seams of rune essence');
  A(r.opt==='Mine rune essence' && /Mining 1/.test(r.label), 'you can mine one, at Mining 1');
  A(r.got > 0 && r.xp > 0, 'mining it gives rune essence and Mining xp');
  A(r.crystals >= 5, 'it shows as a rock split open on pale crystal');
};
