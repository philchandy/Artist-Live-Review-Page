// public/js/pages/admin.js
export async function renderAdminPage() {
  const app = document.getElementById('app');
  loadStyle('/styles/admin.css');

  const user = await checkUser();
  if (!user || user.role !== 'admin') {
    app.innerHTML = '<h2>Access Denied</h2><p>Admin access required.</p>';
    return;
  }

  const navLinks = `<li><span>👤 ${user.username}</span></li>
    <li><a href="#/my-reviews">My Reviews</a></li>
    <li><a href="#/admin" class="active">Admin</a></li>
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

    <main class="admin container">
      <h1>Admin Dashboard</h1>
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
    const res = await fetch('/api/admin/reviews');
    if (!res.ok) throw new Error('Failed to fetch reviews');
    const reviews = await res.json();

    if (!reviews.length) {
      reviewsList.innerHTML = '<p>No reviews found.</p>';
      return;
    }

    reviewsList.innerHTML = reviews.map(r => `
      <div class="review-item" data-id="${r._id}">
        <div class="review-header">
          <strong>${r.username || 'Anonymous'}</strong>
          <span>⭐ ${r.rating}/5</span>
        </div>
        <p><strong>Artist:</strong> ${r.artistName || 'Unknown'}</p>
        <p><strong>Venue:</strong> ${r.venue}</p>
        <p><strong>Comment:</strong> ${r.comment}</p>
        <div class="review-actions">
          <button class="btn-edit" data-id="${r._id}">Edit</button>
          <button class="btn-delete" data-id="${r._id}">Delete</button>
        </div>
      </div>
    `).join('');

    document.querySelectorAll('.btn-edit').forEach(btn => {
      btn.addEventListener('click', () => editReview(btn.dataset.id));
    });

    document.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', () => deleteReview(btn.dataset.id));
    });
  } catch (err) {
    console.error(err);
    reviewsList.innerHTML = '<p>Error loading reviews.</p>';
  }
}

async function editReview(id) {
  const reviewItem = document.querySelector(`.review-item[data-id="${id}"]`);
  const comment = reviewItem.querySelector('p:nth-of-type(3)').textContent.replace('Comment: ', '');
  const rating = reviewItem.querySelector('.review-header span').textContent.match(/\d+/)[0];
  const venue = reviewItem.querySelector('p:nth-of-type(2)').textContent.replace('Venue: ', '');

  const newComment = prompt('Edit comment:', comment);
  const newRating = prompt('Edit rating (1-5):', rating);
  const newVenue = prompt('Edit venue:', venue);

  if (!newComment || !newRating || !newVenue) return;

  try {
    const res = await fetch(`/api/reviews/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ comment: newComment, rating: newRating, venue: newVenue })
    });

    if (res.ok) {
      alert('Review updated successfully');
      await loadReviews();
    } else {
      const err = await res.json();
      alert(err.error || 'Failed to update review');
    }
  } catch (err) {
    console.error(err);
    alert('Error updating review');
  }
}

async function deleteReview(id) {
  if (!confirm('Delete this review?')) return;

  try {
    const res = await fetch(`/api/reviews/${id}`, { method: 'DELETE' });
    if (res.ok) {
      alert('Review deleted successfully');
      await loadReviews();
    } else {
      const err = await res.json();
      alert(err.error || 'Failed to delete review');
    }
  } catch (err) {
    console.error(err);
    alert('Error deleting review');
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
