// RS-317: the world map opened in a town is the same as outside - the whole window, no town minimap over it, and an M slot
// on the hotbar to open and close it
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); G.gameMode = 0; saveCurrentGame = ()=>{};
    const frames = async n=>{ for (let i=0;i<n;i++){ renderGame(); await new Promise(r=>setTimeout(r, 40)); } };
    const look = ()=>{ const cs = canvas.getBoundingClientRect(), mm = document.getElementById('miniMap'); return { w:Math.round(cs.width), h:Math.round(cs.height), x:Math.round(cs.left), y:Math.round(cs.top), mm:!!(mm && getComputedStyle(mm).display!=='none' && mm.offsetHeight), tools:!!document.getElementById('mapSearch') }; };
    await frames(4); toggleOwZoom(); await frames(6); const out = look(); toggleOwZoom();
    enterVillage(); setUi('playing'); await frames(6);
    const slot = [...document.querySelectorAll('[title]')].some(e=>/world map/.test(e.getAttribute('title')||''));
    toggleOwZoom(); await frames(6); const town = look();
    const z0 = owZoomScale(); canvas.dispatchEvent(new WheelEvent('wheel', { deltaY:-100, bubbles:true, cancelable:true })); town.zoom = owZoomScale() > z0;   /* (RS-324: the wheel zooms the map in a town) */
    toggleOwZoom(); await frames(3); const back = look();
    return { out, town, slot, back, win:[window.innerWidth, window.innerHeight] }; });
  console.log(JSON.stringify(r));
  if (r.town.w!==r.out.w || r.town.h!==r.out.h || r.town.x!==r.out.x || r.town.y!==r.out.y) throw new Error('the map fills the same window in a town as outside '+JSON.stringify(r));
  if (!r.town.zoom) throw new Error('the map zooms in a town');
  if (r.town.mm) throw new Error('the town minimap is hidden while the world map is open');
  if (!r.town.tools) throw new Error('the map tools show in a town');
  if (!r.slot) throw new Error('the hotbar has the world map slot in a town');
  if (!r.back.mm) throw new Error('the town minimap comes back when the map is closed');
};
