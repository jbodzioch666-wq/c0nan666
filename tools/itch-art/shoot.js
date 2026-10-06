// Captures HUD-less in-game scenes (world, dungeon, town, tavern) for the itch.io art, into dist/itch-art/raw.
// Run through tools/itch-art/make.sh. Env: W/H (default 1920x1080), THREE_JS (a local three.min.js), PRE (extra page JS).
const path = require('path'), fs = require('fs');
function load(mod, fallbacks){ for (const p of [mod].concat(fallbacks)){ try { return require(p); } catch(e){} } return null; }
const pw = load('playwright', [path.join(__dirname, '../tests/node_modules/playwright'), '/opt/node-tools/node_modules/playwright']);
const ROOT = path.resolve(__dirname, '../..'), PAGE = path.join(ROOT, 'depthcrawl.html'), THREE = process.env.THREE_JS || path.join(__dirname, '../tests/node_modules/three/build/three.min.js');
const OUT = path.join(ROOT, 'dist/itch-art', process.env.OUTDIR || 'raw');
fs.mkdirSync(OUT, { recursive:true });
const W = +process.env.W || 1920, H = +process.env.H || 1080;
const only = process.argv.slice(2);
const HIDE = `.hideme, #miniMap{ display:none !important; } body *{ visibility:hidden !important; } canvas{ visibility:visible !important; } #toast, .v3plate{ display:none !important; }`;
const SCENES = {
  world: async ()=>{
    __boot(); G.gameMode = 0; G.interior = null;
    const at = (x,y)=>G.ow.map[x] && G.ow.map[x][y];
    let best = null, bs = -1e9;
    for (let x=8;x<OW_COLS-8;x++) for (let y=8;y<OW_ROWS-8;y++){ if (!o3Passable(x,y) || at(x,y)!==OW_GRASS) continue; const c = {};
      for (let i=-6;i<=6;i++) for (let j=-5;j<=5;j++){ const k = at(x+i,y+j); c[k] = (c[k]||0) + 1; }
      const wat = (c[OW_WATER]||0) + (c[OW_RIVER]||0), site = (c[OW_TOWN]||0) + (c[OW_CASTLE]||0) + (c[OW_TEMPLE]||0) + (c[OW_DUNGEON]||0) + (c[OW_MINE]||0);
      if (wat > 30 || (c[OW_GRASS]||0) < 40) continue;
      const sc = Math.min(c[OW_FOREST]||0, 40) + Math.min(wat, 22)*1.5 + site*10 + (c[OW_RIVER] ? 12 : 0) - ((c[OW_TUNDRA]||0) + (c[OW_DESERT]||0) + (c[OW_SWAMP]||0))*2 - (c[OW_MOUNTAIN]||0)*0.5;
      if (sc > bs){ bs = sc; best = { x, y }; } }
    G.owPos = best; G.player.clock = DAY_LENGTH*2 + DAY_LENGTH*0.38; O3.dist = +(window.__dist||15);
  },
  dungeon: async ()=>{
    __boot();
    let dx=-1, dy=-1; for (let x=0;x<OW_COLS && dx<0;x++) for (let y=0;y<OW_ROWS;y++) if (G.ow.map[x][y]===OW_DUNGEON){ dx=x; dy=y; break; }
    G.gameMode = 0; G.pendingDungeon = { x:dx, y:dy }; enterDungeonConfirm(); setUi('playing');
    const fl = (x,y)=>G.map[x] && G.map[x][y]===T_FLOOR;
    let best = null, bs = -1;
    for (let x=3;x<G.map.length-3;x++) for (let y=3;y<G.map[0].length-3;y++){ if (!fl(x,y)) continue; let n = 0; for (let i=-3;i<=3;i++) for (let j=-3;j<=3;j++) if (fl(x+i,y+j)) n++; if (n > bs){ bs = n; best = { x, y }; } }
    G.mon.forEach(m=>{ if (Math.hypot(m.x-best.x, m.y-best.y) < 6) m.alive = 0; });
    G.player.x = best.x; G.player.y = best.y;
    const foes = (window.__foes||'skeleton:0,orc:0,spider:0').split(',').map(s=>s.split(':'));
    const spots = [[-2,-2],[1,-2],[2,0],[-2,1],[0,-3]];
    foes.forEach(([k,i], n)=>{ const [ox,oy] = spots[n]; const m = Object.assign(newMonster(), famEntry(k, +i)); m.alive = 1; m.hp = m.maxHp = 30; m.mlevel = 12; m.x = best.x+ox; m.y = best.y+oy; m.awake = true; G.mon.push(m); });
    G.player.facing = 0; ISO.dist = +(window.__dist||9);
  },
  town: async ()=>{
    __boot();
    const at = (x,y)=>G.ow.map[x] && G.ow.map[x][y];
    const ts = townList().map(t=>{ let g = 0; for (let i=-3;i<=3;i++) for (let j=-3;j<=3;j++){ const k = at(t.x+i,t.y+j); if (k===OW_GRASS||k===OW_FOREST) g++; if (k===OW_DESERT||k===OW_TUNDRA) g -= 3; } return [g, t]; }).sort((a,b)=>b[0]-a[0]);
    const t = ts[+(window.__town||0)][1]; G.owPos = { x:t.x, y:t.y }; G.player.clock = DAY_LENGTH*2 + DAY_LENGTH*(+(window.__hour||0.86)); enterVillage(); setUi('playing');
    if (window.__dist) V3.dist = +window.__dist;
  },
  tavern: async ()=>{
    __boot();
    const t = townList()[0]; G.owPos = { x:t.x, y:t.y }; enterVillage(); setUi('playing'); townClosedCheck = ()=>false;
    G.player.clock = DAY_LENGTH*3 + DAY_LENGTH*0.7; enterInterior('tavern'); G.player.x = 9; G.player.y = 10; renderGame();
    if (window.__dist) V3.dist = +window.__dist;
  },
};
const BOOT = `window.__boot = ()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing');
  const mk = m=>Object.assign(newItem(), m), T = 5;
  for (const s of ['head','chest','legs','arms','feet']) try{ equipItem(mk(rsMakeArmour('metal', T, s))); }catch(e){}
  try{ equipItem(mk(rsMakeArmour('metal', T, 'offhand'))); }catch(e){} try{ equipItem(mk(rsMakeWeapon(T, 5))); }catch(e){} try{ equipItem(rsMakeCape(40)); }catch(e){}
  G.player.name = 'Depthcrawler'; };`;
