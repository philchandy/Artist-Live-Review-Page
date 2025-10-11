// public/js/main.js

import { renderPage } from './pages/home.js';
import { renderRegisterPage } from './pages/register.js';
import { renderLoginPage } from './pages/login.js';
import { renderBrowsePage } from './pages/browse.js';
import { renderArtistDetail } from './pages/artist-detail.js';
import { renderReviewForm } from './pages/review-form.js';
import { renderAdminPage } from './pages/admin.js';
import { renderMyReviewsPage } from './pages/my-reviews.js';

async function router() {
  const hash = window.location.hash || '#/';
  const app = document.getElementById('app');
  app.innerHTML = ''; // clear before render

  // Small delay to ensure DOM & CSS stabilize before rendering
  await new Promise((r) => setTimeout(r, 25));

  switch (true) {
    case hash === '#/' || hash === '#/home':
      renderPage();
      break;

    case hash === '#/register':
      renderRegisterPage();
      break;

    case hash === '#/login':
      renderLoginPage();
      break;

    case hash === '#/browse':
      renderBrowsePage();
      break;
    case hash === '#/browse':
      await renderBrowsePage(); //  ensure it refetches each time
      break;

    case hash === '#/review':
      renderReviewForm();
      break;

    case hash === '#/admin':
      await renderAdminPage();
      break;

    case hash === '#/my-reviews':
      await renderMyReviewsPage();
      break;

    // Artist Detail Page
    case hash.startsWith('#/artist/'):
      const artistId = hash.split('/')[2];
      await renderArtistDetail(artistId);
      break;

    default:
      app.innerHTML = '<h2>404 - Page Not Found</h2>';
  }
}

window.addEventListener('DOMContentLoaded', router);
window.addEventListener('hashchange', router);
