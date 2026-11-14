// RS-902: excavating a dig site's hotspot has its own work - the pick in both hands, swung down into the soil before you, earth thrown up
// on each blow (rsMinePose aimed by o3DigAim; it stood idle); and the land's waterfalls are smooth weathered rock (a rock face on fifteen
// points round each ledge, sculpted boulders), with water ten strips across and the curtain bowed out over each lip.
// Shots: shots/rs902-dig.png, rs902-fall.png
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const A = (c, msg, r)=>{ if (!c) throw new Error('assert: ' + msg + ' ' + JSON.stringify(r || {})); };
  const frames = n=>page.evaluate(async n=>{ for (let i=0;i<n;i++){ renderGame(); await new Promise(q=>setTimeout(q, 30)); } }, n);
  await page.evaluate(()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.gameMode = 0; G.player.clock = Math.round(0.42*DAY_LENGTH) + 3*DAY_LENGTH;
    skP().tools.pick = 1; skP().skills.archaeology = SK_XP[99]; G.player.safeGather = 1;
    let hs = null; for (const k of G.ow.digTiles.keys()){ hs = { x:Math.floor(k/4096), y:k % 4096 }; break; } window.__hs = hs; G.owPos = { x:hs.x, y:hs.y }; });
  await frames(60);
  const dig = await page.evaluate(async ()=>{ const o = skOptions().find(q=>q.k==='archaeology'); if (!o) return { opt:false }; skDo(o); const P = O3.player || O3.P, out = { opt:true, mine:[], chips:0 };
    for (let i=0;i<70;i++){ renderGame(); await new Promise(q=>setTimeout(q, 30)); const e = (O3.pl || {}).e; }
    let pl = null; for (const k of ['pl', 'player', 'P', 'me']) if (O3[k] && O3[k].e) pl = O3[k]; out.tool = pl ? pl.e.toolKey : '?'; out.mineT = pl ? +(pl.e.mineT || 0).toFixed(2) : -1;
    if (O3.mrig) for (const c of O3.mrig.chips) if (c.t >= 0) out.chips++;
    out.gather = !!G.gather; return out; });
  await page.screenshot({ path: __dirname + '/shots/rs902-dig.png' });
  /* a waterfall: a river tile against a mountain with water below it, the land built round it */
  const fall = await page.evaluate(async ()=>{ G.gather = null; const W = G.ow.map.length, H = G.ow.map[0].length; let at = null;
    for (let x=2; x<W-2 && !at; x++) for (let y=2; y<H-2 && !at; y++){ if (G.ow.map[x][y]!==OW_RIVER) continue; for (const [a, b] of [[1,0],[-1,0],[0,1],[0,-1]]){ const u = G.ow.map[x+a][y+b], on = G.ow.map[x-a][y-b]; if ((u===OW_MOUNTAIN || u===OW_MOUNTAINPASS) && (on===OW_RIVER || on===OW_WATER) && G.ow.map[x-2*a] && (G.ow.map[x-2*a][y-2*b]!==OW_MOUNTAIN)){ at = { x:x - 2*a, y:y - 2*b, fx:x, fy:y }; break; } } }
    if (!at) return { none:true }; G.owPos = { x:at.x, y:at.y }; for (let i=0;i<120;i++){ renderGame(); await new Promise(q=>setTimeout(q, 30)); if (GFX.falls && GFX.falls.length && i > 50) break; }
    const f = (GFX.falls || [])[0]; if (!f) return { at, falls:0 };
    return { at, falls:GFX.falls.length, flat:!!f.rock.material.flatShading, uv:!!f.rock.geometry.attributes.uv, rockV:f.rock.geometry.attributes.position.count, waterV:f.water.geometry.attributes.position.count, map:!!f.rock.material.map }; });
  await frames(10); await page.screenshot({ path: __dirname + '/shots/rs902-fall.png' });
  console.log(JSON.stringify({ dig, fall }));
  A(dig.opt, 'an excavation hotspot to dig', dig);
  A(/^pick/.test(dig.tool) && dig.mineT > 0.5 && dig.gather, 'digging: the pick in hand, swinging', dig);
  A(dig.chips > 0, 'earth thrown up by the blows', dig);
  if (!fall.none && fall.falls){ A(!fall.flat && fall.uv && fall.map, 'the waterfall\'s rock smooth, with a rock face', fall); A(fall.rockV > 200 && fall.waterV > 150, 'fine rock and water', fall); }
  else console.log('(no waterfall in this world)');
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
