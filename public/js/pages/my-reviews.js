// public/js/pages/my-reviews.js
import { renderNav, attachLogoutHandler, checkUser } from '../components/nav.js';

export async function renderMyReviewsPage() {
  const app = document.getElementById('app');
  loadStyle('/styles/my-reviews.css');

  const user = await checkUser();
  if (!user) {
    window.location.hash = '#/login';
    return;
  }

  app.innerHTML = `
    ${renderNav(user)}

    <main class="my-reviews container">
      <h1>My Reviews</h1>
      <div id="reviewsList">Loading...</div>
    </main>

    <footer class="footer">
      <p>© 2025 LiveLy | Built by Eric Fu & Brandan Yong</p>
    </footer>
  `;

  attachLogoutHandler();
  await loadReviews();
}

async function loadReviews() {
  const reviewsList = document.getElementById('reviewsList');
  try {
    const res = await fetch('/api/my-reviews');
    if (!res.ok) throw new Error('Failed to fetch reviews');
    const reviews = await res.json();

    if (!reviews.length) {
      reviewsList.innerHTML = '<p>You haven\'t written any reviews yet.</p>';
      return;
    }

    reviewsList.innerHTML = reviews.map(r => `
      <div class="review-item">
        <div class="review-header">
          <strong>${r.artistName || 'Unknown Artist'}</strong>
          <span>⭐ ${r.rating}/5</span>
        </div>
        <p><strong>Venue:</strong> ${r.venue}</p>
        <p><strong>Date:</strong> ${new Date(r.concertDate).toLocaleDateString()}</p>
        <p><strong>Comment:</strong> ${r.comment}</p>
      </div>
    `).join('');
  } catch (err) {
    console.error(err);
    reviewsList.innerHTML = '<p>Error loading your reviews.</p>';
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
