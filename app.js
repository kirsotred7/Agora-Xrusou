document.getElementById('yr').textContent = new Date().getFullYear();
const heroBg = document.getElementById('heroBg');
addEventListener('scroll', () => {
  heroBg.style.transform = `translate3d(0,${scrollY*0.35}px,0) scale(1.1)`;
}, { passive: true });
const io = new IntersectionObserver((es) => es.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add('revealed'); io.unobserve(e.target); }
}), { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

function formatEUR(n){
  return new Intl.NumberFormat('el-GR', { style:'currency', currency:'EUR', maximumFractionDigits:0 }).format(n);
}

async function updateLivePrices(){
  try {
    const res = await fetch('https://xaus.com/api/v1/spot?currency=EUR&unit=kg');
    const data = await res.json();

    const goldMarketPerKg = data.xau.price;
    const silverMarketPerKg = (data.silver_usd_oz / (31.1034768/1000)) * data.fx_rate;

    document.getElementById('goldPrice').textContent = formatEUR(goldMarketPerKg) + ' / κιλό';
    document.getElementById('silverPrice').textContent = formatEUR(silverMarketPerKg) + ' / κιλό';
  } catch (err) {
    document.getElementById('goldPrice').textContent = 'Μη διαθέσιμη';
    document.getElementById('silverPrice').textContent = 'Μη διαθέσιμη';
  }
}

updateLivePrices();
setInterval(updateLivePrices, 60000);
