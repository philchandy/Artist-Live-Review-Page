// public/js/pages/browse.js
import {
  renderNav,
  attachLogoutHandler,
  checkUser,
} from '../components/nav.js';
import { showLoading, showError, showEmpty } from '../components/loading.js';

export async function renderBrowsePage() {
  const app = document.getElementById('app');
  loadStyle('/styles/browse.css');
  loadStyle('/styles/loading.css');

  const user = await checkUser();

  app.innerHTML = `
    ${renderNav(user, 'browse')}

    <main class="browse container">
      <h1>Browse Artists</h1>
      <div class="search-bar">
        <input 
          type="text" 
          id="searchInput" 
          placeholder="Search artists by name..." 
        />
      </div>
      <div id="artistsList" class="artists-grid">${showLoading('Loading artists...')}</div>
    </main>

    <footer class="footer">
      <p>© 2025 LiveLy | Built by Eric Fu & Brandan Yong</p>
    </footer>
  `;

  attachLogoutHandler();

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
    artistsList.innerHTML = showLoading('Searching artists...');

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
        artistsList.innerHTML = showEmpty('No artists found.');
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
      artistsList.innerHTML = showError(
        'Failed to load artists. Please try again.'
      );
    }
  }
}

/* ===== Helpers ===== */
function loadStyle(href) {
  if (!document.querySelector(`link[href="${href}"]`)) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  }
}
