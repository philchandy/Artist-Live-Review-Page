// public/js/pages/browse.js
export async function renderBrowsePage() {
  const app = document.getElementById('app');
  loadStyle('/styles/browse.css');

  const user = await checkUser();
  const navLinks = user
    ? `<li><span>👤 ${user.username}</span></li>
       ${user.role === 'admin' ? '<li><a href="#/admin">Admin</a></li>' : ''}
       <li><a href="#" id="logoutBtn">Logout</a></li>`
    : `<li><a href="#/login">Login</a></li>
       <li><a href="#/register">Register</a></li>`;

  app.innerHTML = `
    <header class="header">
      <div class="container header-content">
        <div class="logo">🎤 LiveLy</div>
        <nav class="navbar">
          <ul>
            <li><a href="#/">Home</a></li>
            <li><a href="#/browse" class="active">Browse Artists</a></li>
            <li><a href="#/review">Leave a Review</a></li>
            ${navLinks}
          </ul>
        </nav>
      </div>
    </header>

    <main class="browse container">
      <h1>Browse Artists</h1>
      <div class="search-bar">
        <input 
          type="text" 
          id="searchInput" 
          placeholder="Search artists by name..." 
        />
      </div>
      <div id="artistsList" class="artists-grid">Loading...</div>
    </main>

    <footer class="footer">
      <p>© 2025 LiveLy | Built by Eric Fu & Brandan Yong</p>
    </footer>
  `;

  if (user) {
    document.getElementById('logoutBtn')?.addEventListener('click', async (e) => {
      e.preventDefault();
      await fetch('/api/logout', { method: 'POST' });
      window.location.hash = '#/';
    });
  }

  const searchInput = document.getElementById('searchInput');
  const artistsList = document.getElementById('artistsList');

  await fetchArtists();

  // Debounced search
  let debounceTimer;
  searchInput.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      fetchArtists(searchInput.value.trim());
    }, 300);
  });

  async function fetchArtists(query = '') {
    artistsList.innerHTML = `<p>Loading...</p>`;

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
        headers: { Accept: 'application/json' },
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      if (!Array.isArray(data)) throw new Error('Invalid response format');

      const artists = data.sort(
        (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      );

      if (!artists.length) {
        artistsList.innerHTML = `<p>No artists found.</p>`;
        return;
      }

      // 🟢 Display artist name + average rating only
      artistsList.innerHTML = artists
        .map(
          (a) => `
          <div class="artist-card" data-id="${a._id}">
            <h3>${a.name}</h3>
            ${
              a.avgRating && !isNaN(a.avgRating)
                ? `<p class="rating">⭐ ${Number(a.avgRating).toFixed(1)} / 5</p>`
                : `<p class="rating">No ratings yet</p>`
            }
          </div>`
        )
        .join('');

      document.querySelectorAll('.artist-card').forEach((card) => {
        card.addEventListener('click', () => {
          const id = card.getAttribute('data-id');
          window.location.hash = `#/artist/${id}`;
        });
      });
    } catch (err) {
      console.error('Error loading artists:', err);
      artistsList.innerHTML = `<p>⚠️ Error loading artists.</p>`;
    }
  }
}

/* ===== Helpers ===== */
async function checkUser() {
  try {
    const res = await fetch('/api/me');
    return res.ok ? await res.json() : null;
  } catch {
    return null;
  }
}

function loadStyle(href) {
  if (!document.querySelector(`link[href="${href}"]`)) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  }
}
