// Draws the braided gold threads as the page scrolls: the needle tips follow the viewport,
// the lines stay drawn behind them, and the tips throw off gold sparkles.
// Desktop only: on phones the threads stay static to avoid lag.
const root = document.querySelector('.threads');
const desktop = matchMedia('(min-width: 900px) and (hover: hover)').matches;
const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;

if (root && desktop && !calm) {
  const svg = root.querySelector('svg');
  const VIEW_H = svg.viewBox.baseVal.height;
  const SAMPLES = 600;
  const halos = root.querySelectorAll('.halo path');
  const tips = [...root.querySelectorAll('.tip')];

  // Lookup table per thread: length at each sample and the (monotonic) y reached so far.
  const threads = [...root.querySelectorAll('.draw')].map((path, i) => {
    const length = path.getTotalLength();
    const lens = new Float32Array(SAMPLES + 1);
    const ys = new Float32Array(SAMPLES + 1);
    let maxY = -Infinity;
    for (let k = 0; k <= SAMPLES; k++) {
      lens[k] = (k / SAMPLES) * length;
      maxY = Math.max(maxY, path.getPointAtLength(lens[k]).y);
      ys[k] = maxY;
    }
    return { path, halo: halos[i], tip: tips[i], length, lens, ys, drawn: 0, x: 0, y: 0 };
  });

  // Sparkles on a viewport-sized canvas.
  const canvas = root.querySelector('.sparks');
  const ctx = canvas.getContext('2d');
  const sparks = [];
  let dpr = 1;
  let looping = false;

  const resizeCanvas = () => {
    dpr = Math.min(2, devicePixelRatio || 1);
    canvas.width = innerWidth * dpr;
    canvas.height = innerHeight * dpr;
  };

  const emit = (count) => {
    const rect = svg.getBoundingClientRect();
    const sx = rect.width / svg.viewBox.baseVal.width;
    const sy = rect.height / VIEW_H;
    for (const t of threads) {
      if (t.drawn <= 0 || t.drawn >= 1) continue;
      const x = rect.left + t.x * sx;
      const y = rect.top + t.y * sy;
      if (y < -40 || y > innerHeight + 40) continue;
      for (let n = 0; n < count && sparks.length < 220; n++) {
        const a = Math.random() * Math.PI * 2;
        const v = 0.15 + Math.random() * 0.9;
        sparks.push({
          x, y,
          vx: Math.cos(a) * v,
          vy: Math.sin(a) * v - 0.25,
          life: 1,
          decay: 0.008 + Math.random() * 0.014,
          size: 0.6 + Math.random() * 1.8,
          tw: Math.random() * 6.28,
        });
      }
    }
    if (!looping && sparks.length) {
      looping = true;
      requestAnimationFrame(frame);
    }
  };

  const frame = () => {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    ctx.globalCompositeOperation = 'lighter';
    for (let i = sparks.length - 1; i >= 0; i--) {
      const p = sparks[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.985;
      p.vy = p.vy * 0.985 - 0.004;
      p.tw += 0.25;
      p.life -= p.decay;
      if (p.life <= 0) {
        sparks.splice(i, 1);
        continue;
      }
      const a = p.life * (0.55 + 0.45 * Math.sin(p.tw));
      ctx.fillStyle = `rgba(232,207,154,${(a * 0.18).toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = `rgba(255,244,214,${a.toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    if (sparks.length) requestAnimationFrame(frame);
    else looping = false;
  };

  let queued = false;
  let lastScroll = scrollY;

  const update = () => {
    queued = false;
    const rect = svg.getBoundingClientRect();
    // The tips sit a bit below the middle of the screen.
    const target = ((innerHeight * 0.62 - rect.top) / rect.height) * VIEW_H;
    for (const t of threads) {
      let lo = 0;
      let hi = SAMPLES;
      while (lo < hi) {
        const mid = (lo + hi) >> 1;
        if (t.ys[mid] < target) lo = mid + 1;
        else hi = mid;
      }
      // Lines stay drawn once revealed, like ink.
      const drawn = Math.max(t.drawn, lo / SAMPLES);
      if (drawn !== t.drawn) {
        t.drawn = drawn;
        const offset = String(1 - drawn);
        t.path.style.strokeDashoffset = offset;
        t.halo.style.strokeDashoffset = offset;
        const p = t.path.getPointAtLength(drawn * t.length);
        t.x = p.x;
        t.y = p.y;
        t.tip.setAttribute('transform', `translate(${p.x} ${p.y})`);
        t.tip.classList.toggle('on', drawn > 0 && drawn < 1);
      }
    }
    const moved = Math.abs(scrollY - lastScroll);
    lastScroll = scrollY;
    if (moved > 0) emit(Math.min(6, 1 + Math.round(moved / 25)));
  };

  const queue = () => {
    if (!queued) {
      queued = true;
      requestAnimationFrame(update);
    }
  };

  resizeCanvas();
  root.classList.add('live');
  addEventListener('scroll', queue, { passive: true });
  addEventListener('resize', () => {
    resizeCanvas();
    queue();
  });
  // A gentle idle shimmer so the tips feel alive even when the page is still.
  setInterval(() => emit(1), 260);
  update();
}
