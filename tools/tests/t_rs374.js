// RS-374: a creature killed mid-flash doesn't stay white; the bank shows your pack and the vault side by side, with the
// quiver's arrows and bolts in the pack list to bank; the bag's tabs stay on one row (the Quiver tab no longer wraps out of
// sight on All or Resources); citizens have no plate over their heads - point at one to see who it is; the boss floor
// opens with its card (RS-375); the treasure room's door swings open on its hinges and stays open
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1;
    const out = {}, wait = ms=>new Promise(r=>setTimeout(r, ms)), T = THREE;
    // the flash
    { const m = { nm:'giant spider', x:5, y:5, hp:10, maxHp:10, alive:true }, pt = m3dPortrait(m), e = m3dInstance(m, pt); e.pt = pt; const g = new T.Group(); g.add(e.holder);
      M3D.inst.set(m, e); for (const mt of e.mats) mt.emissive.setScalar(0.55); m3dKill(m); out.flash = Math.max(...e.mats.map(mt=>mt.emissive.r + mt.emissive.g + mt.emissive.b)); M3D.live.delete(e); }
    // the bag's tabs on one row, the Quiver tab there on every tab
    addArrows(30, 1); addArrows(12, RS_BOLT0); for (let i=0;i<6;i++) G.inv.push(genItem(10, 'weapon'));
    out.tabs = {}; for (const t of ['all','res','gear']){ setUi('inventory'); csBagTab(t); await wait(60); const tb = [...document.querySelectorAll('#overlay .cs-bagtab')], q = tb.find(e=>/Quiver/.test(e.textContent));
      out.tabs[t] = !!q && q.getBoundingClientRect().width > 10 && new Set(tb.map(e=>Math.round(e.getBoundingClientRect().top))).size===1; }
    // the bank: side by side, the quiver in the pack list, banked as a bundle
    setUi('bank'); await wait(100); { const ps = [...document.querySelectorAll('#overlay .bank-split > .panel')].map(e=>e.getBoundingClientRect()); out.side = ps.length===2 && Math.abs(ps[0].top - ps[1].top) < 4 && ps[1].left > ps[0].right - 4; }
    out.ammoRows = [...document.querySelectorAll('#overlay .invrow')].filter(e=>/quiver/.test(e.textContent)).length;
    { const bp = bankP(), n0 = bp.stash.length, a0 = arrowCount(RS_BOLT0); bankDepositAmmo(RS_BOLT0); out.banked = bp.stash.length - n0===1 && bp.stash[bp.stash.length-1].qty===a0 && arrowCount(RS_BOLT0)===0; }
    setUi('playing');
    // the boss floor: a notice, no menu
    { let notes = 0; const n0 = notify; notify = (...a)=>{ notes++; return n0(...a); };
      const s = questNearbySites(G.owPos.x, G.owPos.y, 1, 60, ['dungeon'])[0]; G.gameMode = 0; G.pendingDungeon = { x:s.x, y:s.y }; enterDungeonConfirm(); setUi('playing');
      loadLevel(G.dungeonMaxDepth, false); out.bossUi = G.ui; out.bossNote = notes > 0; notify = n0; setUi('playing'); }
    // the treasure room door
    { const p = G.player, D = G.dungeonDeco; let spot = null; for (const [a,b] of [[1,0],[-1,0],[0,1],[0,-1]]) if (G.map[p.x+a] && G.map[p.x+a][p.y+b]===T_FLOOR && !D[p.x+a][p.y+b] && !G.mon.some(m=>m.alive && m.x===p.x+a && m.y===p.y+b)){ spot = [a, b]; break; }
      const x = p.x+spot[0], y = p.y+spot[1]; D[x][y] = 'ldoor'; skAdd('dkey', 1); dgBlocked(x, y); out.door = D[x][y]; out.doorAt = chestOpenedAt(x, y) > 0; out.doorPass = !dgSolid(x, y) && isoPassable(x, y);
      const g = new T.Group(); dgPropModel({ d:'ldooro', rot:0 }, g, (geo, mat, a, b2, c)=>{ const m = new T.Mesh(geo, mat); m.position.set(a, b2, c); g.add(m); return m; }, (k, c)=>new T.MeshStandardMaterial({ color:c||'#888' }), { wood:new T.MeshStandardMaterial(), dwood:new T.MeshStandardMaterial(), stone:new T.MeshStandardMaterial(), iron:new T.MeshStandardMaterial(), gold:new T.MeshStandardMaterial() }, ()=>0.5);
      const hg = g.children[0].children.find(c=>c.isGroup); CHEST_OPEN[G.depth+':'+x+','+y] = performance.now() - 200; g.userData.anim(0, 0, x, y); out.doorMid = +hg.rotation.y.toFixed(2); CHEST_OPEN[G.depth+':'+x+','+y] = performance.now() - 3000; g.userData.anim(0, 0, x, y); out.doorOpen = +hg.rotation.y.toFixed(2); }
    // citizens: no plate until you point at one
    { setUi('playing'); const t = townList()[0]; G.owPos = { x:t.x, y:t.y }; G.gameMode = 0; enterVillage(); setUi('playing'); for (let i=0;i<6;i++){ renderGame(); await wait(40); }
      const folk = V3.plates.filter(p=>p.hover); out.folk = folk.length; renderGame(); out.shown0 = folk.filter(p=>p.el.style.display!=='none').length;
      const pl = folk.find(p=>{ const v = p.obj.position.clone(); v.y += 0.6; v.project(V3.cam); return v.z < 1 && Math.abs(v.x) < 0.8 && Math.abs(v.y) < 0.8; });
      if (pl){ const v = pl.obj.position.clone(); v.y += 0.6; v.project(V3.cam); const mc = V3.cv.parentElement || V3.cv; V3.mxy = { x:(v.x*0.5+0.5)*mc.clientWidth, y:(-v.y*0.5+0.5)*mc.clientHeight }; renderGame(); await wait(30); out.shown1 = folk.filter(p=>p.el.style.display!=='none').length; out.which = pl.el.style.display!=='none'; }
      V3.mxy = null; }
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.flash < 0.01, 'a creature killed mid-flash loses the flash');
  A(r.tabs.all && r.tabs.res && r.tabs.gear, 'the Quiver tab is on the one row of tabs, whichever tab is open');
  A(r.side && r.ammoRows===2 && r.banked, 'the bank: pack and vault side by side, the quiver in the pack list, banked as a bundle');
  A(r.bossUi==='bossPreview', 'the boss floor opens with its card again (RS-375: it was the victory card that was meant)');
  A(r.door==='ldooro' && r.doorAt && r.doorPass && r.doorMid < -0.3 && r.doorMid > -1.6 && Math.abs(r.doorOpen + 1.65) < 0.02, 'the treasure door swings open and stays open, and you walk through it');
  A(r.folk > 0 && r.shown0===0, 'no plates over the citizens');
  A(r.shown1===1 && r.which, 'pointing at a citizen shows who it is');
};
