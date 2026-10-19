// RS-557: ambient occlusion below ground (gfxAoOn: the dungeon view, high setting, not the phone). A half-size depth prepass
// that honours the walls' cut-away, a twelve-tap occlusion pass, a blur, and the picture darkened by it before the bloom. The
// occlusion is real: darker where the floor meets a wall than out in the open; off, the targets are left alone and aoK is 0
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{ const out = {}; goToCharCreate(); ccBegin(); wgRegenerate(12345); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; weatherSync = ()=>{};
    G.gameMode = 0; let dx = -1, dy = -1; for (let x=0;x<OW_COLS && dx<0;x++) for (let y=0;y<OW_ROWS;y++) if (G.ow.map[x][y]===OW_DUNGEON){ dx = x; dy = y; break; }
    G.pendingDungeon = { x:dx, y:dy }; enterDungeonConfirm(); setUi('playing'); G.mon = []; ISO.dist = 9; for (let i=0;i<14;i++){ renderGame(); await new Promise(r=>setTimeout(r, 40)); }
    const P = GFXP.get(FPD.r); out.on = gfxAoOn('fpd'); out.aoK = P.comp.uniforms.aoK.value; out.size = [P.ao.width, P.ao.height, P.dep.width];
    const errs = []; const ce = console.error; console.error = (...a)=>{ errs.push(String(a[0]).slice(0, 200)); }; FPD.r.debug.checkShaderErrors = true; P.ssao.needsUpdate = true; P.depM.needsUpdate = true; for (let i=0;i<3;i++){ renderGame(); await new Promise(r=>setTimeout(r, 40)); } FPD.r.debug.checkShaderErrors = false; console.error = ce; out.errs = errs;
    /* the floor at a wall's foot against the open floor, over every floor tile in view: the whole occlusion buffer read once, each
       tile's middle (clear tiles only) and each wall-side foot projected into it */
    { const hw = P.ao.width, hh = P.ao.height, buf = new Uint8Array(hw*hh*4); FPD.r.readRenderTargetPixels(P.ao, 0, 0, hw, hh, buf);
      const at = (X, Z)=>{ const v = new THREE.Vector3(X, 0.02, Z).project(FPD.cam); if (Math.abs(v.x) > 0.9 || Math.abs(v.y) > 0.9) return null; const i = Math.round((v.x*0.5 + 0.5)*(hw - 1)), j = Math.round((v.y*0.5 + 0.5)*(hh - 1)); return buf[(j*hw + i)*4]; };
      const isF = (x, y)=>G.map[x] && G.map[x][y]===T_FLOOR; let so = 0, no = 0, sw = 0, nw = 0; const p = G.player;
      for (let x=1;x<COLS-1;x++) for (let y=1;y<ROWS-1;y++){ if (!isF(x, y) || (Math.abs(x - p.x) < 2 && Math.abs(y - p.y) < 2)) continue; let walls = 0; for (const [c, d] of [[1,0],[-1,0],[0,1],[0,-1]]) if (G.map[x+c][y+d]===T_WALL){ walls++; const v = at(x + 0.5 + c*0.44, y + 0.5 + d*0.44); if (v!==null){ sw += v; nw++; } }
        if (!walls){ let ok = true; for (let i=-1;i<=1;i++) for (let j=-1;j<=1;j++) if (!isF(x+i, y+j)) ok = false; if (ok){ const v = at(x + 0.5, y + 0.5); if (v!==null){ so += v; no++; } } } }
      out.open = no ? +(so/no).toFixed(1) : null; out.wall = nw ? +(sw/nw).toFixed(1) : null; out.nOpen = no; out.nWall = nw; }
    SET.fps = true; const cost = async ()=>{ for (let k=0;k<5;k++){ PROF.t = {}; PROF.gpuN = 0; for (let i=0;i<70;i++){ renderGame(); gfxGpuPoll(); await new Promise(r=>setTimeout(r, 16)); } gfxGpuPoll(); if (PROF.gpuN > 10) return +((PROF.t.gpu||0)/PROF.gpuN).toFixed(2); } return null; };
    out.msAo = await cost(); window.__noAo = true; out.msPlain = await cost(); out.aoKOff = P.comp.uniforms.aoK.value; window.__noAo = false; SET.fps = false;
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.on && r.aoK===1 && r.size[0] > 100 && r.size[2]===r.size[0], 'the occlusion pass runs at half size');
  A(r.errs.length===0, 'its shaders compile');
  A(r.open===null || r.open > 200, 'open floor is barely occluded: ' + r.open);
  A(r.wall===null || r.open===null || r.wall < r.open - 12, 'the floor at a wall\'s foot is darker: ' + r.wall + ' vs ' + r.open);
  A(r.aoKOff===0, 'off, nothing is darkened');
  A(r.msAo===null || r.msPlain===null || r.msAo < r.msPlain + 2.5, 'under 2.5ms of card time: ' + r.msAo + ' vs ' + r.msPlain);
};
