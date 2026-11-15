// RS-208: the waypoint window fits the screen with no scroll bar, on a phone too - the map shrinks to the room left
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing');
    for (let x=0;x<OW_COLS;x++) for (let y=0;y<OW_ROWS;y++) if (G.ow.map[x][y]===OW_TOWN && !(G.ow.visitedTowns||[]).includes(x+','+y)) (G.ow.visitedTowns = G.ow.visitedTowns||[]).push(x+','+y);
    G.ow.seen = null; try{ for (let x=0;x<OW_COLS;x++) for (let y=0;y<OW_ROWS;y++) owReveal(x, y, 0); }catch(e){}
    setUi('waypoint'); await new Promise(r=>setTimeout(r, 300));
    const ov = document.getElementById('overlay'), cv = document.getElementById('wpMap');
    return { sh:ov.scrollHeight, ch:ov.clientHeight, cvH:Math.round(cv.getBoundingClientRect().height), btn:!!ov.querySelector('.wp-hearth .btn, .wp-hearth span'), vh:innerHeight }; });
  console.log(JSON.stringify(r));
  if (r.sh > r.ch + 1) throw new Error('the waypoint window scrolls '+JSON.stringify(r));
  if (r.cvH < 100) throw new Error('the map is still shown '+JSON.stringify(r));
};
module.exports.mobile = true;
