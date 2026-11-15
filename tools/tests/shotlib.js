// a model on its own, rendered from a few angles into PNG files (for looking at art work; not a test)
//   await shotlib.install(page); then in page: __shot(obj, { yaws:[0, 1.57], w:420, h:520, fit:'y' }) -> [dataURL...]
const fs = require('fs'), path = require('path');
module.exports.install = page=>page.evaluate(()=>{
  window.__shot = (obj, o={})=>{
    const T = THREE, w = o.w || 420, h = o.h || 520, R = window.__shotR || (window.__shotR = new T.WebGLRenderer({ antialias:true, preserveDrawingBuffer:true }));
    R.setSize(w, h, false); R.outputEncoding = T.sRGBEncoding; R.toneMapping = T.ACESFilmicToneMapping; R.shadowMap.enabled = false;
    const sc = new T.Scene(); sc.background = new T.Color(o.bg || '#7d8790');
    sc.add(new T.HemisphereLight(0xfff4e0, 0x404850, 0.9)); const dl = new T.DirectionalLight(0xffffff, 1.6); dl.position.set(2.5, 4, 3); sc.add(dl); const bl = new T.DirectionalLight(0xc0d0ff, 0.5); bl.position.set(-3, 2, -2); sc.add(bl);
    const par = obj.parent; sc.add(obj); obj.updateMatrixWorld(true);
    const box = new T.Box3().setFromObject(obj), c = box.getCenter(new T.Vector3()), sz = box.getSize(new T.Vector3());
    if (o.focus) c.copy(o.focus); const span = o.span || Math.max(sz.y, Math.max(sz.x, sz.z)*0.9), cam = new T.PerspectiveCamera(o.fov || 28, w/h, 0.01, 200), d = span/(2*Math.tan((o.fov || 28)*Math.PI/360))*1.15;
    const out = [];
    for (const yaw of (o.yaws || [0])){ const pitch = o.pitch == null ? 0.12 : o.pitch; cam.position.set(c.x + Math.sin(yaw)*Math.cos(pitch)*d, c.y + Math.sin(pitch)*d, c.z + Math.cos(yaw)*Math.cos(pitch)*d); cam.lookAt(c); R.render(sc, cam); out.push(R.domElement.toDataURL('image/png')); }
    sc.remove(obj); if (par) par.add(obj);
    return out; };
});
module.exports.save = (urls, base)=>urls.map((u, i)=>{ const f = path.join(global.SHOTS, base + (urls.length > 1 ? '_' + i : '') + '.png'); fs.writeFileSync(f, Buffer.from(u.split(',')[1], 'base64')); return f; });
