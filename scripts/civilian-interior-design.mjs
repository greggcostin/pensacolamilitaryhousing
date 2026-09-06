// Static, content-preserving presentation for every civilian page family.
// Original paragraphs, tables, headings, links, forms and scripts stay in the HTML.
import { readFileSync, existsSync } from 'node:fs';
import { getInteriorDesign } from './civilian-interior-design-data.mjs';
import { withBlogCardImages } from './civilian-blog-card-images.mjs';

const esc = value => String(value).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;');
const strip = html => html.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
const voidTags = new Set(['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr']);

// Locate complete top-level HTML blocks without reserializing any original markup.
export function topLevelBlocks(html) {
  const tokens = /<!--[\s\S]*?-->|<(script|style|textarea)\b[^>]*>[\s\S]*?<\/\1\s*>|<\/?[a-z][^>]*>/gi;
  let depth = 0, start = 0, tag = '', out = [];
  for (const match of html.matchAll(tokens)) {
    const token = match[0];
    if (token.startsWith('<!--')) continue;
    const name = token.match(/^<\/?([\w-]+)/)?.[1].toLowerCase();
    const closing = token.startsWith('</');
    const whole = !!match[1] || voidTags.has(name) || /\/>$/.test(token);
    if (!depth && !closing) { start = match.index; tag = name; }
    if (!whole) depth += closing ? -1 : 1;
    if (depth < 0) throw new Error('Unbalanced top-level HTML: ' + name);
    if (!depth) out.push({start,end:match.index+token.length,tag,html:html.slice(start,match.index+token.length)});
  }
  if (depth) throw new Error('Unclosed top-level HTML');
  return out;
}

