// probe (RS-696): the fishing animation, frame by frame. Fishes the nearest spot on the land and holds the gathering's beat at chosen moments
// of the first cast, a catch and a miss (fishAnim reads the time from G.gather.next), each shot from the side through a close camera,
// as one sheet (shots/zfishanim.png, labelled). ZSIDE=-1 shoots from the other side; ZD the camera's distance (default 2.4)
const fs = require('fs');
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const r = await page.evaluate(async ({ side, dist })=>{ const fr = n=>new Promise(res=>{ let i = 0; const f = ()=>++i >= n ? res() : requestAnimationFrame(f); requestAnimationFrame(f); }), wait = ms=>new Promise(res=>setTimeout(res, ms));
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.gameMode = 0; G.player.clock = DAY_LENGTH*0.4;
    skP().tools.rod = Math.max(1, skP().tools.rod||0); owHunterSpawn = ()=>{}; owHuntersStep = ()=>false;
    let n = null, st = null; for (let rr=1; rr<40 && !n; rr++) for (let i=-rr;i<=rr && !n;i++) for (let j=-rr;j<=rr && !n;j++){ if (Math.max(Math.abs(i), Math.abs(j))!==rr) continue; const q = skNodeAt(G.owPos.x + i, G.owPos.y + j); if (!q || q.k!=='fishing' || q.gone || q.type==='deep' || skNodeReq(q) > skLvl('fishing')) continue;
      for (const [dx, dy] of [[0,1],[1,0],[0,-1],[-1,0]]){ const x = q.x + dx, y = q.y + dy; if (o3Passable(x, y) && G.ow.map[x][y]!==OW_WATER){ n = q; st = [x, y]; break; } } }
    if (!n) return { none:true };
    G.owPos = { x:st[0], y:st[1] }; owReveal(st[0], st[1], 8); await fr(120); skDo(skNodeOption(n)); await wait(300); if (!G.gather) return { nogather:true, n };
    const g = G.gather; g.iv = 2800; skGatherTick = ()=>{};   /* (the beat held by hand) */
    const T = THREE, PP = O3.ppos.clone(), [sx, sz] = o3C(n.x, n.y), mid = new T.Vector3((PP.x + sx)/2, PP.y + 0.55, (PP.z + sz)/2), dx = sx - PP.x, dz = sz - PP.z, L = Math.hypot(dx, dz) || 1;
    const cam = O3.cam.clone(); cam.fov = 40; const R = O3.renderer, W = R.domElement.width, H = R.domElement.height; cam.aspect = W/H; cam.position.set(mid.x - dz/L*dist*side, mid.y + 0.75, mid.z + dx/L*dist*side); cam.lookAt(mid); cam.updateProjectionMatrix();
    const plan = [['start', 0.12], ['start', 0.3], ['start', 0.42], ['start', 0.62], ['start', 0.9], ['catch', 0.12], ['catch', 0.3], ['catch', 0.55], ['catch', 0.8], ['catch', 1.05], ['catch', 1.3], ['catch', 1.5], ['catch', 1.75], ['catch', 2.1], ['miss', 0.15], ['miss', 0.4], ['miss', 0.58], ['wait', 1.5]];
    const sheet = document.createElement('canvas'), cw = 380, ch = Math.round(cw*H/W); sheet.width = cw*5; sheet.height = ch*Math.ceil(plan.length/5); const sx2 = sheet.getContext('2d'); sx2.font = 'bold 18px monospace'; sx2.fillStyle = '#fff';
    const frame = ()=>{ const im = new Image(); im.src = R.domElement.toDataURL('image/png'); return new Promise(res=>{ im.onload = ()=>res(im); }); };
    let missN = 0; while (o3Hash(missN, 7, 3) >= 0.55) missN++; let waitN = 0; while (o3Hash(waitN, 7, 3) < 0.55) waitN++;
    const info = []; for (let k=0;k<plan.length;k++){ const [kind, ts] = plan[k];
      g.last = kind==='start' ? undefined : kind==='wait' ? 'miss' : kind; g.n = kind==='start' ? 0 : kind==='miss' ? missN : kind==='wait' ? waitN : 5; g.lastFish = 'trout';
      for (let f=0; f<3; f++){ g.next = performance.now() + (2.8 - ts)*1000; await fr(1); }
      g.next = performance.now() + (2.8 - ts)*1000; await fr(1); R.render(O3.scene, cam); const im = await frame(); sx2.drawImage(im, (k % 5)*cw, Math.floor(k/5)*ch, cw, ch); sx2.fillText(kind + ' ' + ts, (k % 5)*cw + 8, Math.floor(k/5)*ch + 22);
      info.push([kind, ts, O3.frig.float.visible, O3.frig.fish.visible, +O3.frig.float.position.y.toFixed(2)]); }
    return { n:{ x:n.x, y:n.y, type:n.type }, info, sheet:sheet.toDataURL('image/png') }; }, { side:+(process.env.ZSIDE || 1), dist:+(process.env.ZD || 2.4) });
  if (r.sheet) fs.writeFileSync(SHOTS + '/zfishanim.png', Buffer.from(r.sheet.split(',')[1], 'base64')); delete r.sheet;
  console.log(JSON.stringify(r)); if (errs.length) console.log('ERRORS', errs.join(' | '));
};
