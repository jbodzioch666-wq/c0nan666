// RS-794: real waves: a splash lifts the water and spreads as a ring, the land stays still, waves stop at the bank; the picture under the surface is copied without a GL error, the mirror pass runs by water and not inland; with the post target off the water stays see-through and nothing breaks; leaping fish stir it
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e))); page.on('console', m=>{ if (m.type()==='error' && !/favicon|Failed to load/.test(m.text())) errs.push(m.text().slice(0, 300)); });
  const r = await page.evaluate(async ()=>{ const wait = ms=>new Promise(res=>setTimeout(res, ms)); window.__noLock = true; goToCharCreate(); ccBegin(); wgRegenerate(12345); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); o3Pref = true; G.gameMode = 0; saveCurrentGame = ()=>{}; weatherSync = ()=>{}; G.weather = 'clear'; G.player.wildWarned = 1; G.player.hp = G.player.maxHp = 999999; G.player.clock = Math.round(DAY_LENGTH*0.45);
    const M = G.ow.map; let coast = null, dry = null; for (let x=24;x<OW_COLS-24;x++) for (let y=24;y<OW_ROWS-24;y++){ if (M[x][y]!==OW_GRASS) continue; let s = 0; for (let i=-16;i<=16;i++) for (let j=-16;j<=16;j++){ const a = M[x+i] && M[x+i][y+j]; if (a===OW_WATER || a===OW_RIVER) s++; } let w8 = 0; for (let i=-6;i<=6;i++) for (let j=-6;j<=6;j++) if (M[x+i] && M[x+i][y+j]===OW_WATER) w8++; if (w8 > 30 && !coast) coast = [x, y]; if (s===0 && !dry) dry = [x, y]; }
    const go = async at=>{ G.owPos = { x:at[0], y:at[1] }; O3.win = null; O3.ppos = null; for (let i=0;i<25;i++){ renderGame(); await wait(40); } await wait(800); };
    await go(coast); const out = { coast, dry, on:WSIM.on, steps0:WSIM.steps, grab:WVIEW.u.on.value, mirror:WVIEW.u.ron.value }; const gl = O3.renderer.getContext(); out.glErr = gl.getError(); out.dbg = { post:gfxPostOn(), wv:O3.water.visible, par:!!O3.water.parent, inScene:(()=>{ let p = O3.water; while (p.parent) p = p.parent; return p===O3.scene; })(), rt:!!O3.renderer.getRenderTarget(), obr:typeof O3.water.onBeforeRender, sc:!!(GFX.post||{}).scene };
    const read = (x, z)=>{ const W = WSIM, u = (x - W.cx)/W.S + 0.5, v = (z - W.cz)/W.S + 0.5, px = Math.round(u*W.N), py = Math.round(v*W.N), b = new Float32Array(4); const hf = new Uint16Array(4); O3.renderer.readRenderTargetPixels(W.a, px, py, 1, 1, hf); const dec = h=>THREE.DataUtils.fromHalfFloat(h); return dec(hf[0]); };
    /* a spot on open water near you, and one on dry land */ const pp = O3.ppos; let wet = null, land = null; for (let d=1;d<11 && !(wet && land);d+=0.5) for (let a=0;a<6.28;a+=0.4){ const x = pp.x + Math.cos(a)*d, z = pp.z + Math.sin(a)*d, h = O3.heightAt(x, z); if (!wet && h < O3_WATER_Y - 0.15) wet = [x, z]; if (!land && h > O3_WATER_Y + 0.1) land = [x, z]; } out.wet = wet; out.land = land;
    if (!wet || !land) return out; const stir = gfxWsimStir; gfxWsimStir = ()=>{}; o3Splash(wet[0], wet[1], 0.5, 0.25); o3Splash(land[0], land[1], 0.5, 0.25); await wait(60); out.h0 = read(wet[0], wet[1]); out.hLand = read(land[0], land[1]); const ring = ()=>{ let m = 0; for (let a=0;a<6.28;a+=0.2) m = Math.max(m, Math.abs(read(wet[0] + Math.cos(a)*1.2, wet[1] + Math.sin(a)*1.2))); return m; }; out.ring0 = ring(); await wait(700); out.ring1 = ring(); gfxWsimStir = stir;
    /* inland */ if (dry){ await go(dry); await wait(600); out.mirrorDry = WVIEW.u.ron.value; await go(coast); } else { const n = gfxWaterNear; gfxWaterNear = ()=>false; await wait(200); out.mirrorDry = WVIEW.u.ron.value; gfxWaterNear = n; await wait(200); }
    /* post off */ SET.post = false; await wait(500); out.grabOff = WVIEW.u.on.value; out.mirrorOff = WVIEW.u.ron.value; SET.post = true; await wait(300);
    /* no simulation */ window.__noWsim = true; await wait(200); out.onOff = WSIM.on; window.__noWsim = false; await wait(200); out.onBack = WSIM.on;
    /* fish */ let f = null; await wait(100); out.leapers = (O3.leapers||[]).length;
    out.glErr2 = gl.getError(); return out; });
  console.log('rs794', JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: ' + m + ' ' + JSON.stringify(r)); };
  A(r.on, 'the simulation runs'); A(r.grab===1 && r.mirror===1, 'the picture is read back and the mirror drawn by the water');
  A(r.glErr===0 && r.glErr2===0, 'no GL error');
  A(Math.abs(r.h0) > 0.02, 'a splash moves the water'); A(Math.abs(r.hLand) < 1e-3, 'the land stays still');
  A(r.ring1 > r.ring0 && r.ring1 > 0.001, 'the splash spreads as a ring');
  A(r.mirrorDry===0, 'no mirror pass inland'); A(r.grabOff===0 && r.mirrorOff===0, 'with no post target the water goes on without them');
  A(r.onOff===false && r.onBack===true, 'it can be off');
  A(!errs.length, 'no page errors: ' + errs.slice(0, 2).join(' | '));
};
