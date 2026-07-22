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
  const coin = new THREE.Mesh(
    new THREE.CylinderGeometry(1.4,1.4,0.18,64,1),
    new THREE.MeshStandardMaterial({ color:0xf4c430, metalness:1, roughness:0.22, emissive:0x3a2a05, emissiveIntensity:0.4 })
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
    coin.rotation.z += 0.008;
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