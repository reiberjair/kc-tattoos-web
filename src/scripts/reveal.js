// Plays the portrait entrance once the Karla section comes into view.
const story = document.querySelector('.story');

if (story) {
  const observer = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        story.classList.add('in');
        observer.disconnect();
      }
    },
    // The section is several screens tall, so trigger on its top edge reaching 70% of the screen.
    { rootMargin: '0px 0px -30% 0px' },
  );
  observer.observe(story);
}
