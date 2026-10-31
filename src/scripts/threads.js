// Draws the braided gold threads as the page scrolls. The needle tips and their sparkles
// are painted on a viewport canvas at the exact point where each line ends, so line and
// tip stay together. When a thread is complete its tip stays lit at the resting point.
// Desktop only: on phones the threads stay static to avoid lag.
const root = document.querySelector('.threads');
const desktop = matchMedia('(min-width: 900px) and (hover: hover)').matches;
const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;

if (root && desktop && !calm) {
  const svg = root.querySelector('svg');
  const hero = document.querySelector('.hero');
  const view = svg.viewBox.baseVal;
  const SAMPLES = 700;

  // Per thread: real length plus a lookup of length -> highest y reached so far.
  const threads = [...root.querySelectorAll('.draw')].map((path, i) => {
    const length = path.getTotalLength();
    const ys = new Float32Array(SAMPLES + 1);
    let maxY = -Infinity;
    for (let k = 0; k <= SAMPLES; k++) {
      maxY = Math.max(maxY, path.getPointAtLength((k / SAMPLES) * length).y);
      ys[k] = maxY;
    }
    // The core line and its glow layers; dashes in real user units so the visible end matches getPointAtLength.
    const parts = [...root.querySelectorAll(`.ink-part[data-i="${i}"]`)];
    for (const p of parts) {
      p.style.strokeDasharray = `${length} ${length}`;
      p.style.strokeDashoffset = String(length);
    }
    return { path, parts, length, ys, drawn: 0, x: 0, y: 0, phase: i * 2.1 };
  });

  const canvas = root.querySelector('.sparks');
  const ctx = canvas.getContext('2d');
  const sparks = [];
  let dpr = 1;
  let rect = svg.getBoundingClientRect();
  let running = false;

  const resize = () => {
    dpr = Math.min(2, devicePixelRatio || 1);
    canvas.width = innerWidth * dpr;
    canvas.height = innerHeight * dpr;
  };

  const screenPoint = (t) => [
    rect.left + (t.x / view.width) * rect.width,
    rect.top + (t.y / view.height) * rect.height,
  ];

  const visible = (t) => {
    if (t.drawn <= 0) return false;
    const [, y] = screenPoint(t);
    return y > -60 && y < innerHeight + 60;
  };

  const emit = (t, count) => {
    const [x, y] = screenPoint(t);
    for (let n = 0; n < count && sparks.length < 160; n++) {
      const a = Math.random() * Math.PI * 2;
      const v = 0.1 + Math.random() * 0.7;
      sparks.push({
        x, y,
        vx: Math.cos(a) * v,
        vy: Math.sin(a) * v - 0.2,
        life: 1,
        decay: 0.01 + Math.random() * 0.016,
        size: 0.5 + Math.random() * 1.3,
        tw: Math.random() * 6.28,
        star: Math.random() < 0.3,
      });
    }
  };

  const drawTip = (t, time) => {
    const [x, y] = screenPoint(t);
    const pulse = 0.75 + 0.25 * Math.sin(time / 420 + t.phase);
    const r = 16 * pulse;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, 'rgba(255,244,214,0.9)');
    g.addColorStop(0.25, 'rgba(242,221,168,0.35)');
    g.addColorStop(1, 'rgba(201,164,106,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,248,230,1)';
    ctx.beginPath();
    ctx.arc(x, y, 1.8, 0, Math.PI * 2);
    ctx.fill();
  };

  const frame = (time) => {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    ctx.globalCompositeOperation = 'lighter';
    let anyTip = false;
    for (const t of threads) {
      if (!visible(t)) continue;
      anyTip = true;
      drawTip(t, time);
      if (Math.random() < 0.12) emit(t, 1);
    }
    for (let i = sparks.length - 1; i >= 0; i--) {
      const p = sparks[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.98;
      p.vy = p.vy * 0.98 - 0.003;
      p.tw += 0.22;
      p.life -= p.decay;
      if (p.life <= 0) {
        sparks.splice(i, 1);
        continue;
      }
      const a = p.life * (0.5 + 0.5 * Math.sin(p.tw));
      ctx.strokeStyle = ctx.fillStyle = `rgba(255,240,205,${a.toFixed(3)})`;
      if (p.star) {
        const s = p.size * 3;
        ctx.lineWidth = 0.7;
        ctx.beginPath();
        ctx.moveTo(p.x - s, p.y);
        ctx.lineTo(p.x + s, p.y);
        ctx.moveTo(p.x, p.y - s);
        ctx.lineTo(p.x, p.y + s);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    if (anyTip || sparks.length) requestAnimationFrame(frame);
    else running = false;
  };

  const start = () => {
    if (!running) {
      running = true;
      requestAnimationFrame(frame);
    }
  };

  let queued = false;
  let lastScroll = scrollY;

  const update = () => {
    queued = false;
    rect = svg.getBoundingClientRect();
    // The tips ride a bit below the middle of the screen, sliding to the bottom edge over the
    // last screen of scrolling so the threads can finish in the footer.
    const left = document.documentElement.scrollHeight - innerHeight - scrollY;
    const line = 0.62 + 0.38 * Math.min(1, Math.max(0, 1 - left / innerHeight));
    // Never less than a stretch below the hero, so the space under it is not empty on load.
    const heroBottom = hero ? hero.getBoundingClientRect().bottom : 0;
    const floor = heroBottom + Math.max(140, (innerHeight - heroBottom) * 0.75);
    const target = ((Math.max(innerHeight * line, floor) - rect.top) / rect.height) * view.height;
    const moved = Math.abs(scrollY - lastScroll);
    lastScroll = scrollY;
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
        const offset = String(t.length * (1 - drawn));
        for (const p of t.parts) p.style.strokeDashoffset = offset;
        const p = t.path.getPointAtLength(drawn * t.length);
        t.x = p.x;
        t.y = p.y;
      }
      if (moved > 0 && t.drawn < 1 && visible(t)) emit(t, Math.min(4, 1 + Math.round(moved / 40)));
    }
    start();
  };

  const queue = () => {
    if (!queued) {
      queued = true;
      requestAnimationFrame(update);
    }
  };

  resize();
  root.classList.add('live');
  addEventListener('scroll', queue, { passive: true });
  addEventListener('resize', () => {
    resize();
    queue();
  });
  update();
}
