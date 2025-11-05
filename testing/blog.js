const blogPosts = [
  { title: "How I Built This Portfolio", date: "2025-06-01", summary: "A full-featured site with JS, animations, blog, and form!" },
  { title: "Top 10 JavaScript Tips", date: "2025-05-20", summary: "Boost performance, reduce bugs, and write cleaner code." },
  { title: "Dark Mode in 2 Minutes", date: "2025-04-15", summary: "Add theme toggling and persist settings with localStorage." }
];

const blogContainer = document.getElementById('blog-posts');
blogContainer.innerHTML = blogPosts.map(post => `
  <div class="blog-card">
    <h3>${post.title}</h3>
    <small>${post.date}</small>
    <p>${post.summary}</p>
  </div>
`).join('');
