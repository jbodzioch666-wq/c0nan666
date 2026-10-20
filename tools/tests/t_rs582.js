// RS-582: a town's scene is parked while you're inside a building and put straight back when you come out - the same houses,
// walls, trees and people, nothing built again, nothing for the warm-up to draw. Back from the open land to the same town,
// laid out the same, the houses come back and only the people are made afresh. A siege staged while you stand in a town no
// longer throws the town's scene away. A forced rebuild still rebuilds
module.exports = async page=>{
  page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 200)));
  const r = await page.evaluate(async ()=>{ window.__noWarmSlice = false; goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1;
    const fr = async n=>{ for (let i=0;i<n;i++){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); } };
    let builds = 0; const b0 = v3BuildScene; v3BuildScene = function(){ builds++; return b0.apply(this, arguments); };
    const t = G.ow.spawnPos; G.owPos = { x:t.x, y:t.y }; enterVillage(); setUi('playing'); await fr(90); townClosedCheck = ()=>false; const out = {};
    const people = ()=>[V3.player].concat(V3.npcs||[], V3.villagers||[]).filter(Boolean), disposed = w=>{ let n = 0; w.traverse(o=>{ if (o.geometry && o.geometry.__gone) n++; }); return n; };
    const D = THREE.BufferGeometry.prototype.dispose; THREE.BufferGeometry.prototype.dispose = function(){ this.__gone = 1; return D.call(this); };
    /* into a shop and out: the same world, the same people, nothing disposed, no warm-up */
    const w0 = V3.world, p0 = people(), m0 = V3.mats, key = (G.townVendors||[]).map(v=>v.key).find(k=>ROOM_LAYOUT[k]); builds = 0;
    enterInterior(key); await fr(60); out.room = { interior:!!G.interior, worldChanged:V3.world!==w0, parked:!!(V3.parked && V3.parked.world===w0), builds };
    const seen = gfxWarmSeen(V3.renderer); builds = 0; let card = 0; const C0 = gfxWarmCard; gfxWarmCard = function(){ card++; return C0.apply(this, arguments); }; exitInterior(); const t0 = performance.now(); await fr(2); out.outMs = Math.round(performance.now() - t0); await fr(60);
    const pp = V3.player && V3.player.g.position;
    out.out = { builds, sameWorld:V3.world===w0, inScene:w0.parent===V3.scene, samePeople:people().length===p0.length && people().every((p, i)=>p===p0[i]), sameMats:V3.mats===m0, disposed:disposed(w0), warmWait:!!V3.warmWait,
      newMats:(()=>{ let n = 0; V3.world.traverse(o=>{ if (o.material) for (const m of [].concat(o.material)) if (!seen.has(m)) n++; }); return n; })(), newKinds:(()=>{ const k = new Map(); V3.world.traverse(o=>{ if (o.material) for (const m of [].concat(o.material)) if (!seen.has(m)){ const key = (o.name||o.type) + ':' + m.type + (m.visible ? '' : ' hidden') + (o.visible ? '' : ' objHidden'); k.set(key, (k.get(key)||0) + 1); } }); return [...k].slice(0, 8); })(), playerAt:pp ? [Math.floor(pp.x), Math.floor(pp.z)] : null, player:[G.player.x, G.player.y],
      card, plates:V3.labels.querySelectorAll('.v3plate').length, platesListed:(V3.plates||[]).length, banner:(document.getElementById('v3banner')||{}).textContent||'', lamps:V3.plights.filter(l=>l.userData && l.userData.p).length };
    /* out to the land and back: the same houses, new people */
    const w1 = V3.world; G.gameMode = 0; G.villageNpcs = []; setUi('playing'); await fr(20); builds = 0; enterVillage(); setUi('playing'); await fr(60);
    out.back = { builds, sameWorld:V3.world===w1, newPeople:people().length > 0 && people().every(p=>!p0.includes(p)), npcsMatch:(V3.npcs||[]).every(p=>G.villageNpcs.includes(p.n)), disposed:disposed(w1), plates:V3.labels.querySelectorAll('.v3plate').length };
    /* a siege staged while you stand here: the scene stays */
    const w2 = V3.world, pl2 = V3.labels.childNodes.length; builds = 0; try{ siegeTownStage({ id:777, x:t.x, y:t.y, phase:1 }); }catch(e){ out.siegeErr = String(e).slice(0, 120); } await fr(20);
    out.siege = { builds, sameWorld:V3.world===w2, labels:V3.labels.childNodes.length===pl2, staged:!!SIEGE_TOWN }; try{ siegeTownDrop(); }catch(e){}
    /* a forced rebuild still rebuilds */
    const w3 = V3.world; builds = 0; V3.mapRef = null; await fr(20); out.forced = { builds, newWorld:V3.world!==w3, oldDisposed:disposed(w3) > 0 };
    THREE.BufferGeometry.prototype.dispose = D; return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.room.interior && r.room.worldChanged && r.room.parked && r.room.builds===1, 'the room is built, the town parked');
  A(r.out.builds===1 && r.out.sameWorld && r.out.inScene && r.out.samePeople && r.out.sameMats && r.out.disposed===0, 'out of the shop: the same town scene put back, nothing built or disposed');
  A(r.out.newKinds.every(k=>/Sprite/.test(k[0])) && !r.out.warmWait && r.out.card===0, 'and nothing for the warm-up to draw but a puff of smoke, with no loading card: ' + JSON.stringify(r.out.newKinds));
  A(r.out.playerAt && r.out.playerAt[0]===r.out.player[0] && r.out.playerAt[1]===r.out.player[1], 'you stand at the door');
  A(r.out.plates > 5 && r.out.plates===r.out.platesListed && r.out.lamps > 0 && !/^\s*$/.test(r.out.banner), 'the name plates, the lamps and the banner are back');
  A(r.outMs < 120, 'coming out costs no frame to speak of: ' + r.outMs + 'ms');
  A(r.back.builds===1 && r.back.sameWorld && r.back.newPeople && r.back.npcsMatch && r.back.disposed===0 && r.back.plates > 5, 'back from the land: the same houses, new people: ' + JSON.stringify(r.back));
  A(!r.siegeErr && r.siege.staged && r.siege.sameWorld && r.siege.labels, 'a siege staged here leaves the town scene alone: ' + JSON.stringify(r.siege));
  A(r.forced.builds===1 && r.forced.newWorld && r.forced.oldDisposed, 'a forced rebuild still rebuilds and frees the old scene');
  if (errs.length) throw new Error('page errors: ' + errs.join(' | '));
};
