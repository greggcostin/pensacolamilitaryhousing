(() => {
  const dialog = document.getElementById('gc-site-search');
  const links = document.querySelectorAll('[data-gc-site-search]');
  if (!dialog || !links.length || !dialog.showModal) return;
  const status = dialog.querySelector('[role="status"]');
  let ready;
  function loadSearch() {
    if (ready) return ready;
    ready = new Promise((resolve, reject) => {
      const css = document.createElement('link');
      css.rel = 'stylesheet'; css.href = '/pagefind/pagefind-ui.css';
      document.head.append(css);
      const script = document.createElement('script');
      script.src = '/pagefind/pagefind-ui.js';
      script.onload = () => {
        try {
          new PagefindUI({ element: '#gc-search-results', showSubResults: true, showImages: false, pageSize: 6 });
          resolve();
        } catch (error) { reject(error); }
      };
      script.onerror = reject;
      document.head.append(script);
    });
    return ready;
  }
  links.forEach(link => link.addEventListener('click', async event => {
    event.preventDefault();
    dialog.showModal();
    document.documentElement.classList.add('gc-search-open');
    try {
      await loadSearch();
      status.hidden = true;
      if (dialog.open) dialog.querySelector('input')?.focus();
    } catch {
      status.textContent = 'Search is temporarily unavailable. You can still browse the resource library below.';
    }
  }));
  dialog.querySelector('[data-gc-search-close]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => document.documentElement.classList.remove('gc-search-open'));
  dialog.addEventListener('click', event => {
    const bounds = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) dialog.close();
  });
})();