(async()=>{
  const browser = await pw.chromium.launch({ headless:true, args:['--ignore-gpu-blocklist','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
  for (const name of Object.keys(SCENES)){
    if (only.length && !only.includes(name)) continue;
    const page = await browser.newPage({ viewport:{ width:W, height:H } });
    page.on('pageerror', e=>console.log('pageerror', e.message));
    await page.route('**/*', r=>{ const u = r.request().url(); if (u.includes('three.min.js') && fs.existsSync(THREE)) return r.fulfill({ path:THREE, contentType:'application/javascript' }); if (u.startsWith('file:')) return r.continue(); return r.abort(); });
    await page.goto('file://'+PAGE); await page.waitForTimeout(1500); await page.evaluate(BOOT + '; window.fpDrawMinimap = function(){};' + (process.env.PRE||''));
    const extra = process.env['JS_'+name] || '';
    await page.evaluate(`(${SCENES[name].toString()})().then(async ()=>{ ${extra}; for (let i=0;i<40;i++){ renderGame(); try{ if (G.gameMode===0) o3Render(); }catch(e){} await new Promise(r=>setTimeout(r, 40)); } })`);
    await page.addStyleTag({ content:HIDE }); await page.evaluate(()=>{ for (const c of document.querySelectorAll('canvas')){ const r = c.getBoundingClientRect(); if (r.width < 700) c.classList.add('hideme'); } });
    await page.waitForTimeout(500);
    await page.screenshot({ path:path.join(OUT, name+'.png'), timeout:180000 });
    console.log('shot', name); await page.close();
  }
  await browser.close();
})();
