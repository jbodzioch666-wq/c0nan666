// RS-818: wading a river you stand on its bed with the water round your legs, arms held out, foam round you and rings from each step; on the bank, on a winter's ice and off the river you are as before. Shots: zwade probe.
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const A = (c, m, d)=>{ if (!c) throw new Error(m + ' :: ' + JSON.stringify(d)); };
  const ok = await page.evaluate(async ()=>{ const fr = n=>new Promise(res=>{ let i = 0; const f = ()=>++i >= n ? res() : requestAnimationFrame(f); requestAnimationFrame(f); }); const ms = t=>new Promise(res=>setTimeout(res, t)); window.__noLock = true; window.__noPirates = true; goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.clock = DAY_LENGTH*0.3; G.gameMode = 0; moveOverworldEncounters = ()=>{}; checkOverworldEncounterTrigger = ()=>{}; wevStep = ()=>false; wgStep = ()=>false; sqWorldStep = ()=>false; questOverworldTurn = ()=>false; checkMythicBeastTrigger = ()=>false; isWinter = ()=>false;
    let n = null; const m = G.ow.map; for (let x=8;x<OW_COLS-8 && !n;x++) for (let y=8;y<OW_ROWS-8 && !n;y++){ if (m[x][y]!==OW_RIVER || m[x][y-1]!==OW_GRASS || m[x][y+1]===OW_WATER) continue; n = { x, y }; } if (!n) return false; window.__n = n;
    window.__read = ()=>{ const P = O3.player, F = O3.wfx; return { y:+O3.ppos.y.toFixed(3), gy:+O3.heightAt(O3.ppos.x, O3.ppos.z).toFixed(3), wade:+(O3.wadeD||0).toFixed(3), arm:P.e.wadeArm||0, shZ:P.e.rig.arms[0].sh.rotation.z, shadow:P.sh.visible, collar:!!(F && F.collar.visible), rings:F ? F.rings.filter(R=>R.t >= 0).length : 0 }; };
    G.owPos = { x:n.x, y:n.y - 1 }; owReveal(n.x, n.y, 6); O3.ppos = null; await fr(90); const bank = __read(); G.owPos = { x:n.x, y:n.y }; let rings = 0; const t0 = performance.now(); while (performance.now() - t0 < 1500){ await fr(2); rings = Math.max(rings, __read().rings); } await ms(600); const mid = __read();
    /* the helper's own rules */ const [cx, cz] = o3C(n.x, n.y), dep = o3WadeDepth(cx, cz, -9), dry = o3WadeDepth(cx, cz, 0.1); let off = 0; { const nb = o3C(n.x, n.y - 1); off = o3WadeDepth(nb[0], nb[1], -0.3); }
    /* a frozen river is walked on */ const ia = iceAt; iceAt = ()=>true; await ms(900); const ice = __read(); iceAt = ia; await ms(600); G.owPos = { x:n.x, y:n.y - 1 }; await ms(2000); const back = __read(); return { n, bank, rings, mid, ice, back, dep, dry, off, max:O3_WADE_MAX }; });
  console.log(JSON.stringify(ok)); if (!ok) { console.log('no river in this world'); return; }
  const { bank, mid, ice, back } = ok;
  A(bank.wade===0 && bank.shadow && !bank.collar, 'on the bank nothing has changed', bank);
  A(mid.wade > 0.1 && Math.abs(mid.y - Math.max(mid.gy, -0.14 - ok.max)) < 0.02 && mid.y < -0.2, 'mid-river you stand on the bed, under the water', mid);
  A(!mid.shadow && mid.collar, 'no shadow on the water, foam round the legs', mid);
  A(ok.rings >= 1, 'a ring from each step', ok.rings);
  A(mid.arm > 0.5 && mid.shZ < -0.45, 'the arms held out over the water', mid);
  A(ok.dep===ok.max && ok.dry===0 && ok.off===0, 'the depth: capped, none where it is dry, none off the river', [ok.dep, ok.dry, ok.off]);
  A(ice.wade < 0.02 && Math.abs(ice.y + 0.14) < 0.02 && !ice.collar, 'on the ice you walk on top', ice);
  A(back.wade===0 && back.arm===0 && Math.abs(back.shZ + 0.12) < 0.03 && back.shadow && !back.collar, 'out of the river it all comes back', back);
  A(!errs.length, 'page errors', errs);
};
