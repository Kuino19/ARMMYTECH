const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const marked = require('marked');

const contentDir = path.join(__dirname, '../content/blog');
const templatesDir = path.join(__dirname, '../templates');
const postsOutDir = path.join(__dirname, '../posts');
const blogHtmlOut = path.join(__dirname, '../blog.html');

if (!fs.existsSync(postsOutDir)) {
  fs.mkdirSync(postsOutDir);
}

const blogPostTemplate = fs.readFileSync(path.join(templatesDir, 'blog-post.html'), 'utf-8');
const blogIndexTemplate = fs.readFileSync(path.join(templatesDir, 'blog-index.html'), 'utf-8');

const files = fs.readdirSync(contentDir).filter(file => file.endsWith('.md'));

let posts = [];

files.forEach(file => {
  const rawContent = fs.readFileSync(path.join(contentDir, file), 'utf-8');
  const { data, content } = matter(rawContent);
  const slug = file.replace('.md', '');
  
  posts.push({
    slug,
    title: data.title,
    date: new Date(data.date),
    dateString: new Date(data.date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    author: data.author || 'A&I Tech Team',
    category: data.category || 'Updates',
    description: data.description || '',
    htmlContent: marked.parse(content)
  });
});

posts.sort((a, b) => b.date - a.date);

posts.forEach(post => {
  let postHtml = blogPostTemplate
    .replace(/\{\{title\}\}/g, post.title)
    .replace(/\{\{description\}\}/g, post.description)
    .replace(/\{\{category\}\}/g, post.category)
    .replace(/\{\{date\}\}/g, post.dateString)
    .replace(/\{\{author\}\}/g, post.author)
    .replace(/\{\{CONTENT\}\}/g, post.htmlContent);
    
  fs.writeFileSync(path.join(postsOutDir, `${post.slug}.html`), postHtml);
});

if (posts.length > 0) {
  const featured = posts[0];
  const others = posts.slice(1);
  
  const featuredHtml = `
      <div class="blog-featured reveal">
        <div class="blog-featured-img" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"><path d="m4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>
        </div>
        <div class="blog-featured-content">
          <span class="tag tag-green">${featured.category}</span>
          <h2>${featured.title}</h2>
          <div class="blog-meta" style="margin-top:0.5rem;">
            <span style="display:inline-flex;align-items:center;gap:0.3rem;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:13px;height:13px;"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> 
              ${featured.dateString}
            </span>
          </div>
          <p>${featured.description}</p>
          <a href="posts/${featured.slug}.html" class="btn btn-primary">Read Article &rarr;</a>
        </div>
      </div>
  `;
  
  let gridHtml = '';
  others.forEach(post => {
    gridHtml += `
        <article class="blog-card reveal">
          <div class="blog-card-img" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          </div>
          <div class="blog-card-body">
            <div class="blog-meta">
              <span class="tag tag-blue" style="font-size:0.65rem;">${post.category}</span>
              <span>&middot;</span>
              <span>${post.dateString}</span>
            </div>
            <h3>${post.title}</h3>
            <p>${post.description}</p>
            <a href="posts/${post.slug}.html" class="blog-read-more">
              Read Article
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </a>
          </div>
        </article>
    `;
  });
  
  const indexHtml = blogIndexTemplate
    .replace('{{FEATURED_POST}}', featuredHtml)
    .replace('{{BLOG_POSTS}}', gridHtml);
    
  fs.writeFileSync(blogHtmlOut, indexHtml);
}

console.log(`Blog build complete. Generated ${posts.length} posts.`);
