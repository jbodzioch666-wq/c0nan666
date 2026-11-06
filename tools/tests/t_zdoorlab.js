// (art probe, not in ALL) every dungeon theme's door side by side under a plain light, front and back: ZTAG names the shot, ZOPEN=1 swings them open
module.exports = async page=>{ page.setDefaultTimeout(0); const tag = process.env.ZTAG || 'a', open = !!process.env.ZOPEN; await page.setViewportSize({ width:1600, height:1000 });
  await page.evaluate(async ([open, zcx])=>{ window.__zcx = zcx; goToCharCreate(); ccBegin(); wgRegenerate(12345); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    const T = THREE, cv = document.createElement('canvas'); cv.width = 1600; cv.height = 1000; cv.style.cssText = 'position:fixed;left:0;top:0;z-index:99999;width:1600px;height:1000px'; document.body.appendChild(cv);
    const r = new T.WebGLRenderer({ canvas:cv, antialias:true }); r.setPixelRatio(1); r.setSize(1600, 1000, false); r.shadowMap.enabled = true; r.useLegacyLights = true; try{ T.ColorManagement.enabled = false; }catch(e){}
    const sc = new T.Scene(); sc.background = new T.Color(0x23262c); sc.add(new T.HemisphereLight(0xdde4ff, 0x40362c, 0.9)); const sun = new T.DirectionalLight(0xfff0dd, 1.3); sun.position.set(3, 6, 6); sun.castShadow = true; sc.add(sun);
    const TH = ['dungeon', 'graveyard', 'dgForest', 'dgJungle', 'dgSwamp', 'dgDesert', 'dgFrost', 'dgAsh', 'dgHaunt', 'dgCrystal'];
    const floor = new T.Mesh(new T.PlaneGeometry(40, 10), new T.MeshStandardMaterial({ color:0x4a4640 })); floor.rotation.x = -Math.PI/2; floor.receiveShadow = true; sc.add(floor);
    TH.forEach((th, i)=>{ for (const back of [0, 1]){ const g = isoPropModel({ x:0, y:0, kind:'dress', d:open ? 'arch' : 'door', rot:0, side:1, th }); g.position.set((i - 4.5)*1.15, back ? 0 : 0, back ? -2.6 : 0); if (back) g.rotation.y = Math.PI; if (g.userData.anim) g.userData.anim(0, 0); sc.add(g); } });
    const cam = new T.PerspectiveCamera(30, 1.6, 0.1, 100); const cx = +(window.__zcx||0); cam.position.set(cx, 1.6, 4.4); cam.lookAt(cx, 0.75, 0); r.render(sc, cam); r.render(sc, cam); window.__lab = 1; }, [open, process.env.ZCX || '0']);
  await page.waitForTimeout(500); await page.screenshot({ path: SHOTS + '/zdoorlab_' + tag + '.png' }); };