function withClass(html, name) {
  return html.replace(/^<(\w+)\b([^>]*)>/, (tag, type, attrs) => /\bclass="/.test(attrs) ? tag.replace('class="','class="'+name+' ') : `<${type} class="${name}"${attrs}>`);
}

function photo(src, config = {}) {
  const name = src.replace(/^\/images\//,'').replace(/\.jpg$/,'');
  const ledger = JSON.parse(readFileSync(new URL('../content/blog/image-credits.json',import.meta.url),'utf8')).images;
  const entry = ledger['civilian-site/images/'+name+'.jpg'];
  if (!entry) throw new Error('No source record for interior photo: '+src);
  const dimensions = [config.photoWidth || 1600, config.photoHeight || (name === 'gregg-navy-no-tie' ? 2182 : 1067)];
  const alt = config.photoAlt || (name === 'gregg-navy-no-tie' ? 'Gregg Costin, Realtor licensed in Florida and Alabama' : entry.title);
  const credit = entry.creditRequired ? `<figcaption>Photo: <a href="${esc(entry.pageUrl)}" target="_blank" rel="noopener">${esc(entry.credit)}</a>, ${esc(entry.license)}.</figcaption>` : '';
  return `<figure class="gc-interior-feature"><picture><img src="${esc(src)}" width="${dimensions[0]}" height="${dimensions[1]}" alt="${esc(alt)}" loading="eager" decoding="async"></picture>${credit}</figure>`;
}

function withAtmosphere(html, config) {
  if (['school','information'].includes(config.family)) return html;
  let scene = '/images/navarre-768.avif';
  if (['area','article'].includes(config.family)) {
    const src = html.match(/<div class="gc-interior-hero-media">[\s\S]*?<img[^>]*src="([^"]+)"/)?.[1];
    if (!src || !src.startsWith('/images/')) return html;
    const variant = src.replace(/\.(?:jpe?g|png)$/, '-768.avif');
    if (!existsSync('civilian-site' + variant)) return html;
    scene = variant;
  }
  return html.replace(/<body([^>]*)>/, (_, attrs) => {
    const value = `--gc-interior-scene:url('${scene}')`;
    if (/\bstyle="/.test(attrs)) attrs=attrs.replace(/style="([^"]*)"/, (_,style)=>`style="${[...style.split(';').filter(s=>s.trim()&&!s.trim().startsWith('--gc-interior-scene:')),value].join(';')}"`);
    else attrs += ` style="${value}"`;
    return `<body${attrs}>`;
  });
}

const action = (item, primary = false) => item?.href ? `<a class="gc-interior-action${primary?' gc-interior-action--primary':''}" href="${esc(item.href)}">${esc(item.label)} <span aria-hidden="true">↗</span></a>` : '';

function supportCard(config, noPortrait = false) {
  const s = config.support;
  if (!s) return '';
  return `<div class="gc-support-card">${noPortrait?'':`<div class="gc-support-person"><picture><img src="/images/gregg-navy-no-tie.jpg" width="1600" height="2182" loading="lazy" decoding="async" alt="Gregg Costin"></picture><div><strong>Gregg Costin</strong><span>Florida &amp; Alabama Realtor</span></div></div>`}<span class="gc-interior-kicker">A local perspective</span><h2>${esc(s.title)}</h2><p>${esc(s.text)}</p>${action({href:s.href,label:s.label},true)}<a class="gc-support-phone" href="tel:+18502665005">(850) 266-5005</a></div>`;
}

function sectionsFrom(html, path) {
  const blocks = topLevelBlocks(html);
  const headings = blocks.filter(block=>block.tag==='h2');
  let intro = headings.length ? html.slice(0,headings[0].start) : html;
  const sections = headings.map((h,i) => {
    let content = html.slice(h.start,headings[i+1]?.start ?? html.length);
    const title = strip(h.html);
    let classes = 'gc-story-section';
    if (/Frequently asked|questions|Common questions/i.test(title)) classes += ' gc-story-section--faq';
    if (/step.by.step|buying process/i.test(title)) classes += ' gc-story-section--steps';
    if (/buyer representation|marketed|credentials/i.test(title)) classes += ' gc-story-section--benefits';
    if (/inquiry-form-c/.test(content)) classes += ' gc-story-section--form';
    if (/id="inquiry-form-c"/.test(content)) content = content.replace(/(<div[^>]*>)(\s*<form\b)/,(_,opening,form)=>withClass(opening,'gc-contact-form-panel')+form);
    if (path==='/team' && /^(Rachel Ley|Nichole Sims)/.test(title)) {
      classes += ' gc-story-section--person';
      const portrait = topLevelBlocks(content).find(b=>b.tag==='div' && /<img/.test(b.html));
      if (portrait) content = content.slice(0,portrait.start)+withClass(portrait.html,'gc-story-portrait')+content.slice(portrait.end);
    }
    return `<section class="${classes}">\n${content}\n</section>`;
  }).join('\n');
  return `${strip(intro)?'<div class="gc-page-intro">'+intro+'</div>':intro}${sections}`;
}

export function withInteriorDesign(html, requestedPath) {
  const path = requestedPath || html.match(/rel="canonical" href="https:\/\/greggcostin\.com([^"?]*)"/)?.[1];
  if (!path || path==='/' || /gc-home/.test(html.match(/<body[^>]*>/)?.[0]||'')) return html;
  const config = getInteriorDesign(path);
  if (!config) return html;
  // Always load these scoped overrides after the shared experience stylesheet.
  html=html.replace(/<link rel="stylesheet" href="\/assets\/costin-interior.css">\s*/g,'').replace('</head>','<link rel="stylesheet" href="/assets/costin-interior.css">\n</head>');
  if (/data-gc-interior-version=/.test(html)) {
    // Refresh only presentation-owned fallback photos; original editorial images stay intact.
    if (config.photo) {
      html=html.replace(/<figure class="gc-interior-feature"><picture>[\s\S]*?<\/figure>/,current=>current.match(/<img[^>]*src="([^"]+)"/)?.[1]===config.photo ? current : photo(config.photo,config));
      if (!html.includes('class="gc-interior-hero-media"')) html=html.replace(/<\/div><\/header>/,`<div class="gc-interior-hero-media">${photo(config.photo,config)}</div></div></header>`).replace('class="gc-interior-hero"','class="gc-interior-hero gc-interior-hero--split"');
    }
    return withBlogCardImages(withAtmosphere(html,config));
  }
  const header = html.match(/<header\b[^>]*>([\s\S]*?)<\/header>/);
  const main = html.match(/<main\b([^>]*)>([\s\S]*?)<\/main>/);
  if (!header || !main) return html;
  let originalHeader = header[1];
  if (path==='/reviews') originalHeader=originalHeader.replace('Every review below is a real, verbatim Google review from a closed transaction. No filtering and no cherry-picking: this is simply what clients say.','Read feedback shared on Google and Zillow, from first conversations to closing day. Explore the experiences behind our five-star ratings.');
  let content=main[2], media='', asideOriginal='';
  const blocks=topLevelBlocks(content);
  const firstH2=blocks.find(b=>b.tag==='h2')?.start ?? Infinity;
  let heroBlock=blocks.find(b=>b.start<firstH2 && b.tag==='figure' && /<img/.test(b.html));
  if (config.family==='team') heroBlock=blocks.find(b=>b.start<firstH2 && /gregg-courthouse/.test(b.html));
  if (config.family==='school'||config.family==='reviews') heroBlock=blocks.find(b=>b.tag==='div');
  if (config.family==='contact') {
    const taken=blocks.filter(b=>b.start<firstH2 && (b.tag==='figure'||/class="cards"/.test(b.html)));
    asideOriginal=taken.map(b=>b.html).join('\n');
    for (const block of [...taken].reverse()) content=content.slice(0,block.start)+content.slice(block.end);
    heroBlock=null;
  }
  if (heroBlock) {
    media=withClass(heroBlock.html,'gc-interior-feature');
    media=media.replace(/loading="lazy"/g,'loading="eager"');
    content=content.slice(0,heroBlock.start)+content.slice(heroBlock.end);
  } else if (config.photo) media=photo(config.photo,config);
  const hasAside=!['directory','search','reviews','information','team'].includes(config.family);
  const links=`<div class="gc-interior-hero-actions">${action(config.primary,true)}${action(config.secondary)}</div>`;
  const newHeader=`<header class="gc-interior-hero${media?' gc-interior-hero--split':''}"><div class="gc-interior-hero-wrap"><div class="gc-interior-hero-copy"><span class="gc-interior-kicker">${esc(config.eyebrow)}</span><div data-gc-original-header>${originalHeader}</div>${links}</div>${media?'<div class="gc-interior-hero-media">'+media+'</div>':''}</div></header>`;
  const sectionHtml=sectionsFrom(content,path);
  const aside=hasAside?`<aside class="gc-interior-aside" aria-label="Local help and next steps">${asideOriginal}${supportCard(config,config.family==='contact')}</aside>`:'';
  const mainHtml=`<main${main[1]}><div class="gc-interior-grid${hasAside?'':' gc-interior-grid--wide'}"><div class="gc-interior-content">${sectionHtml}</div>${aside}</div></main>`;
  html=html.replace(header[0],newHeader).replace(main[0],mainHtml);
  html=html.replace(/<body([^>]*)>/,(_,attrs)=>`<body${/class="/.test(attrs)?attrs.replace('class="','class="gc-interior gc-interior--'+config.family+' '):attrs+' class="gc-page gc-interior gc-interior--'+config.family+'"'} data-gc-interior-version="1" data-gc-path="${esc(path)}">`);
  return withBlogCardImages(withAtmosphere(html,config));
}
