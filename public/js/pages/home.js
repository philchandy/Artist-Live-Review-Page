// public/js/pages/home.js
import {
  renderNav,
  attachLogoutHandler,
  checkUser,
} from '../components/nav.js';

export async function renderPage() {
  const app = document.getElementById('app');
  const currentUser = await checkUser();

  app.innerHTML = `
    ${renderNav(currentUser, 'home')}

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

  attachLogoutHandler();
}
