// RS-857: the temple's windows are stained glass lit by the hour (the old violet sheet over them glowed the same at dawn, noon and
// night and stood taller than the frames); fishing from your boat, a click on the water sails you off (the ship lay still while you
// fished, so the course was never sailed and the fishing never stopped). Shots: shots/rs857-temple.png, shots/rs857-sea.png
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const A = (c, m, d)=>{ if (!c) throw new Error(m + ' :: ' + JSON.stringify(d)); };
  const s = await page.evaluate(async ()=>{ const fr = n=>new Promise(res=>{ let i = 0; const f = ()=>++i >= n ? res() : requestAnimationFrame(f); requestAnimationFrame(f); }), w = ms=>new Promise(res=>setTimeout(res, ms));
    window.__noLock = true; goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; weatherSync = ()=>{}; const p = G.player; G.gameMode = 0; p.hasBoat = 1; p.boatTier = 4; p.clock = Math.round(0.45*DAY_LENGTH); p.hp = p.maxHp = 99999;
    for (const k of ['rod','net','harpoon']) skP().tools[k] = Math.max(1, skP().tools[k]||0); skGainXP('fishing', 1e7);
    moveOverworldEncounters = ()=>{}; checkOverworldEncounterTrigger = ()=>{}; wevStep = ()=>false; wgStep = ()=>false; sqWorldStep = ()=>false; questOverworldTurn = ()=>false; checkMythicBeastTrigger = ()=>false; owHunterSpawn = ()=>{}; owHuntersStep = ()=>false;
    const M = G.ow.map, sea = (x, y)=>M[x] && M[x][y]===OW_WATER && !owFresh(x, y); let n = null, st = null, away = null;
    for (let x=8; x<OW_COLS-8 && !n; x++) for (let y=8; y<OW_ROWS-8 && !n; y++){ if (!sea(x, y)) continue; const q = skNodeAt(x, y); if (!q || q.k!=='fishing' || q.type!=='deep' || q.gone) continue;
      for (const [dx, dy] of [[0,1],[1,0],[0,-1],[-1,0]]){ let ok = true; for (let k=1;k<=7;k++) if (!sea(x + dx*k, y + dy*k) || skNodeAt(x + dx*k, y + dy*k)) ok = false;
        for (let i=-2;i<=2;i++) for (let j=-2;j<=2;j++) if (!sea(x + dx + i, y + dy + j)) ok = false; if (ok){ n = q; st = [x + dx, y + dy]; away = [x + dx*6, y + dy*6]; break; } } }
    if (!n) return { none:true };
    G.owPos = { x:st[0], y:st[1] }; owReveal(st[0], st[1], 10); for (let i=0;i<40 && !(O3.boat && O3.boat.visible && O3.ship);i++) await fr(20); await fr(30);
    o3GoGather(n.x, n.y); const t0 = performance.now(); while (!G.gather && performance.now() - t0 < 8000) await fr(3); await w(1200);
    const l = o3L(away[0], away[1]), v = new THREE.Vector3(l[0] + 0.5, O3.heightAt ? O3.heightAt(l[0] + 0.5, l[1] + 0.5) : 0, l[1] + 0.5).project(O3.cam), rc = O3.cv.getBoundingClientRect();
    return { node:[n.x, n.y], st, away, atSea:seaOn(), fishing:!!G.gather, sx:rc.left + (v.x + 1)/2*rc.width, sy:rc.top + (1 - v.y)/2*rc.height }; });
  console.log(JSON.stringify(s)); if (s.none) console.log('no deep fishing spot in this world - the sea case skipped'); else {
  A(s.atSea && s.fishing, 'not fishing from the boat', s);
  await page.mouse.click(s.sx, s.sy);
  const s2 = await page.evaluate(async st=>{ const w = ms=>new Promise(res=>setTimeout(res, ms)); const stop = !G.gather; await w(6000); return { stop, moved:Math.abs(G.owPos.x - st[0]) + Math.abs(G.owPos.y - st[1]), fishing:!!G.gather, at:[G.owPos.x, G.owPos.y] }; }, s.st);
  await page.screenshot({ path: SHOTS + '/rs857-sea.png' }); console.log(JSON.stringify(s2)); A(errs.length===0, errs.join('|'));
  A(s2.stop && !s2.fishing && s2.moved >= 2, 'the click on the water did not sail you off', s2); }
  const r = await page.evaluate(async ()=>{ const w = ms=>new Promise(res=>setTimeout(res, ms)), out = {};
    const p = G.player;
    const t = townList()[0]; G.owPos = { x:t.x, y:t.y }; enterVillage(); setUi('playing'); townClosedCheck = ()=>false;
    const at = ph=>{ p.clock = Math.round(ph * DAY_LENGTH) + 3*DAY_LENGTH; };
    const look = async ph=>{ at(ph); if (G.interior) exitInterior(); enterInterior('temple'); setUi('playing'); p.x = ROOM.x0 + 3; p.y = ROOM.y0 + 2; for (let i=0;i<20;i++){ renderGame(); await w(30); }
      const panes = [], sheets = []; V3.world.traverse(o=>{ const g = o.isMesh && o.geometry.parameters; if (!g) return; if (g.width===0.9 && g.height===0.9 && g.depth===0.06) panes.push(o); if (o.geometry.type==='PlaneGeometry' && g.width===0.9 && g.height===1.4) sheets.push(o); });
      const m = panes[0] && panes[0].material; return { n:panes.length, sheets:sheets.length, stained:!!(m && m.map && m.emissiveMap), e:m ? m.emissive.r + m.emissive.g + m.emissive.b : -1, ei:m ? m.emissiveIntensity : -1, ticked:m===V3.winGlass }; };
    out.night = await look(0.9); out.dawn = await look(0.25); out.noon = await look(0.45);
    exitInterior(); return out; });
  await page.screenshot({ path: SHOTS + '/rs857-temple.png' }); console.log(JSON.stringify(r));
  A(r.noon.n===2 && r.noon.stained && r.noon.ticked, 'the temple panes are not stained glass lit by the hour', r); A(r.noon.sheets===0, 'the violet sheet is still there', r);
  A(r.noon.e*r.noon.ei > r.dawn.e*r.dawn.ei && r.dawn.e*r.dawn.ei > r.night.e*r.night.ei, 'the glass does not follow the hour', r);
  A(errs.length===0, errs.join('|')); };
