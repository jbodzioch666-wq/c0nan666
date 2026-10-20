#!/usr/bin/env node
// Browser tests for depthcrawl.html. Each t_<name>.js exports async (page)=>{} and throws on failure.
//   node tools/tests/run.js                 every test, one fresh browser each
//   node tools/tests/run.js town eco        just t_town and t_eco
// Options:
//   --headed     open a real window (fastest on a desktop: the GPU draws the 3D)
//   --soft       force software WebGL (SwiftShader), for servers with no GPU
//   --timeout=N  minutes allowed per test (default 20)
//   --jobs=N     run N tests at once, each in its own browser (default 1); their output is printed as each one finishes
//   --size=WxH   the desktop window (default 1400x900); a smaller one draws faster with --soft
//   --pos=X,Y    where a --headed window opens on the desktop, e.g. on another monitor (default: $DC_TEST_POS, if set)
// Screenshots land in tools/tests/shots/. Needs `npm install` in tools/tests first.
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '../..'), PAGE = path.join(ROOT, 'depthcrawl.html');
const ALL = ['rs487', 'rs587', 'rs586', 'rs585', 'rs584', 'rs583', 'rs582', 'rs581', 'rs580', 'rs579', 'rs578', 'rs577', 'rs576', 'rs575', 'rs574', 'rs572', 'rs571', 'rs570', 'rs569', 'rs568', 'rs566', 'rs565', 'rs564', 'rs563', 'rs561', 'rs560', 'rs559', 'rs558', 'rs557', 'rs556', 'rs555', 'rs554', 'rs553', 'rs552', 'rs551', 'rs550', 'rs549', 'rs548', 'rs547', 'rs546', 'rs544', 'rs543', 'rs542', 'rs541', 'rs540', 'rs539', 'rs538', 'rs537', 'rs536', 'rs534', 'rs533', 'rs532', 'rs531', 'rs530', 'rs529', 'rs528', 'rs527', 'rs526', 'rs525', 'rs524', 'rs523', 'rs522', 'rs521', 'rs520', 'rs519', 'rs518', 'rs517', 'rs516', 'rs514', 'rs513', 'rs511', 'rs510', 'rs509', 'rs508', 'rs507', 'rs506', 'rs505', 'rs504', 'rs503', 'rs502', 'rs501', 'rs500', 'rs499', 'rs498', 'rs497', 'rs495', 'rs494', 'rs493', 'rs492', 'rs491', 'rs490', 'rs489', 'rs488', 'rs486', 'rs485', 'rs483', 'rs482', 'rs481', 'rs479', 'rs478', 'rs477', 'rs476', 'rs475', 'rs473', 'rs472', 'rs471', 'rs470', 'rs469', 'rs468', 'rs467', 'rs466', 'rs465', 'rs464', 'rs463', 'rs462', 'rs461', 'rs460', 'rs459', 'rs458', 'rs456', 'rs455', 'rs454', 'rs453', 'rs452', 'rs451', 'rs450', 'rs449', 'rs448', 'rs444', 'rs443', 'rs442', 'rs441', 'rs440', 'rs439', 'rs438', 'rs437', 'rs436', 'rs435', 'rs434', 'rs433', 'rs432', 'rs431', 'rs430', 'rs428', 'rs427', 'rs426', 'rs424', 'rs423', 'rs422', 'rs420', 'siege', 'rs416', 'rs415', 'walkleak', 'deathall', 'xptstay', 'rs411', 'dgshadow', 'nosnap', 'dgminiwalk', 'dgrooms', 'savelock', 'dgkeep', 'grottoexit', 'walkstutter', 'nativeres', 'owdraws', 'deadcode', 'hudthrottle', 'gpurain', 'dgfx', 'dgcanvas', 'shadowwalk', 'dminimap', 'dsconce', 'sconces', 'tavgames', 'winlight', 'bedsleep', 'rs386', 'hbsweep', 'rs382', 'fieldwon', 'hoverpick', 'townmerge', 'skinall', 'restrig', 'quadrig', 'humanrig', 'rs375', 'rs374', 'menupanel', 'deaths', 'lootfammo', 'ammostack', 'templerunes', 'dgsolid', 'roamterrain', 'townpuddle', 'weatherclock', 'townwalk', 'travelmap', 'ragdoll', 'landreach', 'phonetier', 'lootfilter', 'snakesize', 'spire', 'spiregate', 'cull', 'diag', 'profile', 'jointmerge', 'gpupref', 'nodering', 'landfar', 'townperf', 'lich4', 'mobanim', 'viewwarm', 'dgwarm', 'rs342', 'bigbosses', 'heads', 'godspells', 'rs337', 'gates', 'cutclick', 'rs335', 'rs334', 'sqreturn', 'perfwild', 'dummy', 'dgquest', 'questtabs', 'qbtip', 'dgminimap', 'starlily', 'mimic', 'hooded', 'dglight', 'bagmats', 'ferry', 'qbpick', 'thrall', 'waitbtn', 'sidebooks', 'compactbtn', 'townmap', 'dragfirm', 'boardink', 'mapsearch', 'bladewalk', 'clicksure', 'sitrobe', 'campseat', 'praymix', 'beltline', 'qbars', 'bagtabs', 'drape', 'stairclick', 'offhand', 'mhead', 'skirt', 'cloak', 'helm', 'face', 'wear', 'beetle', 'quad', 'lowtier', 'frog', 'ooze', 'tentacle', 'serpent', 'breath', 'dragon', 'women', 'torso', 'wolf', 'hdbugs', 'crab', 'spider', 'scorpion', 'human', 'halfelf', 'tiefling', 'gnome', 'halfling', 'halforc', 'dwarf', 'highelf', 'woodelf', 'cblvl', 'gearcmp', 'solid', 'lookout', 'volcano', 'intdoor', 'skroam', 'hobbit', 'racetowns', 'races', 'foebeat', 'nofs', 'skeye', 'pyramid', 'rs211', 'maptown', 'bestboss', 'wpfit', 'held', 'grip', 'dgpersist', 'bvzoom', 'crafttier', 'townanim', 'classgear', 'potstack', 'nosockets', 'hearth', 'altarspace', 'charsheet', 'bal2', 'crafthave', 'utilspell', 'noscrolls', 'foodbar', 'newworld', 'cavetip', 'portalwall', 'seats', 'interior', 'necro3d', 'encmodel', 'altar', 'rich', 'mythmap', 'peddlertools', 'lairtop', 'qroll', 'essvein', 'xpdrop', 'townlights', 'robe', 'beasts', 'anim', 'dwalk', 'boot','iso','xpt','diag','touch','bal','gen','grave','clock','rooms','door','roads','chardel','routebtn','graves','crash','wmapm','viewrot','tasks','soak','pace','fpdres','map','wev','wg','sail','big','town','folk','eco','gfx','shore','quest','audio', 'los', 'export', 'daylight', 'nodetip', 'campfire', 'monshadow', 'models', 'rush', 'lootstyle'];

