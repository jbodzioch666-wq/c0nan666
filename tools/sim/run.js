#!/usr/bin/env node
// Balance simulators for depthcrawl.html. Each s_<name>.js exports async (page)=>{} and prints what it measured.
//   THREE_JS=/path/to/three.min.js node tools/sim/run.js combat gather
// Options: --soft (software WebGL), --timeout=N minutes (default 30). Same harness as tools/tests/run.js.
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '../..'), PAGE = path.join(ROOT, 'depthcrawl.html');
const ALL = ['combat', 'gather', 'produce', 'economy'];
function load(mod, fallbacks){ for (const p of [mod].concat(fallbacks)){ try { return require(p); } catch(e){} } return null; }
const pw = load('playwright', ['/opt/node-tools/node_modules/playwright']);
if (!pw){ console.error('playwright not found: run `npm install` in tools/tests'); process.exit(2); }
const THREE = [process.env.THREE_JS, path.join(__dirname, '../tests/node_modules/three/build/three.min.js')].filter(Boolean).find(f=>fs.existsSync(f));
const args = process.argv.slice(2), flag = k=>args.includes('--'+k);
const minutes = +((args.find(a=>a.startsWith('--timeout='))||'').split('=')[1] || 30);
const names = args.filter(a=>!a.startsWith('--')).map(a=>a.replace(/^s_/, '').replace(/\.js$/, ''));
const sims = names.length ? names : ALL;
async function runOne(name){
  const file = path.join(__dirname, 's_'+name+'.js');
  if (!fs.existsSync(file)) return { ok:false, why:'no such sim' };
  const launch = ['--ignore-gpu-blocklist'];
  if (flag('soft')) launch.push('--use-angle=swiftshader', '--enable-unsafe-swiftshader');
  const browser = await pw.chromium.launch({ headless:true, args:launch });
  const page = await browser.newPage({ viewport:{ width:1400, height:900 } });
  const errs = [];
  page.on('pageerror', e=>errs.push('pageerror: '+e.message+'\n'+(e.stack||'').split('\n').slice(0,4).join('\n')));
  page.on('console', m=>{ if (m.type()==='error') errs.push('console: '+m.text()); else if (m.text().startsWith('SIM ')) console.log(m.text().slice(4)); });
  await page.route('**/*', r=>{ const u = r.request().url();
    if (u.includes('three.min.js')) return THREE ? r.fulfill({ path:THREE, contentType:'application/javascript' }) : r.continue();
    if (u.startsWith('file:')) return r.continue(); return r.abort(); });
  let ok = true, why = '';
  const timer = new Promise((_, rej)=>setTimeout(()=>rej(new Error(`timed out after ${minutes} min`)), minutes*60000));
  try { await page.goto('file://'+PAGE); await page.waitForTimeout(1500); await Promise.race([require(file)(page), timer]); }
  catch(e){ ok = false; why = e.message; }
  const real = errs.filter(e=>!/ERR_FAILED|net::|Failed to load resource/.test(e));
  if (real.length) why += (why ? '\n' : '')+real.slice(0, 5).join('\n');
  await browser.close().catch(()=>{});
  return { ok, why };
}
(async()=>{ for (const s of sims){ const t0 = Date.now(); console.log(`--- s_${s}`); const r = await runOne(s); console.log(`${r.ok ? 'DONE' : 'FAIL'} s_${s} (${Math.round((Date.now()-t0)/1000)}s)${r.why ? '\n  '+r.why.replace(/\n/g, '\n  ') : ''}`); } })();
