// RS-235: the volcano is part of the land - the ground itself climbs a broad cone out of its mountain range to a rim round a
// sunken crater, with lava runs down its flanks; the stand-in cone is only shown while its land is out of view
module.exports = async page=>{
  const ev = (f, a)=>page.evaluate(f, a), A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
  const R = await ev(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); G.gameMode = 0; G.interior = null;
    const lm = owLandmark('volcano'); if (!lm) return { none:true };
    let at = null; for (let d=6; d<26 && !at; d++) for (let a=0;a<32 && !at;a++){ const x = Math.round(lm.x + Math.cos(a/32*6.28)*d), y = Math.round(lm.y + Math.sin(a/32*6.28)*d), t = G.ow.map[x] && G.ow.map[x][y];
      if (t!=null && t!==OW_WATER && t!==OW_MOUNTAIN && t!==OW_RIVER && !OW_SITE_TILES.includes(t)) at = { x, y }; }
    if (!at) return { nospot:true };
    G.owPos = at; for (let i=0;i<5;i++){ setUi('playing'); renderGame(); try{ o3Render(); }catch(e){} await new Promise(r=>setTimeout(r, 200)); }
    const cx = lm.x + 0.5, cz = lm.y + 0.5, h = (d, a)=>O3.heightAt(cx + Math.cos(a)*d, cz + Math.sin(a)*d);
    let rim = 0; for (let a=0;a<8;a++) rim += h(VOLC.rc, a*0.785)/8;
    let slope = 0; for (let a=0;a<8;a++) slope += h((VOLC.rc + VOLC.R)/2, a*0.785)/8;
    let lava = 0; O3.world && O3.world.traverse(o=>{ if (o.isMesh && o.material===O3.lavaM) lava++; });
    const lo = (O3.lmObjs||[]).find(o=>o.lm.kind==='volcano');
    return { volc:!!O3.volc, crater:+O3.heightAt(cx, cz).toFixed(2), rim:+rim.toFixed(2), slope:+slope.toFixed(2), lava, farHidden: lo ? lo.anim.far && lo.anim.far.visible===false : null };
  });
  if (R.none || R.nospot){ console.log('  (no volcano or no spot near it in this world - skipped)', JSON.stringify(R)); return; }
  A(R.volc, 'the volcano is built into the land near it: '+JSON.stringify(R));
  A(R.rim > 5 && R.crater < R.rim - 0.8 && R.slope < R.rim && R.slope > 1, 'a tall cone with a crater sunk in its top: '+JSON.stringify(R));
  A(R.lava >= 3, 'lava runs down its flanks: '+JSON.stringify(R));
  A(R.farHidden===true, 'the stand-in cone is hidden up close: '+JSON.stringify(R));
};
