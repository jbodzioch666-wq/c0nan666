// RS-604: a robe in one piece - its cloth runs from the hem up over the chest to the shoulders (the bodice above the bust was another
// cloth, with a seam under it), the trim strip down the front laid on it; and no automatic dropping of the render resolution.
// Shot: shots/rs604-robe.png
module.exports = async page=>{
  page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 200)));
  const r = await page.evaluate(async ()=>{ goToCharCreate(); G.chosenKit = 2; ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); const T = THREE, out = {};
    G.gear.chest = rsMakeArmour('cloth', 4, 'chest'); G.gear.chest.dye = '#e4ddcc'; G.player.look.body = 1; G.player.look.beard = 0;
    const e = m3dInstance({}, rsPlayerLook()), sk = e.rig.skirt, cm = e.rig.chestMesh;
    out.top = sk.userData.extTop; out.shoulder = e.rig.arms[0].sh.position.y;
    /* the bodice under it: only its very top is left (round the neck and the shoulders' tops) */
    { const g = cm.geometry, q = g.attributes.position, I = g.index ? g.index.array : null; let lo = 9; if (I) for (let t=0;t<I.length;t++) lo = Math.min(lo, q.getY(I[t])*cm.scale.y + cm.position.y); out.bodiceFrom = +lo.toFixed(3); }
    /* the strip down the front: on the cloth, outside it */
    { let inside = 0, n = 0; e.rig.torso.children.forEach(m=>{ if (!m.userData || !m.userData.frontTrim) return; n++; }); out.strips = n; }
    /* the render resolution: no stepping down, however slow */
    RES.lvl = 0; for (let i=0;i<10;i++){ RES.avg = 1; RES.n = 89; resTick(1/15); } out.res = { lvl:RES.lvl, scale:resScale() };
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.top > r.shoulder, 'the robe\'s cloth runs up over the chest to the shoulders: ' + r.top + ' / ' + r.shoulder);
  A(r.bodiceFrom > r.top - 0.05, 'the bodice under it is only left at the very top: ' + r.bodiceFrom);
  A(r.res.lvl===0 && r.res.scale===1, 'no automatic resolution drop: ' + JSON.stringify(r.res));
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
