// RS-600: walking a dungeon, the shadows cost a fraction - each torch redrawn only for what moves near it, your figure cast only from the
// two torches nearest you (the shadow pass split), and the catacombs' skulls, bones and shrouded dead casting none of their own
module.exports = async page=>{
  page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 200)));
  const r = await page.evaluate(async ()=>{ goToCharCreate(); G.chosenKit = 2; ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.player.hp = G.player.maxHp = 99999;
    G.gear.cape = rsMakeCape(5); const out = {};
    const s = questNearbySites(G.owPos.x, G.owPos.y, 1, 60, ['dungeon'])[0]; G.gameMode = 0; G.pendingDungeon = { x:s.x, y:s.y }; enterDungeonConfirm(); setUi('playing'); for (const m of G.mon) m.alive = false;
    for (let i=0;i<120;i++) await new Promise(r=>requestAnimationFrame(r));
    const fl = []; for (let x=1;x<COLS-1;x++) for (let y=1;y<ROWS-1;y++) if (G.map[x][y]===T_FLOOR) fl.push([x, y]); let sd = 11; const rnd = ()=>{ sd = (sd*16807) % 2147483647; return sd/2147483647; };
    const R0 = FPD.r, rr = R0.render; let acc = 0; R0.render = function(){ const o = rr.apply(this, arguments); acc += this.info.render.triangles; return o; };
    const walk = async n=>{ const R = FPD.r; let tri = 0, k = 0; acc = 0; for (let i=0;i<n;i++){ if (!ISO.path.length){ for (let j=0;j<8 && !ISO.path.length;j++){ const [x, y] = fl[Math.floor(rnd()*fl.length)]; ISO.path = isoFindPath(x, y, false) || []; } ISO.nextStep = 0; }
      await new Promise(r=>requestAnimationFrame(r)); k++; } return Math.round(acc/k); };
    let far = 0, near = 0, frames = 0; const tick0 = dgShadowTick; dgShadowTick = function(){ const o = tick0.apply(this, arguments); frames++; (FPD.torches||[]).forEach((L, i)=>{ if (L.shadow && L.shadow.needsUpdate && FPD.shadowFrames <= 0){ if (i < 2) near++; else far++; } }); return o; };
    out.split = !!(FPD.r.shadowMap.__split); out.on = await walk(240); dgShadowTick = tick0; out.torchRedraws = { near:+(near/frames).toFixed(2), far:+(far/frames).toFixed(2), torches:(FPD.torches||[]).filter(L=>L.intensity > 0).length };
    const SM = FPD.r.shadowMap, mine = SM.render; SM.render = SM.__orig; out.off = await walk(240); SM.render = mine;
    /* the catacombs' props: no shadows of their own */
    { const M = new THREE.Matrix4(), w = new THREE.Group(), mat = ()=>new THREE.MeshStandardMaterial(); fpdCatacombProps({ skull:[M], bone:[M], shroud:[M], candle:[M], flame:[M], glow:[] }, mat, w);
      out.props = w.children.filter(o=>o.isInstancedMesh).map(o=>o.castShadow); }
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.split, 'the shadow pass is split');
  A(r.torchRedraws.far < 0.08 && r.torchRedraws.far < r.torchRedraws.near/4, 'walking with nothing else about, only the two torches nearest you are redrawn (the others once, as they drop out of the two): ' + JSON.stringify(r.torchRedraws));
  A(r.on <= r.off*1.02, 'and you cast no shadow from the others: ' + r.on + ' triangles a frame against ' + r.off);
  A(r.props.length >= 3 && r.props.slice(0, 3).every(c=>!c), 'skulls, bones and the shrouded dead throw no shadows of their own: ' + r.props);
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
