// RS-563: the phone tier draws less. The 3D views' pixel density is capped at GFX_PHONE_DPR on the phone tier (a flagship phone drew at
// its full 2.6 to 3.5); and your own figure is sculpted on a coarser grid there (it was four fifths of a dungeon frame's triangles).
// Off the phone tier, nothing changes
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{ const out = {}; goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    const d0 = Object.getOwnPropertyDescriptor(window, 'devicePixelRatio'); Object.defineProperty(window, 'devicePixelRatio', { value:3.5, configurable:true });
    out.phone = gfxPhone(); out.dprPhone = gfxDpr(); const pt0 = SET.phoneTier; SET.phoneTier = false; const lm = window.v3LowMem; window.v3LowMem = ()=>false; out.dprDesk = gfxDpr(); out.deskPhone = gfxPhone();
    const tris = ()=>{ const e = m3dPlayerBuild(()=>m3dInstance({}, rsPlayerLook())); let n = 0; e.holder.traverse(o=>{ if (o.isMesh && o.geometry) n += (o.geometry.index ? o.geometry.index.count : o.geometry.attributes.position.count)/3; }); return Math.round(n); };
    out.trisDesk = tris(); { const c0 = M3D_PLAYER_COARSE; M3D_PLAYER_COARSE = 1; out.trisFull = tris(); M3D_PLAYER_COARSE = c0; } window.v3LowMem = lm; SET.phoneTier = true; out.trisPhone = tris(); SET.phoneTier = pt0;
    if (d0) Object.defineProperty(window, 'devicePixelRatio', d0); else delete window.devicePixelRatio;
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.phone && Math.abs(r.dprPhone - 1.75) < 1e-6, 'a phone draws its 3D at 1.75 pixels to the point, not 3.5');
  A(!r.deskPhone && r.dprDesk===3.5, 'a computer keeps its full density');
  A(r.trisPhone < r.trisFull*0.65 && r.trisDesk < r.trisFull*0.65, 'your figure out in the world is sculpted lighter than the full sculpt (RS-563 on phones; RS-575 on every machine): ' + r.trisPhone + ' / ' + r.trisDesk + ' vs ' + r.trisFull);
};
module.exports.mobile = true;
