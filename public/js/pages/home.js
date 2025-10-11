// public/js/pages/home.js
export async function renderPage() {
  const app = document.getElementById('app');
  
  // Check if user is logged in
  let currentUser = null;
  try {
    const response = await fetch('/api/me');
    if (response.ok) {
      currentUser = await response.json();
    }
  } catch (error) {
    // Not logged in
  }
  
  app.innerHTML = `
    <header class="header">
      <div class="container header-content">
        <div class="logo">🎤 LiveLy</div>
        <nav class="navbar">
          <ul>
            <li><a href="#/" class="active">Home</a></li>
            <li><a href="#/browse">Browse Artists</a></li>
            ${currentUser ? `
              <li><a href="#/review">Leave a Review</a></li>
              <li><span style="color: white; margin-right: 10px;">👤 ${currentUser.username}</span></li>
              <li><a href="#/my-reviews">My Reviews</a></li>
              ${currentUser.role === 'admin' ? '<li><a href="#/admin">Admin</a></li>' : ''}
              <li><a href="#" id="logout-btn">Logout</a></li>
            ` : `
              <li><a href="#/login">Login</a></li>
              <li><a href="#/register">Register</a></li>
            `}
          </ul>
        </nav>
      </div>
    </header>

    <!-- 🎶 Vinyl + Needle -->
    <img src="/img/vinyl.png" alt="Spinning vinyl record" class="vinyl-img" />
    <img src="/img/needle.png" alt="Record Player Needle" class="needle-img" />

    <main class="home container">
      <section class="welcome-section">
        <h1>Welcome to LiveLy</h1>
        <p>Discover and review live performances from your favorite artists around the world.</p>
        <a href="#/browse" class="btn explore-btn">Start Exploring</a>
      </section>
    </main>

    <footer class="footer">
      <p>© 2025 LiveLy | Built by Eric Fu & Brandan Yong</p>
    </footer>
  `;
  
  // Add logout handler
  if (currentUser) {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        try {
          await fetch('/api/logout', { method: 'POST' });
          window.location.hash = '#/';
          window.location.reload();
        } catch (error) {
          console.error('Logout failed:', error);
        }
      });
    }
  }
}
