// Keep guide navigation in the HTML so it is available without JavaScript and causes no late shift.
const strip = text => text.replace(/<[^>]*>/g,'').trim();
export function withGuideNavigation(html) {
  if (/<body[^>]*class="[^"]*gc-home/.test(html)) return html;
  const isGuide = /rel="canonical" href="https:\/\/greggcostin\.com\/(resources|blog|neighborhoods)\//.test(html);
  return html.replace(/(<main\b[^>]*>)([\s\S]*?)(<\/main>)/, (_, open, content, close) => {
    content = content.replace(/\s*<!-- COSTIN_TOC_START -->[\s\S]*?<!-- COSTIN_TOC_END -->\s*/g,'\n');
    const headings = [...content.matchAll(/<h2\b([^>]*)>([\s\S]*?)<\/h2>/g)];
    const words = strip(content.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/g,'')).split(/\s+/).length;
    // A navigation aid for substantial reference articles, never a blanket feature on service/profile pages.
    if (!isGuide || headings.length < 6 || words < 1200) return open + content + close;
    const used = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]));
    const links = [];
    let count = 0;
    content = content.replace(/<h2\b([^>]*)>([\s\S]*?)<\/h2>/g, (tag, attrs, title) => {
      count++;
      let id = attrs.match(/\bid="([^"]+)"/)?.[1];
      if (!id) {
        id = 'guide-section-' + count;
        while (used.has(id)) id += '-section';
        used.add(id);
        tag = tag.replace('<h2','<h2 id="' + id + '"');
      }
      links.push(`<li><a href="#${id}">${strip(title)}</a></li>`);
      return tag;
    });
    const toc = '\n<!-- COSTIN_TOC_START -->\n<details class="gc-toc"><summary>Jump to a section</summary><nav aria-label="Guide sections"><ul>' + links.join('') + '</ul></nav></details>\n<!-- COSTIN_TOC_END -->\n';
    // Introductory photos and quick answers keep their position; navigation precedes the article's first section.
    content = content.replace(/<h2\b/,toc + '<h2');
    return open + content + close;
  });
}
