/* Progressive enhancement: the guides, links and forms remain in the HTML. */
(() => {
  'use strict';
  const track = (event, detail = {}) => {
    if (typeof window.gtag === 'function') window.gtag('event', event, { ...detail, site_brand: 'civilian', page_path: location.pathname });
  };
  document.querySelectorAll('.banner-tabs a').forEach(a => {
    if (a.getAttribute('href') === location.pathname.replace(/\/$/, '') || (location.pathname === '/' && a.getAttribute('href') === '/')) a.setAttribute('aria-current', 'page');
  });
  document.querySelectorAll('.gc-toc').forEach(contents => contents.addEventListener('toggle', () => {
    if (contents.open) track('guide_contents_open');
  }));
  const plans = {
    buy: { title: 'Find the home. Understand the whole picture.', text: 'Compare neighborhoods, explore homes, and account for insurance, taxes, and closing costs before you make an offer.', links: [['Explore homes','/search'],['Read the buyer guide','/buy']], inquiry: 'General Question', message: 'I would like help buying a home on the Gulf Coast.' },
    sell: { title: 'A thoughtful strategy for your next move.', text: 'Start with comparable sales and your timeline. Then build a pricing, preparation, and marketing plan around your property.', links: [['See our selling approach','/sell'],['Explore home values','https://greggcostin.realscout.com/whats-my-home-worth']], inquiry: 'Selling My Home', message: 'I would like a pricing and marketing plan for my home.' },
    relocate: { title: 'Get to know the coast before you arrive.', text: 'Explore the practical differences between Florida and Alabama. For a military move, our dedicated PCS guides bring base access, BAH, and VA financing into the picture.', links: [['Compare neighborhoods','/neighborhoods'],['Open the PCS guide','https://pensacolamilitaryhousing.com/pcs-guide']], inquiry: 'General Question', message: 'I am relocating and would like help comparing Gulf Coast communities.' },
    invest: { title: 'Look beyond the view to the carrying costs.', text: 'Start with the property, its rules, and its expenses. Review insurance, association costs, rental restrictions, and your intended use with a local team.', links: [['Explore coastal Alabama','/gulf-shores-orange-beach'],['Explore Perdido Key','/neighborhoods/perdido-key']], inquiry: 'Investment Property', message: 'I would like help evaluating a Gulf Coast investment property.' }
  };
  document.querySelectorAll('[data-plan]').forEach(a => a.addEventListener('click', event => {
    const plan = plans[a.dataset.plan], result = document.querySelector('[data-plan-result]');
    if (!plan || !result) return;
    event.preventDefault();
    document.querySelectorAll('[data-plan]').forEach(link => link.setAttribute('aria-current', String(link === a)));
    result.querySelector('h3').textContent = plan.title;
    result.querySelector('p').textContent = plan.text;
    result.querySelectorAll('[data-plan-link]').forEach((link, i) => { link.textContent = plan.links[i][0] + ' ↗'; link.href = plan.links[i][1]; });
    const ask = result.querySelector('[data-inquiry-open]');
    ask.dataset.inquiryType = plan.inquiry;
    ask.dataset.inquiryMessage = plan.message;
    track('journey_select', { journey: a.dataset.plan });
  }));
  document.addEventListener('click', event => {
    const button = event.target.closest('[data-inquiry-message]');
    if (button) {
      const message = document.querySelector('#inquiry-form [name=message]');
      if (message && (!message.value || message.dataset.prefilled === message.value)) {
        message.value = button.dataset.inquiryMessage;
        message.dataset.prefilled = message.value;
      }
    }
    const link = event.target.closest('[data-guide-link]');
    if (link) track('guide_select', { guide: link.dataset.guideLink });
    const section = event.target.closest('.gc-toc a[href^="#"]');
    if (section) track('guide_section_select', { section_id: section.getAttribute('href').slice(1) });
  }, true);
  // Catch invalid email and missing fields before the legacy worker handlers run.
  document.querySelectorAll('form[id^="inquiry-form"]').forEach(form => {
    for (const [name, autocomplete] of [['name','name'],['email','email'],['phone','tel']]) form.querySelector(`[name="${name}"]`)?.setAttribute('autocomplete', autocomplete);
    form.addEventListener('submit', event => {
      if (!form.checkValidity()) { event.preventDefault(); event.stopImmediatePropagation(); form.reportValidity(); }
    }, true);
    let started = false;
    form.addEventListener('input', () => { if (!started) { started = true; track('inquiry_start', { form_id: form.id }); } });
  });
  document.addEventListener('costin:lead-success', event => {
    const formId = ['inquiry-form','inquiry-form-c'].includes(event.detail?.form_id) ? event.detail.form_id : 'inquiry-form';
    track('generate_lead', { form_id: formId, lead_method: 'website_form' });
    window.costinMeta?.track('Lead');
  });
  // Keep keyboard focus in the open inquiry dialog, and restore the opener on close.
  const overlay = document.getElementById('inquiry-modal');
  if (overlay) {
    let opener, wasOpen = false, backgrounds = [];
    document.addEventListener('click', event => { const trigger = event.target.closest('[data-inquiry-open]'); if (trigger) opener = trigger; }, true);
    const sync = () => {
      const open = overlay.classList.contains('open');
      if (open === wasOpen) return;
      wasOpen = open;
      document.body.classList.toggle('gc-dialog-open', open);
      if (open) {
        backgrounds = [...document.body.children].filter(el => el !== overlay && !['SCRIPT','STYLE'].includes(el.tagName)).map(el => [el, el.inert]);
        backgrounds.forEach(([el]) => { el.inert = true; });
      } else {
        backgrounds.forEach(([el, previous]) => { el.inert = previous; });
        backgrounds = [];
        if (opener?.isConnected) opener.focus();
      }
    };
    new MutationObserver(sync).observe(overlay, { attributes: true, attributeFilter: ['class'] });
    document.addEventListener('keydown', event => {
      if (!overlay.classList.contains('open') || event.key !== 'Tab') return;
      const focusable = [...overlay.querySelectorAll('button,input,select,textarea,a[href],[tabindex="0"]')].filter(el => !el.disabled && el.tabIndex >= 0 && el.getClientRects().length);
      const first = focusable[0], last = focusable.at(-1);
      if (event.shiftKey && (document.activeElement === first || !overlay.contains(document.activeElement))) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }, true);
  }
  document.querySelectorAll('[id^="inquiry-body"]').forEach(body => new MutationObserver(() => {
    if (body.querySelector('form')) return;
    const status = body.firstElementChild;
    if (status) { status.setAttribute('role','status'); status.tabIndex = -1; status.focus(); }
  }).observe(body, { childList: true }));
})();
