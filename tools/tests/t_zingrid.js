// (probe, not in ALL) the user's save: stoop over a cave herb beside her below ground; body and robe points behind the cape; a shot from behind
const fs = require('fs');
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const txt = fs.readFileSync(process.env.ZSAVE, 'utf8');
  const r = await page.evaluate(async txt=>{ const d = JSON.parse(txt).data; importSaveText(txt); loadGame(d.id); setUi('playing'); saveCurrentGame = ()=>{}; G.mon.forEach(m=>{ m.alive = false; }); G.mon = [];
    const fr = async n=>{ for (let i=0;i<n;i++){ renderGame(); await new Promise(r=>setTimeout(r, 30)); } };
    const through = e=>{ const rg = e.rig, c = rg.cape; e.holder.updateMatrixWorld(true); const Ac = c.geometry.attributes.position.array, ci = c.matrixWorld.clone().invert(), v = new THREE.Vector3();
      const capeZ = (x, y)=>{ let best = null, bd = 1e9; for (let k=0;k<Ac.length/3;k++){ const d = Math.hypot(Ac[k*3] - x, Ac[k*3+1] - y); if (d < bd){ bd = d; best = Ac[k*3+2]; } } return bd < 0.03 ? best : null; };
      let n = 0, tot = 0, worst = 0; e.holder.traverse(o=>{ if (!o.isMesh || !o.visible || !o.geometry.attributes.position) return; let robe = false; for (let pa = o; pa; pa = pa.parent) if (pa===rg.skirt) robe = true; if (!(robe || (o.isSkinnedMesh && !/hair/i.test(o.name||'')))) return;
        const q = o.geometry.attributes.position; for (let k=0;k<q.count;k++){ if (o.isSkinnedMesh) o.getVertexPosition(k, v); else v.fromBufferAttribute(q, k); v.applyMatrix4(o.matrixWorld).applyMatrix4(ci); const cz = capeZ(v.x, v.y); if (cz===null) continue; tot++; if (v.z < cz - 0.002){ n++; worst = Math.max(worst, cz - v.z); } } });
      return { n, tot, worst:+worst.toFixed(3), bend:+(rg.torso.rotation.x).toFixed(2) }; };
    await fr(30); const out = { mode:G.gameMode, stand:through(ISO.player) };
    const p = G.player, D = G.dungeonDeco; let at = null; for (const [i,j] of [[1,0],[-1,0],[0,1],[0,-1]]) if (!at && G.map[p.x+i][p.y+j]===T_FLOOR && !D[p.x+i][p.y+j]) at = [p.x+i, p.y+j];
    D[at[0]][at[1]] = 'cavherb'; G.veinLeft = G.veinLeft || {}; G.veinLeft[G.dungeonSlot+'/'+G.depth+':'+at[0]+','+at[1]] = 99; skP().skills.foraging = Math.max(skP().skills.foraging||0, 2e6);
    const o = skOptions().find(o=>o.vein && o.vein.x===at[0] && o.vein.y===at[1]); skDo(o);
    { const e = ISO.player; await fr(10); const f = e.face||0; let best = 0, bc = 2; for (let k=0;k<4;k++){ ISO.rot = k; VIEW.yaw = null; const c = Math.cos(viewYaw() - f); if (c < bc){ bc = c; best = k; } } ISO.rot = (best + (+window.__rotAdd||0))%4; VIEW.yaw = null; }
    out.herb = []; for (let k=0;k<3;k++){ await fr(8); if (!G.gather) skDo(o); out.herb.push(through(ISO.player)); }
    const e = ISO.player, s = new THREE.Vector3(e.holder.position.x, 0.45, e.holder.position.z).project(FPD.cam); out.xy = [(s.x + 1)/2*innerWidth, (1 - s.y)/2*innerHeight];
    return out; }, txt);
  console.log(JSON.stringify(r));
  await page.screenshot({ path:SHOTS + '/zingrid_' + (process.env.ZTAG || 'x') + '.png', clip:{ x:Math.max(0, r.xy[0] - 90), y:Math.max(0, r.xy[1] - 130), width:180, height:220 } });
  if (errs.length) console.log(errs.join('\n'));
};
