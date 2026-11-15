// RS-701: what's in the off hand while you chop. A tome is put away while the hands are on the axe (it stayed in the left hand, on the haft) and
// is back in the hand when you stop; a shield is slung on your back, as a sheathed weapon is, and stays there through the swing
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const r = await page.evaluate(async ()=>{ const fr = n=>new Promise(res=>{ let i = 0; const f = ()=>++i >= n ? res() : requestAnimationFrame(f); requestAnimationFrame(f); }), wait = ms=>new Promise(res=>setTimeout(res, ms));
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.gameMode = 0; G.player.clock = DAY_LENGTH*0.4;
    skP().tools.axe = Math.max(1, skP().tools.axe||0); owHunterSpawn = ()=>{}; owHuntersStep = ()=>false;
    let n = null, st = null; for (let rr=1; rr<40 && !n; rr++) for (let i=-rr;i<=rr && !n;i++) for (let j=-rr;j<=rr && !n;j++){ if (Math.max(Math.abs(i), Math.abs(j))!==rr) continue; const q = skNodeAt(G.owPos.x + i, G.owPos.y + j); if (!q || q.k!=='woodcutting' || q.gone || skNodeReq(q) > skLvl('woodcutting')) continue;
      for (const [dx, dy] of [[0,1],[1,0],[0,-1],[-1,0]]){ const x = q.x + dx, y = q.y + dy; if (o3Passable(x, y) && G.ow.map[x][y]!==OW_WATER && !skNodeAt(x, y)){ n = q; st = [x, y]; break; } } }
    G.owPos = { x:st[0], y:st[1] }; owReveal(st[0], st[1], 8); const out = {}; 
    for (const fam of ['cloth', 'metal']){ G.gear.offhand = rsMakeArmour(fam, 2, 'offhand'); await fr(60);
      const e = O3.player.e, r = e.rig, see = ()=>{ const o = r.tome || r.shield; if (!o) return null; let v = true; for (let q = o; q; q = q.parent) if (!q.visible) v = false; return { vis:v, par:o.parent===r.arms[1].hand ? 'Lhand' : o.parent===r.torso ? 'torso' : o.parent && o.parent.name || '?' }; };
      out[fam] = { before:see(), tome:!!r.tome, shield:!!r.shield };
      skDo(skNodeOption(n)); await wait(1500); out[fam].chop = see(); out[fam].sheathed = !!e.rig.sheathed; out[fam].tk = e.toolKey;
      skStop(); await wait(900); out[fam].after = see(); }
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: ' + m + ' ' + JSON.stringify(r)); };
  const c = r.cloth, m = r.metal;
  A(c.tome && c.before.vis && c.before.par==='Lhand' && c.tk==='axe0', 'a tome in the left hand, then chopping');
  A(!c.chop.vis && c.after.vis && c.after.par==='Lhand', 'the tome put away while you chop, back in the hand when you stop');
  A(m.shield && m.sheathed && m.chop.vis && m.chop.par==='torso', 'a shield slung on your back while you chop');
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
