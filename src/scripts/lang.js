// Remember the language the visitor picks so the automatic detection does not override it.
document.querySelectorAll('a[data-lang]').forEach((link) => {
  link.addEventListener('click', () => {
    try {
      localStorage.setItem('kc-lang', link.dataset.lang);
    } catch {
      // Private mode or blocked storage: the link still works for this visit.
    }
  });
});
