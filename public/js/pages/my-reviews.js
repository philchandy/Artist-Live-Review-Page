// public/js/pages/my-reviews.js
export async function renderMyReviewsPage() {
  const app = document.getElementById('app');
  loadStyle('/styles/my-reviews.css');

  const user = await checkUser();
  if (!user) {
    window.location.hash = '#/login';
    return;
  }

  const navLinks = `<li><span>👤 ${user.username}</span></li>
    <li><a href="#/my-reviews" class="active">My Reviews</a></li>
    ${user.role === 'admin' ? '<li><a href="#/admin">Admin</a></li>' : ''}
    <li><a href="#" id="logoutBtn">Logout</a></li>`;

  app.innerHTML = `
    <header class="header">
      <div class="container header-content">
        <div class="logo">🎤 LiveLy</div>
        <nav class="navbar">
          <ul>
            <li><a href="#/">Home</a></li>
            <li><a href="#/browse">Browse Artists</a></li>
            <li><a href="#/review">Leave a Review</a></li>
            ${navLinks}
          </ul>
        </nav>
      </div>
    </header>

    <main class="my-reviews container">
      <h1>My Reviews</h1>
      <div id="reviewsList">Loading...</div>
    </main>

    <footer class="footer">
      <p>© 2025 LiveLy | Built by Eric Fu & Brandan Yong</p>
    </footer>
  `;

  document.getElementById('logoutBtn').addEventListener('click', async (e) => {
    e.preventDefault();
    await fetch('/api/logout', { method: 'POST' });
    window.location.hash = '#/';
  });

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
