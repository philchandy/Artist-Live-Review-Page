// public/js/pages/review-page.js
import { renderNav, attachLogoutHandler, checkUser } from '../components/nav.js';

export async function renderReviewForm() {
  const app = document.getElementById('app');
  loadStyle('/styles/review-form.css');

  const user = await checkUser();

  // ===== PAGE STRUCTURE =====
  app.innerHTML = `
    <div class="review-page-container">
      ${renderNav(user, 'review')}

      <main class="review-page">
        <div class="review-card">
          <h1>Leave a Review</h1>

          <form id="reviewForm">
            <div class="form-group">
              <label for="artistName">Artist Name</label>
              <input type="text" id="artistName" placeholder="Enter artist name" required />
            </div>

            <div class="form-group">
              <label for="rating">Rating (1–5)</label>
              <select id="rating" required>
                <option value="">Select</option>
                <option value="1">⭐ 1</option>
                <option value="2">⭐ 2</option>
                <option value="3">⭐ 3</option>
                <option value="4">⭐ 4</option>
                <option value="5">⭐ 5</option>
              </select>
            </div>

            <div class="form-group">
              <label for="venue">Venue</label>
              <input type="text" id="venue" placeholder="Venue name" required />
            </div>

            <div class="form-group">
              <label for="date">Date of Performance</label>
              <input type="date" id="date" required />
            </div>

            <div class="form-group">
              <label for="comment">Comment</label>
              <textarea id="comment" placeholder="Share your experience..." required></textarea>
            </div>

            <button type="submit" class="btn">Submit Review</button>
          </form>

          <p class="message" id="formMessage"></p>
        </div>
      </main>

      <footer class="footer">
        <p>© 2025 LiveLy | Built by Eric Fu & Brandan Yong</p>
      </footer>
    </div>
  `;

  attachLogoutHandler();

  // ===== FORM HANDLING =====
  const form = document.getElementById('reviewForm');
  const message = document.getElementById('formMessage');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const artistName =
      document.getElementById('artistName')?.value?.trim() || '';
    const rating = document.getElementById('rating')?.value?.trim() || '';
    const comment = document.getElementById('comment')?.value?.trim() || '';
    const venue = document.getElementById('venue')?.value?.trim() || '';
    const concertDate = document.getElementById('date')?.value?.trim() || '';

    // Track missing fields for debugging
    const missingFields = [];
    if (!artistName) missingFields.push('artistName');
    if (!rating) missingFields.push('rating');
    if (!comment) missingFields.push('comment');
    if (!venue) missingFields.push('venue');
    if (!concertDate) missingFields.push('concertDate');

    if (missingFields.length > 0) {
      console.warn('⚠️ Missing fields:', missingFields.join(', '));
      message.textContent = `⚠️ Please fill out all fields (${missingFields.join(', ')}).`;
      message.className = 'message error';
      return;
    }

    // Additional front-end date check
    if (isNaN(new Date(concertDate).getTime())) {
      message.textContent = '⚠️ Invalid date format.';
      message.className = 'message error';
      console.error('Invalid date value:', concertDate);
      return;
    }

    const data = {
      artistName,
      rating,
      comment,
      venue,
      concertDate,
      userId: user?.userId,
      username: user?.username,
    };

    console.log('📤 Submitting review:', data);

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      console.log('📥 Server response:', result);

      if (res.ok) {
        message.textContent = `✅ Review for "${artistName}" submitted successfully!`;
        message.className = 'message success';
        form.reset();

        setTimeout(() => {
          window.location.hash = '#/browse';
        }, 1800);
      } else {
        message.textContent = result.error || 'Something went wrong.';
        message.className = 'message error';
      }
    } catch (err) {
      console.error('💥 Error submitting review:', err);
      message.textContent = '⚠️ Failed to submit review.';
      message.className = 'message error';
    }
  });
}

/* ===== HELPERS ===== */
function loadStyle(href) {
  if (!document.querySelector(`link[href="${href}"]`)) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  }
}
