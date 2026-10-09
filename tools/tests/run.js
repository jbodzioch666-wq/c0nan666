#!/usr/bin/env node
// Browser tests for depthcrawl.html. Each t_<name>.js exports async (page)=>{} and throws on failure.
//   node tools/tests/run.js                 every test, one fresh browser each
//   node tools/tests/run.js town eco        just t_town and t_eco
// Options:
//   --headed     open a real window (fastest on a desktop: the GPU draws the 3D)
//   --soft       force software WebGL (SwiftShader), for servers with no GPU
//   --timeout=N  minutes allowed per test (default 20)
// Screenshots land in tools/tests/shots/. Needs `npm install` in tools/tests first.
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '../..'), PAGE = path.join(ROOT, 'depthcrawl.html');
const ALL = ['wear', 'beetle', 'quad', 'lowtier', 'frog', 'ooze', 'tentacle', 'serpent', 'breath', 'dragon', 'women', 'torso', 'wolf', 'hdbugs', 'crab', 'spider', 'scorpion', 'human', 'halfelf', 'tiefling', 'gnome', 'halfling', 'halforc', 'dwarf', 'highelf', 'woodelf', 'cblvl', 'gearcmp', 'solid', 'lookout', 'volcano', 'intdoor', 'skroam', 'hobbit', 'racetowns', 'races', 'foebeat', 'nofs', 'skeye', 'pyramid', 'rs211', 'maptown', 'bestboss', 'wpfit', 'held', 'grip', 'dgpersist', 'bvzoom', 'crafttier', 'townanim', 'classgear', 'potstack', 'nosockets', 'hearth', 'altarspace', 'charsheet', 'bal2', 'crafthave', 'utilspell', 'noscrolls', 'foodbar', 'newworld', 'cavetip', 'portalwall', 'seats', 'interior', 'necro3d', 'encmodel', 'altar', 'rich', 'mythmap', 'peddlertools', 'lairtop', 'qroll', 'essvein', 'xpdrop', 'townlights', 'robe', 'beasts', 'anim', 'dwalk', 'boot','iso','xpt','diag','touch','bal','gen','grave','clock','rooms','door','roads','chardel','routebtn','graves','crash','wmapm','viewrot','tasks','soak','pace','fpdres','map','wev','wg','sail','big','town','folk','eco','gfx','shore','quest','audio', 'los', 'export', 'daylight', 'nodetip', 'campfire', 'monshadow', 'models', 'rush', 'lootstyle'];

function load(mod, fallbacks){ for (const p of [mod].concat(fallbacks)){ try { return require(p); } catch(e){} } return null; }
const pw = load('playwright', ['/opt/node-tools/node_modules/playwright']);
if (!pw){ console.error('playwright not found: run `npm install` in tools/tests'); process.exit(2); }
// a local copy of the three.js build the page loads, if there is one (otherwise it comes from the CDN)
const THREE = [process.env.THREE_JS, path.join(__dirname, 'node_modules/three/build/three.min.js')].filter(Boolean).find(f=>fs.existsSync(f));

const args = process.argv.slice(2), flag = k=>args.includes('--'+k);
const minutes = +((args.find(a=>a.startsWith('--timeout='))||'').split('=')[1] || 20);
const names = args.filter(a=>!a.startsWith('--')).map(a=>a.replace(/^t_/, '').replace(/\.js$/, ''));
const tests = names.length ? names : ALL;
const SHOTS = path.join(__dirname, 'shots'); fs.mkdirSync(SHOTS, { recursive:true }); global.SHOTS = SHOTS;

async function runOne(name){
  const file = path.join(__dirname, 't_'+name+'.js');
  if (!fs.existsSync(file)) return { ok:false, why:'no such test' };
  const launch = ['--ignore-gpu-blocklist'];
  if (flag('soft')) launch.push('--use-angle=swiftshader', '--enable-unsafe-swiftshader');
  if (name==='audio') launch.push('--autoplay-policy=no-user-gesture-required');
  const browser = await pw.chromium.launch({ headless:!flag('headed'), args:launch });
  // a test that exports `mobile: true` runs on an emulated phone (touch, 390x844)
  const mobile = !!require(file).mobile;
  const page = mobile ? await (await browser.newContext({ viewport:{ width:390, height:844 }, deviceScaleFactor:2, isMobile:true, hasTouch:true })).newPage()
                      : await browser.newPage({ viewport:{ width:1400, height:900 } });
  const errs = [];
  page.on('pageerror', e=>errs.push('pageerror: '+e.message+'\n'+(e.stack||'').split('\n').slice(0,4).join('\n')));
  page.on('console', m=>{ if (m.type()==='error') errs.push('console: '+m.text()); });
  await page.route('**/*', r=>{
    const u = r.request().url();
    if (u.includes('three.min.js')) return THREE ? r.fulfill({ path:THREE, contentType:'application/javascript' }) : r.continue();
    if (u.startsWith('file:') || u.startsWith('blob:') || u.startsWith('data:')) return r.continue();   // (the page's own files, and what it makes in memory - an exported save is a blob: download)
    return r.abort();   // fonts and anything else: the game runs fine without them
  });
  let ok = true, why = '';
  const timer = new Promise((_, rej)=>setTimeout(()=>rej(new Error(`timed out after ${minutes} min`)), minutes*60000));
  try {
    await page.goto('file://'+PAGE); await page.waitForTimeout(1500);
    delete require.cache[require.resolve(file)];
    await Promise.race([require(file)(page), timer]);
  } catch(e){ ok = false; why = e.message; }
  const real = errs.filter(e=>!/ERR_FAILED|net::|Failed to load resource/.test(e));
  if (real.length){ ok = false; why += (why ? '\n' : '')+real.join('\n'); }
  await browser.close().catch(()=>{});
  return { ok, why };
}

(async()=>{
  const res = [];
  for (const t of tests){
    const t0 = Date.now(); console.log(`--- t_${t}`);
    const r = await runOne(t), secs = Math.round((Date.now()-t0)/1000);
    console.log(`${r.ok ? 'PASS' : 'FAIL'} t_${t} (${secs}s)${r.why ? '\n  '+r.why.replace(/\n/g, '\n  ') : ''}`);
    res.push([t, r.ok, secs]);
  }
  if (res.length > 1){ console.log('\nSUMMARY'); for (const [t, ok, s] of res) console.log(`  ${ok ? 'PASS' : 'FAIL'}  t_${t}  ${s}s`); }
  process.exit(res.every(r=>r[1]) ? 0 : 1);
})();
