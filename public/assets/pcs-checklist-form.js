/* A downloadable guide is useful even when the contact service is unavailable.
   Only an accepted contact submission is a lead; a failed request never is. */
(() => {
  const form = document.getElementById('lm-form');
  if (!form) return;
  const result = document.getElementById('lm-ok');
  const button = form.querySelector('button[type="submit"]');
  let submitting = false;
  const finish = accepted => {
    form.hidden = true;
    form.style.display = 'none';
    result.style.display = 'block';
    result.setAttribute('role', 'status');
    result.innerHTML = '<strong>Your checklist is ready.</strong> <a href="/downloads/pensacola-pcs-checklist.pdf" download>Download the PDF now</a>.' + (accepted ? ' Your request was received. Gregg may follow up about your move.' : ' Your contact request could not be delivered. You can still download the guide or call (850) 266-5005.');
    if (accepted) {
      try { localStorage.setItem('pmh-inquiry-submitted', '1'); } catch {}
      window.gtag?.('event', 'generate_lead', {form_id: 'lm-form'});
      document.dispatchEvent(new CustomEvent('costin:lead-success', {detail: {form_id: 'lm-form'}}));
    }
    result.querySelector('a').addEventListener('click', () => window.gtag?.('event', 'file_download', {file_name: 'pensacola-pcs-checklist.pdf'}), {once: true});
  };
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (submitting || !form.reportValidity()) return;
    const fields = new FormData(form);
    if (fields.get('website')) return;
    submitting = true;
    button.disabled = true;
    button.textContent = 'Preparing your guide...';
    const data = {
      name: String(fields.get('name') || '').trim(),
      email: String(fields.get('email') || '').trim(),
      phone: '', inquiryType: 'General Question',
      message: 'Requested the free Pensacola PCS checklist. May follow up about relocation planning.',
      _gotcha: '', page_path: location.pathname, sourceUrl: location.href
    };
    try {
      const attribution = JSON.parse(localStorage.getItem('costin_attr') || '{}');
      for (const key of ['utm_source','utm_medium','utm_campaign','utm_content','utm_term','landing_page','referrer','first_seen']) {
        if (typeof attribution[key] === 'string') data[key] = attribution[key];
      }
    } catch {}
    try {
      const response = await fetch('https://costin-contact.gregg-costin.workers.dev', {
        method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(data), signal: AbortSignal.timeout(15000)
      });
      const body = await response.json();
      finish(response.ok && body.success === true);
    } catch { finish(false); }
  });
})();
