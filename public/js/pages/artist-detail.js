// public/js/pages/artist-detail.js
import {
  renderNav,
  attachLogoutHandler,
  checkUser,
} from '../components/nav.js';
import { showLoading, showError, showEmpty } from '../components/loading.js';

export async function renderArtistDetail(artistId) {
  const app = document.getElementById('app');
  await ensureStyleLoaded('/styles/artist-detail.css');
  await ensureStyleLoaded('/styles/loading.css');

  const user = await checkUser();

  // ===== BASE STRUCTURE =====
  app.innerHTML = `
    ${renderNav(user)}

    <main class="artist-detail container">
      ${showLoading('Loading artist details...')}
    </main>

    <footer class="footer">
      <p>© 2025 LiveLy | Built by Eric Fu & Brandan Yong</p>
    </footer>
  `;

  attachLogoutHandler();

  try {
    // Fetch artist info + reviews
    const [artistRes, reviewRes] = await Promise.all([
      fetch(`/api/artists/${artistId}`),
      fetch(`/api/artists/${artistId}/reviews`),
    ]);

    if (!artistRes.ok || !reviewRes.ok) throw new Error('API Error');
    const artist = await artistRes.json();
    const reviews = await reviewRes.json();

    const main = document.querySelector('main');
    main.innerHTML = `
      <section class="artist-info">
        <div class="artist-meta">
          <h1>${artist.name}</h1>
          <p><strong>⭐ ${calcAverage(reviews)} / 5</strong></p>
        </div>
      </section>

      <section class="reviews-section">
        <h2>Fan Reviews</h2>
        <div class="reviews-container">
          ${
            reviews.length
              ? reviews
                  .map(
                    (r) => `
                    <div class="review-card">
                      <div class="review-header">
                        <strong>${r.username || 'Anonymous'}</strong>
                        <span>⭐ ${r.rating}</span>
                      </div>
                      <p><strong>Comments:</strong> ${r.comment}</p>
                      <p><small><strong>Date Seen:</strong> ${new Date(
                        r.concertDate
                      ).toLocaleDateString()}</small></p>
                    </div>`
                  )
                  .join('')
              : showEmpty('No reviews yet.')
          }
        
        </div>
      </section>

      <div class="btn-wrapper">
        <button class="btn secondary" id="backBtn">← Back to Browse</button>
      </div>
    `;

    // Back button
    document.getElementById('backBtn').addEventListener('click', () => {
      window.location.hash = '#/browse';
    });
  } catch (err) {
    console.error(err);
    const main = document.querySelector('main');
    main.innerHTML = `
      ${showError('Failed to load artist details.')}
      <div class="btn-wrapper">
        <button class="btn" onclick="window.location.hash='#/browse'">← Back to Browse</button>
      </div>
    `;
  }
}

/* ===== Helpers ===== */
function ensureStyleLoaded(href) {
  return new Promise((resolve) => {
    const existing = document.querySelector(`link[href="${href}"]`);
    if (existing) return resolve();
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.onload = () => resolve();
    document.head.appendChild(link);
  });
}

function calcAverage(reviews) {
  if (!reviews.length) return 0;
  const avg = reviews.reduce((a, r) => a + (r.rating || 0), 0) / reviews.length;
  return avg.toFixed(1);
}
