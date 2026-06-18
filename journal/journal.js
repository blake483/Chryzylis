const POSTS_PER_PAGE = 6;
const FILTERS = ["All", "Transaction", "Reflections", "Journey", "Domiciliary Care"];

let allPosts = [];
let activeFilter = "All";
let currentPage = 1;

function mediaHTML(post) {
  if (post.image) {
    return `<div class="journal-card-media" style="background-image:url('${post.image}');background-size:cover;background-position:center;">
      <div class="journal-card-tag">${post.tags[0]}</div>
    </div>`;
  }
  return `<div class="journal-card-media">
    <div class="journal-card-tag">${post.tags[0]}</div>
  </div>`;
}

function featuredCardHTML(post) {
  return `
    <a href="${post.slug}.html" class="journal-card journal-card-featured reveal visible">
      ${mediaHTML(post)}
      <div class="journal-card-body">
        <div class="journal-card-date">Featured · ${post.dateLabel}</div>
        <div class="journal-card-title">${post.title}</div>
        <p class="journal-card-excerpt">${post.excerpt}</p>
        <span class="journal-card-read">Read the story
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </span>
      </div>
    </a>`;
}

function cardHTML(post, delayIndex) {
  const delayClass = delayIndex > 0 ? `reveal-delay-${Math.min(delayIndex, 4)}` : "";
  return `
    <a href="${post.slug}.html" class="journal-card reveal visible ${delayClass}">
      ${mediaHTML(post)}
      <div class="journal-card-body">
        <div class="journal-card-date">${post.tags.join(" · ")} · ${post.dateLabel}</div>
        <div class="journal-card-title">${post.title}</div>
        <p class="journal-card-excerpt">${post.excerpt}</p>
        <span class="journal-card-read">Read the story
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </span>
      </div>
    </a>`;
}

function getFilteredPosts() {
  const sorted = [...allPosts].sort((a, b) => new Date(b.date) - new Date(a.date));
  if (activeFilter === "All") return sorted;
  return sorted.filter(p => p.tags.includes(activeFilter));
}

function render() {
  const grid = document.getElementById("journal-grid");
  const featuredSlot = document.getElementById("journal-featured-slot");
  const pagination = document.getElementById("journal-pagination");

  const filtered = getFilteredPosts();

  let featured = null;
  let pool = filtered;

  if (activeFilter === "All" && currentPage === 1) {
    featured = filtered.find(p => p.featured) || null;
    pool = filtered.filter(p => p !== featured);
  }

  const totalPages = Math.max(1, Math.ceil(pool.length / POSTS_PER_PAGE));
  if (currentPage > totalPages) currentPage = totalPages;

  const start = (currentPage - 1) * POSTS_PER_PAGE;
  const pagePosts = pool.slice(start, start + POSTS_PER_PAGE);

  featuredSlot.innerHTML = featured ? featuredCardHTML(featured) : "";
  grid.innerHTML = pagePosts.map((p, i) => cardHTML(p, i + 1)).join("");

  if (totalPages <= 1) {
    pagination.innerHTML = "";
    return;
  }

  let buttons = "";
  buttons += `<button class="journal-page-btn" ${currentPage === 1 ? "disabled" : ""} data-page="${currentPage - 1}">Prev</button>`;
  for (let i = 1; i <= totalPages; i++) {
    buttons += `<button class="journal-page-btn ${i === currentPage ? "active" : ""}" data-page="${i}">${i}</button>`;
  }
  buttons += `<button class="journal-page-btn" ${currentPage === totalPages ? "disabled" : ""} data-page="${currentPage + 1}">Next</button>`;
  pagination.innerHTML = buttons;

  pagination.querySelectorAll(".journal-page-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const page = parseInt(btn.dataset.page, 10);
      if (!isNaN(page) && page >= 1 && page <= totalPages) {
        currentPage = page;
        render();
        document.getElementById("journal-listing").scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });
}

function setupFilters() {
  const bar = document.getElementById("journal-filter-bar");
  bar.innerHTML = FILTERS.map(f =>
    `<button class="journal-filter ${f === "All" ? "active" : ""}" data-filter="${f}">${f}</button>`
  ).join("");

  bar.querySelectorAll(".journal-filter").forEach(btn => {
    btn.addEventListener("click", () => {
      bar.querySelectorAll(".journal-filter").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      activeFilter = btn.dataset.filter;
      currentPage = 1;
      render();
    });
  });
}

fetch("data/posts.json")
  .then(res => res.json())
  .then(data => {
    allPosts = data;
    setupFilters();
    render();
  })
  .catch(err => {
    document.getElementById("journal-grid").innerHTML = `<p style="color: var(--mid); padding: 40px;">Unable to load journal entries.</p>`;
    console.error(err);
  });
