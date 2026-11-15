// RS-608: a robe in at the waist as the body under it (its cloth follows the waist slider), its cloth laid over the shoulders' tops to
// the neckline with no bodice left showing above it, the figure in the world drawn with that same seamless weave; and a monster's death
// samples its pose through applyBoneTransform (the renamed boneTransform warned to the console on every point, every death)
module.exports = async page=>{
  page.setDefaultTimeout(0); const errs = [], warns = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 200))); page.on('console', m=>{ if (/boneTransform/.test(m.text())) warns.push(m.text()); });
  const r = await page.evaluate(async ()=>{ goToCharCreate(); G.chosenKit = 2; ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    G.gear.chest = rsMakeArmour('cloth', 0, 'chest'); G.player.look.body = 1; const out = {};
    const waistAt = w=>{ G.player.look.bd = { waist:w }; const e = m3dInstance({}, rsPlayerLook()), sk = e.rig.skirt, q = sk.geometry.attributes.position; let m = 0, chestTop = 0;
      for (let i=0;i<q.count;i++){ const Y = q.getY(i) + sk.position.y; if (Math.abs(Y - 0.11) < 0.012) m = Math.max(m, Math.abs(q.getX(i)*sk.scale.x)); if (Y > chestTop) chestTop = Y; }
      const ix = e.rig.chestMesh.geometry.index; return { w:+m.toFixed(3), top:+chestTop.toFixed(3), shown:ix ? ix.count : -1, rig:e.rig, sk }; };
    const a = waistAt(0), b = waistAt(1); out.waist = [a.w, b.w]; out.top = a.top; out.shown = a.shown;
    /* the shoulders' tops: at the side, the cloth goes as high as the bodice's shoulder there (it stopped below it before) */
    { const cm = a.rig.chestMesh, g = cm.geometry.userData.from || cm.geometry, q = g.attributes.position, sk = a.sk, qs = sk.geometry.attributes.position; let bTop = 0, cTop = 0;
      for (let i=0;i<q.count;i++){ const X = Math.abs(q.getX(i)*cm.scale.x + cm.position.x), Y = q.getY(i)*cm.scale.y + cm.position.y; if (X > 0.1 && X < 0.12 && Y > bTop) bTop = Y; }
      for (let i=0;i<qs.count;i++){ const X = Math.abs(qs.getX(i)*sk.scale.x), Y = qs.getY(i) + sk.position.y; if (X > 0.1 && X < 0.12 && Y > cTop) cTop = Y; } out.sh = [+bTop.toFixed(3), +cTop.toFixed(3)]; }
    /* in the world: the player's figure keeps the three-way weave and its points */
    G.player.look.bd = {}; for (let i=0;i<120;i++) await new Promise(r=>requestAnimationFrame(r));
    let tri = 0, triPts = 0; for (const sc of [typeof O3!=='undefined' && O3.scene, typeof V3!=='undefined' && V3.scene]) if (sc) sc.traverse(o=>{ if (!o.isMesh || !o.material || !o.material.userData || !o.material.userData.tri) return; tri++; const t = o.geometry.attributes.aTri; if (t){ let s = 0; for (let i=0;i<Math.min(t.array.length, 3000);i++) s += Math.abs(t.array[i]); if (s > 0) triPts++; } });
    out.world = [tri, triPts];
    /* a death: the dying figure's pose sampled */
    const s = questNearbySites(G.owPos.x, G.owPos.y, 1, 60, ['dungeon'])[0]; G.gameMode = 0; G.pendingDungeon = { x:s.x, y:s.y }; enterDungeonConfirm(); setUi('playing'); G.player.hp = G.player.maxHp = 99999;
    for (let i=0;i<200;i++) await new Promise(r=>requestAnimationFrame(r));
    let died = 0; for (const m of G.mon){ if (!m.alive) continue; m.x = G.player.x + 1; m.y = G.player.y; for (let i=0;i<30;i++) await new Promise(r=>requestAnimationFrame(r)); m.hp = 0; const i = G.mon.indexOf(m); noteFoe(i); monsterDies(i); died++; for (let i=0;i<90;i++) await new Promise(r=>requestAnimationFrame(r)); if (died >= 2) break; }
    out.died = died; return out; });
  console.log(JSON.stringify(r), warns.length);
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.waist[1] - r.waist[0] > 0.015, 'the robe follows the waist: narrow ' + r.waist[0] + ', broad ' + r.waist[1]);
  A(r.waist[0] < 0.1, 'in at a slim waist: ' + r.waist[0]);
  A(r.shown===0, 'none of the bodice left showing above the cloth: ' + r.shown);
  A(r.sh[1] >= r.sh[0] - 0.004, 'the cloth up over the shoulder\'s top: bodice ' + r.sh[0] + ', cloth ' + r.sh[1]);
  A(r.world[0] > 0 && r.world[1]===r.world[0], 'the figure in the world in the three-way weave, with its points: ' + r.world);
  A(r.died >= 1, 'a monster died');
  A(!warns.length, 'no boneTransform warnings: ' + warns.length);
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
