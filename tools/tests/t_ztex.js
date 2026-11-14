// (probe, not in ALL) every textured material in the town scene, before going into a building and after coming out: maps whose
// image is gone, empty, or one flat colour
module.exports = async page=>{
  page.setDefaultTimeout(0);
  const r = await page.evaluate(async ()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    const t = G.ow.spawnPos; G.owPos = { x:t.x, y:t.y }; enterVillage(); setUi('playing'); townClosedCheck = ()=>false; const fr = async n=>{ for (let i=0;i<n;i++){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); } };
    await fr(120);
    const look = ()=>{ const res = { mats:0, maps:0, bad:[], byName:{} }, seen = new Set(), cv = document.createElement('canvas'); cv.width = cv.height = 8; const cx = cv.getContext('2d', { willReadFrequently:true });
      const sc = V3.scene || (V3.world && V3.world.parent); (sc || V3.world).traverse(o=>{ if (!o.material) return; for (const m of [].concat(o.material)){ if (seen.has(m)) continue; seen.add(m); res.mats++;
        for (const k of ['map', 'normalMap', 'bumpMap', 'roughnessMap']){ const tx = m[k]; if (!tx) continue; res.maps++; const im = tx.image; let why = null;
          if (!im) why = 'no image'; else if (!(im.width > 0)) why = 'size 0'; else { try{ cx.clearRect(0, 0, 8, 8); cx.drawImage(im, 0, 0, 8, 8); const d = cx.getImageData(0, 0, 8, 8).data; let mn = 999, mx = 0; for (let i=0;i<d.length;i+=4){ const v = d[i] + d[i+1] + d[i+2]; mn = Math.min(mn, v); mx = Math.max(mx, v); } if (mx - mn < 4 && k==='map') why = 'flat ' + d[0] + ',' + d[1] + ',' + d[2]; }catch(e){ why = 'unreadable ' + e.message.slice(0, 40); } }
          if (tx.__disposed) why = (why ? why + ' ' : '') + 'disposed';
          if (why) res.bad.push({ obj:o.name || o.type, k, why, w:im && im.width, uuid:tx.uuid.slice(0, 6), atlas:!!m.userData.atlas }); } } });
      return res; };
    const D = THREE.Texture.prototype.dispose; THREE.Texture.prototype.dispose = function(){ this.__disposed = (this.__disposed||0) + 1; if (!window.__dispStack) window.__dispStack = []; if (window.__dispStack.length < 6) window.__dispStack.push((new Error().stack||'').split('\n').slice(2, 6).join(' | ').slice(0, 300)); return D.call(this); };
    const before = look();
    const k = (G.townVendors||[]).map(v=>v.key).find(k=>ROOM_LAYOUT[k]); enterInterior(k); await fr(90); exitInterior(); await fr(120);
    const after = look();
    return { before:{ mats:before.mats, maps:before.maps, bad:before.bad.length, ex:before.bad.slice(0, 6) }, after:{ mats:after.mats, maps:after.maps, bad:after.bad.length, ex:after.bad.slice(0, 12) }, disp:window.__dispStack || [] }; });
  console.log(JSON.stringify(r, null, 1));
};
