// Shared by the rollout and both military factories so new pages retain measurement.
export const META_SETTINGS = '<p><button type="button" data-meta-settings>Facebook &amp; Instagram ad preferences</button></p>';

export function applyMilitaryMeta(html) {
  if (!html.includes('src="/assets/costin-meta.js"')) {
    html = html.replace('</head>', '<link rel="stylesheet" href="/assets/costin-meta.css">\n<script defer src="/assets/costin-meta-config.js"></script>\n<script defer src="/assets/costin-meta.js"></script>\n</head>');
  }
  if (!html.includes('data-meta-settings')) {
    if (html.includes('</footer>')) html = html.replace('</footer>', META_SETTINGS + '\n</footer>');
    else if (html.includes('data-costin-sites')) html = html.replace(/(<p data-costin-sites>[\s\S]*?<\/p>)/, '$1\n' + META_SETTINGS);
    else html = html.replace('</body>', '<footer>' + META_SETTINGS + '</footer>\n</body>');
  }
  html = html.replace(/data-meta-settings hidden/g, 'data-meta-settings');
  // The contact worker must explicitly accept the inquiry before it counts as a lead.
  html = html.replace(/if\(res\.ok&&res\.j\.success(?:===true)?\)\{(?:document\.dispatchEvent\(new CustomEvent\('costin:lead-success',\{detail:\{form_id:form.id\}\}\)\);)?/g,
    "if(res.ok&&res.j.success===true){document.dispatchEvent(new CustomEvent('costin:lead-success',{detail:{form_id:form.id}}));");
  html = html.replace(/e.preventDefault\(\);errBox.style.display='none';(?!if\(!form.reportValidity)/g,
    "e.preventDefault();errBox.style.display='none';if(!form.reportValidity())return;");
  html = html.replace(/(?:if\(data\._gotcha\)return;\r?\n)?if\(!data.name\|\|!data.email/g,
    match => match.startsWith('if(data._gotcha)') ? match : 'if(data._gotcha)return;\n' + match);
  return html;
}
