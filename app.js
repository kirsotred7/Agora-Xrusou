document.getElementById('yr').textContent = new Date().getFullYear();
const heroBg = document.getElementById('heroBg');
addEventListener('scroll', () => {
  heroBg.style.transform = `translate3d(0,${scrollY*0.35}px,0) scale(1.1)`;
}, { passive: true });
const io = new IntersectionObserver((es) => es.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add('revealed'); io.unobserve(e.target); }
}), { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));