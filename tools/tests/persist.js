// (probe runner, not a test) runs a probe in two separate browser launches that share one kept profile - whether what the browser
// caches on disk (its built shaders) carries over from one day's play to the next. node tools/tests/persist.js <probe> <profileDir>
const pw = require('playwright'), path = require('path'), fs = require('fs');
const ROOT = path.resolve(__dirname, '../..'), PAGE = path.join(ROOT, 'depthcrawl.html'), THREE = path.join(__dirname, 'node_modules/three/build/three.min.js');
(async ()=>{
  const probe = process.argv[2], dir = process.argv[3];
  for (const run of [1, 2]){
    const ctx = await pw.chromium.launchPersistentContext(dir, { headless:false, args:['--ignore-gpu-blocklist', '--window-position=-1880,-370'], viewport:{ width:1400, height:900 } });
    const page = ctx.pages()[0] || await ctx.newPage();
    await page.route('**/*', r=>{ const u = r.request().url(); if (u.includes('three.min.js')) return r.fulfill({ path:THREE, contentType:'application/javascript' }); if (u.startsWith('file:') || u.startsWith('blob:') || u.startsWith('data:')) return r.continue(); return r.abort(); });
    await page.goto('file://' + PAGE); await page.waitForTimeout(1500);
    console.log('--- launch ' + run); delete require.cache[require.resolve('./t_' + probe + '.js')]; await require('./t_' + probe + '.js')(page);
    await ctx.close(); await new Promise(r=>setTimeout(r, 2000));
  }
})().catch(e=>{ console.error(e); process.exit(1); });
