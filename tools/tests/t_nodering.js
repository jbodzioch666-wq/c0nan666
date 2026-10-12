// RS-350: the gathering spots (the trees you cut, the rocks, the herbs) no longer pop in a wave as you walk. Their chunks
// reach as far as the camera sees - zoomed out, farther - but never past the built land's edge; a step keeps every chunk
// still in reach and builds only the new edge; and a land window move keeps the chunks still inside it, since the ground
// under them is the same, instead of freeing them all and rebuilding nearest first
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); G.gameMode = 0; G.player.wildWarned = 1; saveCurrentGame = ()=>{};
    const fr = async n=>{ for (let i=0;i<n;i++){ renderGame(); await new Promise(r=>setTimeout(r, 20)); } };
    const settle = async ()=>{ for (let i=0;i<60;i++){ O3.nodeTick = null; o3SyncNodes(); if (O3.nodeTick) break; } };
    const out = {}; await fr(4); await settle(); out.near = O3.nodeChunks.size;
    O3.dist = 28; await fr(2); await settle(); out.far = O3.nodeChunks.size;
    const inWin = ([cx, cy])=>cx*O3_NCH >= O3.win.x0 && cy*O3_NCH >= O3.win.y0 && cx*O3_NCH + O3_NCH <= O3.win.x0 + O3_W && cy*O3_NCH + O3_NCH <= O3.win.y0 + O3_W;
    out.allInWindow = [...O3.nodeChunks.keys()].every(k=>inWin(k.split(',').map(Number)));
    // steps: the chunks near you keep their identity, a row at most changes
    const cx0 = Math.floor(G.owPos.x/O3_NCH), cy0 = Math.floor(G.owPos.y/O3_NCH), nearKeys = []; for (let i=-1;i<=1;i++) for (let j=-1;j<=1;j++) nearKeys.push((cx0+i)+','+(cy0+j));
    const before = new Map(O3.nodeChunks); let freed = 0; const f0 = o3FreeNodeChunk; o3FreeNodeChunk = c=>{ freed++; return f0(c); };
    for (let k=0;k<7;k++){ G.player.hp = effMaxHp(); G.ui = 'playing'; G.gameMode = 0; moveDir(1, 0); await fr(1); await settle(); }
    out.nearKept = nearKeys.filter(k=>before.has(k) && O3.nodeChunks.get(k)===before.get(k)).length; out.nearHad = nearKeys.filter(k=>before.has(k)).length; out.freedOnWalk = freed;
    // a window move keeps the chunks still inside the new window
    const keep = new Map(O3.nodeChunks); freed = 0; const w0 = O3.win; G.owPos.x = Math.min(OW_COLS-3, w0.cx + 22); O3.mapRef = null; await fr(2); await settle();
    out.winMoved = O3.win!==w0; let kept = 0, lost = 0; for (const [k, c] of keep){ if (inWin(k.split(',').map(Number))){ if (O3.nodeChunks.get(k)===c) kept++; else lost++; } } out.keptAcrossMove = kept; out.lostAcrossMove = lost;
    o3FreeNodeChunk = f0; O3.dist = 12;
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.far > r.near && r.far >= 90, 'zoomed out, the chunks reach farther: '+r.near+' -> '+r.far);
  A(r.allInWindow, 'no chunk sits past the built land');
  A(r.nearHad >= 6 && r.nearKept===r.nearHad && r.freedOnWalk <= 2*13, 'a walk keeps the chunks round you and frees only the trailing edge');
  A(r.winMoved && r.keptAcrossMove >= 20 && r.lostAcrossMove===0, 'a window move keeps the chunks still inside it');
};
