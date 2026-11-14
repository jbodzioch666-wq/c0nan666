// RS-787: a battle at a town with its stops taken out. The loading card goes up before the town is built and before the way home, instead of a freeze; the banner names the battle, not a roadside encounter; a shire's trees are told where you stand and the camera is, so they open round the line to you; a building's fade builds no shader in mid-walk; a creature joining the battle has its shaders started off the frame
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e)));
  const r = await page.evaluate(async ()=>{ const wait = ms=>new Promise(res=>setTimeout(res, ms)), until = async (f, ms)=>{ const t = performance.now(); while (!f() && performance.now() - t < ms){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); } return f(); }, out = {}; window.__noLock = true; goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; const p = G.player; p.hp = p.maxHp = 999999; SET.loadCards = true;
    const t = townList().find(t=>(townFlavorAt(t.x, t.y)||{}).race==='halfling'); G.owPos = { x:t.x, y:t.y }; G.gameMode = 0; const key = t.x + ',' + t.y, e = wevP(), id = ++e.seq, nm = o3TownName(t.x, t.y), card = ()=>{ const c = document.getElementById('loadCard'); return { show:!!(c && c.classList.contains('show')), text:c ? c.textContent : '' }; };
    /* the card first, then the siege */
    const d = { id, kind:'siege', key, x:t.x, y:t.y, camp:'orc', until:wevTurn() + DAY_LENGTH }; e.dyn.push(d); siegeCardThen(`The siege of ${nm}`, 'the battle before the gate', ()=>wevSiegeFight(d)); out.before = { mode:G.gameMode, war:!!G.siegeWar, card:card() };
    const started = await until(()=>G.gameMode===2 && G.siegeWar && SIEGE_TOWN && SIEGE_TOWN.cands && !SIEGE_TOWN.fadeW, 60000); out.started = !!started; for (const m of G.mon) m.hp = m.maxHp = 9999999; await wait(600);
    const hud = ()=>document.body.innerText; out.labelField = /siege of /.test(hud()) && /wave 1 of 3/.test(hud()); out.roadside = /roadside encounter/.test(hud());
    const U = shireUniforms(), Tn = SIEGE_TOWN, pp = ISO.player.pos; await new Promise(r=>requestAnimationFrame(r)); out.camOff = +U.uCamP.value.distanceTo(FPD.cam.position).toFixed(3); out.focusOff = +Math.hypot(U.uFocus.value.x - ISO.player.pos.x, U.uFocus.value.z - ISO.player.pos.y).toFixed(3); out.warmGone = !Tn.fadeW && !Tn.world.getObjectByName('siegeFadeWarm');
    /* a new creature's shaders start off the frame */
    const realS = gfxCompileScene; let live = 0; gfxCompileScene = function(V, rr, sc, cam, w){ if (V===FPD && V.compileDue && V.compileLive) live++; return realS(V, rr, sc, cam, w); }; G.mon.forEach((m, i)=>{ if (m.alive){ m.hp = 0; monsterDies(i); } }); await until(()=>G.siegeWar.wave===2 && G.mon.some(m=>m.alive), 8000); for (const m of G.mon) if (m.alive) m.hp = m.maxHp = 9999999; const t2 = performance.now(); while (!live && performance.now() - t2 < 5000) await new Promise(r=>requestAnimationFrame(r)); out.live = live; gfxCompileScene = realS; out.labelWave = /wave 2 of 3/.test(hud());
    /* the gate gives way */
    siegeWarStreets(G.siegeWar); for (const m of G.mon) m.hp = m.maxHp = 9999999; await until(()=>FPD.mapRef===G.map && !FPD.warmWait, 15000); await wait(800); out.labelStreets = /the streets/.test(hud());
    /* each building's fade, by a ray through it: no new shader */
    const P = FPD.r.info.programs, n0 = P.length; out.fades = 0; const c = FPD.cam.position.clone(), ps = ISO.player.pos, ox = ps.x, oy = ps.y; for (const occ of Tn.occ.slice(0, 8)){ const cn = new THREE.Vector3(); new THREE.Box3().setFromObject(occ).getCenter(cn); const k = (0.55 - c.y)/(cn.y - c.y); ps.x = c.x + (cn.x - c.x)*k; ps.y = c.z + (cn.z - c.z)*k; Tn.t0 = performance.now() - 50; siegeTownTick(); if ((occ.userData.grp.userData.fade||0) > 0.05) out.fades++; gfxRender(FPD.r, FPD.scene, FPD.cam, 'fpd'); } ps.x = ox; ps.y = oy; out.newPrograms = P.length - n0; await wait(300);
    /* won: the card, and only then home */
    G.mon.forEach((m, i)=>{ if (m.alive){ m.hp = 0; monsterDies(i); } }); const t3 = performance.now(); let sawCard = false, modeAtCard = null; while (performance.now() - t3 < 3000){ const q = card(); if (q.show && /siege is broken/.test(q.text)){ sawCard = true; modeAtCard = G.gameMode; out.townAtCard = !!SIEGE_TOWN; break; } await new Promise(r=>requestAnimationFrame(r)); } out.sawCard = sawCard; out.modeAtCard = modeAtCard; await until(()=>G.gameMode===3, 20000); out.home = G.gameMode; out.dropped = !SIEGE_TOWN; out.siegeGone = !G.siegeWar;
    return out; });
  console.log('rs787', JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: ' + m + ' ' + JSON.stringify(r)); };
  A(r.before.card.show && /The siege of/.test(r.before.card.text) && r.before.mode!==2 && !r.before.war, 'the card is up before the town is built');
  A(r.started, 'the battle starts after it');
  A(r.labelField && !r.roadside, 'the banner names the battle and its wave');
  A(r.labelWave && r.labelStreets, 'the banner follows the battle');
  A(r.camOff < 0.01 && r.focusOff < 0.01, 'a shire\'s trees know the camera and where you stand');
  A(r.warmGone, 'the fade\'s stand-ins are gone once built');
  A(r.live > 0, 'a new wave warms off the frame');
  A(r.fades >= 4 && r.newPrograms===0, 'a building\'s fade builds no new shader');
  A(r.sawCard && r.modeAtCard===2 && r.townAtCard, 'won: the card goes up with the battle still behind it');
  A(r.home===3 && r.dropped && r.siegeGone, 'and then you\'re home, the staged town gone');
  A(!errs.length, 'no page errors: ' + errs.slice(0, 2).join(' | '));
};
