document.getElementById('yr').textContent = new Date().getFullYear();
const heroBg = document.getElementById('heroBg');
addEventListener('scroll', () => {
  heroBg.style.transform = `translate3d(0,${scrollY*0.35}px,0) scale(1.1)`;
}, { passive: true });
const io = new IntersectionObserver((es) => es.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add('revealed'); io.unobserve(e.target); }
}), { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

(function(){
  const canvas = document.getElementById('coin');
  if (!canvas || typeof THREE === 'undefined') return;
  const w = canvas.clientWidth, h = canvas.clientHeight;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, w/h, 0.1, 100);
  camera.position.set(0,0,5);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias:true, alpha:true });
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));
  renderer.setSize(w,h,false);

  function drawArcText(ctx, text, cx, cy, radius, startAngle, clockwise, color, fontPx){
    ctx.save();
    ctx.fillStyle = color;
    ctx.font = `700 ${fontPx}px Georgia, serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const dir = clockwise ? 1 : -1;
    let angle = startAngle;
    const chars = text.split('');
    for (let i = 0; i < chars.length; i++){
      const ch = chars[i];
      const charWidth = ctx.measureText(ch).width;
      const step = (charWidth + fontPx*0.28) / radius;
      angle += dir * step * 0.5;
      ctx.save();
      ctx.translate(cx + Math.cos(angle)*radius, cy + Math.sin(angle)*radius);
      ctx.rotate(angle + (clockwise ? Math.PI/2 : -Math.PI/2));
      ctx.fillText(ch, 0, 0);
      ctx.restore();
      angle += dir * step * 0.5;
    }
    ctx.restore();
  }

  function drawEmblem(ctx, cx, cy, r, color){
    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 4;
    for (const side of [-1, 1]){
      ctx.beginPath();
      for (let i = 0; i <= 12; i++){
        const t = i/12;
        const ang = Math.PI*0.5 + t*Math.PI*0.85;
        const rad = r*0.55 + t*r*0.28;
        const x = side * Math.cos(ang) * rad*0.5;
        const y = Math.sin(ang) * rad - r*0.15;
        if (i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
        const lx = x + side*9*Math.cos(ang+0.35);
        const ly = y + 9*Math.sin(ang+0.35);
        ctx.moveTo(x,y); ctx.lineTo(lx,ly); ctx.moveTo(x,y);
      }
      ctx.stroke();
    }
    ctx.beginPath();
    for(let i=0;i<5;i++){
      const a = (Math.PI*2/5)*i - Math.PI/2;
      const a2 = a + Math.PI/5;
      ctx.lineTo(Math.cos(a)*r*0.34, Math.sin(a)*r*0.34);
      ctx.lineTo(Math.cos(a2)*r*0.14, Math.sin(a2)*r*0.14);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function makeCoinFaceTexture(kind){
    const size = 512;
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const ctx = c.getContext('2d');
    const cx = size/2, cy = size/2, r = size/2 - 8;

    const grad = ctx.createRadialGradient(cx,cy,10,cx,cy,r);
    grad.addColorStop(0,'#eecf8e');
    grad.addColorStop(0.6,'#cd9f4f');
    grad.addColorStop(1,'#93691f');
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2); ctx.fill();

    const beads = 56;
    for(let i=0;i<beads;i++){
      const a = (i/beads)*Math.PI*2;
      const bx = cx + Math.cos(a)*(r-14);
      const by = cy + Math.sin(a)*(r-14);
      ctx.beginPath(); ctx.arc(bx,by,3.2,0,Math.PI*2);
      ctx.fillStyle = 'rgba(60,40,10,0.55)';
      ctx.fill();
    }
    ctx.strokeStyle = 'rgba(60,40,10,0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(cx,cy,r-34,0,Math.PI*2); ctx.stroke();

    const ink = 'rgba(45,28,6,0.9)';

    if (kind === 'obverse'){
      drawEmblem(ctx, cx, cy+18, r*0.62, ink);
      drawArcText(ctx, 'ΑΓΟΡΑ · ΧΡΥΣΟΥ · ΧΑΛΑΝΔΡΙΟΥ', cx, cy, r-22, -Math.PI*0.86, true, ink, 23);
    } else {
      drawEmblem(ctx, cx, cy+18, r*0.62, ink);
      drawArcText(ctx, '24Κ · ΚΑΘΑΡΟ · ΧΡΥΣΑΦΙ', cx, cy, r-22, -Math.PI*0.86, true, ink, 23);
    }

    const tex = new THREE.CanvasTexture(c);
    tex.anisotropy = 4;
    return tex;
  }

  function makeReededEdgeTexture(){
    const w = 512, h = 64;
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const ctx = c.getContext('2d');
    const base = ctx.createLinearGradient(0,0,0,h);
    base.addColorStop(0,'#c99a44');
    base.addColorStop(0.5,'#a97e34');
    base.addColorStop(1,'#8a641f');
    ctx.fillStyle = base;
    ctx.fillRect(0,0,w,h);
    const grooves = 90;
    const gw = w/grooves;
    for (let i=0;i<grooves;i++){
      const x = i*gw;
      const g = ctx.createLinearGradient(x,0,x+gw,0);
      g.addColorStop(0,'rgba(255,235,180,0.55)');
      g.addColorStop(0.4,'rgba(255,235,180,0)');
      g.addColorStop(0.6,'rgba(60,40,10,0)');
      g.addColorStop(1,'rgba(60,40,10,0.5)');
      ctx.fillStyle = g;
      ctx.fillRect(x,0,gw,h);
    }
    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.repeat.set(6,1);
    tex.anisotropy = 4;
    return tex;
  }

  const faceTexFront = makeCoinFaceTexture('obverse');
  const faceTexBack = makeCoinFaceTexture('reverse');
  const edgeTex = makeReededEdgeTexture();

  const sideMat = new THREE.MeshStandardMaterial({ map:edgeTex, metalness:0.4, roughness:0.45, emissive:0x6b4a12, emissiveIntensity:0.45 });
  const topMat = new THREE.MeshStandardMaterial({ map:faceTexFront, metalness:0.45, roughness:0.4, emissive:0x3a2a0a, emissiveIntensity:0.2 });
  const bottomMat = new THREE.MeshStandardMaterial({ map:faceTexBack, metalness:0.45, roughness:0.4, emissive:0x3a2a0a, emissiveIntensity:0.2 });

  const coin = new THREE.Mesh(
    new THREE.CylinderGeometry(1.4,1.4,0.1,64,1),
    [sideMat, topMat, bottomMat]
  );
  coin.rotation.x = Math.PI/2;
  scene.add(coin);

  scene.add(new THREE.HemisphereLight(0xfff4d6, 0x4a3510, 1.4));
  scene.add(new THREE.AmbientLight(0xffffff,0.85));
  const k = new THREE.DirectionalLight(0xfff1c2,3.2); k.position.set(3,4,5); scene.add(k);
  const k2 = new THREE.DirectionalLight(0xffe9b0,1.6); k2.position.set(-3,-2,4); scene.add(k2);
  const p1 = new THREE.PointLight(0xffb347,4,15); p1.position.set(-4,2,2); scene.add(p1);
  const p2 = new THREE.PointLight(0xffd76a,3.5,15); p2.position.set(4,-3,2); scene.add(p2);

  let mx=0, my=0;
  addEventListener('mousemove', e => {
    mx = (e.clientX/innerWidth-0.5)*2;
    my = (e.clientY/innerHeight-0.5)*2;
  });
  (function tick(){
    coin.rotation.z += 0.012;
    coin.rotation.x += (Math.PI/2 + my*0.3 - coin.rotation.x)*0.05;
    coin.position.x += (mx*0.3 - coin.position.x)*0.05;
    renderer.render(scene,camera);
    requestAnimationFrame(tick);
  })();
  addEventListener('resize', () => {
    const W=canvas.clientWidth, H=canvas.clientHeight;
    camera.aspect = W/H; camera.updateProjectionMatrix();
    renderer.setSize(W,H,false);
  });
})();