// RS-566: waterfalls come down the mountains. From a river's head the stream climbs the slope behind it to a spring, then comes down
// over rock ledges in steps - a pool on each, a curtain of water over each lip - into the river. The water never runs uphill, never
// sinks into the ground, runs faster down a curtain than across a pool, and its foam and flow run downstream
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{ goToCharCreate(); ccBegin(); wgRegenerate(12345); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); o3Pref = true; G.gameMode = 0; weatherSync = ()=>{};
    G.owPos = { x:107, y:46 }; O3.win = null; O3.ppos = null; for (let i=0;i<8;i++){ renderGame(); await new Promise(r=>setTimeout(r, 40)); }
    const out = { n:(GFX.falls||[]).length, falls:[] };
    const rc = new THREE.Raycaster(), dn = new THREE.Vector3(0, -1, 0), side0 = GFX.fallMat.rock.side; GFX.fallMat.rock.side = THREE.DoubleSide; let downTop = 0; for (const f of GFX.falls){ f.rock.updateMatrixWorld(); const p = f.path, a = f.water.geometry.attributes, P = a.position, Fl = a.aFl; let sunk = 0, up = 0, curt = 0, pool = 0, maxY = -9;
      for (let i=0;i<P.count;i++){ const x = P.getX(i), y = P.getY(i), z = P.getZ(i), sp = Fl.getW(i); maxY = Math.max(maxY, y); if (sp > 0.5) curt++; else { pool++; if (y < O3.heightAt(x, z) - 0.03 && Fl.getX(i) > 0.2 && Fl.getX(i) < 0.8){ rc.set(new THREE.Vector3(x, 30, z), dn); const hit = rc.intersectObject(f.rock)[0]; if (!hit || hit.point.y < y) sunk++; else if (hit.face.normal.y < 0) downTop++; } }   /* (the bit of a pool tucked under the next step's rock is meant to be hidden) */ if (0){ } }
      /* (along the stream's middle line, going down the way it runs, the water never climbs) */
      const mids = []; for (let i=0;i<P.count;i++) if (Math.abs(Fl.getX(i) - 0.5) < 0.01) mids.push([Fl.getY(i), P.getY(i)]); mids.sort((q, w)=>q[0] - w[0]); for (let i=1;i<mids.length;i++) if (mids[i][1] > mids[i-1][1] + 0.03) up++;
      const climb = p.every((q, i)=>i < 2 || q[2] >= p[1][2] - 0.1);
      out.falls.push({ at:[f.tx, f.ty], steps:f.steps, drop:+f.drop.toFixed(2), pts:p.length, sunk, up, curt, pool, top:+maxY.toFixed(2), climb, river:[OW_RIVER, OW_WATER].includes(o3Tile(Math.floor(p[0][0] - Math.sign(p[1][0] - p[0][0])*0.4), Math.floor(p[0][1] - Math.sign(p[1][1] - p[0][1])*0.4))) }); }
    const m = GFX.fallMat.water, sh = { uniforms:{}, vertexShader:'#include <uv_vertex>', fragmentShader:'#include <color_fragment>' }; m.onBeforeCompile(sh); out.shader = /uT\*vFl\.w/.test(sh.fragmentShader) && /aFl/.test(sh.vertexShader);
    GFX.fallMat.rock.side = side0; out.downTop = downTop;
    out.shared = GFX.falls.every(f=>f.water.material===GFX.fallMat.water && f.rock.material===GFX.fallMat.rock);
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.n >= 3, 'waterfalls where the rivers come off the mountains');
  const tall = r.falls.filter(f=>f.drop > 3.5);   /* (RS-618: generator 11's narrower ranges stand a little lower) */ A(tall.length >= 2 && tall.every(f=>f.steps >= 3), 'a tall fall comes down in steps');
  A(r.falls.every(f=>f.climb && f.pts >= 3), 'each stream climbs from the river to its spring');
  A(r.falls.every(f=>f.up===0), 'the water never runs uphill');
  A(r.falls.every(f=>f.sunk===0), 'the pools stay over the ground');
  A(r.downTop===0, 'the rock over a tucked pool faces up');
  A(r.falls.every(f=>f.curt > 0 && f.pool > 0), 'pools and curtains');
  A(r.falls.every(f=>f.river), 'each falls into its river');
  A(r.shader && r.shared, 'the water runs in one shared shader, curtains faster than pools');
};
