// RS-575: lighter frames. Off screen, an animal (or a beast) on the land leaves the frame - hidden, its matrices left alone - and back
// on screen it's drawn and brought up to date at once
module.exports = async page=>{
  page.setDefaultTimeout(0);
  const r = await page.evaluate(async ()=>{ goToCharCreate(); ccBegin(); wgRegenerate(12345); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); o3Pref = true; G.gameMode = 0; weatherSync = ()=>{}; saveCurrentGame = ()=>{};
    G.owPos = { x:98, y:116 }; O3.win = null; O3.ppos = null; for (let i=0;i<60;i++){ renderGame(); await new Promise(r=>setTimeout(r, 30)); }
    const ws = (O3.wild||[]).filter(w=>w.e && w.alive && w.k!=='bird'), S = new THREE.Sphere(); let on = 0, off = 0, bad = 0;
    for (const w of ws){ const h = w.e.holder; S.center.set(h.position.x, h.position.y + 0.6, h.position.z); S.radius = 2.6*Math.max(1, h.scale.x); const vis = O3.fr.intersectsSphere(S);
      if (vis){ on++; if (!h.visible) bad++; } else { off++; if (h.visible || h.matrixWorldAutoUpdate) bad++; } }
    // walk over to one that's off screen: it comes back, its matrix where it stands
    let back = null; const tgt = ws.find(w=>!w.e.holder.visible);
    if (tgt){ G.owPos = { x:Math.floor(tgt.x), y:Math.floor(tgt.z) }; O3.ppos = null; for (let i=0;i<40;i++){ renderGame(); await new Promise(r=>setTimeout(r, 30)); } const h = tgt.e.holder, v = new THREE.Vector3().setFromMatrixPosition(h.matrixWorld);
      back = { visible:h.visible, auto:h.matrixWorldAutoUpdate, off:+v.distanceTo(h.position).toFixed(3) }; }
    return { n:ws.length, on, off, bad, back }; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.n >= 4 && r.off >= 1, 'animals about, some of them off screen');
  A(r.bad===0, 'every animal off screen is out of the frame, every one on screen is drawn');
  A(r.back && r.back.visible && r.back.auto && r.back.off < 0.01, 'one walked into view is drawn again, up to date where it stands');
};
