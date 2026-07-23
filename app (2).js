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

  // Draw an engraved "lira" face onto a canvas, used as a texture on the coin
  function makeCoinFaceTexture(label){
    const size = 512;
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const ctx = c.getContext('2d');
    const cx = size/2, cy = size/2, r = size/2 - 8;

    const grad = ctx.createRadialGradient(cx,cy,10,cx,cy,r);
    grad.addColorStop(0,'#f7e2a0');
    grad.addColorStop(0.6,'#e0b45c');
    grad.addColorStop(1,'#a9782f');
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2); ctx.fill();

    // outer beaded rim
    ctx.strokeStyle = 'rgba(60,40,10,0.6)';
    ctx.lineWidth = 6;
    ctx.beginPath(); ctx.arc(cx,cy,r-10,0,Math.PI*2); ctx.stroke();
    const beads = 48;
    for(let i=0;i<beads;i++){
      const a = (i/beads)*Math.PI*2;
      const bx = cx + Math.cos(a)*(r-22);
      const by = cy + Math.sin(a)*(r-22);
      ctx.beginPath(); ctx.arc(bx,by,4,0,Math.PI*2);
      ctx.fillStyle = 'rgba(60,40,10,0.55)';
      ctx.fill();
    }

    // inner circle
    ctx.strokeStyle = 'rgba(60,40,10,0.45)';
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(cx,cy,r-70,0,Math.PI*2); ctx.stroke();

    // center star emblem
    ctx.fillStyle = 'rgba(60,40,10,0.75)';
    ctx.save();
    ctx.translate(cx, cy - 30);
    ctx.beginPath();
    for(let i=0;i<5;i++){
      const a = (Math.PI*2/5)*i - Math.PI/2;
      const a2 = a + Math.PI/5;
      ctx.lineTo(Math.cos(a)*46, Math.sin(a)*46);
      ctx.lineTo(Math.cos(a2)*18, Math.sin(a2)*18);
    }
    ctx.closePath(); ctx.fill();
    ctx.restore();

    // text label (e.g. LIRA)
    ctx.fillStyle = 'rgba(60,40,10,0.85)';
    ctx.font = '700 46px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.save();
    ctx.translate(cx, cy + 60);
    ctx.fillText(label, 0, 0);
    ctx.restore();

    ctx.font = '600 20px Georgia, serif';
    ctx.fillStyle = 'rgba(60,40,10,0.65)';
    ctx.fillText('24K', cx, cy + 100);

    const tex = new THREE.CanvasTexture(c);
    tex.anisotropy = 4;
    return tex;
  }

  const faceTexFront = makeCoinFaceTexture('ΛΙΡΑ');
  const faceTexBack = makeCoinFaceTexture('AU');

  const sideMat = new THREE.MeshStandardMaterial({ color:0xd9a63f, metalness:1, roughness:0.28, emissive:0x3a2a05, emissiveIntensity:0.3 });
  const topMat = new THREE.MeshStandardMaterial({ map:faceTexFront, metalness:0.9, roughness:0.32, emissive:0x2a1d05, emissiveIntensity:0.15 });
  const bottomMat = new THREE.MeshStandardMaterial({ map:faceTexBack, metalness:0.9, roughness:0.32, emissive:0x2a1d05, emissiveIntensity:0.15 });

  const coin = new THREE.Mesh(
    new THREE.CylinderGeometry(1.4,1.4,0.18,64,1),
    [sideMat, topMat, bottomMat]
  );
  coin.rotation.x = Math.PI/2;
  scene.add(coin);
  const rimMat = new THREE.MeshStandardMaterial({ color:0xffd76a, metalness:1, roughness:0.15 });
  const rimGeo = new THREE.TorusGeometry(1.35,0.04,16,100);
  [0,-0.09,0.09].forEach(y => { const r = new THREE.Mesh(rimGeo,rimMat); r.position.y=y; coin.add(r); });
  scene.add(new THREE.AmbientLight(0xffffff,0.35));
  const k = new THREE.DirectionalLight(0xfff1c2,2.2); k.position.set(3,4,5); scene.add(k);
  const p1 = new THREE.PointLight(0xffb347,3,15); p1.position.set(-4,2,2); scene.add(p1);
  const p2 = new THREE.PointLight(0xffd76a,2.5,15); p2.position.set(4,-3,2); scene.add(p2);
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