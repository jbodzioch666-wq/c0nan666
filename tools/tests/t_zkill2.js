// (probe, not in ALL) which 2D canvas draw kinds (method, font, shadow, filter, blend, style kind) are seen for the first time after a kill
module.exports = async page=>{
  page.setDefaultTimeout(0);
  await page.evaluate(async ()=>{ window.__noWarmSlice = false; goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.player.hp = G.player.maxHp = 99999;
    const s = questNearbySites(G.owPos.x, G.owPos.y, 1, 60, ['dungeon'])[0]; G.gameMode = 0; G.pendingDungeon = { x:s.x, y:s.y }; enterDungeonConfirm(); setUi('playing');
    const seen = window.__seen = new Map(); window.__rec = false; window.__new = [];
    const kind = v=> typeof v==='string' ? 'c' : v && v.constructor ? v.constructor.name : '?';
    const P = CanvasRenderingContext2D.prototype;
    for (const m of ['fillText','strokeText','fillRect','strokeRect','fill','stroke','drawImage','putImageData','clearRect']){ const o = P[m]; P[m] = function(){
      const c = this.canvas, k = m + '|' + (c.id||c.className||(c.width+'x'+c.height)) + '|' + (/Text/.test(m) ? this.font : '') + '|sb' + (this.shadowBlur>0 ? 1 : 0) + '|' + this.filter + '|' + this.globalCompositeOperation + '|' + (/stroke/i.test(m) ? kind(this.strokeStyle) : kind(this.fillStyle)) + (m==='drawImage' ? '|' + (arguments[0] && arguments[0].constructor.name) : '');
      if (!seen.has(k)){ seen.set(k, 1); if (window.__rec) window.__new.push(k + ' @' + (window.__f||0) + ' ' + (new Error().stack.split('\n')[2]||'').trim().slice(0, 80)); }
      return o.apply(this, arguments); }; }
    for (let i=0;i<300;i++) await new Promise(r=>requestAnimationFrame(r)); await new Promise(r=>setTimeout(r, 5000)); });
  const r = await page.evaluate(async ()=>{ const m = G.mon.find(m=>m.alive); m.x = G.player.x + 1; m.y = G.player.y; m.hp = 0; const i = G.mon.indexOf(m);
    window.__rec = true; window.__f = 0; noteFoe(i); monsterDies(i); for (let f=0; f<120; f++){ window.__f = f; await new Promise(r=>requestAnimationFrame(r)); } window.__rec = false; return window.__new; });
  for (const k of r) console.log(k);
};
