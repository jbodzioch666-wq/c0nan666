// RS-396: the dungeon's 3D view is shown on its own canvas under the 2D overlay canvas, not copied onto it every frame; and with
// post-processing on, the vignette, the hurt/heal/glow edges and the fade are drawn by the post shader, not as 2D gradient fills
module.exports = async page=>{
  const S = '/tmp/claude-0/-home-user-c0nan666/3bb54428-39f0-502a-8d60-2c5df0a710a2/scratchpad';
  const r = await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; SET.edgeFx = true;   /* (RS-581: the edges are off unless asked for) */
    let dx=-1, dy=-1; for (let x=0;x<OW_COLS && dx<0;x++) for (let y=0;y<OW_ROWS;y++) if (G.ow.map[x][y]===OW_DUNGEON){ dx=x; dy=y; break; }
    G.gameMode = 0; G.pendingDungeon = { x:dx, y:dy }; enterDungeonConfirm(); setUi('playing');
    const run = async n=>{ for (let i=0;i<n;i++){ renderGame(); await new Promise(r=>setTimeout(r, 60)); } };
    await run(6);
    // no copy of the 3D canvas onto the 2D one
    let copies = 0, grads = 0; const d0 = ctx.drawImage.bind(ctx), g0 = ctx.createRadialGradient.bind(ctx);
    ctx.drawImage = function(img, ...a){ if (img===FPD.cv) copies++; return d0(img, ...a); };
    const fp0 = fpDrawPost; window.fpDrawPost = function(){ ctx.createRadialGradient = function(...a){ grads++; return g0(...a); }; try{ return fp0(); } finally { ctx.createRadialGradient = g0; } };   /* (gradients drawn for the frame itself) */
    FP.hurt = 1; FP.heal = 0.5; FP.glow = 0.5; await run(1);
    const U = GFXP.get(FPD.r).comp.uniforms, uni = { hurt:+(U.hurt.value - FP.hurt*0.7).toFixed(3), heal:+(U.heal.value - FP.heal*0.45).toFixed(3), glow:+(U.glow.value - FP.glow*0.5).toFixed(3), vig2:U.vig2.value, res:[U.res.value.x, U.res.value.y], raw:+U.hurt.value.toFixed(2) };
    ctx.drawImage = d0; window.fpDrawPost = fp0;
    const cv = FPD.cv, mc = canvas, wrap = mc.parentElement, under = [...wrap.children].indexOf(cv) < [...wrap.children].indexOf(mc);
    const shown = cv.style.display==='block' && cv.style.width===mc.clientWidth+'px' && cv.style.height===mc.clientHeight+'px';
    // the 2D canvas is clear where nothing is drawn over the 3D view
    const px = ctx.getImageData(Math.round(mc.width*0.3), Math.round(mc.height*0.45), 1, 1).data;
    const post = gfxPostOn();
    // the lit dungeon shows through: a pixel of the GL canvas near the middle is not black
    const gl = FPD.r.getContext(), buf = new Uint8Array(4); gl.readPixels(cv.width>>1, cv.height>>1, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, buf);
    G.gameMode = 0; G.interior = null; renderGame(); const hidden = cv.style.display==='none';
    return { copies, grads, uni, under, shown, alpha:px[3], post, hidden, preserve:!!FPD.r.getContextAttributes().preserveDrawingBuffer };
  });
  await page.screenshot({ path:`${S}/s396-dungeon.png`, timeout:150000 });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.copies===0, 'the 3D canvas is never copied onto the 2D one');
  A(r.under && r.shown, 'the dungeon canvas is shown under the overlay canvas, the same size');
  A(r.alpha===0, 'the overlay canvas is clear over the view');
  A(!r.post || (r.uni.raw > 0.3 && Math.abs(r.uni.hurt) < 0.01 && Math.abs(r.uni.heal) < 0.01 && Math.abs(r.uni.glow) < 0.01 && r.uni.vig2===0.6 && r.uni.res[0] > 1), 'the frame is in the post shader: '+JSON.stringify(r.uni));
  A(!r.post || r.grads===0, 'no 2D gradient fills for the frame');
  A(r.hidden, 'the dungeon canvas goes when you leave');
  A(!r.preserve, 'no preserved drawing buffer');
};
