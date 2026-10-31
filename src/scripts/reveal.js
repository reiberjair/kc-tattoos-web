// 1. Karla's entrance follows the scroll: the backlight swells first, then she fades up in front of it.
// 2. Section text rises in once, and gold titles light up with a glint when they appear.
const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
const story = document.querySelector('.story');

if (story) {
  const arch = story.querySelector('.arch');
  const floor = story.querySelector('.story-floor');
  const img = story.querySelector('.portrait img');
  const photo = story.querySelector('.story-photo');
  const firstPanel = story.querySelector('.panel');
  const phone = matchMedia('(max-width: 900px)');
  const clamp = (v) => Math.min(1, Math.max(0, v));
  const ease = (v) => 1 - Math.pow(1 - v, 3);
  let queued = false;

  const update = () => {
    queued = false;
    // Starts with the first scroll, finishes after about 420px.
    const p = calm ? 1 : clamp(scrollY / 420);
    const a = ease(clamp(p / 0.55));
    const k = ease(clamp((p - 0.25) / 0.75));
    arch.style.opacity = String(a);
    arch.style.transform = `translateX(-50%) scale(${0.6 + 0.4 * a})`;
    floor.style.transform = `scaleX(${a})`;
    img.style.opacity = String(k);
    img.style.transform = `translateY(${(1 - k) * 110}px) scale(${0.92 + 0.08 * k})`;
    if (p > 0.45) story.classList.add('in');
    // Phones: Karla stays fixed only while her quote passes under her, then scrolls away
    // so the rest of the text gets the whole screen.
    if (phone.matches) {
      const hold = firstPanel.offsetHeight * 0.9;
      const out = Math.max(0, Math.min(photo.offsetHeight, scrollY - story.offsetTop - hold));
      photo.style.transform = out ? `translateY(${-out}px)` : '';
    } else {
      photo.style.transform = '';
    }
  };

  addEventListener('scroll', () => {
    if (!queued) {
      queued = true;
      requestAnimationFrame(update);
    }
  }, { passive: true });
  update();
}

const risers = document.querySelectorAll(
  '.js :is(.story,.obra,.esp,.proc,.contact,.faq) :is(h2,.eyebrow,.quote,.role,.sign,.panel>p,.facts li,.frame2,.steps>div,.esp li,figcaption,details,.lead,.chan li,form), .js .trust>div',
);
const golds = document.querySelectorAll('.gold:not(.ink-text)');

// Checked on scroll (not IntersectionObserver) so text can never stay hidden after a big jump.
let pending = [...new Set([...risers, ...golds])];
let checking = false;

const reveal = () => {
  checking = false;
  const line = innerHeight * 0.88;
  pending = pending.filter((el) => {
    if (el.getBoundingClientRect().top > line) return true;
    el.classList.add('seen');
    if (el.classList.contains('gold')) el.classList.add('lit');
    return false;
  });
  if (!pending.length) removeEventListener('scroll', queueReveal);
};

function queueReveal() {
  if (!checking) {
    checking = true;
    requestAnimationFrame(reveal);
  }
}

addEventListener('scroll', queueReveal, { passive: true });
addEventListener('resize', queueReveal);
reveal();
