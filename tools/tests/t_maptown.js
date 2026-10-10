// RS-210: the world map (M) opens in a town too, and its ! marks explain themselves on hover: a quest objective and a wandering threat
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing');
    const A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); }, out = {}, wait = ms=>new Promise(r=>setTimeout(r, ms));
    let tx=-1, ty=-1; for (let x=0;x<OW_COLS && tx<0;x++) for (let y=0;y<OW_ROWS;y++) if (G.ow.map[x][y]===OW_TOWN){ tx=x; ty=y; break; }
    G.owPos = { x:tx, y:ty }; enterVillage(); setUi('playing'); renderGame(); await wait(200);
    A(G.gameMode===3, 'in a town');
    toggleOwZoom(); renderGame(); await wait(200);
    const mt = document.getElementById('mapTools');
    out.town = { open:G.owZoomedOut, mapOpen:owMapOpen(), tools:!!mt && mt.style.display!=='none', v3:!(V3.cv && V3.cv.style.display!=='none') };
    A(out.town.open && out.town.mapOpen && out.town.tools && out.town.v3, 'the map opens in a town '+JSON.stringify(out.town));
    const px = G.player.x, py = G.player.y; moveDir(1, 0); A(G.player.x===px && G.player.y===py, 'no walking with the map open');
    // a wandering threat and a quest objective near you, close in so both show
    G.ow.encounters = G.ow.encounters || []; const en = { x:tx+3, y:ty }; G.ow.encounters.push(en);
    try{ owReveal(tx, ty, 8); }catch(e){}
    G.owZoomScale = OW_ZOOM_MAX; renderGame(); await wait(150);
    const cv = canvas, rc = cv.getBoundingClientRect(), k = cv.width/rc.width, C = owZoomLastCellPx, cam = owZoomLastCam;
    const at = (x, y, dy)=>({ clientX: rc.left + ((x-cam.x)*C + C/2)/k, clientY: rc.top + ((y-cam.y)*C + C/2 + (dy||0))/k });
    const tip = ()=>{ const t = document.getElementById('itemTooltip') || document.querySelector('.tooltip, #tooltip'); return t && t.style.display!=='none' ? t.textContent : ''; };
    cv.dispatchEvent(new MouseEvent('mousemove', Object.assign({ bubbles:true }, at(en.x, en.y)))); await wait(50);
    out.threat = tip(); A(/wandering threat/.test(out.threat), 'the red ! explains itself: '+out.threat);
    const keep = [questsShown, questTarget, questTitle, questObjective];
    questsShown = ()=>[{ id:'fq', kind:'fetch' }]; questTarget = ()=>({ x:tx-3, y:ty, turnIn:false }); questTitle = ()=>'A test quest'; questObjective = ()=>'bring back three things';
    try{ renderGame(); const R = Math.min(19*dpr, Math.max(11*dpr, C*1.1));
      cv.dispatchEvent(new MouseEvent('mousemove', Object.assign({ bubbles:true }, at(tx-3, ty, -R*1.6)))); await wait(50);
      out.quest = tip(); } finally { [questsShown, questTarget, questTitle, questObjective] = keep; }
    A(/quest objective/.test(out.quest) && /A test quest/.test(out.quest), 'the gold ! explains itself: '+out.quest);
    toggleOwZoom(); renderGame(); await wait(150); A(!G.owZoomedOut && G.gameMode===3, 'M closes it again, still in town');
    return out; });
  console.log(JSON.stringify(r));
};
