// RS-858: the furniture inside the buildings - open cases whose books and jars show (they stood inside solid blocks), a panelled
// counter with its ledger, ink and candle, moulded window frames with a lintel and sill, a timber frame of posts and knee braces,
// shaped pew ends; every part with turned edges (v3RBox). Shot: shots/rs858-temple.png
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const A = (c, m, d)=>{ if (!c) throw new Error(m + ' :: ' + JSON.stringify(d)); };
  const r = await page.evaluate(async ()=>{ const w = ms=>new Promise(r=>setTimeout(r, ms)), out = {};
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; const t = townList()[0]; G.owPos = { x:t.x, y:t.y }; enterVillage(); setUi('playing'); townClosedCheck = ()=>false; G.player.clock = Math.round(0.45*DAY_LENGTH) + 3*DAY_LENGTH;
    for (const k of ['shop', 'temple', 'smith', 'tavern']){ if (!VILLAGE_BUILDINGS.some(b=>b.key===k)) continue; if (G.interior) exitInterior(); enterInterior(k); setUi('playing'); G.player.x = 10; G.player.y = 8; V3.dist = 12; for (let i=0;i<20;i++){ renderGame(); await w(25); }
      const R = { solid:0, books:0, rbox:0, ledger:0, frames:0, pewEnds:0, wallsInCase:0 };
      V3.world.traverse(o=>{ if (!o.isMesh) return; const g = o.geometry, P = g.parameters;
        if (P && g.type==='BoxGeometry' && Math.abs(P.width - 1.0) < 1e-3 && Math.abs(P.height - 1.9) < 1e-3) R.solid++;
        if (o.material && o.material.vertexColors && g.attributes.color) R.books++;
        if (Object.values(V3_RB).includes(g)) R.rbox++;
        if (o.material===V3_FURN.paper) R.ledger++;
        if (g.type==='ExtrudeGeometry' && g===townV3Bench.pewEnd) R.pewEnds++; });
      R.panes = 0; V3.world.traverse(o=>{ const P = o.isMesh && o.geometry.parameters; if (P && P.width===0.9 && P.height===0.9 && P.depth===0.06) R.panes++; });
      out[k] = R; }
    if (G.interior) exitInterior(); enterInterior('temple'); setUi('playing'); G.player.x = 10; G.player.y = 8; V3.dist = 12; for (let i=0;i<30;i++){ renderGame(); await w(25); }
    return out; });
  await page.screenshot({ path: SHOTS + '/rs858-temple.png' }); console.log(JSON.stringify(r)); A(errs.length===0, errs.join('|'));
  for (const k in r){ const R = r[k]; A(R.solid===0, k + ': a solid cabinet block is still there', R); A(R.rbox > 60, k + ': the parts are not turned', R); A(R.panes===2, k + ': the windows', R); }
  A(r.shop.books >= 1 && r.shop.ledger >= 2, 'the shop: no books on its shelves or no ledger on its counter', r.shop);
  A(r.temple.books >= 2 && r.temple.pewEnds >= 4, 'the temple: its bookcase or its pews', r.temple); };
