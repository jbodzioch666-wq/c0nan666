// probe (RS-666): a save where click-to-move stopped after going in and out of a dungeon. ZSAVE the save. Loads it, then
// tries to walk to each neighbour by o3WalkTo and by a real click, and reports the flags that block a click and where the path goes
const fs = require('fs');
module.exports = async page=>{ page.setDefaultTimeout(0);
  const txt = fs.readFileSync(process.env.ZSAVE, 'utf8');
  const r = await page.evaluate(async txt=>{ const d = JSON.parse(txt).data; importSaveText(txt); loadGame(d.id); saveCurrentGame = ()=>{}; setUi('playing');
    const fr = n=>new Promise(res=>{ let i = 0; const f = ()=>++i >= n ? res() : requestAnimationFrame(f); requestAnimationFrame(f); }); await fr(200);
    const flags = ()=>({ ui:G.ui, mode:G.gameMode, active:o3Active(), portal:!!G.owPortal, ferry:!!G.owFerry, lookout:!!O3.lookout, doorWalk:!!O3.doorWalk, pos:{ ...G.owPos }, pl:o3PL(), path:(O3.path||[]).length, chase:!!O3.chase, lag:figLag(), stepT:O3.stepT, stepping:O3.stepping, ppos:O3.ppos&&[O3.ppos.x,O3.ppos.z], c:o3C(G.owPos.x,G.owPos.y), F:typeof O3F!=='undefined'?JSON.stringify(O3F).slice(0,200):null });
    const out = { start:flags(), tries:[] };
    for (const [dx, dy] of [[3,0],[-3,0],[0,3],[0,-3]]){ const q = owOff(G.owPos.x, G.owPos.y, dx, dy) || [G.owPos.x + dx, G.owPos.y + dy];
      const L = o3L(q[0], q[1]); const pass = o3Passable(L ? L[0] : q[0], L ? L[1] : q[1]);
      const p0 = { ...G.owPos }; o3WalkTo({ kind:'ground', x:q[0], y:q[1] }); const path = (O3.path||[]).length; await fr(90);
      out.tries.push({ f:flags(), to:q, L, pass, path, moved:G.owPos.x!==p0.x || G.owPos.y!==p0.y, now:{ ...G.owPos } }); }
    /* a real click on the land a little way off, in screen space */
    const cv = O3.cv, rc = cv.getBoundingClientRect(), pick = o3Pick({ clientX:rc.left + rc.width*0.5 + 160, clientY:rc.top + rc.height*0.5 + 60 });
    out.pick = pick; out.end = flags(); return out; }, txt);
  console.log(JSON.stringify(r, null, 1)); };
