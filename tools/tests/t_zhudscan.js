// probe (RS-670): every tile of a world, as the place you stand: does the bar at the top (clockLandText, clockBarText), the area
// (wgArea), the place and the province throw for any tile? ZSAVE a save (else a fresh planet). Lists the first tiles that throw,
// with the error. No land is built.
const fs = require('fs');
module.exports = async page=>{ page.setDefaultTimeout(0);
  const txt = process.env.ZSAVE ? fs.readFileSync(process.env.ZSAVE, 'utf8') : null;
  const r = await page.evaluate(txt=>{ o3Pref = false; if (txt){ const d = JSON.parse(txt).data; importSaveText(txt); loadGame(d.id); } else { goToCharCreate(); ccBegin(); setWorldSizeTier('planet'); confirmWorldPreview(); }
    setUi('playing'); saveCurrentGame = ()=>{}; G.gameMode = 0; G.interior = null; G.inTown = false;
    const W = OW_COLS, H = OW_ROWS, m = G.ow.map, out = { gen:G.ow.genVer, size:W + 'x' + H, tiles:0, bad:{}, ex:[] }, p0 = { ...G.owPos };
    const fns = { land:()=>{ G._landK = null; return clockLandText(); }, bar:()=>clockBarText(), area:()=>wgArea(G.owPos.x, G.owPos.y), place:()=>owPlaceAt(G.owPos.x, G.owPos.y), prov:()=>provAt(G.owPos.x, G.owPos.y), bio:()=>wgBioAt(G.owPos.x, G.owPos.y), band:()=>wgBand(G.owPos.x, G.owPos.y), terr:()=>wevTerrAt(G.owPos.x, G.owPos.y), sight:()=>wgSight(), step:()=>G.ow.road ? wgStepCost(G.owPos.x, G.owPos.y) : 1, cliff:()=>owCliffAt(G.owPos.x, G.owPos.y), ice:()=>iceAt(G.owPos.x, G.owPos.y) };
    for (let x=0;x<W;x++) for (let y=0;y<H;y++){ if (typeof cubeFace==='function' && owCube() && cubeFace(x, y) < 0) continue; out.tiles++; G.owPos.x = x; G.owPos.y = y;
      for (const k in fns){ try{ fns[k](); }catch(e){ out.bad[k] = (out.bad[k]||0) + 1; if (out.ex.length < 12) out.ex.push({ k, x, y, t:m[x][y], face:owCube() ? cubeFace(x, y) : 1, e:String(e).slice(0, 160) }); } } }
    G.owPos.x = p0.x; G.owPos.y = p0.y; return out; }, txt);
  console.log(JSON.stringify(r)); };
