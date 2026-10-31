// Draws the gold threads as the page scrolls, with a glowing needle tip at the head.
// Desktop only: on phones the threads stay static to avoid lag.
const root = document.querySelector('.threads');
const desktop = matchMedia('(min-width: 900px) and (hover: hover)').matches;
const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;

if (root && desktop && !calm) {
  const lines = [...root.querySelectorAll('.draw')].map((path) => ({
    path,
    length: path.getTotalLength(),
    speed: Number(path.dataset.speed) || 1,
  }));
  const tips = root.querySelectorAll('.tip');
  let queued = false;

  const update = () => {
    queued = false;
    const max = document.documentElement.scrollHeight - innerHeight;
    const progress = max > 0 ? Math.min(1, scrollY / max) : 0;
    lines.forEach(({ path, length, speed }, i) => {
      const drawn = Math.min(1, 0.03 + progress * speed);
      path.style.strokeDashoffset = String(1 - drawn);
      if (i === 0) {
        const point = path.getPointAtLength(drawn * length);
        tips.forEach((tip) => {
          tip.setAttribute('cx', point.x);
          tip.setAttribute('cy', point.y);
        });
      }
    });
  };

  const queue = () => {
    if (!queued) {
      queued = true;
      requestAnimationFrame(update);
    }
  };

  root.classList.add('live');
  addEventListener('scroll', queue, { passive: true });
  addEventListener('resize', queue);
  update();
}
