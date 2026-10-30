// RS-649: a landmark first seen from far off is drawn (and clicked) where it is. The landmarks are frozen (RS-501), and one whose place
// was set after the freeze - on a Planet nearly all of them, hidden past the horizon until you come near - stayed where it was frozen:
// its name over the grass, and no tower under it. Shot: shots/rs649.png
module.exports = async page=>{
  page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const r = await page.evaluate(async ()=>{ const fr = n=>new Promise(res=>{ let i = 0; const f = ()=>++i >= n ? res() : requestAnimationFrame(f); requestAnimationFrame(f); });
    goToCharCreate(); ccBegin(); setWorldSizeTier('planet'); confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.gameMode = 0; G.interior = null; G.player.hasBoat = 1; await fr(90);
    const m = G.ow.map, T = THREE, out = {}, lms = owGeo().landmarks.filter(l=>l.kind!=='volcano');
    const at = (lm, d)=>{ for (let a=0; a<16; a++){ const q = owNb(lm.x, lm.y, Math.round(Math.cos(a*Math.PI/8)*d), Math.round(Math.sin(a*Math.PI/8)*d)); if (q && [OW_GRASS, OW_FOREST, OW_DESERT, OW_TUNDRA].includes(m[q[0]][q[1]])) return q; } return null; };
    out.lms = [];
    for (const lm of lms){ const far = at(lm, 80), near = at(lm, 9); if (!far || !near) continue;
      G.owPos = { x:far[0], y:far[1] }; await fr(90); const o0 = (O3.lmObjs||[]).find(o=>o.lm.id===lm.id), hidFar = o0 ? !o0.g.visible : null;
      G.owPos = { x:near[0], y:near[1] }; owReveal(near[0], near[1], 12); await fr(150);
      const o = (O3.lmObjs||[]).find(o=>o.lm.id===lm.id); if (!o) continue; const p = o.g.position, me = o.g.matrixWorld.elements, he = o.hb.matrixWorld.elements;
      const row = { kind:lm.kind, hidFar, vis:o.g.visible, pos:[+p.x.toFixed(1), +p.z.toFixed(1)], drawn:[+me[12].toFixed(1), +me[14].toFixed(1)], box:[+he[12].toFixed(1), +he[14].toFixed(1)] };
      /* a click on it, a little way up its side, reaches it */
      O3.dist = 24; await fr(40);
      { const v = new T.Vector3(p.x, p.y + 3 - o3CurveDrop(p.x, p.z), p.z).project(O3.cam), rc = O3.cv.getBoundingClientRect();
        if (v.z < 1 && Math.abs(v.x) < 0.9 && Math.abs(v.y) < 0.9){ const a = o3Pick({ clientX:rc.left + (v.x*0.5+0.5)*rc.width, clientY:rc.top + (-v.y*0.5+0.5)*rc.height }); row.pick = a ? a.kind + ':' + (a.id||'') : null; } O3.dist = 12; }
      out.lms.push(row); if (out.lms.length >= 2) break; }
    return out; });
  await page.screenshot({ path: SHOTS + '/rs649.png' });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.lms.length >= 1, 'a landmark to walk up to from far off');
  for (const l of r.lms){
    A(l.hidFar===true, 'past the horizon it is hidden (' + l.kind + ')');
    A(l.vis && Math.abs(l.drawn[0] - l.pos[0]) < 0.01 && Math.abs(l.drawn[1] - l.pos[1]) < 0.01, 'near, it is drawn where it stands (' + l.kind + ')');
    A(Math.abs(l.box[0] - l.pos[0]) < 0.01 && Math.abs(l.box[1] - l.pos[1]) < 0.01, 'and its click box is there with it (' + l.kind + ')');
    if (l.pick !== undefined) A(l.pick && l.pick.startsWith('landmark'), 'a click on it reaches it (' + l.kind + ')'); }
  A(r.lms.some(l=>l.pick !== undefined), 'a click was tried on one');
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
