// RS-312: a click always works in a fight. An action pressed while the monsters' answer is pending goes through (their answer
// lands first), and a HUD button that is re-drawn between the press and the release still gets its click. Also: water never
// shows inside the boat - its floor rides above the wave tops, and an unseen lid stands between the hull and the water.
module.exports = async page=>{
  await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing');
    saveCurrentGame = ()=>{};
    G.gameMode = 0; randomEncounter(false); setUi('playing');
    const P = G.player; P.hp = P.maxHp = 9999; G.mon = G.mon.filter((m,i)=>i===0); const m = G.mon[0]; m.hp = m.maxHp = 9999; m.atkBonus = 99; m.dmg1 = 1; m.dmg2 = 1;
    m.x = P.x + 1; m.y = P.y; if (G.map[m.x][m.y]===T_WALL) G.map[m.x][m.y] = T_FLOOR;
    for (let i=0;i<4;i++){ renderGame(); await new Promise(r=>setTimeout(r, 60)); }
    window.__used = 0; qbUse = ()=>{ window.__used++; };
    SET.qb1 = true; renderGame(); });
  const r0 = await page.evaluate(()=>{ tryMove(1, 0); return { pending:foePending() }; });
  if (!r0.pending) throw new Error('a blow leaves the monsters\' answer pending');
  const box = await page.evaluate(()=>{ const s = document.querySelector('#quickBar [data-qb="0"]'); const b = s.getBoundingClientRect(); return { x:b.x + b.width/2, y:b.y + b.height/2 }; });
  await page.mouse.move(box.x, box.y); await page.mouse.down();
  const held = await page.evaluate(()=>{ const el = document.getElementById('quickBar'), s0 = el.querySelector('[data-qb="0"]'); el._h = ''; renderGame(); renderGame(); return { same:s0.isConnected, held:uiHeld(el) }; });
  await page.mouse.up(); await page.waitForTimeout(100);
  const r1 = await page.evaluate(()=>({ used:window.__used, released:!UIHOLD.el, redrawn:document.getElementById('quickBar')._h!=='' }));
  console.log(JSON.stringify({ held, r1 }));
  if (!held.same || !held.held) throw new Error('the bar is not redrawn under a held press '+JSON.stringify(held));
  if (r1.used!==1) throw new Error('the press mid-fight fires its click once: '+r1.used);
  if (!r1.released || !r1.redrawn) throw new Error('the bar lets go and redraws after the click '+JSON.stringify(r1));
  // every action path hurries the pending answer instead of dropping the press
  const hur = await page.evaluate(()=>['tryMove','moveDir','rangedAttack','reachAttack','castKnownSpell','castDivineSmite','rsCastFromBook','useAbility'].filter(n=>/foeHurry\(\)/.test(String(window[n])) && !/foeBusy\(\)\) return/.test(String(window[n]))).length);
  if (hur!==8) throw new Error('every action path hurries their answer: '+hur);
  // the boat
  const b = await page.evaluate(async ()=>{
    G.gameMode = 0; G.mon = []; const sp = G.ow.spawnPos; let at = null;
    for (let r=2; r<60 && !at; r++) for (let dx=-r; dx<=r && !at; dx++) for (let dy=-r; dy<=r; dy++){ const x = sp.x+dx, y = sp.y+dy; if (G.ow.map[x] && G.ow.map[x][y]===OW_WATER && !iceAt(x, y)){ at = { x, y }; break; } }
    if (!at) return { skip:true };
    G.player.boat = G.player.boat || 1; G.owPos = at; O3.win = null; for (let k=0;k<8;k++){ renderGame(); await new Promise(r=>setTimeout(r, 40)); }
    const T = THREE, out = { vis:O3.boat.visible }; let lid = null, fl = null; O3.boat.traverse(o=>{ if (o.name==='waterLid') lid = o; if (o.name==='boatFloor') fl = o; });
    out.lid = !!lid && lid.material.colorWrite===false && lid.material.depthWrite===true && lid.renderOrder < (O3.water.renderOrder||0);
    /* the floor's lowest point, at the boat's lowest bob and most roll, against the highest wave top */
    let lo = 1e9; for (const ph of [0, 0.4, 0.8, 1.2, 1.6, 2.0, 2.4, 2.8]){ O3.t = 100 + ph; renderGame(); O3.boat.updateMatrixWorld(true); const pa = fl.geometry.attributes.position, v = new T.Vector3();
      for (let i=0;i<pa.count;i++){ v.fromBufferAttribute(pa, i).applyMatrix4(fl.matrixWorld); lo = Math.min(lo, v.y); } }
    out.margin = lo - (O3_WATER_Y + 0.047); return out; });
  console.log(JSON.stringify(b));
  if (b.skip) return;
  if (!b.vis || !b.lid) throw new Error('the boat carries its unseen water lid '+JSON.stringify(b));
  if (!(b.margin > 0)) throw new Error('the boat floor stays above the wave tops: '+b.margin);
};
