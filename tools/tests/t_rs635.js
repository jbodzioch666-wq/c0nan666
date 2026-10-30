// RS-635: no glowing ring on the ground round a gathering spot (tree, rock, herb patch, fishing spot) on the open land; the spots
// themselves still stand there and can be clicked. Shot: shots/rs635-nodes.png
module.exports = async page=>{
  page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const r = await page.evaluate(async ()=>{ goToCharCreate(); ccBegin(); confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.gameMode = 0; G.interior = null;
    for (let i=0;i<300;i++) await new Promise(r=>requestAnimationFrame(r));
    let discMesh = 0; O3.scene.traverse(o=>{ if (o.isMesh && o.material && o.material===O3.discMat) discMesh++; });
    return { discMat:!!O3.discMat, discMesh, hits:(O3.nodeHits||[]).length, chunks:O3.nodeChunks ? O3.nodeChunks.size : 0 }; });
  await page.screenshot({ path: SHOTS + '/rs635-nodes.png' });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(!r.discMat && r.discMesh===0, 'no ring under the gathering spots');
  A(r.hits > 0, 'the spots are still there to click');
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
