// RS-647: on a Planet everything goes where the curve puts the land. The sprites (the glows over a dungeon or a town, the icons over the
// monsters) never bent and hung in the air; the names over the towns were placed from where the land would have been flat; a click went past
// a deer or a dungeon a little way off to the ground behind; a landmark past the horizon came up in sight again where it isn't (a volcano by a
// temple, a tower out at sea); and the animals of the old frame stood on after it changed, still and past clicking. Shot: shots/rs647.png
module.exports = async page=>{
  page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const r = await page.evaluate(async ()=>{ const fr = n=>new Promise(res=>{ let i = 0; const f = ()=>++i >= n ? res() : requestAnimationFrame(f); requestAnimationFrame(f); });
    goToCharCreate(); ccBegin(); setWorldSizeTier('planet'); confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.gameMode = 0; G.interior = null; G.player.hasBoat = 1; await fr(90);
    const out = {}, T = THREE, m = G.ow.map;
    out.spriteBent = /dcCurve/.test(T.ShaderLib.sprite.vertexShader);
    out.k = +o3CurveK().toFixed(5);
    /* a landmark: hidden from far off past the horizon, seen near */
    { const lm = owGeo().landmarks.find(l=>l.id==='tower') || owGeo().landmarks[0], at = d=>{ for (let a=0; a<16; a++){ const q = owNb(lm.x, lm.y, Math.round(Math.cos(a*Math.PI/8)*d), Math.round(Math.sin(a*Math.PI/8)*d)); if (q && [OW_GRASS, OW_FOREST, OW_DESERT, OW_TUNDRA].includes(m[q[0]][q[1]])) return q; } return null; };
      const vis = async d=>{ const q = at(d); if (!q) return null; G.owPos = { x:q[0], y:q[1] }; await fr(120); const o = (O3.lmObjs||[]).find(o=>o.lm.id===lm.id); return o ? o.g.visible : null; };
      out.lm = { id:lm.id, near:await vis(10), far:await vis(45) }; }
    /* a town: its name where the curve has put it; a dungeon a little way off: a click on it reaches it */
    { const towns = Object.values(G.ow.townPositions||{}).filter(Boolean); let t = towns[0]; G.owPos = { x:t.x, y:t.y + 6 }; if (m[t.x][t.y + 6]===OW_WATER || m[t.x][t.y + 6]===OW_MOUNTAIN){ const q = owNb(t.x, t.y, 0, -6) || [t.x, t.y]; G.owPos = { x:q[0], y:q[1] }; } await fr(150);
      const pl = (O3.plates||[]).find(p=>p.town && p.x===t.x && p.y===t.y), v = new T.Vector3(), cw = O3.cv.width/(window.devicePixelRatio||1), ch = O3.cv.height/(window.devicePixelRatio||1);
      if (pl){ v.copy(pl.pos); const dr = o3CurveDrop(v.x, v.z); v.y -= dr; v.project(O3.cam); const tr = pl.el.style.transform, mm = /translate\(([-\d.]+)px, ([-\d.]+)px\)$/.exec(tr), r0 = O3.cv.getBoundingClientRect();
        out.plate = { drop:+dr.toFixed(3), want:[Math.round((v.x*0.5+0.5)*r0.width), Math.round((-v.y*0.5+0.5)*r0.height)], got:mm ? [Math.round(+mm[1]), Math.round(+mm[2])] : null, shown:pl.el.style.display }; } }
    { const hb = (O3.hits||[]).filter(h=>h.userData.act && h.userData.act.kind==='site').map(h=>{ h.updateMatrixWorld(true); const e = h.matrixWorld.elements, d = Math.hypot(e[12] - O3.ppos.x, e[14] - O3.ppos.z); return { h, d }; }).filter(o=>o.d > 6 && o.d < 14).sort((a, b)=>a.d - b.d)[0];
      if (hb){ const e = hb.h.matrixWorld.elements, v = new T.Vector3(e[12], e[13] - o3CurveDrop(e[12], e[14]), e[14]); v.project(O3.cam); const rc = O3.cv.getBoundingClientRect(), cx = rc.left + (v.x*0.5+0.5)*rc.width, cy = rc.top + (-v.y*0.5+0.5)*rc.height;
        const a = o3Pick({ clientX:cx, clientY:cy }), want = hb.h.userData.act; out.pick = { d:+hb.d.toFixed(1), drop:+o3CurveDrop(e[12], e[14]).toFixed(2), kind:a && a.kind, same:!!a && a.kind==='site' && a.x===want.x && a.y===want.y }; } else out.pick = { none:true }; }
    /* the animals of the old frame go when it changes */
    { await fr(60); const before = (O3.wild||[]).filter(w=>w.e && w.e.holder && w.e.holder.parent).map(w=>w.e.holder); const f0 = O3F.face, other = [0, 1, 2, 3, 4, 5].find(k=>k!==f0);
      o3FrameSwitch(other); const left = before.filter(h=>h.parent).length; out.wild = { before:before.length, left, list:(O3.wild||[]).length }; o3FrameSwitch(f0); await fr(60); }
    return out; });
  await page.screenshot({ path: SHOTS + '/rs647.png' });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.spriteBent && r.k > 0, 'the sprites bend with the land on a planet');
  A(r.lm.near===true && r.lm.far===false, 'a landmark near is seen, one past the horizon hidden');
  if (r.plate) A(r.plate.got && Math.abs(r.plate.got[0] - r.plate.want[0]) <= 2 && Math.abs(r.plate.got[1] - r.plate.want[1]) <= 2, 'a town\'s name where the curve has put the town');
  if (!r.pick.none) A(r.pick.drop > 0.3 && r.pick.same, 'a click on a dungeon a little way off reaches it');
  A(r.wild.left===0 && r.wild.list===0, 'the animals of the old frame go when it changes');
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
