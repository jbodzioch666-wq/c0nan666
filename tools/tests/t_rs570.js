// RS-570: (1) with the sculpt cache cold, the skeleton is carved a few milliseconds a tick - no tick of its background build
// holds the page for long (a whole thorax or pelvis in one go was 0.4 to 2 seconds) - and still comes out whole; (2) in a hill
// town only the buildings stand on stone terraces, not the trees; (3) on the open land no tree to cut grows against a town, the
// roads stop at a town's edge instead of running under its houses, and a town's level pad sits with the rolling ground, not in a pit
module.exports = async page=>{
  page.setDefaultTimeout(0);
  const r = await page.evaluate(async ()=>{ goToCharCreate(); ccBegin(); wgRegenerate(12345); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; weatherSync = ()=>{};
    const out = {};
    // (1) the skeleton, cold
    { SCULPT_DB.mem && SCULPT_DB.mem.clear && SCULPT_DB.mem.clear(); const get0 = sculptDbGet; sculptDbGet = ()=>null; SK3_READY.clear(); SK3.ok = null; SK3.started = false; SK3.building = false;
      const st0 = sk3SculptStep; let worst = 0, steps = 0; sk3SculptStep = function(j, dl){ const t = performance.now(); const r = st0(j, dl); worst = Math.max(worst, performance.now() - t); steps++; return r; };
      const t0 = performance.now(); sk3Init(); const survey = performance.now() - t0;
      while (!SK3.ok && SK3.building && performance.now() - t0 < 120000) await new Promise(r=>setTimeout(r, 50));
      sk3SculptStep = st0; sculptDbGet = get0;
      let meshes = 0, tris = 0; if (SK3.m) SK3.m.root.traverse(o=>{ if (o.isMesh && o.geometry && o.geometry.attributes.position){ meshes++; tris += o.geometry.attributes.position.count; } });
      out.sk3 = { ok:SK3.ok, survey:+survey.toFixed(0), worst:+worst.toFixed(0), steps, meshes, verts:tris, secs:+((performance.now() - t0)/1000).toFixed(1) }; }
    // (2) a hill town: terraces under buildings only
    { let hill = null; const drb = detectRegionBiome; detectRegionBiome = ()=>OW_MOUNTAIN;   /* (no town on the fixed seed is in the hills: one is made so) */
      for (let x=0;x<OW_COLS && !hill;x++) for (let y=0;y<OW_ROWS && !hill;y++) if (G.ow.map[x][y]===OW_TOWN && !(x===G.ow.spawnPos.x && y===G.ow.spawnPos.y)){ G.owPos = { x, y }; try{ villagePrep(); if (G.villageTheme==='mountain') hill = [x, y]; }catch(e){} }
      out.hill = hill;
      if (hill){ G.owPos = { x:hill[0], y:hill[1] }; enterVillage(); setUi('playing'); for (let i=0;i<6;i++){ renderGame(); await new Promise(r=>setTimeout(r, 40)); }
        const occ = V3.occ || [], props = occ.filter(o=>o.userData.prop), blds = occ.filter(o=>!o.userData.prop); let underTree = 0, terr = 0;
        V3.world.traverse(o=>{ if (!o.isMesh || !o.geometry || !o.geometry.parameters || o.geometry.type!=='BoxGeometry') return; const P = o.geometry.parameters; if (Math.abs(P.height - 0.34) > 0.001 || Math.abs(o.position.y - 0.17) > 0.01) return; terr++;
          if (props.some(p=>Math.abs(p.position.x - o.position.x) < 0.01 && Math.abs(p.position.z - o.position.z) < 0.01)) underTree++; });
        out.terr = { terr, underTree, props:props.length, blds:blds.length, hillStyle:!!(G.townLy && G.townLy.info.style.hill) }; G.gameMode = 0; G.interior = null; }
      detectRegionBiome = drb; }
    // (3) the open land round every town
    { const road = G.ow.road; let nodeBy = 0, towns = 0; for (let x=1;x<OW_COLS-1;x++) for (let y=1;y<OW_ROWS-1;y++) if (G.ow.map[x][y]===OW_TOWN){ towns++; for (let i=-1;i<=1;i++) for (let j=-1;j<=1;j++){ const n = skNodeStatic(x+i, y+j); if (n && n.k==='woodcutting') nodeBy++; } }
      out.land = { towns, nodeBy };
      const t = G.ow.spawnPos; G.gameMode = 0; G.owPos = { x:t.x, y:t.y + 2 }; setUi('playing'); O3.win = null; O3.ppos = null; for (let i=0;i<14;i++){ renderGame(); await new Promise(r=>setTimeout(r, 40)); }
      let roadIn = 0; O3.scene.traverse(o=>{ if (!o.isMesh || !o.geometry || !o.geometry.attributes.rd) return; const p = o.geometry.attributes.position; for (let i=0;i<p.count;i++){ const x = p.getX(i), z = p.getZ(i), tx = Math.floor(x), tz = Math.floor(z); if (o3Tile(tx, tz)===OW_TOWN && Math.hypot(x - tx - 0.5, z - tz - 0.5) < 0.3) roadIn++; } });
      const h0 = O3.heightAt(t.x + 0.5, t.y + 0.5); let ring = 0, rn = 0; for (let a=0;a<12;a++){ const x = t.x + 0.5 + Math.cos(a/12*6.283)*1.8, z = t.y + 0.5 + Math.sin(a/12*6.283)*1.8; const tt = o3Tile(Math.floor(x), Math.floor(z)); if (tt===OW_WATER || tt===OW_RIVER || tt===OW_MOUNTAIN) continue; ring += O3.heightAt(x, z); rn++; }
      Object.assign(out.land, { roadIn, pad:+h0.toFixed(3), ring:rn ? +(ring/rn).toFixed(3) : null }); }
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.sk3.ok && r.sk3.meshes > 20 && r.sk3.verts > 20000, 'the skeleton comes out whole: ' + JSON.stringify(r.sk3));
  A(r.sk3.worst < 40 && r.sk3.steps > 20, 'carved a little at a time - no tick holds the page: worst ' + r.sk3.worst + 'ms over ' + r.sk3.steps + ' steps');
  A(r.hill && r.terr && r.terr.terr > 0 && r.terr.underTree===0, 'a hill town terraces its buildings, not its trees: ' + JSON.stringify(r.terr));
  A(r.land.towns >= 8 && r.land.nodeBy===0, 'no tree to cut stands against a town');
  A(r.land.roadIn===0, 'the roads stop at the town\'s edge');
  A(r.land.ring==null || r.land.pad > r.land.ring - 0.12, 'the town sits level with the ground round it, not in a pit: pad ' + r.land.pad + ', ring ' + r.land.ring);
};
