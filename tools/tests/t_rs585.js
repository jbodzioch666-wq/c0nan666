// RS-585: the dye works. A tome has a trim to dye (its emblem and its clasp), and its emblem is on both covers; every unique that
// takes a dye has a trim too (a plain great helm's bands, the sage's hat band, bands on plate legs, a gauntlet's cuff); the pack's list
// is gone, only what you wear is dyed; the book is shut at your side in the dye works. And the staff sits up in the palm. Shots:
// shots/rs585-dye.png
module.exports = async page=>{
  page.setDefaultTimeout(0);
  const r = await page.evaluate(async ()=>{ goToCharCreate(); G.chosenKit = 2; ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; const out = {}, wait = ms=>new Promise(r=>setTimeout(r, ms)), T = THREE;
    for (const d of DYES) skAdd('dye_'+d[0], 9);
    /* the tome: trimmable, its emblem in the trim dye, its clasp too, an emblem on each cover */
    G.gear.offhand = rsMakeArmour('cloth', 2, 'offhand'); const tome = G.gear.offhand && G.gear.offhand.used && G.gear.offhand.rsFam==='cloth' ? G.gear.offhand : null; out.hasTome = !!tome;
    if (tome){ out.tomeTrim = trimmable(tome); G.player.emblem = 'cross'; trimDyeApply('g:offhand', DYES[2][0]); const L = rsPlayerLook(); out.tomeEmCol = L.o.tomeEmCol; out.tomeClasp = L.o.tomeClasp; out.want = DYES[2][2];
      const e = m3dInstance({}, L); let ems = 0; e.rig.tome && e.rig.tome.traverse(o=>{ if (o.isMesh && o.material && o.material.map && o.material.alphaTest) ems++; }); out.emblems = ems; }
    /* the uniques: each one that takes a dye has a trim, and its trim shows on the figure */
    out.uniq = {}; for (let id=1; id<=UNIQUES.length; id++){ const it = buildUnique(id, 40); try{ rsMigrateItem2 && rsMigrateItem2(it); rsUniqueify && rsUniqueify(it); }catch(e){}
      if (!dyeable(it)) continue; out.uniq[it.nm] = { slot:it.slot, trim:trimmable(it) }; }
    const wearU = (nm, slot)=>{ const id = UNIQUES.findIndex(u=>u[0]===nm) + 1, it = buildUnique(id, 40); try{ rsMigrateItem2 && rsMigrateItem2(it); rsUniqueify && rsUniqueify(it); }catch(e){} it.trimDye = '#c02a30'; G.gear[slot] = it; return it; };
    wearU('Crown of Thieves', 'head'); wearU('Stormtread', 'legs'); wearU('Grasp of the Ogre', 'arms');
    { const L = rsPlayerLook(); out.looks = { helmTrim:L.o.helmTrim, legTrim:L.o.legTrim, gloveTrim:L.o.gloves && L.o.gloves.trim };
      const e = m3dInstance({}, L); let rings = 0; e.root.traverse(o=>{ if (o.isMesh && o.geometry && o.geometry.type==='TorusGeometry') rings++; }); out.rings = rings; }
    wearU('Visage of the Sage', 'head'); out.sageBand = rsPlayerLook().o.sageBand;
    /* the window: worn only; the book shut */
    G.inv.push(Object.assign(newItem(), { used:1, nm:'Spare Robe', slot:'chest', rsFam:'cloth', rsTier:1 }));
    wearU('Crown of Thieves', 'head'); openDyeWorks(); await wait(400); const ov = document.getElementById('overlay'); out.pack = /IN YOUR PACK/i.test(ov.textContent); out.spare = /Spare Robe/.test(ov.textContent);
    out.labels = [...ov.querySelectorAll('.dyerow .muted')].map(x=>x.textContent.split(' · ')[0]).filter(x=>/^its /.test(x));
    for (let i=0;i<400 && (!LP.e || LP.pend);i++) await wait(25); for (let i=0;i<6;i++) await new Promise(r=>requestAnimationFrame(r));
    const tg = LP.e && LP.e.rig.tome; out.shut = tg ? { closed:tg.getObjectByName('tomeClosed').visible, open:tg.getObjectByName('tomeOpen').visible } : null;
    /* the staff, up in the palm */
    const e3 = m3dInstance({}, rsPlayerLook()), piv = e3.rig.weapon && e3.rig.weapon.parent, g = m3dGrip(e3.rig.b || 1); out.staffPiv = piv ? [+(piv.position.x - g[0]).toFixed(4), +(piv.position.y - g[1]).toFixed(4)] : null;
    return out; });
  await page.screenshot({ path: SHOTS + '/rs585-dye.png' });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.hasTome && r.tomeTrim, 'a tome has a trim to dye');
  A(r.tomeEmCol===r.want && r.tomeClasp===r.want, 'its emblem and clasp take the trim dye');
  A(r.emblems===4, 'its emblem on both covers, shut and open: ' + r.emblems);
  A(Object.values(r.uniq).length >= 4 && Object.values(r.uniq).every(u=>u.trim), 'every unique that takes a dye has a trim: ' + JSON.stringify(r.uniq));
  A(r.looks.helmTrim==='#c02a30' && r.looks.legTrim==='#c02a30' && r.looks.gloveTrim==='#c02a30', 'and it shows: the helm bands, the leg bands, the cuffs: ' + JSON.stringify(r.looks) + ' rings ' + r.rings);
  A(r.sageBand==='#c02a30', 'the sage hat band in the trim dye');
  A(!r.pack && !r.spare, 'no pack list in the dye works');
  A(r.labels.includes('its emblem and clasp') && r.labels.includes('its trim'), 'the trim rows are named by what they are: ' + r.labels);
  A(r.shut && r.shut.closed && !r.shut.open, 'the book shut in the dye works: ' + JSON.stringify(r.shut));
  A(r.staffPiv && r.staffPiv[0] < -0.005 && r.staffPiv[1] > 0.01, 'the staff up into the palm: ' + r.staffPiv);
};