function load(mod, fallbacks){ for (const p of [mod].concat(fallbacks)){ try { return require(p); } catch(e){} } return null; }
const pw = load('playwright', ['/opt/node-tools/node_modules/playwright']);
if (!pw){ console.error('playwright not found: run `npm install` in tools/tests'); process.exit(2); }
// a local copy of the three.js build the page loads, if there is one (otherwise it comes from the CDN)
const THREE = [process.env.THREE_JS, path.join(__dirname, 'node_modules/three/build/three.min.js')].filter(Boolean).find(f=>fs.existsSync(f));

const args = process.argv.slice(2), flag = k=>args.includes('--'+k);
const opt = k=>(args.find(a=>a.startsWith('--'+k+'='))||'').split('=')[1];
const minutes = +(opt('timeout') || 20), jobs = Math.max(1, +(opt('jobs') || 1));
const [VW, VH] = (opt('size') || '1400x900').split('x').map(Number);
const names = args.filter(a=>!a.startsWith('--')).map(a=>a.replace(/^t_/, '').replace(/\.js$/, ''));
const tests = names.length ? names : ALL;
const SHOTS = path.join(__dirname, 'shots'); fs.mkdirSync(SHOTS, { recursive:true }); global.SHOTS = SHOTS;

async function runOne(name){
  const file = path.join(__dirname, 't_'+name+'.js');
  if (!fs.existsSync(file)) return { ok:false, why:'no such test' };
  const launch = ['--ignore-gpu-blocklist'];
  if (flag('soft')) launch.push('--use-angle=swiftshader', '--enable-unsafe-swiftshader');
  const pos = opt('pos') || process.env.DC_TEST_POS;
  if (pos) launch.push('--window-position=' + pos);
  if (name==='audio') launch.push('--autoplay-policy=no-user-gesture-required');
  const browser = await pw.chromium.launch({ headless:!flag('headed'), args:launch });
  // a test that exports `mobile: true` runs on an emulated phone (touch, 390x844)
  const mobile = !!require(file).mobile;
  // (acceptDownloads: the newer headless shell delivers no download event without it - t_export)
  const page = mobile ? await (await browser.newContext({ viewport:{ width:390, height:844 }, deviceScaleFactor:2, isMobile:true, hasTouch:true, acceptDownloads:true })).newPage()
                      : await browser.newPage({ viewport:{ width:VW, height:VH }, acceptDownloads:true });
  const errs = [];
  page.on('pageerror', e=>errs.push('pageerror: '+e.message+'\n'+(e.stack||'').split('\n').slice(0,4).join('\n')));
  page.on('console', m=>{ if (m.type()==='error') errs.push('console: '+m.text()); });
  await page.route('**/*', r=>{
    const u = r.request().url();
    if (u.includes('three.min.js')) return THREE ? r.fulfill({ path:THREE, contentType:'application/javascript' }) : r.continue();
    if (u.startsWith('file:') || u.startsWith('blob:') || u.startsWith('data:')) return r.continue();   // (the page's own files, and what it makes in memory - an exported save is a blob: download)
    return r.abort();   // fonts and anything else: the game runs fine without them
  });
  await page.addInitScript(()=>{ window.__noWarmSlice = 1; });   // (RS-499: tests keep the one-call scene compile; t_rs499 clears it to test the sliced one)
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
  const res = [], queue = tests.slice(), T0 = Date.now();
  // with --jobs, a test's console lines are held and printed with its result, so tests running side by side don't interleave
  const log0 = console.log, als = new (require('async_hooks').AsyncLocalStorage)();
  if (jobs > 1) console.log = (...a)=>{ const st = als.getStore(); if (st) st.push(a.join(' ')); else log0(...a); };
  const worker = async ()=>{
    while (queue.length){
      const t = queue.shift(), t0 = Date.now(), held = [];
      if (jobs===1) log0(`--- t_${t}`);
      const r = await (jobs===1 ? runOne(t) : als.run(held, ()=>runOne(t)));
      const secs = Math.round((Date.now()-t0)/1000);
      if (jobs > 1){ log0(`--- t_${t}`); for (const l of held) log0(l); }
      log0(`${r.ok ? 'PASS' : 'FAIL'} t_${t} (${secs}s)${r.why ? '\n  '+r.why.replace(/\n/g, '\n  ') : ''}`);
      res.push([t, r.ok, secs]);
    }
  };
  await Promise.all(Array.from({ length:Math.min(jobs, tests.length) }, worker));
  if (jobs > 1) log0(`\n${tests.length} tests in ${Math.round((Date.now()-T0)/1000)}s with ${jobs} at once`);
  if (res.length > 1){ console.log('\nSUMMARY'); for (const [t, ok, s] of res) console.log(`  ${ok ? 'PASS' : 'FAIL'}  t_${t}  ${s}s`); }
  process.exit(res.every(r=>r[1]) ? 0 : 1);
})();
