// RS-690: Back in the Boat - out of a drowned temple (the Rotunda, at sea) you are in your boat again. The walk down left the boat waiting
// at the mooring stone (set beside you, off your position); back under sail only its bob was set, so out of the temple you floated on the
// sea beside it. Walks in from the boat, comes back out, and checks the boat is under you, you stand in it, outside the well, and it
// sails off with you. Shot: shots/rs690.png (back out, in the boat)
module.exports = async page=>{
  page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const r = await page.evaluate(async ()=>{ const fr = n=>new Promise(res=>{ let i = 0; const f = ()=>++i >= n ? res() : requestAnimationFrame(f); requestAnimationFrame(f); });
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.gameMode = 0; G.player.clock = DAY_LENGTH*0.4; window.__trans = true;
    G.ow.encounters = []; checkOverworldEncounterTrigger = ()=>false; wevStep = ()=>false;
    const m = G.ow.map, sea = []; for (let x=0;x<OW_COLS;x++) for (let y=0;y<OW_ROWS;y++) if (m[x][y]===OW_TEMPLE && owSeaSite(x, y)) sea.push({ x, y });
    sea.sort((a, b)=>Math.hypot(a.x - G.owPos.x, a.y - G.owPos.y) - Math.hypot(b.x - G.owPos.x, b.y - G.owPos.y)); const s = sea[0]; if (!s) return { none:true };
    G.player.hasBoat = 1; G.player.boatTier = 1; const q0 = owNb(s.x, s.y, 0, 1); G.owPos = { x:q0[0], y:q0[1] }; owReveal(q0[0], q0[1], 8); await fr(150);
    const out = {}; moveDir(0, -1); out.walk = !!O3.doorWalk;
    let ashore = false; const t0 = performance.now(); while (performance.now() - t0 < 30000 && G.gameMode===0){ await fr(1); if (O3.boat && O3.boat.visible && Math.hypot(O3.boat.position.x, O3.boat.position.z) > 0.3) ashore = true; }
    out.ashore = ashore; out.inMode = G.gameMode; out.kind = G.siteKind;
    /* back out */
    dgFinish(true); setUi('playing'); await fr(60);
    const C = o3C(s.x, s.y), state = ()=>{ const P = O3.player; return { pos:[G.owPos.x, G.owPos.y], onSite:G.owPos.x===s.x && G.owPos.y===s.y, boat:!!O3.boat.visible, off:+Math.hypot(O3.boat.position.x, O3.boat.position.z).toFixed(3), inBoat:P && P.g.position.y > 0.1, out:+Math.hypot(O3.ppos.x - C[0], O3.ppos.z - C[1]).toFixed(2) }; };
    let last = null, still = 0; for (let i=0;i<600 && still < 15;i++){ await fr(1); const p = O3.ppos.x.toFixed(3) + ',' + O3.ppos.z.toFixed(3); still = p===last ? still + 1 : 0; last = p; }
    out.back = state(); out.mode = G.gameMode;
    out.shot = O3.renderer.domElement.toDataURL('image/png');
    /* and off under sail */
    let maxOff = 0; moveDir(0, 1); for (let i=0;i<120;i++){ await fr(1); maxOff = Math.max(maxOff, Math.hypot(O3.boat.position.x, O3.boat.position.z)); }
    out.sail = Object.assign(state(), { maxOff:+maxOff.toFixed(3) });
    return out; });
  if (r.shot) require('fs').writeFileSync(SHOTS + '/rs690.png', Buffer.from(r.shot.split(',')[1], 'base64')); r.shot = !!r.shot;
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: ' + m + ' ' + JSON.stringify(r)); };
  A(!r.none, 'a temple at sea');
  A(r.walk && r.ashore && r.inMode===1 && r.kind==='temple', 'in from the boat, which waits at the mooring');
  A(r.mode===0 && r.back.onSite && r.back.out > 2.4, 'back out on the temple\'s tile, outside the well: ' + r.back.out);
  A(r.back.boat && r.back.off < 0.01 && r.back.inBoat, 'in the boat again, not beside it: ' + r.back.off);
  A(r.sail.boat && r.sail.maxOff < 0.01 && r.sail.inBoat && !r.sail.onSite, 'and it sails off with you');
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
