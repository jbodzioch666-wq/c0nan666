// RS-734: stooped to forage in a robe and a cape, the robe's top came out through the cape - the body was bent for the work after
// the robe was folded for standing, so its cloth over the back stayed upright under the bent cape. Now the robe and the cape are
// hung after the work's pose: no robe vertex lies behind the cape, foraging (two views) or standing, for a tiefling (with a tail) and a human.
// Shots: shots/rs734_forage.png (from behind), rs734_side.png
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
  const run = (race, kind, rot)=>page.evaluate(async ([race, kind, rot])=>{ goToCharCreate(); G.chosenRace = RACES.findIndex(r=>r[0]===race); G.ccLook = null; ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.gameMode = 0; G.interior = null;
    G.gear.chest = rsMakeArmour('cloth', 3, 'chest'); G.gear.legs = rsMakeArmour('cloth', 3, 'legs'); G.gear.head = rsMakeArmour('cloth', 3, 'head'); G.gear.cape = rsMakeCape(0, 'Black Cape'); G.gear.cape.dye = '#e8dcc0';
    G.player.clock = G.player.turnCount = 60; O3.dist = 3.2; skGainXP('mining', 1e6); skGainXP('foraging', 1e6);
    const cands = []; for (let x=2;x<OW_COLS-2;x++) for (let y=2;y<OW_ROWS-2;y++){ const n = skNodeStatic(x, y); if (n && n.k===kind) cands.push({ x, y, d:Math.hypot(x - G.owPos.x, y - G.owPos.y) }); } cands.sort((a, b)=>a.d - b.d);
    const pick = ()=>skOptions().find(o=>o.k===kind || (o.node && o.node.k===kind) || (kind==='foraging' && /^Pick /.test(o.label)));
    let opt = null; for (const c of cands.slice(0, 40)){ G.owPos = { x:c.x, y:c.y }; if (opt = pick()) break; } if (!opt && kind) return { none:true };
    const fr = async n=>{ for (let i=0;i<n;i++){ if (kind && !G.gather){ const o = pick(); if (o) skDo(o); } renderGame(); try{ o3Render(); }catch(e){} await new Promise(r=>setTimeout(r, 40)); } };
    await fr(20); if (typeof rot==='string'){ const py = O3.player.yaw, sc = k=>{ ISO.rot = k; VIEW.yaw = null; return Math.cos(viewYaw() - py); }, ks = [0, 1, 2, 3]; ks.sort((a, b)=>rot==='back' ? sc(a) - sc(b) : Math.abs(sc(a)) - Math.abs(sc(b))); ISO.rot = ks[0]; } else ISO.rot = rot; VIEW.yaw = null; await fr(30);
    const r = O3.player.e.rig, c = r.cape, Ac = c.geometry.attributes.position.array, T = THREE, ci = c.matrixWorld.clone().invert(), v = new T.Vector3();
    const capeZ = (x, y)=>{ let best = null, bd = 1e9; for (let k=0;k<Ac.length/3;k++){ const d = Math.hypot(Ac[k*3] - x, Ac[k*3+1] - y); if (d < bd){ bd = d; best = Ac[k*3+2]; } } return bd < 0.03 ? best : null; };
    const sk = r.skirt; sk.updateMatrixWorld(true); const q = sk.geometry.attributes.position; let n = 0, worst = 0, tot = 0, at = null;
    for (let k=0;k<q.count;k++){ v.fromBufferAttribute(q, k).applyMatrix4(sk.matrixWorld).applyMatrix4(ci); const cz = capeZ(v.x, v.y); if (cz===null) continue; tot++; if (v.z < cz - 0.002){ n++; if (cz - v.z > worst){ worst = cz - v.z; at = [v.x, v.y, v.z].map(a=>+a.toFixed(3)); } } }
    const pp = O3.pgrp.position, s = new T.Vector3(pp.x, pp.y + 0.5, pp.z).project(O3.cam);
    return { gather:G.gather && G.gather.o && G.gather.o.k, bend:+r.torso.rotation.x.toFixed(2), n, tot, worst:+worst.toFixed(3), late:r.clothLate, at, capeH:c.userData.h, xy:[(s.x + 1)/2*innerWidth, (1 - s.y)/2*innerHeight] }; }, [race, kind, rot]);
  const out = {};
  out.tf = await run('Tiefling', 'foraging', 'back'); await page.screenshot({ path:SHOTS + '/rs734_forage.png', clip:{ x:Math.max(0, out.tf.xy[0] - 200), y:Math.max(0, out.tf.xy[1] - 250), width:400, height:460 } });
  out.tf2 = await run('Tiefling', 'foraging', 'side'); await page.screenshot({ path:SHOTS + '/rs734_side.png', clip:{ x:Math.max(0, out.tf2.xy[0] - 200), y:Math.max(0, out.tf2.xy[1] - 250), width:400, height:460 } });
  out.hf = await run('Human', 'foraging', 0); out.ts = await run('Tiefling', null, 3);
  console.log(JSON.stringify(out));
  for (const k of ['tf', 'tf2', 'hf']){ const o = out[k]; A(o.gather==='foraging' && o.bend > 0.6, k + ': foraging, stooped: ' + JSON.stringify(o)); A(o.tot > 100 && o.n===0, k + ': no robe through the cape: ' + JSON.stringify(o)); A(o.late===false, k + ': the late hanging done'); }
  A(out.ts.tot > 100 && out.ts.n===0 && out.ts.bend < 0.2, 'standing: no robe through the cape: ' + JSON.stringify(out.ts));
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
