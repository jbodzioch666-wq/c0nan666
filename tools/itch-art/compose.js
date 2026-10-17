// Lays the title over the captured scenes: cover (630x500), banner (960x300), page background (1920x1080) and
// embed background (1280x720), into dist/itch-art/out. Needs dist/itch-art/fonts (make.sh unpacks them from the itch zip).
const path = require('path'), fs = require('fs');
function load(mod, fallbacks){ for (const p of [mod].concat(fallbacks)){ try { return require(p); } catch(e){} } return null; }
const pw = load('playwright', [path.join(__dirname, '../tests/node_modules/playwright'), '/opt/node-tools/node_modules/playwright']);
const DIR = path.resolve(__dirname, '../../dist/itch-art'), RAW = process.env.RAW || 'raw', OUT = path.join(DIR, 'out'); fs.mkdirSync(OUT, { recursive:true });
const img = n=>`${RAW}/${n}.png`;
const BASE = `<!doctype html><meta charset="utf-8"><link rel="stylesheet" href="fonts/fonts.css"><style>
  *{ margin:0; padding:0; box-sizing:border-box; }
  html,body{ background:#0b0907; overflow:hidden; }
  .stage{ position:relative; overflow:hidden; }
  .bg{ position:absolute; inset:0; background-size:cover; }
  .title{ font-family:'Cinzel', serif; font-weight:700; letter-spacing:0.06em; line-height:1; text-transform:uppercase;
    background:linear-gradient(180deg, #fff3c4 0%, #f2c260 45%, #b8742a 70%, #f0c868 100%); -webkit-background-clip:text; background-clip:text; color:transparent;
    -webkit-text-stroke:1.5px rgba(40,20,6,0.85); filter:drop-shadow(0 3px 0 #2a1406) drop-shadow(0 0 18px rgba(255,150,40,0.45)) drop-shadow(0 6px 14px rgba(0,0,0,0.9)); }
  .sub{ font-family:'Cinzel', serif; font-weight:600; color:#f1e2bd; letter-spacing:0.22em; text-transform:uppercase; text-shadow:0 2px 6px #000, 0 0 12px #000; }
  .rule{ height:2px; background:linear-gradient(90deg, transparent, #d9a54a, transparent); }
</style>`;
const PIECES = {
  // the itch.io cover: 630x500 (shown at 315x250 in listings)
  cover: { w:630, h:500, html:`<div class="stage" style="width:630px;height:500px">
      <div class="bg" style="background-image:url(${img('dungeon')});background-position:${process.env.COVER_POS||'50% 57%'};background-size:${process.env.COVER_SIZE||'177%'}"></div>
      <div class="bg" style="background:radial-gradient(ellipse at 50% 40%, transparent 40%, rgba(0,0,0,0.6) 100%), linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 22%, rgba(0,0,0,0) 58%, rgba(0,0,0,0.9) 88%)"></div>
      <div style="position:absolute;left:0;right:0;bottom:24px;text-align:center"><div class="title" style="font-size:68px">Depthcrawl</div>
        <div class="rule" style="width:340px;margin:12px auto 9px"></div><div class="sub" style="font-size:16px">Dungeons &middot; Skills &middot; Towns</div></div>
    </div>` },
  // the page banner: 960x300 across the top of the page
  banner: { w:960, h:300, html:`<div class="stage" style="width:960px;height:300px">
      <div class="bg" style="background-image:url(${img('world')});background-position:${process.env.BANNER_POS||'100% 48%'};background-size:${process.env.BANNER_SIZE||'150%'}"></div>
      <div class="bg" style="background:linear-gradient(90deg, rgba(0,0,0,0) 30%, rgba(0,0,0,0.55) 62%, rgba(0,0,0,0.8)), linear-gradient(180deg, rgba(0,0,0,0.2), rgba(0,0,0,0) 35%, rgba(0,0,0,0.45))"></div>
      <div style="position:absolute;right:44px;top:50%;transform:translateY(-55%);text-align:right"><div class="title" style="font-size:76px">Depthcrawl</div>
        <div class="rule" style="width:400px;margin:14px 0 10px auto"></div>
        <div class="sub" style="font-size:16px">Deep dungeons &middot; skills to master &middot; living towns</div></div>
    </div>` },
  background: { w:1920, h:1080, html:`<div class="stage" style="width:1920px;height:1080px">
      <div class="bg" style="background-image:url(${img('town')});background-position:50% 50%;filter:blur(3px) saturate(0.9) brightness(0.68);transform:scale(1.03)"></div>
      <div class="bg" style="background:radial-gradient(ellipse at 50% 40%, rgba(11,9,7,0.35) 0%, rgba(11,9,7,0.75) 55%, rgba(11,9,7,0.97) 100%)"></div>
    </div>` },
  // the embed background: 1280x720, behind the Run game button (kept clear in the middle)
  embed: { w:1280, h:720, html:`<div class="stage" style="width:1280px;height:720px">
      <div class="bg" style="background-image:url(${img('tavern')});background-position:${process.env.EMBED_POS||'55% 45%'};background-size:${process.env.EMBED_SIZE||'cover'}"></div>
      <div class="bg" style="background:radial-gradient(ellipse at 50% 55%, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.55) 60%, rgba(0,0,0,0.85) 100%), linear-gradient(180deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 30%)"></div>
      <div style="position:absolute;left:0;right:0;top:40px;text-align:center"><div class="title" style="font-size:92px">Depthcrawl</div></div>
      <div style="position:absolute;left:0;right:0;bottom:34px;text-align:center"><div class="sub" style="font-size:20px">Click to enter &middot; best in fullscreen</div></div>
    </div>` },
};
(async()=>{
  const only = process.argv.slice(2);
  const browser = await pw.chromium.launch({ headless:true });
  for (const [name, P] of Object.entries(PIECES)){
    if (only.length && !only.includes(name)) continue;
    const f = path.join(DIR, '_'+name+'.html'); fs.writeFileSync(f, BASE + P.html);
    const page = await browser.newPage({ viewport:{ width:P.w, height:P.h } });
    await page.goto('file://'+f); await page.evaluate(()=>document.fonts.ready); await page.waitForTimeout(300);
    await page.screenshot({ path:path.join(OUT, name+'.png') }); await page.close(); console.log('made', name);
  }
  await browser.close();
})();
