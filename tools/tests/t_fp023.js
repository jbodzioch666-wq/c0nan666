// FP-023: the land's trees, bushes and rocks as a sculpted kit (SET.tpLand 'model', a test against the drawn ones - 'drawn' the default):
// by a forest, with the kit on, the oaks, pines, bushes and rocks are the kit's textured pieces (an InstancedMesh per variant and part,
// the leaves cut out and two-sided, not shadowing themselves), the drawn parts of those kinds gone, the reeds still drawn; back to
// 'drawn' through the setting and the land is built anew without them
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
  const ev = (f, a)=>page.evaluate(f, a), wait = ms=>ev(async ms=>{ const t = performance.now() + ms; while (performance.now() < t){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); } }, ms);
  await ev(()=>{ window.__noLock = true; goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.player.clock = DAY_LENGTH*0.4; PFX.camp = -1e9;
    const m = G.ow.map; let best = null, bd = 1e9; for (let x=2;x<OW_COLS-2;x++) for (let y=2;y<OW_ROWS-2;y++){ if (m[x][y]!==OW_GRASS) continue; let n = 0; for (let i=-2;i<=2;i++) for (let j=-2;j<=2;j++) if (m[x+i][y+j]===OW_FOREST) n++; if (n < 10) continue; const d = Math.hypot(x - G.owPos.x, y - G.owPos.y); if (d < bd){ bd = d; best = [x, y]; } }
    if (best) G.owPos = { x:best[0], y:best[1] }; G.gameMode = 0; setUi('playing'); });
  await wait(4000);
  const look = ()=>ev(()=>{ const out = { on:nkOn(), kit:{}, drawn:{}, leafOk:true, win:!!O3.win }; if (!O3.world) return out;
    O3.world.traverse(o=>{ if (!o.isInstancedMesh || !o.userData.kind) return; const k = o.userData.kind, mt = o.material;
      if (mt.map && o.geometry.index && o.geometry.attributes.position.count > 100){ out.kit[k] = (out.kit[k]||0) + 1; if (mt.alphaTest > 0 && mt.side!==THREE.DoubleSide) out.leafOk = false; if (!o.receiveShadow) out.leafNoSelf = true; }
      else out.drawn[k] = (out.drawn[k]||0) + 1; });
    return out; });
  A(await ev(()=>SET.tpLand==='drawn'), 'the drawn land by default');
  A(await ev(()=>buildSettings().includes("setSetting('tpLand', 'model')")), 'a row in the settings');
  const d0 = await look(); console.log('drawn', JSON.stringify(d0));
  A(!d0.on && !Object.keys(d0.kit).length && d0.drawn.oak && d0.drawn.pine, 'the drawn trees by a forest');
  await ev(()=>{ setSetting('tpLand', 'model'); }); await wait(5000);
  const m = await look(); console.log('model', JSON.stringify(m));
  A(m.on && m.kit.oak >= 2 && m.kit.pine >= 2 && m.kit.bush >= 1, 'kit oaks, pines and bushes (a mesh per variant and part)');
  A(!m.drawn.oak && !m.drawn.pine && !m.drawn.bush && !m.drawn.rock, 'the drawn parts of those kinds gone: ' + Object.keys(m.drawn).join(','));
  A(m.leafOk && m.leafNoSelf, 'the leaves cut out, two-sided, not shadowing themselves');
  await ev(()=>{ setSetting('tpLand', 'drawn'); }); await wait(4000);
  const d1 = await look(); console.log('back', JSON.stringify(d1));
  A(!d1.on && !Object.keys(d1.kit).length && d1.drawn.oak, 'the drawn trees back');
  A(!errs.length, 'page errors: ' + errs.join(' | '));
};
