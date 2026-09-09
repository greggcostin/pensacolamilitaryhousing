// The published React bundle predates the shared photography footer. Keep the
// link present after React mounts, while retaining the no-JS shell's link.
(() => {
  const root = document.getElementById('root');
  if (!root) return;
  function sync() {
    const footer = root.querySelector('footer');
    if (!footer) return;
    if (!footer.querySelector('a[href="/photo-credits"]')) {
      const p = document.createElement('p');
      p.setAttribute('data-pagefind-ignore', '');
      p.className = 'gc-photo-credit-link';
      p.style.cssText = 'font-size:12px;line-height:1.6;text-align:center;margin:18px auto 0;color:#C3C8D1';
      const a = document.createElement('a');
      a.href = '/photo-credits';
      a.textContent = 'Photography credits';
      a.setAttribute('data-photography-credits', '');
      a.style.cssText = 'color:inherit;text-decoration:underline;text-underline-offset:3px';
      p.appendChild(a);
      footer.appendChild(p);
    }
    const fallback = document.querySelector('[data-photo-fallback]');
    if (fallback) fallback.hidden = true;
  }
  sync();
  new MutationObserver(sync).observe(root, {childList:true,subtree:true});
})();
